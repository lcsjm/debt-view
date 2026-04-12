# Documentação Técnica: Assistente Inteligente (Chatbot AI)

Este documento foi criado para detalhar ao grupo o funcionamento do chatbot inteligente implementado no projeto "DebtView". Ele visa explicar a arquitetura, o fluxo de dados em banco e os recursos interativos que foram desenvolvidos.

## 1. Visão Geral

O Assistente Financeiro é uma inteligência artificial embutida no projeto para prover dicas de alívio de dívidas personalizadas à situação financeira de cada usuário.
Para tal, usa o modelo de ponta **Gemini 2.5 Flash** do Google. De forma a proteger as credenciais de autenticação (tokens e API Keys) e evitar abusos ou vazamentos de chave, toda chamada direta à inteligência é processada em um ambiente fechado de backend na nuvem, rodando através de Supabase Edge Functions.

## 2. Arquitetura e Componentes

### 🎨 2.1 Camada Visual (Frontend)

- **O código mora em**: `src/components/ui/ChatBot.tsx`.
- **Interface e Usabilidade**: Possui design minimalista escuro (Slate/Tailwind), markdown embutido (`react-markdown`) e indicativos luminosos na hora de digitar.
- **Interação**: Apresenta botões e inputs interativos. Um botão de lixeira no canto possibilita a limpeza de todo o histórico.
- **Avaliação instantânea**: Se renderizado via preenchimento dos formulários (`financialData`), ele tem um código próprio capaz de gerar análises textuais "matemáticas" simples antes de chamar a inteligência artificial, poupando custos de backend em cenários em que há dados faltando.

### 🧠 2.2 Camada de Contexto Vivo (Live Context)

- **O código mora em**: `src/utils/aiContext.ts`.
- Quando um usuário interage, apenas mandar a frase dele (ex: *"Como quito minhas dívidas?"*) produz respostas rasas. Sabendo disso, foi implementado o `getAILiveContext`.
- Antes da pergunta chegar na inteligência artificial, o sistema realiza uma varredura em **todas** as tabelas relevantes no momento em que a tecla enter é apertada.
  - *Exemplo de tabelas puxadas na mágica do real-time:* Dados financeiro fixos, despesas variadas listadas, dívidas ativas da pessoa puxadas do Serasa, últimas transações submetidas no painel de Dash, simulações salvas na calculadora.
- Todo esse compilado vira um texto de plano de fundo secreto alimentado na "Memória" da comunicação. Assim, a IA sempre responde com contexto atual. Exemplo de uso: *"Vi aqui que ontem o senhor submeteu uma batata-frita como gasto. Gostaria de focar em reduzir isso?"*

### 🌐 2.3 Camada de Requisição Segura (Backend - Supabase)

- **O código mora em**: `supabase/functions/chat_handler/index.ts`.
- O Frontend invoca de forma blindada a Edge Function através do método `supabase.functions.invoke('chat_handler')`.
- Lá ocorre uma execução Deno de Javascript/Typescript contendo:
  - Verificação de autenticação e identidade de conta via Bearer Token.
  - Sincronização do Histórico e Limite restrito de no máximo as últimas 15 conversas trocadas entre o Bot e Usuário (para poupar custos limitados na API do Google).
  - Um prompt de direcionamento instruindo a IA do Google (`systemInstruction`): *"Você é um assistente financeiro altamente especializado..."*. As mensagens passam a aderir a uma formatação com tópicos fortes.
  - A API do Gemini retorna a sua deliberação, ela é convertida para texto cru, salva no Storage, e então devolvida ao cliente do usuário.

## 3. Estruturas Nativas (Tabelas e Buckets)

- O projeto utiliza uma tabela chamada primariamente de `chat`.
- Ao mandar mensagens pela primeira vez, além da tabela relacional em Postgres, o Supabase invoca um salvamento no Bucket padrão chamado de `chat_history`. Lá, o arquivo `.json` com o histórico gigantesco fica guardado pelo nome de identificador de conta.
- Retornando no dia seguinte, ou trocando de dispositivo, as mensagens são carregadas magicamente no chat localmente pois o banco sempre atrela aquele JSON salvo à identidade ativa.

---

### Preparativos de Testes Locais e Deploy

Se quiserem testar ou homologar em máquina local:

1. Validem se o arquivo `.env` detém as duas constantes preenchidas (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) e com o projeto real do momento preenchidos nela.
2. Certifiquem de que o botão de Deploy Functions do Supabase ocorreu após as alterações, empurrando a função `chat_handler` pra nuvem. No dashboard do Supabase via Web, as `Edge Functions` e os `Secrets` da mesma (ali salvando a variável secret: `GEMINI_API_KEY`) devem estar online.
