import { login } from "../api";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../index.css';
import { getUserProfile } from "../api"; // Importa a função que verifica o login
import LoginButton from "../components/LoginButton";




export function PagPrincipal() {
    const navigate = useNavigate();

    useEffect(() => {
        async function checkLogin() {
            const userData = await getUserProfile();
            if (userData) {
                console.log("Utilizador autenticado, redirecionando para /perfil...");
                navigate("/perfil");
            }
        }
        checkLogin();
    }, [navigate]);

    return (
        <>
            <div className="container">
                <button className="button" onClick={login}><span>Login</span></button>
            </div>
        </>

    )
}
