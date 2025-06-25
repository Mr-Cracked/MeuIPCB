import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaUser, FaCalendarAlt, FaSchool, FaCheck, FaRobot,
  FaChalkboardTeacher, FaNetworkWired, FaBars
} from "react-icons/fa";
import "./sideNavbar.css";

export default function SideNavbar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="top-bar">
        <button className="menu-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <NavLink to="/perfil" className="nav-item">
        <FaUser className="icon" />
        {isExpanded && <span>perfil</span>}
      </NavLink>

      <NavLink to="/horario" className="nav-item">
        <FaCalendarAlt className="icon" />
        {isExpanded && <span>horario</span>}
      </NavLink>

      <NavLink to="/calendario" className="nav-item">
        <FaCalendarAlt className="icon" />
        {isExpanded && <span>calendario</span>}
      </NavLink>

      <NavLink to="/escola" className="nav-item">
        <FaSchool className="icon" />
        {isExpanded && <span>escola</span>}
      </NavLink>

      <NavLink to="/to-do" className="nav-item">
        <FaCheck className="icon" />
        {isExpanded && <span>to-do</span>}
      </NavLink>

      <NavLink to="/ai" className="nav-item">
        <FaRobot className="icon" />
        {isExpanded && <span>ai</span>}
      </NavLink>

      <NavLink to="/moodle" className="nav-item">
        <FaChalkboardTeacher className="icon" />
        {isExpanded && <span>moodle</span>}
      </NavLink>

      <NavLink to="/netpa" className="nav-item">
        <FaNetworkWired className="icon" />
        {isExpanded && <span>netpa</span>}
      </NavLink>
    </div>
  );
}
