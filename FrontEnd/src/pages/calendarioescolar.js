import React from "react";
import "../calendario.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export function CalendarioEscolar() {
    return (
        <div className="perfil-container">
            <div className="main-layout">
                {/* Conteúdo principal */}
                <main className="content">
                    <TopNavbar />

                    <div className="calendario-wrapper">
                        <h2>Calendário Escolar</h2>

                        <div className="pdf-scroll-container">
                            <iframe
                                src="http://localhost:3000/api/escola/"
                                title="Calendário Escolar"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                            ></iframe>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CalendarioEscolar;
