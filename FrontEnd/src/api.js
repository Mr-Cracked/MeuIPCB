import axios from "axios";

// URL do back-end
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Função para iniciar o login
export const login = async () => {
    window.location.href = `${API_URL}/auth/signin`;
};

// Função para obter os dados do utilizador autenticado
export const getUserProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/profile`, { withCredentials: true });
        return response.data;
    } catch (error) {
        console.error("Erro ao obter perfil:", error);
        return null;
    }
};

export const isAuthenticated = async () => {
    try{

        let reponse = await axios.get(`${API_URL}/users/profile`, { withCredentials: true });
        return reponse.data.isAuthenticated === true;
    }catch (error){
        console.error("Erro ao obter perfil:", error);
        return false;
    }
};
