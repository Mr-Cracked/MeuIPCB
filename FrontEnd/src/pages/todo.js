import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../todo.css";
import TopNavbar from "../components/TopNavbar";
import CriarTarefa from "../components/criarTarefa";
import ConfirmarModal from "../components/confirmarApagar";
import EditarTarefa from "../components/editarTarefa";
import { FaTrashAlt, FaEdit, FaRegCalendarAlt } from "react-icons/fa";

export function Todo() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [tarefaParaApagar, setTarefaParaApagar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchUserProfile() {
      try {
        const response = await axios.get("http://localhost:3000/api/aluno/", {
          withCredentials: true,
        });

        if (isMounted && response.data) {
          setUser(response.data);
        } else {
          setTimeout(() => {
            if (isMounted) navigate("/");
          }, 0);
        }
      } catch (error) {
        if (isMounted && error.response?.status === 401) {
          setTimeout(() => navigate("/"), 0);
        } else {
          setUser(null);
        }
      }
    }

    async function fetchTodos() {
      try {
        const res = await axios.get("http://localhost:3000/api/todo/all", {
          withCredentials: true,
        });
        setTodos(res.data);
      } catch (err) {
        console.error("Erro ao carregar tarefas:", err);
      }
    }

    fetchUserProfile();
    fetchTodos();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  function confirmarApagar(id) {
    setTarefaParaApagar(id);
  }

  function apagarTarefaConfirmada() {
    if (!tarefaParaApagar) return;

    axios
      .delete(`http://localhost:3000/api/todo/${tarefaParaApagar}`, {
        withCredentials: true,
      })
      .then(() => {
        setTodos((prev) => prev.filter((t) => t._id !== tarefaParaApagar));
        setTarefaParaApagar(null);
      })
      .catch((err) => {
        console.error("Erro ao apagar tarefa:", err);
        alert("Erro ao apagar tarefa.");
        setTarefaParaApagar(null);
      });
  }

  function concluirTarefa(id) {
    const tarefa = todos.find((t) => t._id === id);
    if (!tarefa) return;

    axios
      .put(
        `http://localhost:3000/api/todo/atualizar`,
        {
          id,
          titulo: tarefa.titulo,
          prazo: tarefa.prazo,
          descricao: tarefa.descricao,
          prioridade: tarefa.prioridade,
          concluido: !tarefa.concluido,
        },
        { withCredentials: true }
      )
      .then(() => {
        setTodos((prev) =>
          prev.map((todo) =>
            todo._id === id ? { ...todo, concluido: !todo.concluido } : todo
          )
        );
      })
      .catch((err) => console.error("Erro ao concluir tarefa:", err));
  }

  function adicionarTarefa(novaTarefa) {
    setTodos((prev) => [...prev, novaTarefa.todo]);
  }

  function getCorPrioridade(p) {
    if (!p) return "";
    const prioridade = p.toLowerCase();
    if (prioridade === "alta") return "prioridade-alta";
    if (prioridade === "média-alta") return "prioridade-media-alta";
    if (prioridade === "média") return "prioridade-media";
    if (prioridade === "baixa") return "prioridade-baixa";
    return "";
  }

  return (
    <div className="perfil-container">
      <div className="main-layout">
        <main className="content">
          <TopNavbar />
          <div className="todo-box">
            <h2>to do</h2>
            <div className="todo-list">
              {todos.length === 0 ? (
                <p>Sem tarefas.</p>
              ) : (
                todos.map((item) => (
                  <div className="todo-item" key={item._id}>
                    <button
                      className={`checkbox ${item.concluido ? "concluido" : ""}`}
                      onClick={() => concluirTarefa(item._id)}
                      title={item.concluido ? "Tarefa concluída" : "Marcar como concluída"}
                    />
                    <div className={`todo-text ${item.concluido ? "riscado" : ""} ${getCorPrioridade(item.prioridade)}`}>
                      {item.titulo}
                    </div>
                    <div className={`prazo-box ${getCorPrioridade(item.prioridade)}`}>
                      <FaRegCalendarAlt size={14} />{" "}
                      {new Date(item.prazo).toLocaleDateString("pt-PT")}
                    </div>
                    <div className="todo-actions">
                      <button
                        className={`botao-editar ${getCorPrioridade(item.prioridade)}`}
                        title="Editar"
                        onClick={() => setTarefaParaEditar(item)}
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        className={`botao-apagar ${getCorPrioridade(item.prioridade)}`}
                        title="Apagar"
                        onClick={() => confirmarApagar(item._id)}
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="add-todo-button" onClick={() => setMostrarModal(true)}>＋</button>

          {mostrarModal && (
            <CriarTarefa
              onClose={() => setMostrarModal(false)}
              onTarefaCriada={adicionarTarefa}
            />
          )}

          {tarefaParaEditar && (
            <EditarTarefa
              tarefa={tarefaParaEditar}
              onFechar={() => setTarefaParaEditar(null)}
              onAtualizada={(tAtualizada) => {
                setTodos((prev) =>
                  prev.map((t) =>
                    t._id === tAtualizada._id ? tAtualizada : t
                  )
                );
                setTarefaParaEditar(null);
              }}
            />
          )}

          {tarefaParaApagar && (
            <ConfirmarModal
              onConfirmar={apagarTarefaConfirmada}
              onCancelar={() => setTarefaParaApagar(null)}
            />
          )}
        </main>

        {/* Painel lateral (versão antiga) */}
        <div className="side-panel">
          <div className="black-box"></div>
          <div className="black-box"></div>
          <div className="date-box">
            <div className="big-text">{new Date().getDate()}</div>
            <div className="small-text">
              {new Date().toLocaleDateString("pt-PT", { weekday: "long" })}
            </div>
            <div className="small-text">{new Date().getFullYear()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
