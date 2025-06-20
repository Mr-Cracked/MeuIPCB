import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, NavLink } from "react-router-dom";
import "../todo.css";
import IconButton from "../components/iconbutton.js";
import TopNavbar from "../components/TopNavbar.js";

export function Perfil() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
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

      return () => {
        isMounted = false;
      };
    }

    async function fetchTodos() {
      try {
        const res = await axios.get("http://localhost:3000/api/todos", {
          withCredentials: true,
        });
        setTodos(res.data);
      } catch (err) {
        console.error("Erro ao carregar tarefas:", err);
      }
    }

    fetchUserProfile();
    fetchTodos();
  }, [navigate]);

  function apagarTarefa(id) {
    axios
      .delete(`http://localhost:3000/api/todos/${id}`, { withCredentials: true })
      .then(() => setTodos((prev) => prev.filter((todo) => todo._id !== id)))
      .catch((err) => console.error("Erro ao apagar tarefa:", err));
  }

  function concluirTarefa(id) {
    axios
      .put(
        `http://localhost:3000/api/todos/${id}`,
        { concluido: true },
        { withCredentials: true }
      )
      .then(() => {
        // opcionalmente atualiza a lista completa
        setTodos((prev) =>
          prev.map((todo) =>
            todo._id === id ? { ...todo, concluido: true } : todo
          )
        );
      })
      .catch((err) => console.error("Erro ao concluir tarefa:", err));
  }

  return (
    <div className="perfil-container">
      <div className="main-layout">
        <aside className="sidebar">
          <h2>MeuIPCB</h2>
          <ul>
            <li>
              <NavLink to="/perfil" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                Perfil
              </NavLink>
            </li>
            <li>
              <NavLink to="/horario" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                Horário
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendario" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                Calendario
              </NavLink>
            </li>
            <li>
              <NavLink to="/escola" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                escola
              </NavLink>
            </li>
            <li>
              <NavLink to="/todo" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                to-do
              </NavLink>
            </li>
            <li>
              <NavLink to="/moodle" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                moodle
              </NavLink>
            </li>
            <li>
              <NavLink to="/netpa" className={({ isActive }) => (isActive ? "link ativo" : "link")}>
                netpa
              </NavLink>
            </li>
          </ul>
        </aside>

        <main className="content">
          <TopNavbar />

          <div className="todo-box">
            <h2>to do</h2>
            <div className="todo-list">
              {todos.length === 0 ? (
                <p>Sem tarefas.</p>
              ) : (
                todos.map((item, index) => (
                  <div className={`todo-item cor${index % 4}`} key={item._id}>
                    <div className="todo-left">
                      <div className="checkbox"></div>
                      <div className="todo-text">{item.titulo}</div>
                    </div>
                    <div className="todo-actions">
                      <button onClick={() => concluirTarefa(item._id)}>✓</button>
                      <button onClick={() => navigate(`/editartarefa/${item._id}`)}>✎</button>
                      <button onClick={() => apagarTarefa(item._id)}>🗑</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="side-panels">
            <div className="black-box"></div>
            <div className="black-box"></div>
            <div className="date-box">
              <div className="big-day">{new Date().getDate()}</div>
              <div className="weekday">
                {new Date().toLocaleDateString("pt-PT", { weekday: "long" })}
              </div>
              <div className="year">{new Date().getFullYear()}</div>
            </div>
          </div>

          <button
            className="add-todo-button"
            onClick={() => navigate("/criartarefa")}
          >
            ＋
          </button>
        </main>
      </div>
    </div>
  );
}
