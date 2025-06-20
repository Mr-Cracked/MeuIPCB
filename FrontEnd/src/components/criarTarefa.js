import React, { useState, useEffect } from "react";
import "./criarTarefa.css";
import axios from "axios";

export default function CriarTarefa({ onClose, onTarefaCriada }) {
  const [titulo, setTitulo] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [prazo, setPrazo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dono, setDono] = useState("");

  // Obter o dono via endpoint da sessão (assumindo que existe)
  useEffect(() => {
    axios
      .get("http://localhost:3000/api/aluno", { withCredentials: true })
      .then((res) => {
        setDono(res.data.email || res.data.username); // adaptado conforme a resposta
      })
      .catch((err) => {
        console.error("Erro ao obter dono da sessão:", err);
      });
  }, []);

  const criar = async () => {
    if (!titulo.trim() || !prioridade) {
      alert("Por favor preenche o título e escolhe a prioridade.");
      return;
    }

    try {
      console.log("A enviar para o servidor:", {
        dono,
        titulo,
        prioridade,
        prazo,
        descricao,
      });

      const res = await axios.post(
        "http://localhost:3000/api/todo/inserir",
        { dono, titulo, prioridade, prazo, descricao },
        { withCredentials: true }
      );

      console.log("Resposta recebida:", res.data);
      onTarefaCriada(res.data);
      onClose();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      alert("Ocorreu um erro ao criar a tarefa.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card-tarefa">
        <button className="fechar-card" onClick={onClose}>
          ×
        </button>
        <div className="conteudo-card">
          <div className="esquerda">
            <input
              className="campo-input"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Escreve aqui o título"
            />

            <select
              className="campo-input"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
            >
              <option value="" disabled>
                Escolha a prioridade
              </option>
              <option value="Alta">Alta</option>
              <option value="Média-Alta">Média-Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>

            <input
              className="campo-input"
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
            />

            <button className="campo editar" onClick={criar}>
              Criar
            </button>
          </div>

          <textarea
            className="descricao-box"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Escreva uma descrição"
          />
        </div>
      </div>
    </div>
  );
}
