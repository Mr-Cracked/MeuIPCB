// src/components/TopNavbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TopNavbar.css';

export default function TopNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Redireciona o browser (e não apenas faz um GET)
    window.location.href = "http://localhost:3000/auth/signout";
  };

  return (
    <div className="top-navbar">
      <div className="logo">MeuIPCB</div>
      <div className="search-wrapper">
        {/* Placeholder para funcionalidade futura */}
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
