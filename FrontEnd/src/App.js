import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Perfil } from "./pages/perfil.js";
import { PagPrincipal } from "./pages/pagprincipal.js";
import LoginButton from "./components/LoginButton";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<PagPrincipal />} />
                <Route path="/perfil" element={<Perfil />} />

            </Routes>
        </Router>
    );
}

export default App;



