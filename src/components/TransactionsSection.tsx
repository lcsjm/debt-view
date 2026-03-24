import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import supabase from "../../utils/supabase";
import { Trash2, Pencil, X, AlertCircle } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const transactionSchema = z.object({
  value: z.string().min(1, "Obrigatório").refine((val) => {
    const digits = val.replace(/\D/g, "");
    return parseInt(digits, 10) > 0;
  }, "Maior que zero"),
  type: z.enum(["Renda", "Despesa"], {
    errorMap: () => ({ message: "Obrigatório" })
  }),
  category: z.string().min(3, "Min. 3 letras")
});

type TransactionForm = z.infer<typeof transactionSchema>;

// Helpers de formatação para BRL Real-Time
const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
};

export default function TransactionSection() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isEditing = editingId !== null;
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    setValue: setFormValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      value: "",
      type: undefined as any,
      category: ""
    }
  });

  const filteredTransactions = [...transactions]
    .filter((item) =>
      item.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // Ordena Renda primeiro, depois Despesa, e então por maior valor
      if (a.type === "Renda" && b.type !== "Renda") return -1;
      if (a.type !== "Renda" && b.type === "Renda") return 1;
      return b.value - a.value;
    });

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if(error){
      console.error(error.message);
      return;
    }
    setTransactions(data || []);
  }

  async function onSubmit(data: TransactionForm) {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) {
      toast({ title: "Usuário não autenticado", variant: "destructive" });
      return;
    }

    const numericValue = parseCurrencyInput(data.value);

    if (isEditing) {
      const { error } = await supabase
        .from("transactions")
        .update({
          value: numericValue,
          type: data.type,
          category: data.category
        })
        .eq("id", editingId);

      if(error) {
        toast({ title: "Erro na edição", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Transação atualizada!" });
      setEditingId(null);
    } else {
      const { error } = await supabase
        .from("transactions")
        .insert({
          value: numericValue,
          type: data.type,
          category: data.category,
          user_id: user.id
        });

      if(error) {
         toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
         return;
      }
      toast({ title: "Transação adicionada!" });
    }

    reset();
    await loadTransactions();
    // 🎓 Avisa o React Query que os dados novos chegaram, para o Nivo Chart redesenhar a tela
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  }

  async function deleteTransaction(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if(error){
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
      return;
    }
    await loadTransactions();
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    toast({ title: "Transação removida" });
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    setFormValue("value", formatCurrencyInput((item.value * 100).toFixed(0)));
    setFormValue("type", item.type as any);
    setFormValue("category", item.category);
  }

  function cancelEdit() {
    setEditingId(null);
    reset();
  }

  function toggleEdit(item: any) {
    if(editingId === item.id) cancelEdit();
    else startEdit(item);
  }

  return (    
    <section className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
      
      <h2 className="font-heading font-bold text-xl mb-6 text-foreground">
        Lançamentos Manuais
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          // Garante que pressionar Enter em qualquer campo do formulário envia os dados
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }
        }}
        className="flex flex-wrap items-start gap-4 bg-muted/40 p-5 rounded-xl border border-border mb-8"
      >
        
        {/* Valor Input */}
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Valor</label>
          <div className="relative flex items-center bg-background rounded-lg border border-border focus-within:ring-2 focus-within:ring-ring transition-all">
            <span className="pl-3 text-muted-foreground font-medium select-none text-sm">R$</span>
            <Controller
              name="value"
              control={control}
              render={({ field: { onChange, value } }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0,00"
                  className="w-full bg-transparent px-2 py-2.5 text-foreground outline-none text-sm font-semibold"
                  value={value}
                  onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
                />
              )}
            />
          </div>
          {errors.value && (
            <motion.span initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium"><AlertCircle size={12}/> {errors.value.message}</motion.span>
          )}
        </div>
    
        {/* Tipo Select */}
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Tipo</label>
          <select 
            {...register("type")}
            className="w-full border border-border bg-background rounded-lg px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all text-sm font-semibold h-[42px]"
          >
            <option value="Renda">Renda</option>
            <option value="Despesa">Despesa </option>
          </select>
          {errors.type && (
            <motion.span initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium"><AlertCircle size={12}/> {errors.type.message}</motion.span>
          )}
        </div>
       
        {/* Categoria Input */}
        <div className="flex-[2] min-w-[200px]">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Categoria / Descrição</label>
          <input 
            {...register("category")}
            type="text"
            placeholder="Ex: Supermercado, Salário..."
            className="w-full border border-border bg-background rounded-lg px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all text-sm font-semibold h-[42px]"
          />
          {errors.category && (
            <motion.span initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-destructive text-xs mt-1.5 flex items-center gap-1 font-medium"><AlertCircle size={12}/> {errors.category.message}</motion.span>
          )}
        </div>
        
        {/* Botões Ação */}
        <div className="w-full flex gap-3 justify-end mt-2 md:mt-6 md:w-auto">
          {isEditing && (
            <motion.button 
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={cancelEdit}
              className="px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted font-medium text-sm transition"
            >
              Cancelar
            </motion.button>
          )}
          <motion.button 
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 font-medium text-sm transition flex items-center gap-2 disabled:opacity-50"
          >
             {isSubmitting ? "Processando..." : (isEditing ? "Salvar Edição" : "Lançar")}
          </motion.button>
        </div>
      </form>

      {/* lista de transações */}
      <div className="max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sticky top-0 bg-card py-2 z-10 border-b border-border">
          <h2 className="text-lg font-heading font-bold text-foreground">
            Histórico Recente
          </h2>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="🔎 Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border border-border bg-background rounded-full px-4 py-1.5 w-full text-sm focus:ring-2 focus:ring-ring outline-none transition-all"
            />
          </div>
        </div>

        {transactions.length === 0 && (
          <div className="text-muted-foreground text-center py-10 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
             <p className="font-semibold mb-1">Nenhuma transação registrada.</p>
             <p className="text-sm">Comece adicionando seus ganhos e gastos no formulário.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filteredTransactions.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={item.id}
              className={`flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/70 transition-colors rounded-xl border ${editingId === item.id ? 'border-primary ring-1 ring-primary' : 'border-transparent'}`}
            >
              <div className="flex flex-col gap-1 w-1/3">
                <span className="font-semibold text-foreground text-sm truncate">{item.category}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.type}</span>
              </div>

              <div className={`flex-1 text-right font-bold text-lg ${
                item.type === "Renda" ? "text-green-500" : "text-destructive"
              }`}>
                {item.type === "Renda" ? "+ " : "- "}
                R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* BOTÕES */}
              <div className="flex gap-2 ml-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors ${editingId === item.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  onClick={() => toggleEdit(item)}
                >
                  {editingId === item.id ? <X size={16} /> : <Pencil size={16} />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive hover:text-white p-2 rounded-lg transition-colors"
                  onClick={() => deleteTransaction(item.id)}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}