import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import "../disciplinas.css";

export default function Disciplinas() {
  const [anoSelecionado, setAnoSelecionado] = useState("1º Ano");
  const [planoEstudos, setPlanoEstudos] = useState({});
  const [aluno, setAluno] = useState(null);

  useEffect(() => {
    async function fetchAluno() {
      try {
        const res = await axios.get("http://localhost:3000/api/aluno/", {
          withCredentials: true,
        });
        setPlanoEstudos(res.data.plano_de_estudos || {});
        setAluno(res.data);
      } catch (err) {
        console.error("Erro ao buscar dados do aluno:", err);
      }
    }

    fetchAluno();
  }, []);

  const disciplinas = planoEstudos[anoSelecionado] || [];

  return (
    <div className="perfil-container">
      <div className="main-layout">
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
                  <NavLink to="/contactos">contactos</NavLink>
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
                to="/ai"
                className={({ isActive }) => (isActive ? "link ativo" : "link")}
              >
                AI
              </NavLink>
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

        <main className="content">
          <TopNavbar />

          <div className="disciplinas-wrapper">
            <select
              className="ano-dropdown"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
            >
              <option value="1º Ano">Ano Curricular: 1</option>
              <option value="2º Ano">Ano Curricular: 2</option>
              <option value="3º Ano">Ano Curricular: 3</option>
            </select>

            <div className="tabela-disciplinas">
              <table>
                <thead>
                  <tr>
                    <th>Semestre</th>
                    <th>Código</th>
                    <th>UC</th>
                    <th>ECTS</th>
                    <th>Nota</th>
                    <th>Situação</th>
                    <th>Faltas</th>
                    <th>Limite de Faltas</th>
                    <th>Faltas Justificadas</th>
                  </tr>
                </thead>
                <tbody>
                  {disciplinas.map((disciplina, idx) => (
                    <tr key={idx}>
                      <td>{disciplina.periodo}</td>
                      <td>{disciplina.codigo}</td>
                      <td>{disciplina.UC}</td>
                      <td>{disciplina.ECTS}</td>
                      <td>{disciplina.nota}</td>
                      <td>{disciplina.situacao}</td>
                      <td>{disciplina.faltas_dadas}h</td>
                      <td>{disciplina.limite_faltas}h</td>
                      <td>{disciplina.faltas_justificadas}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
