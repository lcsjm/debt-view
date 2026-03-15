import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import supabase from "../../utils/supabase"

export interface Transaction {
  id?: string
  value: number
  type: string
  category: string
  user_id?: string
}

export function useTransactions(){

  const queryClient = useQueryClient()

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if(!user) throw new Error("Usuário não autenticado")

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)

      if(error) throw error

      return data || []
    }
  })

  const { mutateAsync: addTransaction } = useMutation({
    mutationFn: async (newTransaction: Transaction) => {

      const { data: { user } } = await supabase.auth.getUser()

      if(!user) throw new Error("Usuário não autenticado")

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...newTransaction,
          user_id: user.id
        })

      if(error) throw error

      return data
    },
    onSuccess: ()=>{
      queryClient.invalidateQueries({queryKey:["transactions"]})
    }
  })

  return { transactions, isLoading, addTransaction }

}