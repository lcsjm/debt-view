import { useState } from "react";
import { Link } from "react-router-dom";
import css from "../App.css"
export default function About(){
    return (
        <>
        <section>
        <h1>O que seria o projeto do endividamento ?</h1>
        <p> O projeto de endividamento tem como proposito ajudar as pessoas a enteder seus gasto e consequetimente sair da divida, com a ideia de apresentar uma tabela com seus gasto para enteder</p>
        </section>
        <section>
            <h1>Quem faz parte do time?</h1>
            <div className="col lg-4"> 
                <div className="shadow">
                    <h2>Guilherme</h2>
                    <p>oi sou guilherme</p>
                </div>

                <div className="shadow">
                    <h2>Vitor</h2>
                    <p>oi sou vitor</p>
                </div>

                <div className="shadow">
                        <h2>Alexia</h2>
                        <p>oi sou Alexia</p>
                </div>
                
                <div className="shadow">
                    <h2>Lucas</h2>
                    <p>oi sou lucas</p>
                </div>
                </div>
        </section>
        
        </>
    )
}