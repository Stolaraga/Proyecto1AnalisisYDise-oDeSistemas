// src/App.tsx
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import RegistrarTutor from "./pages/RegistrarTutor";
import RegistrarProgramacion from "./pages/RegistrarProgramacion";
import RegistrarDisponibilidad from "./pages/RegistrarDisponibilidad";
import AccesosPermisos from "./pages/AccesosPermisos";

export default function App() {
  return (
    <>
      <header style={{padding:"10px 16px",borderBottom:"1px solid #e6e8ef"}}>
        <nav style={{display:"flex",gap:12,fontFamily:"system-ui,sans-serif"}}>
          <Link to="/">Inicio</Link>
          <Link to="/registrar-tutor">Registrar tutor</Link>
          <Link to="/registrar-programacion">Programación</Link>
          <Link to="/registrar-disponibilidad">Disponibilidad</Link>
          <Link to="/accesos-permisos">Accesos y permisos</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registrar-tutor" element={<RegistrarTutor />} />
        <Route path="/registrar-programacion" element={<RegistrarProgramacion />} />
        <Route path="/registrar-disponibilidad" element={<RegistrarDisponibilidad />} />
        <Route path="/accesos-permisos" element={<AccesosPermisos />} />
      </Routes>
    </>
  );
}
