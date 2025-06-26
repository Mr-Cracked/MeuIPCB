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
