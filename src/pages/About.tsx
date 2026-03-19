import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css"; 
import Header from "@/components/Header";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans transition-colors duration-500">
      
      {/* ─── Background Glow ─── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40 dark:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#1D4F91]/10 dark:bg-[#1D4F91]/20 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-[#77127B]/10 dark:bg-[#77127B]/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] bg-[#E80070]/5 dark:bg-[#E80070]/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        <Header />

        {/* ─── Seção Sobre o Projeto ─── */}
        <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#E80070] via-[#C1188B] to-[#77127B]">
            Um projeto Transforma-se: "DebtView"
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto transition-colors duration-300">
           Nosso projeto é em parceria com a empresa Serasa Experian e SENAC-SP. Nascido na cidade de São Carlos-SP, tem como principal objetivo ajudar nossos usuários a terem mais controle sobre suas próprias finanças, mostrando análises, gráficos, planilhas, além de um auxílio de Chatbot individualizado. Disponibilizamos links externos para que seja possível realizar renegociações de dívidas e amortizações.
          </p>
        </section>

        {/* ─── Seção do Time ─── */}
        <section className="py-16 px-6">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1D4F91] dark:text-white mb-12 transition-colors duration-300">
              Desenvolvedores:
            </h2>
            
            {/* Flex Container para manter lado a lado */}
            <div className="flex flex-wrap justify-center gap-6"> 
              
              {/* Card do Guilherme */}
              <div className="flex-1 min-w-[250px] max-w-[300px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#426DA9]/10 hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1D4F91] to-[#426DA9] shadow-lg shadow-[#426DA9]/20 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  G
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Guilherme</h3>
                <p className="text-[#426DA9] dark:text-[#8CB4F5] text-sm font-medium mt-2 leading-relaxed">XX anos, nascido em XXXX, "blábláblá".<br/><br/>LinkedIn: ...</p>
              </div>

              {/* Card do Vitor */}
              <div className="flex-1 min-w-[250px] max-w-[300px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#77127B]/10 hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#426DA9] to-[#77127B] shadow-lg shadow-[#77127B]/20 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  V
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Vitor</h3>
                <p className="text-[#77127B] dark:text-[#E88CEE] text-sm font-medium mt-2 leading-relaxed">XX anos, nascido em XXXX, "blábláblá".<br/><br/>LinkedIn: ...</p>
              </div>

              {/* Card da Alexia */}
              <div className="flex-1 min-w-[250px] max-w-[300px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#E80070]/10 hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#C1188B] to-[#E80070] shadow-lg shadow-[#E80070]/20 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  A
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Lucas</h3>
               <p className="text-[#426DA9] dark:text-[#8CB4F5] text-sm font-medium mt-2 leading-relaxed">XX anos, nascido em XXXX, "blábláblá".<br/><br/>LinkedIn: ...</p>
              </div>

              {/* Card do Lucas */}
              <div className="flex-1 min-w-[250px] max-w-[300px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#1D4F91]/10 hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#1D4F91] to-[#C1188B] shadow-lg shadow-[#1D4F91]/20 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  L
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Alexia</h3>
                <p className="text-[#C1188B] dark:text-[#FF85BB] text-sm font-medium mt-2 leading-relaxed">XX anos, nascido em XXXX, "blábláblá".<br/><br/>LinkedIn: ...</p>
              </div>

               {/* Card da Ketlyn */}
               <div className="flex-1 min-w-[250px] max-w-[300px] bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#1D4F91]/10 hover:-translate-y-2 transition-all duration-300 text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-[#426DA9] to-[#E80070] shadow-lg shadow-[#426DA9]/20 text-white rounded-full flex items-center justify-center mx-auto mb-6 font-bold text-3xl transition-transform group-hover:scale-110 duration-300">
                  K
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white transition-colors">Ketlyn</h3>
                <p className="text-[#426DA9] dark:text-[#8CB4F5] text-sm font-medium mt-2 leading-relaxed">XX anos, nascido em XXXX, "blábláblá".<br/><br/>LinkedIn: ...</p>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}