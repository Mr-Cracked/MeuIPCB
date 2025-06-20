import React, { useEffect, useState } from "react";
import axios from "axios";
import "../horario.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink } from "react-router-dom";

export default function Horario() {
  const [horario, setHorario] = useState({});

  useEffect(() => {
    async function fetchHorario() {
      try {
        const response = await axios.get("http://localhost:3000/api/aluno/", {
          withCredentials: true,
        });
        const aluno = response.data;
        const horarioDaTurma = aluno?.turma?.horario || {};
        setHorario(horarioDaTurma);
      } catch (error) {
        console.error("Erro ao buscar dados do aluno:", error);
      }
    }

    fetchHorario();
  }, []);

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <h2>MeuIPCB</h2>
        <ul>
          <li><NavLink to="/perfil">perfil</NavLink></li>
          <li><NavLink to="/horario" className="ativo">horario</NavLink></li>
          <li><NavLink to="/calendario">calendario</NavLink></li>
          <li><NavLink to="/escola">escola</NavLink></li>
          <li><NavLink to="/todo">to-do</NavLink></li>
          <li><NavLink to="/moodle">moodle</NavLink></li>
          <li><NavLink to="/netpa">netpa</NavLink></li>
        </ul>
      </aside>

      <main className="main-content">
        <TopNavbar />

        <div className="horario-box">
          <h2>HORÁRIO SEMANAL</h2>

          {Object.entries(horario).map(([dia, aulas]) => (
            <div key={dia} className="dia-bloco">
              <h3>{dia}</h3>
              {aulas.length === 0 ? (
                <p className="sem-aulas">Sem aulas</p>
              ) : (
                aulas.map((aula, index) => (
                  <div key={index} className="aula-card">
                    <div>{aula.inicio} - {aula.fim}</div>
                    <div>{aula.disciplina}</div>
                    <div>{aula.sala}</div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
