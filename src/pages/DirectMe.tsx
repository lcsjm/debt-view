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
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col bg-[#0A101D] overflow-hidden">
      
      {/* BACKGROUND DINÂMICO COM FRAMER MOTION */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#1D4F91] rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[20%] right-[10%] w-[60%] h-[60%] bg-[#77127B] rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] left-[20%] w-[80%] h-[60%] bg-[#E80070] rounded-full blur-[140px] mix-blend-screen" 
        />
      </div>

      {/* BOTÃO VOLTAR */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05, x: -5, backgroundColor: "rgba(255,255,255,0.2)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg transition-colors"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
        <span className="font-semibold">Voltar</span>
      </motion.button>

      {/* CONTEÚDO */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="w-full max-w-6xl grid md:grid-cols-2 gap-10 mt-20 md:mt-0"
        >

          {/* INFO */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col justify-center relative overflow-hidden group"
          >
            {/* Brilho sutil no card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <h2 className="text-5xl font-black mb-8 text-white drop-shadow-md tracking-tight">
              Fale Conosco
            </h2>

            <div className="space-y-6 mt-2 relative z-10">
              <div className="flex items-center gap-5 group/item cursor-pointer">
                <div className="p-3.5 rounded-full bg-gradient-to-br from-[#E80070] to-[#C1188B] shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                  <Mail className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-medium text-white/90 group-hover/item:text-white transition-colors">suporte@serasaexperian.com</span>
              </div>
              
              <div className="flex items-center gap-5 group/item cursor-pointer">
                <div className="p-3.5 rounded-full bg-gradient-to-br from-[#77127B] to-[#C1188B] shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                  <Phone className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-medium text-white/90 group-hover/item:text-white transition-colors">(11) 99999-9999</span>
              </div>
              
              <div className="flex items-center gap-5 group/item cursor-pointer">
                <div className="p-3.5 rounded-full bg-gradient-to-br from-[#1D4F91] to-[#426DA9] shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                  <MapPin className="text-white" size={24} strokeWidth={2.5} />
                </div>
                <span className="text-lg font-medium text-white/90 group-hover/item:text-white transition-colors">São Carlos - SP</span>
              </div>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-[#0b132b]/60 backdrop-blur-3xl p-10 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col gap-6"
          >
            <h2 className="text-3xl font-bold text-white mb-2">Envie uma mensagem</h2>

            <div className="grid md:grid-cols-2 gap-5">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Seu nome"
                required
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 outline-none transition-all duration-300 hover:bg-white/10 focus:bg-white/10 focus:border-[#426DA9] focus:ring-2 focus:ring-[#426DA9]/30"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Seu e-mail"
                required
                className="p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 outline-none transition-all duration-300 hover:bg-white/10 focus:bg-white/10 focus:border-[#426DA9] focus:ring-2 focus:ring-[#426DA9]/30"
              />
            </div>

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Assunto"
              required
              className="p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 outline-none transition-all duration-300 hover:bg-white/10 focus:bg-white/10 focus:border-[#77127B] focus:ring-2 focus:ring-[#77127B]/30 w-full"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Sua mensagem..."
              required
              rows={4}
              className="p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/50 outline-none transition-all duration-300 hover:bg-white/10 focus:bg-white/10 focus:border-[#E80070] focus:ring-2 focus:ring-[#E80070]/30 w-full resize-none"
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(232,0,112,0.2)] hover:shadow-[0_0_30px_rgba(232,0,112,0.5)] transition-shadow duration-300"
            >
              <Send size={20} strokeWidth={2.5} />
              Enviar Mensagem
            </motion.button>
          </motion.form>
        </motion.div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>
    </div>
  );
}