import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SideNavbar from "../components/sideNavbar"; // ✅ corrigido
import TopNavbar from "../components/TopNavbar";
import "../perfil.css";

export function Perfil() {
  const [user, setUser] = useState(null);
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

  return (
    <div className="perfil-container">
      <div className="main-layout">
        <SideNavbar />

        <main className="content">
          <TopNavbar />

          <div className="grid-layout">
            {/* Coluna da esquerda */}
            <div className="left-column">
              <div className="perfil-card">
                <div className="avatar-placeholder" />
                <div className="perfil-conteudo">
                  {user ? (
                    <>
                      <h2 className="perfil-nome">{user.nome}</h2>
                      <div className="perfil-info">
                        <p>
                          <strong>Número de Estudante:</strong>{" "}
                          {user.numero_aluno}
                        </p>
                        <p>
                          <strong>E-mail:</strong> {user.email}
                        </p>
                        <p>
                          <strong>Curso:</strong> {user.curso}
                        </p>
                        <p>
                          <strong>Escola:</strong> {user.instituicao}
                        </p>
                        <p>
                          <strong>Ano Curricular:</strong>{" "}
                          {user.ano_curricular}
                        </p>
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
                  <div className="black-box" />
                  <div className="black-box" />
                </div>
              </div>
            </div>

            {/* Coluna da direita */}
            <div className="todo-painel">
              <h2>to do</h2>
              <div className="todo-item azul" />
              <div className="todo-item rosa" />
              <div className="todo-item amarelo" />
              <div className="todo-item verde" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
