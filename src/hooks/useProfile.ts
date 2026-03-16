import { useQuery } from "@tanstack/react-query";
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
}

export function useProfile() {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      return data as ProfileData | null;
    },
  });

  return { profile, isLoading, error };
}
