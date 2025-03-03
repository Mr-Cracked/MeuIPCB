import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from '../components/navbar.js';
import IconButton from '../components/iconbutton.js';
import { getUserProfile } from "../api";


export function Perfil() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const userData = await getUserProfile();
                if (userData) {
                    console.log("Dados do Utilizador Recebidos:", userData);  // Debug
                    setUser(userData);
                } else {
                    console.error("Utilizador não autenticado, redirecionando...");
                    navigate("/");
                }
            } catch (error) {
                console.error("Erro ao buscar perfil:", error);
            }
        }
        fetchUserProfile();
    }, [navigate]);

    return (
        <div>
            <Navbar /> { }
            <IconButton />
            <div className="app-container">
                <div className="rectangle"></div>
            </div>
            <div className="app-container">
                <div className='square'></div>
            </div>
            <div className="app-container">
                <div className="verticalrect"></div>
            </div>
            <div className="text-container">
                {user ? (
                    <>
                        <h2>Nome: {user.displayName || user.idTokenClaims?.name}</h2>
                        <p>Email: {user.email || user.idTokenClaims?.preferred_username}</p>
                    </>
                ) : (
                    <p>A carregar informações do Utilizador...</p>
                )}
            </div>
        </div>
    );
}