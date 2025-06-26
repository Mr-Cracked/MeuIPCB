import React from "react";
import "../calendario.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export function CalendarioExames() {
    return (
        <div className="perfil-container">
            <div className="main-layout">

                {/* Conteúdo principal */}
                <main className="content">
                    <TopNavbar />

                    <div className="calendario-wrapper">
                        <h2>Calendário de Exames</h2>

                        <div className="pdf-container">
                            <iframe
                                src="http://localhost:3000/api/curso/epoca/Exame"
                                title="Calendário de Exames"
                                width="100%"
                                height="800px"
                                frameBorder="0"
                            ></iframe>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CalendarioExames;
