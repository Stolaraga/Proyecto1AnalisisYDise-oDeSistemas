import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegistrarTutor from "./pages/RegistrarTutor";
import RegistrarProgramacion from "./pages/RegistrarProgramacion";
import RegistrarDisponibilidad from "./pages/RegistrarDisponibilidad";
import AccesosPermisos from "./pages/AccesosPermisos";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registrar-tutor" element={<RegistrarTutor />} />
      <Route path="/registrar-programacion" element={<RegistrarProgramacion />} />
      <Route path="/registrar-disponibilidad" element={<RegistrarDisponibilidad />} />
      <Route path="/accesos-permisos" element={<AccesosPermisos />} />
    </Routes>
  );
}
