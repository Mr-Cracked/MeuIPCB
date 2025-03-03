import React from "react";
import "../styles.css";
import logoutIcon from "../assets/logout.png";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const IconButton = () => {
    const handleLogout = () => {
        // Redireciona o utilizador para o endpoint de logout do back-end
        window.location.href = `${API_URL}/auth/signout`;
    };

    return (
        <button className="icon-button" onClick={handleLogout}>
            <img src={logoutIcon} alt="Logout" className="icon" />
        </button>
    );
};

export default IconButton;
