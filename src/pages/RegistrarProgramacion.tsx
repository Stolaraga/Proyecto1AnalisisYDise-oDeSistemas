import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/** ====== Tipos y utilidades ====== */
type Modalidad = "Presencial" | "Virtual";
type Bloque = {
  id: string;
  tutorId: string; // demo: fijo
  materia: string;
  modalidad: Modalidad;
  sedeOAula?: string;   // cuando es presencial
  enlace?: string;      // cuando es virtual
  fecha: string;        // YYYY-MM-DD
  horaInicio: string;   // HH:mm
  horaFin: string;      // HH:mm
  capacidad: number;
  bufferMin: number;
  creadoEn: string;     // ISO
};

const MATERIAS = [
  "Matemática General",
  "Cálculo",
  "Estadística",
  "Programación I",
  "Programación II",
  "Bases de Datos",
];

const HORARIO_OPERATIVO = { desde: "07:00", hasta: "22:00" };
const TUTOR_DEMO_ID = "tutor-demo-001"; // en el futuro saldrá del login

function readBloques(): Bloque[] {
  try { return JSON.parse(localStorage.getItem("bloques") || "[]"); } catch { return []; }
}
function writeBloques(arr: Bloque[]) {
  localStorage.setItem("bloques", JSON.stringify(arr));
}
function uuid() { return crypto.randomUUID(); }

