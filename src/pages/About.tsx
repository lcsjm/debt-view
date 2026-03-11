import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css"
import Header from "@/components/Header";
export default function About(){
    return (
        <>
            <Header/>

  {/* Seção Sobre o Projeto */}
  <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center">
    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
      O que seria o projeto do endividamento?
    </h1>
    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
      O projeto de endividamento tem como propósito ajudar as pessoas a entender seus gastos e, 
      consequentemente, sair da dívida, com a ideia de apresentar uma tabela detalhada 
      para facilitar a compreensão financeira.
    </p>
  </section>

  {/* Seção do Time */}
  <section className="py-12 px-6 bg-slate-50">
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-10">
        Quem faz parte do time?
      </h1>
      
      {/* Grid Responsivo: 1 col no mobile, 2 no tablet, 4 no desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> 
        
        {/* Card do Guilherme */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            G
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Guilherme</h2>
          <p className="text-slate-500 mt-2">Desenvolvedor</p>
        </div>

        {/* Card do Vitor */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            V
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Vitor</h2>
          <p className="text-slate-500 mt-2">Analista</p>
        </div>

        {/* Card da Alexia */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300 text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            A
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Alexia</h2>
          <p className="text-slate-500 mt-2">Designer</p>
        </div>

        {/* Card do Lucas */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            L
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Lucas</h2>
          <p className="text-slate-500 mt-2">Gestor</p>
        </div>
        
      </div>
    </div>
  </section>
</>
    )
};