import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./sideNavbar.css";

export default function SideNavbar() {
  const [lightMode, setLightMode] = useState(false);
  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const [escolaAberto, setEscolaAberto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const escolaRef = useRef(null);
  const calendarioRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ escola: 0, calendario: 0 });

  useEffect(() => {
    const mode = localStorage.getItem("mode");
    if (mode === "light") {
      setLightMode(true);
      document.body.classList.add("light-mode");
    }
  }, []);

  useEffect(() => {
    const escolaTop = escolaRef.current?.getBoundingClientRect().top || 0;
    const calendarioTop = calendarioRef.current?.getBoundingClientRect().top || 0;
    setDropdownPos({ escola: escolaTop, calendario: calendarioTop });
  }, [escolaAberto, calendarioAberto]);

  const toggleTheme = () => {
    const newMode = !lightMode;
    setLightMode(newMode);
    if (newMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("mode", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("mode", "dark");
    }
  };

  const isAtivo = (path) => location.pathname === path;

  return (
    <>
      <div className="sidebar open">
        <div className="logo-details">
          <span className="logo_name">MeuIPCB</span>
        </div>

        <ul className="nav-list">
          <li className={isAtivo("/perfil") ? "active" : ""} onClick={() => navigate("/perfil")}>
            <span className="links_name">Perfil</span>
          </li>
          <li className={isAtivo("/horario") ? "active" : ""} onClick={() => navigate("/horario")}>
            <span className="links_name">Horário</span>
          </li>
          <li className={isAtivo("/todo") ? "active" : ""} onClick={() => navigate("/todo")}>
            <span className="links_name">To-Do</span>
          </li>

          <li className={`dropdown ${calendarioAberto ? "open" : ""}`} ref={calendarioRef}>
            <div className="dropdown-toggle" onClick={() => setCalendarioAberto(!calendarioAberto)}>
              <span className="links_name">Calendário</span>
            </div>
          </li>

          <li className={`dropdown ${escolaAberto ? "open" : ""}`} ref={escolaRef}>
            <div className="dropdown-toggle" onClick={() => setEscolaAberto(!escolaAberto)}>
              <span className="links_name">Escola</span>
            </div>
          </li>

          <li>
            <a href="https://moodle2425.ipcb.pt/" target="_blank" rel="noopener noreferrer">
              <span className="links_name">Moodle</span>
            </a>
          </li>
          <li>
            <a href="https://academicos.ipcb.pt/netpa/page" target="_blank" rel="noopener noreferrer">
              <span className="links_name">NetPa</span>
            </a>
          </li>
        </ul>
      </div>

      {calendarioAberto && (
        <ul
          className="dropdown-menu"
          style={{
            position: "fixed",
            top: dropdownPos.calendario,
            left: 250,
          }}
        >
          <li className={isAtivo("/calendarioescolar") ? "active" : ""} onClick={() => navigate("/calendarioescolar")}>
            <span>Escolar</span>
          </li>
          <li className={isAtivo("/calendariofrequencia") ? "active" : ""} onClick={() => navigate("/calendariofrequencia")}>
            <span>Frequência</span>
          </li>
          <li className={isAtivo("/calendarioexames") ? "active" : ""} onClick={() => navigate("/calendarioexames")}>
            <span>Exames</span>
          </li>
        </ul>
      )}

      {escolaAberto && (
        <ul
          className="dropdown-menu"
          style={{
            position: "fixed",
            top: dropdownPos.escola,
            left: 250,
          }}
        >
          <li className={isAtivo("/disciplinas") ? "active" : ""} onClick={() => navigate("/disciplinas")}>
            <span>Disciplinas</span>
          </li>
          <li className={isAtivo("/contactos") ? "active" : ""} onClick={() => navigate("/contactos")}>
            <span>Contactos</span>
          </li>
          <li className={isAtivo("/mapa") ? "active" : ""} onClick={() => navigate("/mapa")}>
            <span>Mapa</span>
          </li>
          <li className={isAtivo("/anuncios") ? "active" : ""} onClick={() => navigate("/anuncios")}>
            <span>Anúncios</span>
          </li>
          
        </ul>
        
      )}
    </>
  );
}
