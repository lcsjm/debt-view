"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion, Variants } from "framer-motion";
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col bg-[#0A101D] overflow-hidden">
      
      {/* BACKGROUND FLUIDO E DINÂMICO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Esfera Azul */}
        <motion.div 
          animate={{ 
            x: [0, 100, -50, 0], 
            y: [0, 50, -100, 0], 
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#1D4F91] rounded-full blur-[130px] opacity-50 transform-gpu will-change-transform"
        />
        {/* Esfera Roxa */}
        <motion.div 
          animate={{ 
            x: [0, -120, 80, 0], 
            y: [0, -80, 120, 0], 
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[5%] w-[55%] h-[55%] bg-[#77127B] rounded-full blur-[150px] opacity-40 transform-gpu will-change-transform"
        />
        {/* Esfera Rosa/Magenta (Nova) */}
        <motion.div 
          animate={{ 
            x: [0, 80, -100, 0], 
            y: [0, -120, 60, 0], 
            scale: [0.9, 1.1, 0.9] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-[#E80070] rounded-full blur-[140px] opacity-30 transform-gpu will-change-transform"
        />
      </div>

      {/* BOTÃO VOLTAR MELHORADO */}
      <motion.button
        onClick={handleBack}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/5 hover:bg-white/15 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300 group text-white/80 hover:text-white shadow-lg"
      >
        <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
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
            className="bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm flex flex-col items-center text-center shadow-2xl"
          >
            <h2 className="text-4xl font-bold mb-8">
              Fale Conosco
            </h2>

            {/* EMAIL */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-gradient-to-br from-[#E80070] to-[#C1188B] shadow-lg shadow-[#E80070]/20">
                <Mail size={22} />
              </div>
              <span className="text-lg">
                suporte.debtview@gmail.com
              </span>
            </div>

            {/* QR CODE */}
            <div className="mt-4 flex flex-col items-center group">
              <div className="overflow-hidden rounded-xl shadow-lg border border-white/10 transition-transform duration-500 group-hover:scale-105 group-hover:shadow-[#77127B]/30">
                <img
                  src="/qrcode.jpg"
                  alt="QR Code"
                  className="w-40 h-40 object-cover"
                />
              </div>
              <span className="text-sm text-white/60 mt-4 transition-colors duration-300 group-hover:text-white/90">
                Escaneie para contato rápido
              </span>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-[#0b132b]/60 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm flex flex-col gap-6 shadow-2xl"
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
                className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#E80070]/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Seu e-mail"
                required
                className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#E80070]/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
              />
            </div>

            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Assunto"
              required
              className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#E80070]/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Sua mensagem..."
              required
              rows={4}
              className="p-4 rounded-xl bg-white/5 border border-white/10 focus:border-[#E80070]/50 focus:bg-white/10 focus:outline-none transition-all duration-300 resize-none"
            />

            {/* BOTÃO ENVIAR MELHORADO */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(119,18,123,0.3)] hover:shadow-[0_0_30px_rgba(232,0,112,0.5)] transition-all duration-500"
            >
              {/* Efeito de brilho ao passar o mouse */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <Send size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 relative z-10" />
              <span className="relative z-10">Enviar Mensagem</span>
            </motion.button>
          </motion.form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}