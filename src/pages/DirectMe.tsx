import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Send, ArrowLeft } from "lucide-react";
import supabase from "../../utils/supabase";
import Footer from "@/components/footer";

export default function DirectMe() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase.from("contatos").insert([
      {
        nome: form.name,
        email: form.email,
        assunto: form.subject,
        mensagem: form.message,
      },
    ]);

    if (error) {
      console.error("Erro ao enviar:", error.message);
      alert("Erro ao enviar mensagem 😢");
      return;
    }

    alert("Mensagem enviada com sucesso 🚀");

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col bg-[#0A101D] overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#1D4F91] rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[20%] right-[10%] w-[60%] h-[60%] bg-[#77127B] rounded-full blur-[150px]"
        />
      </div>

      {/* BOTÃO VOLTAR */}
      <motion.button
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/20"
      >
        <ArrowLeft size={20} />
        Voltar
      </motion.button>

      {/* CONTEÚDO */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-6xl grid md:grid-cols-2 gap-10"
        >

          {/* INFO */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 p-10 rounded-[2rem] border border-white/10 flex flex-col items-center text-center"
          >
            <h2 className="text-4xl font-bold mb-8">
              Fale Conosco
            </h2>

            {/* EMAIL */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-gradient-to-br from-[#E80070] to-[#C1188B]">
                <Mail size={22} />
              </div>
              <span className="text-lg">
                suporte.debtview@gmail.com
              </span>
            </div>

            {/* QR CODE */}
            <div className="mt-4 flex flex-col items-center">
              <img
                src="/qrcode.jpg"
                alt="QR Code"
                className="w-40 h-40 rounded-lg shadow-lg"
              />
              <span className="text-sm text-white/60 mt-3">
                Escaneie para contato rápido
              </span>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-[#0b132b]/60 p-10 rounded-[2rem] border border-white/10 flex flex-col gap-6"
          >
            <h2 className="text-3xl font-bold">Envie uma mensagem</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Seu e-mail"
                required
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              />
            </div>

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Assunto"
              required
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Sua mensagem..."
              required
              rows={4}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] p-4 rounded-xl font-bold"
            >
              <Send size={18} />
              Enviar Mensagem
            </button>
          </motion.form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}