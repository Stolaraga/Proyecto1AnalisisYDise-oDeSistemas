import { Link } from "react-router-dom";
export default function RegistrarDisponibilidad() {
  return (
    <div style={wrap}>
      <h2>Registrar disponibilidad de tutor</h2>
      <p style={p}>Prototipo para publicar bloques de disponibilidad.</p>
      <div style={box}><em>Aquí irá el selector de bloques de tiempo.</em></div>
      <Link to="/" style={back}>← Volver al inicio</Link>
    </div>
  );
}
const wrap: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
const box: React.CSSProperties = { background: "#fff", border: "1px solid #e6e8ef", borderRadius: 12, padding: 16 };
const p: React.CSSProperties = { opacity: 0.9 };
const back: React.CSSProperties = { display: "inline-block", marginTop: 16, textDecoration: "none" };
