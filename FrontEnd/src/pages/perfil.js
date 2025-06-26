import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import EditarTarefa from "../components/editarTarefa";
import "../perfil.css";
import { FaEye } from "react-icons/fa";

export function Perfil() {
  const [user, setUser] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [editarModalAberto, setEditarModalAberto] = useState(false);
  const [anuncioRecente, setAnuncioRecente] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ativo = true;

    async function fetchUserProfile() {
      try {
        const { data } = await axios.get("http://localhost:3000/api/aluno/", {
          withCredentials: true,
        });
        if (ativo) setUser(data);
      } catch (err) {
        if (ativo && err.response?.status === 401) navigate("/");
      }
    }

    async function fetchTarefas() {
      try {
        const { data } = await axios.get("http://localhost:3000/api/todo/all", {
          withCredentials: true,
        });
        if (ativo) setTarefas(data.filter(t => !t.concluida));
      } catch (err) {
        console.error("Erro tarefas:", err);
      }
    }

    async function fetchAnuncioRecente() {
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/anuncio/veraluno",
          { withCredentials: true }
        );
        if (ativo && data?.length) setAnuncioRecente(data[0]);
      } catch (err) {
        console.error("Erro anúncio:", err);
      }
    }

    fetchUserProfile();
    fetchTarefas();
    fetchAnuncioRecente();
    return () => { ativo = false; };
  }, [navigate]);

  const getCorPrioridade = (p = "") => {
    const pr = p.toLowerCase();
    if (pr === "alta") return "prioridade-alta";
    if (["média-alta", "media-alta"].includes(pr)) return "prioridade-media-alta";
    if (["média", "media"].includes(pr)) return "prioridade-media";
    if (pr === "baixa") return "prioridade-baixa";
    return "";
  };

  const abrirDetalhes = (t) => setTarefaSelecionada(t);
  const fecharDetalhes = () => setTarefaSelecionada(null);

  const eliminarTarefa = async (id) => {
    if (!window.confirm("Tens a certeza que queres eliminar esta tarefa?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/todo/${id}`, { withCredentials: true });
      setTarefas(prev => prev.filter(t => t._id !== id));
      fecharDetalhes();
    } catch {
      alert("Erro ao eliminar tarefa.");
    }
  };

  const marcarComoConcluida = async (id) => {
    try {
      await axios.put("http://localhost:3000/api/todo/atualizar",
        { id, concluido: true }, { withCredentials: true }
      );
      setTarefas(prev => prev.filter(t => t._id !== id));
    } catch {
      alert("Erro ao concluir tarefa.");
    }
  };

  const handleAtualizacao = (tAtualizada) =>
    setTarefas(prev => prev.map(t => t._id === tAtualizada._id ? tAtualizada : t));

  return (
    <div className="perfil-container">
      <TopNavbar />

      <div className="grid-layout">
        {/* -------- COLUNA ESQUERDA -------- */}
        <div className="left-column">
          {/* cartão de perfil */}
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
                <p>A carregar informações…</p>
              )}
            </div>
          </div>

          {/* painel grande com anúncio */}
          <div className="left-painel">
            {anuncioRecente ? (
              <div className="anuncio-recente">
                <h3>{anuncioRecente.titulo}</h3>
                <p className="meta">
                  {new Date(anuncioRecente.data).toLocaleDateString("pt-PT")}
                  {" · "}{anuncioRecente.dono}
                </p>
                <p className="descricao-limitada">
                  {anuncioRecente.descricao.length > 250
                    ? anuncioRecente.descricao.slice(0, 247) + "…"
                    : anuncioRecente.descricao}
                </p>
                <button className="ver-todos-btn" onClick={() => navigate("/anuncios")}>
                  Ver todos
                </button>
              </div>
            ) : (
              <p style={{ opacity: .6, textAlign: "center" }}>Sem anúncios novos.</p>
            )}
          </div>

          {/* black-box com estilo da tua versão final */}
          <div className="middle-painel">
            <div
              className="black-box"
              onClick={() => window.open("https://moodle2425.ipcb.pt/", "_blank")}
              style={{ cursor: "pointer" }}
            />
            <div
              className="black-box"
              onClick={() => alert("Funcionalidade em breve!")}
            />
          </div>
        </div>

        {/* -------- COLUNA TO-DO -------- */}
        <div className="todo-painel">
          <div style={{ position: "relative", textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>to do</h2>
            <FaEye size={20} color="#1e2659"
              title="Ver todas as tarefas"
              style={{ position: "absolute", right: 15, top: 5, cursor: "pointer" }}
              onClick={() => navigate("/todo")} />
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
              tarefas.map(t => (
                <div key={t._id}
                  className={`todo-item ${getCorPrioridade(t.prioridade)}`}
                  style={{ cursor: "pointer", justifyContent: "space-between" }}>
                  <div className="todo-text" onClick={() => abrirDetalhes(t)}>
                    <span>{t.titulo}</span>
                  </div>
                  <div title="Concluir"
                    onClick={() => marcarComoConcluida(t._id)}
                    style={{
                      width: 18, height: 18, border: "2px solid #333",
                      borderRadius: 4, background: "#fff", marginLeft: 10,
                      cursor: "pointer", flexShrink: 0
                    }} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* -------- MODAL DETALHES TAREFA -------- */}
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

      {/* -------- MODAL EDITAR TAREFA -------- */}
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
