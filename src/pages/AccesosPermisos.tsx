import { Link } from "react-router-dom";
export default function AccesosPermisos() {
  return (
    <div style={wrap}>
      <h2>Registrar accesos y permisos</h2>
      <p style={p}>Prototipo para roles y permisos (estudiante, tutor, coordinación).</p>
      <div style={box}><em>Aquí irá la UI de roles/permisos.</em></div>
      <Link to="/" style={back}>← Volver al inicio</Link>
    </div>
  );
}
const wrap: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
const box: React.CSSProperties = { background: "#fff", border: "1px solid #e6e8ef", borderRadius: 12, padding: 16 };
const p: React.CSSProperties = { opacity: 0.9 };
const back: React.CSSProperties = { display: "inline-block", marginTop: 16, textDecoration: "none" };
