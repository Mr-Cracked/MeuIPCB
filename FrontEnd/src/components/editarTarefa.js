import React, { useEffect, useState } from "react";
import axios from "axios";
import "./editarTarefa.css";

export default function EditarTarefa({ tarefa, onFechar, onAtualizada }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("média");
  const [prazo, setPrazo] = useState("");

  useEffect(() => {
    if (tarefa) {
      setTitulo(tarefa.titulo || "");
      setDescricao(tarefa.descricao || "");
      setPrioridade(tarefa.prioridade || "média");
      setPrazo(tarefa.prazo?.slice(0, 10) || "");
    }
  }, [tarefa]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.put(
        "http://localhost:3000/api/todo/atualizar",
        {
          id: tarefa._id,
          titulo,
          descricao,
          prioridade,
          prazo,
          concluido: tarefa.concluido,
        },
        { withCredentials: true }
      );

      console.log("Resposta ao editar tarefa:", res.data);

      if (onAtualizada) onAtualizada(); // sem enviar tarefa
      onFechar();
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
      alert("Erro ao atualizar tarefa.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Editar Tarefa</h3>
        <form onSubmit={handleSubmit} className="form-tarefa">
          <label>
            Título:
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </label>

          <label>
            Descrição:
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </label>

          <label>
            Prioridade:
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value)}
            >
              <option value="alta">Alta</option>
              <option value="média-alta">Média-Alta</option>
              <option value="média">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </label>

          <label>
            Prazo:
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              required
            />
          </label>

          <div className="botoes">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onFechar} className="cancelar">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
