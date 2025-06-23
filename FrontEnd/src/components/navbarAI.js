import React, { useState } from "react";
import {
  FaComments,
  FaUserGraduate,
  FaCalendarAlt,
  FaCogs,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "./navbarAI.css";

const SideNavbar = () => {
  const [expandida, setExpandida] = useState(false);

  const toggleNavbar = () => {
    setExpandida(!expandida);
  };

  return (
    <>
      {/* Botão flutuante separado */}
      <button
        className="toggle-flutuante-separado"
        onClick={toggleNavbar}
        title={expandida ? "Fechar menu" : "Abrir menu"}
      >
        {expandida ? <FaTimes /> : <FaBars />}
      </button>

      {/* NAVBAR */}
      <div className={`side-navbar ${expandida ? "expandida" : ""}`}>
        <div className="nav-item">
          <FaComments className="icon" />
          {expandida && <span>Chat</span>}
        </div>
        <div className="nav-item">
          <FaUserGraduate className="icon" />
          {expandida && <span>Alunos</span>}
        </div>
        <div className="nav-item">
          <FaCalendarAlt className="icon" />
          {expandida && <span>Calendário</span>}
        </div>
        <div className="nav-item">
          <FaCogs className="icon" />
          {expandida && <span>Definições</span>}
        </div>
      </div>
    </>
  );
};

export default SideNavbar;