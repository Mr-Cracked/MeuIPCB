import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../components/sideNavbar";
import TopNavbar from "../components/TopNavbar";
import EditarTarefa from "../components/editarTarefa";
import "../perfil.css";
import { FaEye } from "react-icons/fa";

export function Perfil() {
  const [user, setUser] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [editarModalAberto, setEditarModalAberto] = useState(false);
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
        if (isMounted) {
          if (error.response?.status === 401) {
            setTimeout(() => navigate("/"), 0);
          } else {
            setUser(null);
          }
        }
      }

      return () => {
        isMounted = false;
      };
    }

    async function fetchTarefas() {
      try {
        const res = await axios.get("http://localhost:3000/api/todo/all", {
          withCredentials: true,
        });
        setTarefas(res.data.filter((t) => !t.concluida));
      } catch (err) {
        console.error("❌ Erro ao buscar tarefas:", err);
      }
    }

    fetchUserProfile();
    fetchTarefas();
  }, [navigate]);

  function getCorPrioridade(p) {
    if (!p) return "";
    const prioridade = p.toLowerCase();
    if (prioridade === "alta") return "prioridade-alta";
    if (prioridade === "média-alta" || prioridade === "media-alta") return "prioridade-media-alta";
    if (prioridade === "média" || prioridade === "media") return "prioridade-media";
    if (prioridade === "baixa") return "prioridade-baixa";
    return "";
  }

  const abrirDetalhes = (tarefa) => setTarefaSelecionada(tarefa);
  const fecharDetalhes = () => setTarefaSelecionada(null);

  const handleAtualizacao = (tarefaAtualizada) => {
    setTarefas((prev) =>
      prev.map((t) => (t._id === tarefaAtualizada._id ? tarefaAtualizada : t))
    );
  };

  const eliminarTarefa = async (id) => {
    if (!window.confirm("Tens a certeza que queres eliminar esta tarefa?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/todo/${id}`, {
        withCredentials: true,
      });
      setTarefas((prev) => prev.filter((t) => t._id !== id));
      fecharDetalhes();
    } catch (err) {
      alert("Erro ao eliminar tarefa.");
    }
  };

  const marcarComoConcluida = async (id) => {
    try {
      await axios.put("http://localhost:3000/api/todo/atualizar", {
        id,
        concluido: true,
      }, {
        withCredentials: true,
      });

      setTarefas((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("❌ Erro ao concluir tarefa:", err);
      alert("Erro ao marcar tarefa como concluída.");
    }
  };

  return (
    <div className="main-layout">
      <SideNavbar />
      <div className="content">
        <div className="perfil-container">
          <TopNavbar />
          <div className="grid-layout">
            <div className="left-column">
              <div className="perfil-card">
                <div className="avatar-placeholder" />
                <div className="perfil-conteudo">
                  {user ? (
                    <>
                      <h2 className="perfil-nome">{user.nome}</h2>
                      <div className="perfil-info">
                        <p><strong>Número de Estudante:</strong> {user.numero_aluno}</p>
                        <p><strong>E-mail:</strong> {user.email}</p>
                        <p><strong>Curso:</strong> {user.curso}</p>
                        <p><strong>Escola:</strong> {user.instituicao}</p>
                        <p><strong>Ano Curricular:</strong> {user.ano_curricular}</p>
                      </div>
                    </>
                  ) : (
                    <p>A carregar informações do aluno...</p>
                  )}
                </div>
              </div>

              <div className="painel">
                <div className="left-painel" />
                <div className="middle-painel">
                  <div
                    className="black-box"
                    onClick={() => window.open("https://moodle2425.ipcb.pt/", "_blank")}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="black-box" />
                </div>
              </div>
            </div>

            <div className="todo-painel">
              <div style={{ position: "relative", textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>to do</h2>
                <FaEye
                  title="Ver todas as tarefas"
                  onClick={() => navigate("/todo")}
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "5px",
                    cursor: "pointer",
                  }}
                  size={20}
                  color="#1e2659"
                />
              </div>

              <div className="todo-list">
                {tarefas.length === 0 ? (
                  <>
                    <div className="todo-item azul" />
                    <div className="todo-item rosa" />
                    <div className="todo-item amarelo" />
                    <div className="todo-item verde" />
                  </>
                ) : (
                  tarefas.map((tarefa) => (
                    <div
                      key={tarefa._id}
                      className={`todo-item ${getCorPrioridade(tarefa.prioridade)}`}
                      style={{ cursor: "pointer", justifyContent: "space-between" }}
                    >
                      <div onClick={() => abrirDetalhes(tarefa)} className="todo-text">
                        <span>{tarefa.titulo}</span>
                      </div>
                      <div
                        onClick={() => marcarComoConcluida(tarefa._id)}
                        title="Marcar como concluída"
                        style={{
                          width: "18px",
                          height: "18px",
                          border: "2px solid #333",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          marginLeft: "10px",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {tarefaSelecionada && !editarModalAberto && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Detalhes da Tarefa</h3>
            <p><strong>Título:</strong> {tarefaSelecionada.titulo}</p>
            <p><strong>Descrição:</strong> {tarefaSelecionada.descricao || "—"}</p>
            <p><strong>Prioridade:</strong> {tarefaSelecionada.prioridade}</p>
            <p><strong>Prazo:</strong> {tarefaSelecionada.prazo?.slice(0, 10) || "—"}</p>
            <div className="botoes">
              <button onClick={() => setEditarModalAberto(true)}>Editar</button>
              <button onClick={() => eliminarTarefa(tarefaSelecionada._id)} className="cancelar">Eliminar</button>
              <button onClick={fecharDetalhes} className="cancelar">Fechar</button>
            </div>
          </div>
        </div>
      )}

      {editarModalAberto && tarefaSelecionada && (
        <EditarTarefa
          tarefa={tarefaSelecionada}
          onFechar={() => {
            setEditarModalAberto(false);
            setTarefaSelecionada(null);
          }}
          onAtualizada={(t) => {
            handleAtualizacao(t);
            setEditarModalAberto(false);
          }}
        />
      )}
    </div>
  );
}
