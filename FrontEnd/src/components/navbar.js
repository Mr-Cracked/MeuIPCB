import React from 'react';
import './navbar.css'; // Import the CSS file

const Navbar = () => {
    return (
        <nav className="navbar">
            <ul className="nav-links">
                <li><a href="/perfil">Perfil</a></li>
                <li><a href="/horário">Horário</a></li>
                <li><a href="/disciplinas">Disciplinas</a></li>
                <div class="dropdown">
                    <button class="dropbtn">Escola
                        <i class="fa fa-caret-down"></i>
                    </button>
                    <div class="dropdown-content">
                        <a href="#">Professores</a>
                        <a href="#">Horários/Calendários</a>
                        <a href="#">Mapa Escolar</a>
                    </div>
                </div>
            </ul>
        </nav>
    );
};

export default Navbar;
