import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles.css"; // Ou outro ficheiro CSS que uses
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export default function Contactos() {
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    async function fetchDados() {
      try {
        const alunosRes = await axios.get(
          "http://localhost:3000/api/alunos/emails",
          {
            withCredentials: true,
          }
        );
        setAlunos(alunosRes.data);

        const profsRes = await axios.get(
          "http://localhost:3000/api/professores",
          {
            withCredentials: true,
          }
        );
        setProfessores(profsRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      }
    }

    fetchDados();
  }, []);

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h2>MeuIPCB</h2>
        <ul>
          <li>
            <NavLink to="/perfil">perfil</NavLink>
          </li>
          <li>
            <NavLink to="/horario">horario</NavLink>
          </li>
          <li>
            <NavLink to="/calendario">calendario</NavLink>
          </li>
          <li>
            <NavLink to="/escola">escola</NavLink>
          </li>
          <li>
            <NavLink to="/todo">to-do</NavLink>
          </li>
          <li>
            <NavLink to="/contactos" className="ativo">
              contactos
            </NavLink>
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <TopNavbar />
        <div className="contactos-container">
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
              <p>Em caso de emergência, contactar a secretaria da escola.</p>
              <p>Os contactos são apenas para uso académico.</p>
              <p>Verifica sempre o e-mail antes de enviar mensagens.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
