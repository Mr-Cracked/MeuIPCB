import React, { useEffect, useState } from "react";
import axios from "axios";
import "../contactos.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export default function Contactos() {
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [filtro, setFiltro] = useState("Todos");
  const [termoPesquisa, setTermoPesquisa] = useState("");

  useEffect(() => {
    async function fetchDados() {
      try {
        const alunosRes = await axios.get("http://localhost:3000/api/aluno/emails", {
          withCredentials: true,
        });
        setAlunos(alunosRes.data);

        const profsRes = await axios.get("http://localhost:3000/api/professor/professores", {
          withCredentials: true,
        });
        setProfessores(profsRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }

    fetchDados();
  }, []);

  const filtrarLista = (lista) =>
      lista.filter(
          (pessoa) =>
              pessoa.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
              pessoa.email.toLowerCase().includes(termoPesquisa.toLowerCase())
      );

  const alunosVisiveis =
      filtro === "Todos" || filtro === "Alunos" ? filtrarLista(alunos) : alunos;

  const professoresVisiveis =
      filtro === "Todos" || filtro === "Professores" ? filtrarLista(professores) : professores;

  return (
      <div className="perfil-container">
        <div className="main-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <h2>MeuIPCB</h2>
            <ul>
              <li><NavLink to="/perfil">Perfil</NavLink></li>
              <li><NavLink to="/horario">Horário</NavLink></li>
              <li className="dropdown">
                <span className="dropdown-label">Calendarios ▾</span>
                <ul className="dropdown-content">
                  <li><NavLink to="/calendarioescolar">Escolar</NavLink></li>
                  <li><NavLink to="/calendariofrequencia">Frequências</NavLink></li>
                  <li><NavLink to="/calendarioexames">Exame/Recurso</NavLink></li>
                </ul>
              </li>
              <li className="dropdown">
                <span className="dropdown-label">escola ▾</span>
                <ul className="dropdown-content">
                  <li><NavLink to="/disciplinas">disciplinas</NavLink></li>
                  <li><NavLink to="/contactos" className="ativo">contactos</NavLink></li>
                  <li><NavLink to="/anuncios">anuncios</NavLink></li>
                  <li><NavLink to="/mapa">mapa</NavLink></li>
                </ul>
              </li>
              <li><NavLink to="/todo">to-do</NavLink></li>
              <li><NavLink to="/moodle">moodle</NavLink></li>
              <li><NavLink to="/netpa">netpa</NavLink></li>
            </ul>
          </aside>

          {/* Conteúdo principal */}
          <main className="content">
            <TopNavbar />

            <div className="contactos-wrapper">
              <h2>Contactos</h2>

              <div className="filtro-pesquisa">
                <input
                    type="text"
                    className="input-pesquisa-global"
                    placeholder="Pesquisar por nome ou email..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                />
                <select
                    className="select-filtro"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                >
                  <option value="Todos">Todos</option>
                  <option value="Alunos">Alunos</option>
                  <option value="Professores">Professores</option>
                </select>
              </div>

              <div className="tabela-contactos">
                <div className="coluna">
                  <h3>Alunos</h3>
                  {alunosVisiveis.length > 0 ? (
                      alunosVisiveis.map((aluno, i) => (
                          <p key={i}>{aluno.nome} — {aluno.email}</p>
                      ))
                  ) : (
                      <p>Não há alunos para mostrar.</p>
                  )}
                </div>

                <div className="coluna">
                  <h3>Professores</h3>
                  {professoresVisiveis.length > 0 ? (
                      professoresVisiveis.map((prof, i) => (
                          <p key={i}>{prof.nome} — {prof.email}</p>
                      ))
                  ) : (
                      <p>Não há professores para mostrar.</p>
                  )}
                </div>

                <div className="coluna">
                  <h3>Informações</h3>
                  <p>Av. Pedro Álvares Cabral, nº 12 6000-084 Castelo Branco</p>
                  <p>(+351) 272 339 600</p>
                  <p>(+351) 965 956 971</p>
                  <p>ipcb@ipcb.pt</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
}
