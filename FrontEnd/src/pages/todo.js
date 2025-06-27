import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../todo.css";
import TopNavbar from "../components/TopNavbar";
import CriarTarefa from "../components/criarTarefa";
import ConfirmarModal from "../components/confirmarApagar";
import EditarTarefa from "../components/editarTarefa";
import { FaTrashAlt, FaEdit, FaRegCalendarAlt } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export function Todo() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState(null);
  const [tarefaParaApagar, setTarefaParaApagar] = useState(null);
  const [filtroSelecionado, setFiltroSelecionado] = useState("prazo");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [tarefasDia, setTarefasDia] = useState([]);
  const [mostrarTarefasDia, setMostrarTarefasDia] = useState(false);
  const navigate = useNavigate();

  const fetchTodos = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/todo/all", {
        withCredentials: true,
      });
      setTodos(res.data);
    } catch (err) {
      console.error("Erro ao carregar tarefas:", err);
    }
  };

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

  function ordenarTarefas(tarefas) {
    return [...tarefas].sort((a, b) => {
      if (filtroSelecionado === "prazo") {
        return new Date(a.prazo) - new Date(b.prazo);
      } else if (filtroSelecionado === "criado") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filtroSelecionado === "prioridade") {
        const ordem = {
          alta: 1,
          "média-alta": 2,
          média: 3,
          baixa: 4,
        };
        return (
          (ordem[a.prioridade?.toLowerCase()] || 5) -
          (ordem[b.prioridade?.toLowerCase()] || 5)
        );
      }
      return 0;
    });
  }

  const datasComTarefas = todos.map((t) => new Date(t.prazo).toDateString());

  function handleDiaSelecionado(date) {
    const selecionadas = todos.filter(
      (t) => new Date(t.prazo).toDateString() === date.toDateString()
    );
    setTarefasDia(selecionadas);
    setMostrarTarefasDia(true);
  }

  return (
    <div className="perfil-container">
      <TopNavbar />

      <div className="main-layout">
        <main className="content">
          <div className="todo-box">
            <h2>to do</h2>
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end", padding: "0 25px" }}>
              <select
                value={filtroSelecionado}
                onChange={(e) => setFiltroSelecionado(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #ccc", fontWeight: "600" }}
              >
                <option value="prazo">Ordenar por Prazo</option>
                <option value="criado">Ordenar por Criação</option>
                <option value="prioridade">Ordenar por Prioridade</option>
              </select>
            </div>

            <div className="todo-list">
              {ordenarTarefas(todos).length === 0 ? (
                <p>Sem tarefas.</p>
              ) : (
                ordenarTarefas(todos).map((item) => (
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
                      <button className={`botao-editar ${getCorPrioridade(item.prioridade)}`} onClick={() => setTarefaParaEditar(item)}>
                        <FaEdit size={14} />
                      </button>
                      <button className={`botao-apagar ${getCorPrioridade(item.prioridade)}`} onClick={() => confirmarApagar(item._id)}>
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
            <CriarTarefa onClose={() => setMostrarModal(false)} onTarefaCriada={adicionarTarefa} />
          )}

          {tarefaParaEditar && (
            <EditarTarefa
              tarefa={tarefaParaEditar}
              onFechar={() => setTarefaParaEditar(null)}
              onAtualizada={() => {
                fetchTodos();
                setTarefaParaEditar(null);
              }}
            />
          )}

          {tarefaParaApagar && (
            <ConfirmarModal onConfirmar={apagarTarefaConfirmada} onCancelar={() => setTarefaParaApagar(null)} />
          )}

          {mostrarTarefasDia && (
            <div className="modal-backdrop" onClick={() => setMostrarTarefasDia(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Tarefas do Dia</h3>
                {tarefasDia.length === 0 ? (
                  <p>Nenhuma tarefa para este dia.</p>
                ) : (
                  <ul>
                    {tarefasDia.map((t) => (
                      <li key={t._id}>{t.titulo}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </main>

        <div className="side-panel">
          <div className="black-box"></div>
          <div className="black-box"></div>

          <div
            className="date-box"
            onClick={() => setMostrarCalendario(!mostrarCalendario)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <div className="big-text">{new Date().getDate()}</div>
            <div className="small-text">{new Date().toLocaleDateString("pt-PT", { weekday: "long" })}</div>
            <div className="small-text">{new Date().getFullYear()}</div>
          </div>

          {mostrarCalendario && (
            <div className="calendar-popup">
              <Calendar
                locale="pt-PT"
                onClickDay={(date) => handleDiaSelecionado(date)}
                tileClassName={({ date }) =>
                  datasComTarefas.includes(date.toDateString()) ? "highlight" : null
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
