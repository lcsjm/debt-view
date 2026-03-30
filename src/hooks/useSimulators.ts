import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";

export interface DebtData {
  id?: string;
  creditor: string;
  value: number;
  payment: number;
  type: string;
  rate: number;
  date: string | null;
  status: string;
  year: string;
  installments:number;
  user_id?: string;
}

export function usesimulators() {
  const queryClient = useQueryClient();

  const { data: simulators, isLoading, error } = useQuery({
    queryKey: ["simulators"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("simulators")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data as DebtData[]) || [];
    },
  });

  const { mutateAsync: saveDebt, isPending: isSaving } = useMutation({
    mutationFn: async (newDebt: DebtData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("simulators")
        .insert({ 
            ...newDebt, 
            user_id: user.id 
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulators"] });
      // Invalidate finances since new simulators might affect total simulators
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  const { mutateAsync: updateDebt, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedDebt: DebtData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (!updatedDebt.id) throw new Error("ID da dívida não fornecido");

      const { id, user_id, date, ...updatePayload } = updatedDebt as any;
      if (date) updatePayload.date = date; // Prevent date from being swallowed if it's there

      const { data, error } = await supabase
        .from("simulators")
        .update(updatePayload)
        .eq("id", updatedDebt.id)
        .eq("user_id", user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulators"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  const { mutateAsync: deleteDebt, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("simulators")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulators"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  return { simulators, isLoading, error, saveDebt, isSaving, updateDebt, isUpdating, deleteDebt, isDeleting };
}
