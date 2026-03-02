import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css"
export default function Resultado(){
    return (
        <>
        <section>
            <h1>Resultado da calculadora financeira</h1>
        </section>
        <section>
            <div className="col lg-3">
                <div className="shadow">
                </div>
                    <h2>Renda Fixa</h2>
                <div className="shadow">
                </div>
                    <h2>Renda varivael</h2>
                <div className="shadow">
                </div>
                    <h2>Gasto fixos</h2>
                <div className="shadow">
                </div>
                    <h2>Gastos Variavies</h2>
                <div className="shadow">
                </div>
                    <h2>Valor Total das Dividas</h2>
                <div className="shadow">
                    <h2>Investimentos</h2>
                </div>
            </div>
        </section>
        
        </>
    )
}