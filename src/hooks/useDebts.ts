import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supabase from "../../utils/supabase";

export interface DebtData {
  id?: string;
  creditor: string;
  value: number;
  amount: number;
  rate: number;
  date: string | null;
  status: string;
  user_id?: string;
}

export function useDebts() {
  const queryClient = useQueryClient();

  const { data: debts, isLoading, error } = useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("debts")
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
        .from("debts")
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
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      // Invalidate finances since new debts might affect total debts
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
        .from("debts")
        .update(updatePayload)
        .eq("id", updatedDebt.id)
        .eq("user_id", user.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  const { mutateAsync: deleteDebt, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
        
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["finances"] });
    },
  });

  return { debts, isLoading, error, saveDebt, isSaving, updateDebt, isUpdating, deleteDebt, isDeleting };
}
