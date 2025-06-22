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
import { CalendarioEscolar } from "./pages/calendarioescolar";
import { Disciplinas } from "./pages/disciplinas";
import Contactos from "./pages/contactos";
import CalendarioExames from "./pages/calendarioexames";
import CalendarioFrequencia from "./pages/calendariofrequencia";

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
        <Route path="/calendarioescolar" element={<CalendarioEscolar />} />
        <Route path="/calendarioexames" element={<CalendarioExames />} />
        <Route path="/calendariofrequencia" element={<CalendarioFrequencia />} />
        <Route path="/disciplinas" element={<Disciplinas />} />
        <Route path="/contactos" element={<Contactos />} />
      </Routes>
    </Router>
  );
}

export default App;
