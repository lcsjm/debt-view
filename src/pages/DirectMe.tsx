import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ArrowLeft } from "lucide-react";
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
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col bg-[#0A101D] overflow-hidden">
      
      {/* BACKGROUND CORRIGIDO */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D4F91] via-[#77127B] to-[#E80070] bg-[length:300%_300%] animate-gradient-slow blur-3xl mix-blend-screen opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-tl from-[#426DA9] via-transparent to-[#C1188B] bg-[length:300%_300%] animate-gradient-fast blur-2xl opacity-40" />
      </div>

      {/* BOTÃO VOLTAR */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/10"
      >
        <ArrowLeft size={18} />
        Voltar
      </motion.button>

      {/* CONTEÚDO */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-6xl grid md:grid-cols-2 gap-10 mt-16 md:mt-0"
        >

          {/* INFO */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col justify-center"
          >
            <h2 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#426DA9] to-[#E80070]">
              Fale Conosco
            </h2>

            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <Mail className="text-[#E80070]" size={24} />
                <span>suporte@serasaexperian.com</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-[#C1188B]" size={24} />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-[#77127B]" size={24} />
                <span>São Carlos-SP</span>
              </div>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-[#0b132b]/50 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl space-y-6 border border-white/10"
          >
            <h2 className="text-3xl font-semibold">Envie uma mensagem</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className="p-4 rounded-xl bg-white/5"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Seu e-mail"
                required
                className="p-4 rounded-xl bg-white/5"
              />
            </div>

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Assunto"
              required
              className="p-4 rounded-xl bg-white/5 w-full"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Mensagem"
              required
              className="p-4 rounded-xl bg-white/5 w-full"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#1D4F91] to-[#E80070] p-4 rounded-xl"
            >
              Enviar
            </button>
          </motion.form>
        </motion.div>
      </div>

      {/* FOOTER COM Z-INDEX */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}