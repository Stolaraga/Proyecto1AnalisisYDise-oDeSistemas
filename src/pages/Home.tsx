import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>Proyecto 1 — Prototipos (Universidad)</h1>
      <p style={{ opacity: 0.9, marginBottom: 24 }}>
        Esta página presenta un <strong>prototipo navegable</strong> del Proyecto 1 de la
        asignatura <em>Análisis y Diseño de Sistemas</em>, desarrollado por Elías Granados Ulloa.
        El objetivo es mostrar flujos clave de la plataforma de tutorías académicas.
      </p>

      <section style={{ display: "grid", gap: 16 }}>
        <Link to="/registrar-tutor" style={card}> Registrar tutor</Link>
        <Link to="/registrar-programacion" style={card}> Registrar programación de tutorías</Link>
        <Link to="/registrar-disponibilidad" style={card}> Registrar disponibilidad de tutor</Link>
        <Link to="/accesos-permisos" style={card}> Registrar accesos y permisos</Link>
      </section>

      <footer style={{ marginTop: 28, fontSize: 12, opacity: 0.75 }}>
        Nota: Contenido de demostración con fines académicos. No es un sistema en producción.
      </footer>
    </main>
  );
}

const card: React.CSSProperties = {
  display: "block",
  padding: "16px 18px",
  background: "#f5f7fb",
  borderRadius: 12,
  textDecoration: "none",
  color: "#111",
  boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  border: "1px solid #e6e8ef",
};
