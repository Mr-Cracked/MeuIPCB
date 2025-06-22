import React, { useEffect, useState } from "react";
import axios from "axios";
import "../contactos.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export default function Contactos() {
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    async function fetchDados() {
      try {
        const alunosRes = await axios.get(
          "http://localhost:3000/api/aluno/emails",
          { withCredentials: true }
        );
        setAlunos(alunosRes.data);

        const profsRes = await axios.get(
          "http://localhost:3000/api/professor/professores",
          { withCredentials: true }
        );
        setProfessores(profsRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }

    fetchDados();
  }, []);

  return (
    <div className="perfil-container">
      <div className="main-layout">
        {/* Sidebar igual à do perfil */}
        <aside className="sidebar">
          <h2>MeuIPCB</h2>
          <ul>
            <li>
              <NavLink
                to="/perfil"
                className={({ isActive }) => (isActive ? "link ativo" : "link")}
              >
                Perfil
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/horario"
                className={({ isActive }) => (isActive ? "link ativo" : "link")}
              >
                Horário
              </NavLink>
            </li>
            <li className="dropdown">
              <span className="dropdown-label">Calendarios ▾</span>
              <ul className="dropdown-content">
                <li>
                  <NavLink to="/calendarioescolar">Escolar</NavLink>
                </li>
                <li>
                  <NavLink to="/calendariofrequencia">Frequências</NavLink>
                </li>
                <li>
                  <NavLink to="/calendarioexames">Exame/Recurso</NavLink>
                </li>
              </ul>
            </li>
            <li className="dropdown">
              <span className="dropdown-label">escola ▾</span>
              <ul className="dropdown-content">
                <li>
                  <NavLink to="/disciplinas">disciplinas</NavLink>
                </li>
                <li>
                  <NavLink to="/contactos" className="ativo">contactos</NavLink>
                </li>
                <li>
                  <NavLink to="/anuncios">anuncios</NavLink>
                </li>
                <li>
                  <NavLink to="/mapa">mapa</NavLink>
                </li>
              </ul>
            </li>
            <li>
              <NavLink
                to="/todo"
                className={({ isActive }) => (isActive ? "link ativo" : "link")}
              >
                to-do
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/moodle"
                className={({ isActive }) => (isActive ? "link ativo" : "link")}
              >
                moodle
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/netpa"
                className={({ isActive }) => (isActive ? "link ativo" : "link")}
              >
                netpa
              </NavLink>
            </li>
          </ul>
        </aside>

        {/* Conteúdo principal */}
        <main className="content">
          <TopNavbar />

          <div className="contactos-wrapper">
            <h2>Contactos</h2>
            <div className="tabela-contactos">
              <div className="coluna">
                <h3>Alunos</h3>
                {alunos.map((aluno, i) => (
                  <p key={i}>
                    {aluno.nome} — {aluno.email}
                  </p>
                ))}
              </div>

              <div className="coluna">
                <h3>Professores</h3>
                {professores.map((prof, i) => (
                  <p key={i}>
                    {prof.nome} — {prof.email}
                  </p>
                ))}
              </div>

              <div className="coluna">
                <h3>Informações</h3>
                <p>Av. Pedro Álvares Cabral, nº 12 6000-084 Castelo Branco</p>
                <p>(+351) 272 339 600 (Chamada para a rede fixa nacional)</p>
                <p>(+351) 965 956 971 (Chamada para a rede móvel nacional)</p>
                <p>ipcb@ipcb.pt</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
