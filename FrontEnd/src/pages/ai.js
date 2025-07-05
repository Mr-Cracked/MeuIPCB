import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../ai.css";
//import SideNavbar from "../components/navbarAI";
import ReactMarkdown from "react-markdown";

const temas = {
  "Rosa / Azul": { aluno: "#fddde6", ai: "#cce5ff" },
  "Verde / Castanho": { aluno: "#d4f4dd", ai: "#e6d4b6" },
  "Violeta / Azul": { aluno: "#e0d7f5", ai: "#d0eaff" },
  "Preto / Branco": { aluno: "#333", ai: "#eee" },
};

const AIChatPage = () => {
  const [user, setUser] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [temaAtual, setTemaAtual] = useState("Rosa / Azul");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    async function fetchUserProfile() {
      try {
        const response = await axios.get("http://localhost:3000/api/aluno/", {
          withCredentials: true,
        });

        if (isMounted && response.data) {
          console.log("✅ Dados do Aluno Recebidos:", response.data);
          setUser(response.data);
        } else {
          console.warn("⚠️ Utilizador não autenticado.");
          setTimeout(() => {
            if (isMounted) navigate("/");
          }, 0);
        }
      } catch (error) {
        console.error("❌ Erro ao buscar perfil do aluno:", error);
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

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    const tema = temas[temaAtual];
    document.documentElement.style.setProperty("--cor-aluno", tema.aluno);
    document.documentElement.style.setProperty("--cor-ai", tema.ai);
  }, [temaAtual]);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const enviarPergunta = async (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    const novaPergunta = { autor: "aluno", texto: mensagem };
    setMensagens((prev) => [...prev, novaPergunta]);
    setMensagem("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/ai/pergunta",
        { pergunta: mensagem },
        { withCredentials: true }
      );

      const novaResposta = { autor: "ai", texto: response.data.resposta };
      setMensagens((prev) => [...prev, novaResposta]);
    } catch (error) {
      console.error("Erro ao obter resposta da IA:", error);
      setMensagens((prev) => [
        ...prev,
        { autor: "ai", texto: "❌ Erro ao comunicar com o assistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-wrapper ${darkMode ? "dark" : ""}`}>
      <div className={`chat-container ${darkMode ? "dark" : ""}`}>
        <h2>Drava</h2>

        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <label htmlFor="tema">🎨 Tema:&nbsp;</label>
          <select
            id="tema"
            value={temaAtual}
            onChange={(e) => setTemaAtual(e.target.value)}
          >
            {Object.keys(temas).map((tema) => (
              <option key={tema} value={tema}>
                {tema}
              </option>
            ))}
          </select>
          <button
            onClick={() => setDarkMode((prev) => !prev)}
            style={{
              marginLeft: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: darkMode ? "#999" : "#333",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            {darkMode ? "☀️ Claro" : "🌙 Escuro"}
          </button>
        </div>

        <div className={`chat-box ${darkMode ? "dark" : ""}`}>
          {mensagens.map((msg, i) => (
            <div key={i} className={`mensagem ${msg.autor}`}>
              <ReactMarkdown>{msg.texto}</ReactMarkdown>
            </div>
          ))}
          {loading && (
            <div className="mensagem ai">
              <span>⏳ A escrever...</span>
            </div>
          )}
        </div>

        <form
          className={`chat-input ${darkMode ? "dark" : ""}`}
          onSubmit={enviarPergunta}
        >
          <input
            type="text"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Escreve a tua pergunta aqui..."
          />
          <button type="submit">➤</button>
        </form>
      </div>
    </div>
  );
};

export default AIChatPage;
