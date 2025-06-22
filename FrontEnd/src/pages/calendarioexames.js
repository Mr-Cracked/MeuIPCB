import React from "react";
import "../calendario.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export function CalendarioExames() {
    return (
        <div className="perfil-container">
            <div className="main-layout">
                {/* Sidebar */}
                <aside className="sidebar">
                    <h2>MeuIPCB</h2>
                    <ul>
                        <li>
                            <NavLink to="/perfil" className={({ isActive }) => (isActive ? "link ativo" : "link")}>Perfil</NavLink>
                        </li>
                        <li>
                            <NavLink to="/horario" className={({ isActive }) => (isActive ? "link ativo" : "link")}>Horário</NavLink>
                        </li>
                        <li className="dropdown">
                            <span className="dropdown-label">Calendarios ▾</span>
                            <ul className="dropdown-content">
                                <li><NavLink to="/calendarioescolar" >Escolar</NavLink></li>
                                <li><NavLink to="/calendariofrequencia" >Frequências</NavLink></li>
                                <li><NavLink to="/calendarioexames" className="ativo">Exame/Recurso</NavLink></li>
                            </ul>
                        </li>
                        <li className="dropdown">
                            <span className="dropdown-label">escola ▾</span>
                            <ul className="dropdown-content">
                                <li><NavLink to="/disciplinas">disciplinas</NavLink></li>
                                <li><NavLink to="/contactos">contactos</NavLink></li>
                                <li><NavLink to="/anuncios">anuncios</NavLink></li>
                                <li><NavLink to="/mapa">mapa</NavLink></li>
                            </ul>
                        </li>
                        <li>
                            <NavLink to="/todo" className={({ isActive }) => (isActive ? "link ativo" : "link")}>to-do</NavLink>
                        </li>
                        <li>
                            <NavLink to="/moodle" className={({ isActive }) => (isActive ? "link ativo" : "link")}>moodle</NavLink>
                        </li>
                        <li>
                            <NavLink to="/netpa" className={({ isActive }) => (isActive ? "link ativo" : "link")}>netpa</NavLink>
                        </li>
                    </ul>
                </aside>

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
