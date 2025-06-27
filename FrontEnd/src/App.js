import React from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import 'boxicons/css/boxicons.min.css';
import 'react-calendar/dist/Calendar.css';

import { PagPrincipal } from "./pages/pagprincipal";
import { Perfil } from "./pages/perfil";
import { Todo } from "./pages/todo";
import { Escola } from "./pages/escola";
import Horario from "./pages/horario";
import Mapa from "./pages/mapa";
import { Professores } from "./pages/professores";
import Anuncios from "./pages/anuncios";
import { CalendarioEscolar } from "./pages/calendarioescolar";
import Disciplinas from "./pages/disciplinas";
import Contactos from "./pages/contactos";
import CalendarioExames from "./pages/calendarioexames";
import CalendarioFrequencia from "./pages/calendariofrequencia";
import AIChatPage from "./pages/ai";
import AnunciosC from "./pages/anuncioC";

import SideNavbar from "./components/sideNavbar";
import "./App.css";

function AppContent() {
  const location = useLocation();
  
  // Páginas onde NÃO queres mostrar a sidebar
  const paginasSemSidebar = ["/ai", "/", "/anuncioC"]; // adiciona outras conforme necessário

  const mostrarSidebar = !paginasSemSidebar.includes(location.pathname);

  return (
    <div className="main-layout">
      {mostrarSidebar && <SideNavbar />}
      <div className="content">
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
          <Route path="/ai" element={<AIChatPage />} />
          <Route path="/anuncioscoord" element={<AnunciosC />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
