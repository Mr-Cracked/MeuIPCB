import React, { useEffect, useState } from "react";
import axios from "axios";
import "../horario.css";
import TopNavbar from "../components/TopNavbar";
import { NavLink, useNavigate } from "react-router-dom";

export default function Horario() {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [horario, setHorario] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchHorario() {
      try {
        const response = await axios.get("http://localhost:3000/api/turma/horario", {
          withCredentials: true,
        });

        if (isMounted && Array.isArray(response.data)) {
          setTurmas(response.data);

          if (response.data.length > 0) {
            setTurmaSelecionada(response.data[0].nome);
            processaHorario(response.data[0].horario);
          }
        }
      } catch (error) {
        console.error("❌ Erro ao buscar dados do aluno:", error);
        if (isMounted && error.response?.status === 401) {
          setTimeout(() => navigate("/"), 0);
        }
      }
    }

    fetchHorario();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  function processaHorario(horarioArray) {
    const horarioPorDia = {};

    horarioArray.forEach((bloco) => {
      const dia = bloco.dia;
      if (!horarioPorDia[dia]) {
        horarioPorDia[dia] = [];
      }
      horarioPorDia[dia] = horarioPorDia[dia].concat(bloco.aulas);
    });

    for (const dia in horarioPorDia) {
      horarioPorDia[dia].sort((a, b) =>
          a.hora_inicio.localeCompare(b.hora_inicio)
      );
    }

    setHorario(horarioPorDia);
  }

  function handleTurmaChange(event) {
    const nomeTurma = event.target.value;
    setTurmaSelecionada(nomeTurma);
    const turmaEscolhida = turmas.find((t) => t.nome === nomeTurma);
    if (turmaEscolhida) {
      processaHorario(turmaEscolhida.horario);
    }
  }

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

            {turmas.length > 1 && (
                <div className="seletor-turma">
                  <label htmlFor="turma-select">Seleciona a turma: </label>
                  <select id="turma-select" value={turmaSelecionada} onChange={handleTurmaChange}>
                    {turmas.map((t) => (
                        <option key={t._id} value={t.nome}>{t.nome}</option>
                    ))}
                  </select>
                </div>
            )}

            {Object.keys(horario).length === 0 ? (
                <p>Sem horário disponível.</p>
            ) : (
                <div className="tabela-horario">
                  <table>
                    <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Segunda-feira</th>
                      <th>Terça-feira</th>
                      <th>Quarta-feira</th>
                      <th>Quinta-feira</th>
                      <th>Sexta-feira</th>
                    </tr>
                    </thead>
                    <tbody>
                    {gerarLinhasHorario(horario)}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </main>
      </div>
  );
}

function gerarLinhasHorario(horarioPorDia) {
  const dias = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];
  const blocos = new Set();

  dias.forEach((dia) => {
    (horarioPorDia[dia] || []).forEach((aula) => {
      blocos.add(`${aula.hora_inicio} - ${aula.hora_fim}`);
    });
  });

  const blocosOrdenados = Array.from(blocos).sort();

  return blocosOrdenados.map((intervalo, i) => (
      <tr key={i}>
        <td><strong>{intervalo}</strong></td>
        {dias.map((dia) => {
          const aula = (horarioPorDia[dia] || []).find(a =>
              `${a.hora_inicio} - ${a.hora_fim}` === intervalo
          );
          return (
              <td key={dia}>
                {aula ? (
                    <>
                      <div><strong>{aula.disciplina}</strong></div>
                      <div>{aula.sala}</div>
                    </>
                ) : (
                    ""
                )}
              </td>
          );
        })}
      </tr>
  ));
}