/** Devuelve true si hay solapamiento entre [a1,a2) y [b1,b2) en minutos */
function overlap(a1: number, a2: number, b1: number, b2: number) {
  return Math.max(a1, b1) < Math.min(a2, b2);
}
function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** ====== Componente ====== */
export default function RegistrarProgramacion() {
  // Form
  const [materia, setMateria] = useState(MATERIAS[0]);
  const [modalidad, setModalidad] = useState<Modalidad>("Presencial");
  const [sedeOAula, setSedeOAula] = useState("");
  const [enlace, setEnlace] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState("14:00");
  const [horaFin, setHoraFin] = useState("15:00");
  const [capacidad, setCapacidad] = useState(4);
  const [bufferMin, setBufferMin] = useState(10);

  // Recurrencia semanal
  const [recurrente, setRecurrente] = useState(false);
  const [repeticiones, setRepeticiones] = useState(6); // semanas

  // UI
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [cargando, setCargando] = useState(false);
  const [bloques, setBloques] = useState<Bloque[]>([]);

  useEffect(() => setBloques(readBloques().sort((a,b)=> (a.fecha+a.horaInicio).localeCompare(b.fecha+b.horaInicio))), []);

  // Duración sugerida
  const duracionMin = useMemo(() => toMin(horaFin) - toMin(horaInicio), [horaInicio, horaFin]);

  function validar(): string | null {
    if (!materia) return "Selecciona una materia.";
    if (!fecha) return "Selecciona la fecha.";
    if (!horaInicio || !horaFin) return "Ingresa hora de inicio y fin.";
    const ini = toMin(horaInicio), fin = toMin(horaFin);
    if (fin <= ini) return "La hora de fin debe ser mayor a la hora de inicio.";
    // horario operativo simple
    if (ini < toMin(HORARIO_OPERATIVO.desde) || fin > toMin(HORARIO_OPERATIVO.hasta))
      return `Fuera de horas operativas (${HORARIO_OPERATIVO.desde} - ${HORARIO_OPERATIVO.hasta}).`;
    // logística según modalidad
    if (modalidad === "Presencial" && !sedeOAula.trim()) return "Debes indicar la sede o el aula.";
    if (modalidad === "Virtual" && !enlace.trim()) return "Debes indicar el enlace de la reunión.";
    if (capacidad < 1) return "La capacidad debe ser al menos 1.";
    if (bufferMin < 0) return "El buffer no puede ser negativo.";
    return null;
  }

  /** Genera fechas para recurrencia semanal */
  function generarFechas(base: string, cant: number) {
    const arr: string[] = [];
    const d0 = new Date(base+"T00:00:00");
    for (let i = 0; i < cant; i++) {
      const d = new Date(d0);
      d.setDate(d.getDate() + i*7);
      arr.push(d.toISOString().slice(0,10));
    }
    return arr;
  }

  function hayChoque(fechaX: string, ini: number, fin: number) {
    return bloques.some(b => 
      b.tutorId === TUTOR_DEMO_ID &&
      b.fecha === fechaX &&
      overlap(ini - bufferMin, fin + bufferMin, toMin(b.horaInicio) - b.bufferMin, toMin(b.horaFin) + b.bufferMin)
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const err = validar();
    if (err) { setMsg({ type: "err", text: err }); return; }

    const ini = toMin(horaInicio), fin = toMin(horaFin);
    const fechas = recurrente ? generarFechas(fecha, repeticiones) : [fecha];

    // Choques
    const conflictos = fechas.filter(f => hayChoque(f, ini, fin));
    if (conflictos.length) {
      setMsg({ type: "err", text: `Choque de agenda en: ${conflictos.join(", ")}` });
      return;
    }

    setCargando(true);
    await new Promise(r => setTimeout(r, 500)); // simular latencia

    const nuevos: Bloque[] = fechas.map(f => ({
      id: uuid(),
      tutorId: TUTOR_DEMO_ID,
      materia,
      modalidad,
      sedeOAula: modalidad === "Presencial" ? sedeOAula.trim() : undefined,
      enlace: modalidad === "Virtual" ? enlace.trim() : undefined,
      fecha: f,
      horaInicio,
      horaFin,
      capacidad,
      bufferMin,
      creadoEn: new Date().toISOString(),
    }));

    const store = [...readBloques(), ...nuevos];
    writeBloques(store);
    setBloques(store.sort((a,b)=> (a.fecha+a.horaInicio).localeCompare(b.fecha+b.horaInicio)));

    setCargando(false);
    setMsg({ type: "ok", text: `Se publicaron ${nuevos.length} bloque(s) de tutoría.` });
  }

  /** ====== Estilos mínimos ====== */
  const wrap: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
  const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const row3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 };
  const lbl: React.CSSProperties = { fontSize: 14, fontWeight: 600, marginBottom: 4 };
  const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #e1e4ea", borderRadius: 10, width: "100%" };
  const btn: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d5e2", background: "#0ea5e9", color:"#fff", cursor:"pointer" };
  const btnGhost: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d5e2", background: "#f5f7fb", cursor:"pointer" };

  return (
    <div style={wrap}>
      <h2>Registrar programación de tutorías</h2>
      <p style={{opacity:.9, marginBottom:12}}>
        Publica bloques de tutoría con fecha y hora. Este prototipo valida choques de agenda, horas operativas,
        logística por modalidad y permite crear recurrencias semanales.
      </p>

      {msg && (
        <div style={{
          margin: "8px 0 16px",
          padding: "10px 12px",
          borderRadius: 10,
          background: msg.type === "ok" ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${msg.type === "ok" ? "#10b98155" : "#ef444455"}`,
          color: msg.type === "ok" ? "#065f46" : "#7f1d1d"
        }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display:"grid", gap: 16 }}>
        <div style={row3}>
          <div>
            <label style={lbl}>Materia *</label>
            <select style={input} value={materia} onChange={e=>setMateria(e.target.value)}>
              {MATERIAS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Modalidad *</label>
            <select style={input} value={modalidad} onChange={e=>setModalidad(e.target.value as Modalidad)}>
              <option>Presencial</option>
              <option>Virtual</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Capacidad *</label>
            <input style={input} type="number" min={1} value={capacidad} onChange={e=>setCapacidad(parseInt(e.target.value||"0"))}/>
          </div>
        </div>

        {modalidad === "Presencial" ? (
          <div>
            <label style={lbl}>Sede / Aula *</label>
            <input style={input} placeholder="Ej. Campus Central - Aula B203" value={sedeOAula} onChange={e=>setSedeOAula(e.target.value)} />
          </div>
        ) : (
          <div>
            <label style={lbl}>Enlace de la reunión *</label>
            <input style={input} placeholder="https://..." value={enlace} onChange={e=>setEnlace(e.target.value)} />
          </div>
        )}

        <div style={row3}>
          <div>
            <label style={lbl}>Fecha *</label>
            <input style={input} type="date" value={fecha} onChange={e=>setFecha(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Hora inicio *</label>
            <input style={input} type="time" value={horaInicio} onChange={e=>setHoraInicio(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Hora fin *</label>
            <input style={input} type="time" value={horaFin} onChange={e=>setHoraFin(e.target.value)} />
          </div>
        </div>

        <div style={row2}>
          <div>
            <label style={lbl}>Buffer entre sesiones (min)</label>
            <input style={input} type="number" min={0} value={bufferMin} onChange={e=>setBufferMin(parseInt(e.target.value||"0"))}/>
            <small style={{opacity:.7}}>Duración actual: <b>{duracionMin}</b> min (no incluye buffer).</small>
          </div>
          <div>
            <label style={lbl}>Recurrencia</label>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <label><input type="checkbox" checked={recurrente} onChange={e=>setRecurrente(e.target.checked)}/> Semanal</label>
              {recurrente && (
                <>
                  <span>por</span>
                  <input style={{...input, width:100}} type="number" min={1} max={20} value={repeticiones} onChange={e=>setRepeticiones(parseInt(e.target.value||"1"))}/>
                  <span>semanas</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button disabled={cargando} type="submit" style={{...btn, opacity: cargando ? .7 : 1}}>
            {cargando ? "Publicando..." : "Publicar bloque(s)"}
          </button>
          <Link to="/" style={{...btnGhost, textDecoration:"none", lineHeight:"36px"}}>← Volver al inicio</Link>
        </div>
      </form>

      <hr style={{margin:"24px 0"}} />

      <ListadoBloques data={bloques}/>
    </div>
  );
}

/** ====== Listado de bloques publicados ====== */
function ListadoBloques({ data }: { data: Bloque[] }) {
  if (!data.length) return null;
  return (
    <div>
      <h3 style={{marginBottom:8}}>Bloques publicados</h3>
      <div style={{display:"grid", gap:10}}>
        {data.map(b => (
          <div key={b.id} style={{ border:"1px solid #e6e8ef", borderRadius:12, padding:12, background:"#fafbff" }}>
            <strong>{b.materia}</strong> — {b.modalidad === "Presencial" ? (b.sedeOAula || "—") : (b.enlace || "—")}
            <br/>
            {b.fecha} · {b.horaInicio}–{b.horaFin} · Capacidad: {b.capacidad} · Buffer: {b.bufferMin} min
            <br/>
            <small>Creado: {new Date(b.creadoEn).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
