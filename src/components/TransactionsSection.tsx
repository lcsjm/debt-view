import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import supabase from "../../utils/supabase";
import { Trash2, Pencil, Brush, X } from "lucide-react"

export default function TransactionSection() {

  const [value, setValue] = useState<number>(0)
  const [type, setType] = useState("")
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const isEditing = editingId !== null
  const filteredTransactions = [...transactions]
    .filter((item) =>
      item.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {

      if (a.type === "Renda" && b.type !== "Renda") return -1
      if (a.type !== "Renda" && b.type === "Renda") return 1

      return b.value - a.value

   })

  // carregar transações ao abrir a página
  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions(){

    const { data: { user } } = await supabase.auth.getUser()

    if(!user){
      alert("Usuário não autenticado")
      return
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false })

    if(error){
      alert(error.message)
      return
    }

    setTransactions(data || [])

  }

  async function createTransaction(){

    const { data: { user } } = await supabase.auth.getUser()

    if(!user){
      alert("Usuário não autenticado")
      return
    }

    const { error } = await supabase
      .from("transactions")
      .insert({
        value,
        type,
        category,
        user_id: user.id
      })

    if(error){
      alert(error.message)
      return
    }

    // limpar inputs
    setValue(0)
    setType("")
    setCategory("")

    // atualizar lista
    await loadTransactions()

  }

  async function deleteTransaction(id: string){

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)

  if(error){
    alert(error.message)
    return
  }

  await loadTransactions()

}

function startEdit(item: any){
  setValue(item.value)
  setType(item.type)
  setCategory(item.category)
  setEditingId(item.id)
}

async function updateTransaction(){

  if(!editingId) return

  const { error } = await supabase
    .from("transactions")
    .update({
      value,
      type,
      category
    })
    .eq("id", editingId)

  if(error){
    alert(error.message)
    return
  }

  // limpar edição
  setEditingId(null)
  setValue(0)
  setType("")
  setCategory("")

  await loadTransactions()
}
function cancelEdit(){
  setEditingId(null)
  setValue(0)
  setType("")
  setCategory("")
}
function toggleEdit(item: any){

  if(editingId === item.id){
    cancelEdit()
  }else{
    startEdit(item)
  }

}

  return (    
    <section className="bg-white rounded-2xl p-6 shadow-md">

      <h2 className="text-center font-bold text-xl mb-4">
        Insira seus valores financeiros</h2>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h2>Insira o valor</h2>
             <input className="border rounded-lg px-3 py-2 mb-6"
            type="number"
            placeholder="Valor"
            value={value}
            onChange={(e)=>setValue(Number(e.target.value))}
          />
        </div>
    
        <div>
          <h2>Selecione o tipo</h2>
              <select className="border rounded-lg px-3 py-2 mb-6"
                value={type}
                onChange={(e)=>setType(e.target.value)}
              >
                <option value="">Tipo</option>
                <option value="Renda">Renda</option>
                <option value="Despesa">Despesa</option>
              </select>
        </div>
       
        <div>
          <h2>digite a categoria</h2>
            <input className="border rounded-lg px-3 py-2 mb-6"
            type="text"
            placeholder="Categoria"
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
          />
        </div>
        

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition mb-6"
           onClick={isEditing ? updateTransaction : createTransaction}
           >
          {isEditing ? "Salvar edição" : "Adicionar transação"}
        </button>
     
      </div >


      {/* lista de transações */}

  <div className="max-h-[420px]">

    <div className="flex justify-between items-center mb-4">

      <h2 className="text-xl font-bold">
        Sua lista de transações
      </h2>

      <input
        type="text"
        placeholder="🔎 Buscar..."
        className="border rounded-lg px-3 py-2 w-56"
      />
    </div>

  {transactions.length === 0 && (
    <p className="text-gray-500 text-center py-6">
      Nenhuma transação ainda
    </p>
  )}

  <div className="flex flex-col divide-y ">
     

    {filteredTransactions.map((item) => (

      <div
        key={item.id}
        className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 transition rounded-lg"
      >

        {/* CATEGORIA */}
        <div className="flex-1 font-medium">
          {item.category}
        </div>

        {/* TIPO */}
        <div className="flex-1 text-sm text-gray-500">
          {item.type}
        </div>

        {/* VALOR */}
        <div className={`flex-1 font-bold ${
          item.type === "Renda"
            ? " font-bold text-lg text-green-600"
            : "font-bold text-lg text-red-500"
        }`}>
          R$ {item.value}
        </div>

        {/* BOTÕES */}
        <div className="flex gap-2">

          <button
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition"
            onClick={() => toggleEdit(item)}
          >
            {editingId === item.id ? <X size={14} /> : <Brush size={14} />}
          </button>

          <button
            className="flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition"
            onClick={() => deleteTransaction(item.id)}
          >
            <Trash2 size={14} />
          </button>

        </div>

      </div>

    ))}

  </div>

</div>

<div className="mt-4 flex justify-center">
  <button className="text-blue-600 hover:text-blue-800 font-medium">
    Ver histórico completo →
  </button>
</div>

    </section>

  )
}