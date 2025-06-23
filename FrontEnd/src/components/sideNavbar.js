import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sideNavbar.css";

export default function SideNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownCalendario, setDropdownCalendario] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleDropdownCalendario = () => setDropdownCalendario(!dropdownCalendario);

  return (
    <div className="sidebar">
      <div className="logo"></div>

      <NavLink to="/" className="nav-item">página principal</NavLink>
      <NavLink to="/perfil" className="nav-item">perfil</NavLink>
      <NavLink to="/horario" className="nav-item">horario</NavLink>

      <div className={`nav-item dropdown-toggle ${dropdownCalendario ? "open" : ""}`} onClick={toggleDropdownCalendario}>
        calendario
      </div>
      {dropdownCalendario && (
        <div className="dropdown-menu">
          <NavLink to="/calendario-escolar" className="nav-item subitem">escolar</NavLink>
          <NavLink to="/calendario-exames" className="nav-item subitem">exames</NavLink>
        </div>
      )}

      <div className={`nav-item dropdown-toggle ${dropdownOpen ? "open" : ""}`} onClick={toggleDropdown}>
        escola
      </div>
      {dropdownOpen && (
        <div className="dropdown-menu">
          <NavLink to="/disciplinas" className="nav-item subitem">disciplinas</NavLink>
          <NavLink to="/contactos" className="nav-item subitem">contactos</NavLink>
          <NavLink to="/anuncios" className="nav-item subitem">anuncios</NavLink>
          <NavLink to="/mapa" className="nav-item subitem">mapa</NavLink>
        </div>
      )}

      <NavLink to="/todo" className="nav-item">to-do</NavLink>
      <NavLink to="/moodle" className="nav-item">moodle</NavLink>
      <NavLink to="/netpa" className="nav-item">netpa</NavLink>
    </div>
  );
}
