

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Send, ArrowLeft, ExternalLink } from "lucide-react";
import supabase from "../../utils/supabase";
import Footer from "@/components/footer";

export default function DirectMe() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("contatos").insert([
        {
          nome: form.name,
          email: form.email,
          assunto: form.subject,
          mensagem: form.message,
        },
      ]);

      if (error) throw error;

      alert("Mensagem enviada com sucesso 🚀");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (err: any) {
      console.error("Erro Supabase:", err);
      alert("Erro ao enviar mensagem 😢");
    } finally {
      setLoading(false);
    }
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
      
      {/* BOTÃO VOLTAR */}
      <motion.button
        onClick={handleBack}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/20"
      >
        <ArrowLeft size={20} />
        Voltar
      </motion.button>

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

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-full bg-gradient-to-br from-[#E80070] to-[#C1188B]">
                <Mail size={22} />
              </div>
              <span className="text-lg">
                suporte.debtview@gmail.com
              </span>
            </div>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeqlY90_FbVFchQGoOgrjMuvDfbdXKQqpt0-3XOtAuBAwmVIg/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 mt-2 mb-6 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1D4F91] to-[#77127B]"
            >
              <ExternalLink size={18} />
              <span>Responder formulário de feedback</span>
            </a>

           <div className="mt-2 flex flex-col items-center">
  <a
    href="https://docs.google.com/forms/d/e/1FAIpQLSeqlY90_FbVFchQGoOgrjMuvDfbdXKQqpt0-3XOtAuBAwmVIg/viewform?usp=publish-editor"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="/qrcode.jpg"
      alt="QR Code Feedback"
      className="w-40 h-40 rounded-lg shadow-lg cursor-pointer hover:opacity-80 transition"
    />
  </a>

  {/* CONTEXTUALIZAÇÃO */}
  <p className="mt-4 text-sm text-white/70 max-w-xs leading-relaxed">
    Escaneie o QR Code para acessar nosso formulário de feedback. Sua opinião é
    essencial para melhorarmos continuamente a plataforma, corrigirmos possíveis
    problemas e implementarmos novas funcionalidades que atendam melhor às suas necessidades.
  </p>
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1D4F91] via-[#77127B] to-[#E80070] p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={18} />
              {loading ? "Enviando..." : "Enviar Mensagem"}
            </button>
          </motion.form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}