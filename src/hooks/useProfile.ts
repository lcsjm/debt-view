import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";

export interface ProfileData {
  id: string;
  name: string;
  cpf: string;
  birth: string | null;
  cep: string | null;
  gender: string | null;
  race: string | null;
  user_id: string;
  avatar_url: string | null;
}

export function useProfile() {
// 🎓 O useQuery serve para BUSCAR/LER dados (SELECT).
  // Ele lida sozinho com estados de 'carregando', 'sucesso' e 'erro',
  // e salva o resultado em memória (cache) para o app ficar rápido.
  const { data: profile, isLoading, error } = useQuery({
    // 🔑 queryKey: É como dar um nome pra sua busca. 
    // Se você for pra outra tela e voltar, o React Query já sabe que esse dado existe na memória.
    queryKey: ["user_profile"],
    
    // 🔄 queryFn: É a função com o código que de fato vai no Supabase pedir os dados.
    queryFn: async () => {
      // 1. Pega o logado no momento
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 2. Faz o SELECT na tabela profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      return data as ProfileData | null;
    },
  });

  // 2️⃣ SALVANDO O PERFIL (UPSERT) via useMutation
  const queryClient = useQueryClient();
  const { mutateAsync: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: async (updatedProfile: Partial<ProfileData>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .upsert({ ...updatedProfile, user_id: user.id }, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida o cache do perfil para a tela atualizar com os novos dados
      queryClient.invalidateQueries({ queryKey: ["user_profile"] });
      // Invalida também a consulta do Serasa, útil se o usuário acabou de adicionar/atualizar o CPF
      queryClient.invalidateQueries({ queryKey: ["serasa_debts"] });
    },
  });

  return { profile, isLoading, error, saveProfile, isSaving };
}
