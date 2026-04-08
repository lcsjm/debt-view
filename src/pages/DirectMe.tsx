"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion, Variants } from "framer-motion";
import { Mail, Send, ArrowLeft } from "lucide-react";
import { useContact } from "@/hooks/usecontatos";
import Footer from "@/components/footer";

export default function DirectMe() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const { sendMessage, loading } = useContact();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await sendMessage(form);

      alert("Mensagem enviada com sucesso 🚀");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (err: any) {
      console.error("Erro:", err.message);
      alert("Erro ao enviar mensagem 😢");
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1], // ✅ corrigido
      },
    },
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col bg-[#0A101D] overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, -50, 0], y: [0, 50, -100, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#1D4F91] rounded-full blur-[130px] opacity-50"
        />
        <motion.div 
          animate={{ x: [0, -120, 80, 0], y: [0, -80, 120, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] right-[5%] w-[55%] h-[55%] bg-[#77127B] rounded-full blur-[150px] opacity-40"
        />
        <motion.div 
          animate={{ x: [0, 80, -100, 0], y: [0, -120, 60, 0], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-[#E80070] rounded-full blur-[140px] opacity-30"
        />
      </div>

      {/* BOTÃO VOLTAR */}
      <motion.button
        onClick={handleBack}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/5 hover:bg-white/15 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-300 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
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
            className="bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm flex flex-col items-center text-center"
          >
            <h2 className="text-4xl font-bold mb-8">
              Fale Conosco
            </h2>

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
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeqlY90_FbVFchQGoOgrjMuvDfbdXKQqpt0-3XOtAuBAwmVIg/viewform?usp=publish-editor"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/qrcode.jpg"
                  alt="QR Code"
                  className="w-40 h-40 rounded-lg shadow-lg hover:opacity-80 transition"
                />
              </a>

              <p className="mt-4 text-sm text-white/70 max-w-xs leading-relaxed">
                Escaneie o QR Code para acessar nosso formulário de feedback. Sua opinião é essencial para melhorarmos a plataforma e criar novas funcionalidades para você.
              </p>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit}
            className="bg-[#0b132b]/60 p-10 rounded-[2rem] border border-white/10 backdrop-blur-sm flex flex-col gap-6"
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
              className="p-4 rounded-xl bg-white/5 border border-white/10 resize-none"
            />

            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}