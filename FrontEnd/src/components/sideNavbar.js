import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./sideNavbar.css";

export default function SideNavbar() {
  const [open, setOpen] = useState(false);
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
  }, [escolaAberto, calendarioAberto, open]);

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
      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="logo-details">
          <i className="bx bx-menu" id="btn" onClick={() => setOpen(!open)}></i>
          <span className="logo_name">MeuIPCB</span>
        </div>

        <ul className="nav-list">
          {/* PERFIL */}
          <li className={isAtivo("/perfil") ? "active" : ""} onClick={() => navigate("/perfil")}>
            <i className="bx bx-user"></i>
            <span className="links_name">Perfil</span>
          </li>

          {/* HORÁRIO */}
          <li className={isAtivo("/horario") ? "active" : ""} onClick={() => navigate("/horario")}>
            <i className="bx bx-calendar"></i>
            <span className="links_name">Horário</span>
          </li>

          {/* TO-DO */}
          <li className={isAtivo("/todo") ? "active" : ""} onClick={() => navigate("/todo")}>
            <i className="bx bx-list-check"></i>
            <span className="links_name">To-Do</span>
          </li>

          {/* CALENDÁRIO */}
          <li className={`dropdown ${calendarioAberto ? "open" : ""}`} ref={calendarioRef}>
            <div className="dropdown-toggle" onClick={() => setCalendarioAberto(!calendarioAberto)}>
              <i className="bx bx-calendar-event"></i>
              <span className="links_name">Calendário</span>
              <i className={`bx ${calendarioAberto ? "bx-chevron-up" : "bx-chevron-down"}`} />
            </div>
          </li>

          {/* ESCOLA */}
          <li className={`dropdown ${escolaAberto ? "open" : ""}`} ref={escolaRef}>
            <div className="dropdown-toggle" onClick={() => setEscolaAberto(!escolaAberto)}>
              <i className="bx bx-buildings"></i>
              <span className="links_name">Escola</span>
              <i className={`bx ${escolaAberto ? "bx-chevron-up" : "bx-chevron-down"}`} />
            </div>
          </li>

          {/* TEMA */}
          <li onClick={toggleTheme}>
            <i className={`bx ${lightMode ? "bx-sun" : "bx-moon"}`}></i>
            <span className="links_name">Tema</span>
          </li>
        </ul>
      </div>

      {/* DROPDOWN CALENDÁRIO */}
      {calendarioAberto && (
        <ul
          className="dropdown-menu"
          style={{
            position: "fixed",
            top: dropdownPos.calendario,
            left: open ? 250 : 78,
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

      {/* DROPDOWN ESCOLA */}
      {escolaAberto && (
        <ul
          className="dropdown-menu"
          style={{
            position: "fixed",
            top: dropdownPos.escola,
            left: open ? 250 : 78,
          }}
        >
          <li className={isAtivo("/professores") ? "active" : ""} onClick={() => navigate("/professores")}>
            <span>Professores</span>
          </li>
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
