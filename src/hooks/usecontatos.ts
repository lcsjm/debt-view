import { useMutation } from "@tanstack/react-query";
import supabase from "../../utils/supabase";
import { useAuth } from "../context/AuthContext";

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function useContact() {
  const { user } = useAuth();

  const sendMessage = useMutation({
    mutationFn: async (data: ContactData) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("contatos").insert([
        {
          user_id: user.id,
          nome: data.name,
          email: data.email,
          assunto: data.subject,
          mensagem: data.message,
        },
      ]);

      if (error) throw new Error(error.message);

      return true;
    },
  });

  return {
    sendMessage: sendMessage.mutateAsync,
    loading: sendMessage.isPending,
    error: sendMessage.error,
  };
}