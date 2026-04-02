import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Used to bypass RLS for DB inserts
    )

    // Pegar o token do usuário autenticado (caso aplicável)
    const authHeader = req.headers.get('Authorization')
    let userId = null

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabaseClient.auth.getUser(token)
      if (user) userId = user.id
    }

    const { message, context } = await req.json()
    if (!message) {
      throw new Error("A mensagem é obrigatória.")
    }

    let jsonUrl = undefined
    let conversationHistory = []

    if (userId) {
      // 1. Busca a conversa atual do usuário
      const { data: chatRow } = await supabaseClient
        .from('chat')
        .select('id, json_url, history')
        .eq('user_id', userId)
        .maybeSingle()

      jsonUrl = chatRow?.json_url

      // Sempre carrega preferencialmente do history da tabela para sync com o frontend
      if (chatRow && chatRow.history && Array.isArray(chatRow.history)) {
        conversationHistory = chatRow.history
      }
    }

    // Adiciona a nova mensagem do usuário no conteúdo
    conversationHistory.push({ id: `user-${Date.now()}`, role: "user", content: message })

    // 3. Comunica com a IA Gemini
    let systemInstruction = "Você é um assistente financeiro altamente especializado, amigável e focado no alívio de dívidas. Mantenha respostas não muito longas, diretas ao ponto, com tópicos importantes ressaltados em negrito."
    
    // Se o frontend passou contexto (financialData), adicionamos
    if (context) {
      systemInstruction += "\n\n" + context
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`

    // Prepara o formato exato que a API do Gemini exige
    const geminiHistory = conversationHistory
      .slice(-15) // Limita últimas 15 mensagens
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }))

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: geminiHistory
      })
    })
    
    const geminiResult = await response.json()
    
    if (!response.ok) {
       console.error("Gemini Error:", geminiResult)
       throw new Error("Erro na API do Gemini")
    }

    const aiMessageText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não entendi a resposta da IA."
    
    // Adiciona a resposta da IA no histórico
    conversationHistory.push({ id: `bot-${Date.now()}`, role: "assistant", content: aiMessageText })

    // 4. Salva ou atualiza a conversa no bucket apenas se asutenticado
    if (userId) {
      if (!jsonUrl) {
        jsonUrl = `${userId}-${Date.now()}.json`
      }
      
      await supabaseClient
        .storage
        .from('chat_history')
        .upload(jsonUrl, JSON.stringify(conversationHistory), {
          contentType: 'application/json',
          upsert: true
        })

      // 5. Atualiza a tabela com o json_url E O history (para o frontend renderizar quando fizer f5)
      const { data: currentChatRow } = await supabaseClient.from('chat').select('id').eq('user_id', userId).maybeSingle()
      
      if (!currentChatRow) {
        await supabaseClient
          .from('chat')
          .insert({ user_id: userId, json_url: jsonUrl, history: conversationHistory })
      } else {
        await supabaseClient
          .from('chat')
          .update({ json_url: jsonUrl, history: conversationHistory })
          .eq('id', currentChatRow.id)
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiMessageText,
      json_url: jsonUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
