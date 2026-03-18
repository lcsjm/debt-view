import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css"; 
import Header from "@/components/Header";

export default function About() {
  return (
  
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden font-sans transition-colors duration-500">
      
      {/* ─── Background Glow (Mais suave no claro, intenso no escuro) ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40 dark:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#1D4F91]/10 dark:bg-[#1D4F91]/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-[#77127B]/10 dark:bg-[#77127B]/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-[#E80070]/5 dark:bg-[#E80070]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ─── Seção Sobre o Projeto ─── */}
        <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#E80070] via-[#C1188B] to-[#77127B]">
            O que seria o projeto do endividamento?
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-white/70 leading-relaxed max-w-3xl mx-auto transition-colors duration-300">
            O projeto de endividamento tem como propósito ajudar as pessoas a entender seus gastos e, 
            consequentemente, sair da dívida, com a ideia de apresentar uma tabela detalhada 
            para facilitar a compreensão financeira.
          </p>
        </section>

        {/* ─── Seção do Time ─── */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 dark:text-white mb-12 transition-colors duration-300">
              Quem faz parte do time?
            </h2>
            
            {/* Grid Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> 
              
              {/* Card do Guilherme */}
              <div className="bg-white dark:bg-white/[0.05] border border-slate-100 dark:border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-md dark:shadow-xl hover:shadow-lg dark:hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1D4F91] to-[#426DA9] shadow-lg shadow-[#426DA9]/20 dark:shadow-[#426DA9]/30 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  G
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Guilherme</h3>
                <p className="text-[#426DA9] font-medium mt-1">Desenvolvedor</p>
              </div>

              {/* Card do Vitor */}
              <div className="bg-white dark:bg-white/[0.05] border border-slate-100 dark:border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-md dark:shadow-xl hover:shadow-lg dark:hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#426DA9] to-[#77127B] shadow-lg shadow-[#77127B]/20 dark:shadow-[#77127B]/30 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  V
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Vitor</h3>
                <p className="text-[#77127B] font-medium mt-1 group-hover:text-[#C1188B] transition-colors">Analista</p>
              </div>

              {/* Card da Alexia */}
              <div className="bg-white dark:bg-white/[0.05] border border-slate-100 dark:border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-md dark:shadow-xl hover:shadow-lg dark:hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#C1188B] to-[#E80070] shadow-lg shadow-[#E80070]/20 dark:shadow-[#E80070]/30 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  A
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Alexia</h3>
                <p className="text-[#E80070] font-medium mt-1">Designer</p>
              </div>

              {/* Card do Lucas */}
              <div className="bg-white dark:bg-white/[0.05] border border-slate-100 dark:border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-md dark:shadow-xl hover:shadow-lg dark:hover:bg-white/[0.08] hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1D4F91] to-[#C1188B] shadow-lg shadow-[#1D4F91]/20 dark:shadow-[#1D4F91]/30 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  L
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Lucas</h3>
                <p className="text-[#C1188B] font-medium mt-1">Gestor</p>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}