import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { PagPrincipal } from "./pages/pagprincipal";
import { Perfil } from "./pages/perfil";
import { Todo as Todo } from "./pages/todo"; // Corrigido aqui
import { Escola } from "./pages/escola";
import Horario from "./pages/horario";
import { Mapa } from "./pages/mapa";
import { Professores } from "./pages/professores";
import { Anuncios } from "./pages/anuncios";
import { Calendarios } from "./pages/calendarios";
import { Disciplinas } from "./pages/disciplinas";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PagPrincipal />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/todo" element={<Todo />} />
        <Route path="/escola" element={<Escola />} />
        <Route path="/horario" element={<Horario />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/professores" element={<Professores />} />
        <Route path="/anuncios" element={<Anuncios />} />
        <Route path="/calendarios" element={<Calendarios />} />
        <Route path="/disciplinas" element={<Disciplinas />} />
      </Routes>
    </Router>
  );
}

export default App;
