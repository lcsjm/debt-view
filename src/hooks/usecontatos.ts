import { useMutation } from "@tanstack/react-query";
import supabase from "utils/supabase";

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function useContact() {
  const sendMessage = useMutation({
    mutationFn: async (data: ContactData) => {
      const { error } = await supabase.from("contatos").insert([
        {
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