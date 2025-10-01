import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Publicación de disponibilidad del tutor por días de semana y rango horario,
 * con recurrencia entre una fecha de inicio y fin. Valida choques con
 * disponibilidades previas del mismo tutor.
 */

type Dia = "L" | "K" | "M" | "J" | "V" | "S" | "D";
type Slot = {
  id: string;
  tutorId: string;      // demo: fijo
  dias: Dia[];          // por ejemplo ["L","M","J"]
  horaInicio: string;   // HH:mm
  horaFin: string;      // HH:mm
  desde: string;        // YYYY-MM-DD
  hasta: string;        // YYYY-MM-DD
  bufferMin: number;
  creadoEn: string;     // ISO
};

const TUTOR_DEMO_ID = "tutor-demo-001";
const DIAS: { k: Dia; label: string; js: number }[] = [
  { k: "D", label: "Dom", js: 0 },
  { k: "L", label: "Lun", js: 1 },
  { k: "K", label: "Mar", js: 2 }, // uso K para evitar ambigüedad con "Miércoles"
  { k: "M", label: "Mié", js: 3 },
  { k: "J", label: "Jue", js: 4 },
  { k: "V", label: "Vie", js: 5 },
  { k: "S", label: "Sáb", js: 6 },
];

function readDisp(): Slot[] {
  try { return JSON.parse(localStorage.getItem("disponibilidad") || "[]"); } catch { return []; }
}
function writeDisp(arr: Slot[]) {
  localStorage.setItem("disponibilidad", JSON.stringify(arr));
}
function uuid() { return crypto.randomUUID(); }
function toMin(hhmm: string) { const [h, m] = hhmm.split(":").map(Number); return h*60+m; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate()+n); return x; }

/** solape estricto con buffer */
function overlap(a1: number, a2: number, b1: number, b2: number) {
  return Math.max(a1, b1) < Math.min(a2, b2);
}

export default function RegistrarDisponibilidad() {
  // Formulario
  const [dias, setDias] = useState<Dia[]>(["L","K","M","J","V"]);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [desde, setDesde] = useState(() => new Date().toISOString().slice(0,10));
  const [hasta, setHasta] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth()+1); return d.toISOString().slice(0,10);
  });
  const [bufferMin, setBufferMin] = useState(10);

  // UI
  const [msg, setMsg] = useState<{type:"ok"|"err"; text:string}|null>(null);
  const [cargando, setCargando] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);

  useEffect(() => {
    setSlots(readDisp().sort((a,b)=> (a.desde+a.horaInicio).localeCompare(b.desde+b.horaInicio)));
  }, []);

  const duracion = useMemo(()=> toMin(horaFin)-toMin(horaInicio), [horaInicio, horaFin]);

  function toggleDia(d: Dia) {
    setDias(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev, d]);
  }

  function validar(): string | null {
    if (dias.length === 0) return "Selecciona al menos un día.";
    if (!horaInicio || !horaFin) return "Ingresa hora de inicio y fin.";
    if (toMin(horaFin) <= toMin(horaInicio)) return "La hora de fin debe ser mayor a la de inicio.";
    if (!desde || !hasta) return "Selecciona el rango de fechas.";
    if (new Date(hasta) < new Date(desde)) return "La fecha final no puede ser menor que la inicial.";
    if (bufferMin < 0) return "Buffer inválido.";
    return null;
  }

  /** detecta choque con slots guardados (mismo día de semana y solape de horas) */
  function hayChoqueConExistentes(): string[] {
    const ini = toMin(horaInicio), fin = toMin(horaFin);
    const conflictos: string[] = [];
    const d0 = new Date(desde);
    const d1 = new Date(hasta);

    // Recorremos por día para encontrar coincidencias con slots existentes
    for (let d = new Date(d0); d <= d1; d = addDays(d, 1)) {
      const wk = DIAS.find(x => x.js === d.getDay())?.k as Dia;
      if (!wk || !dias.includes(wk)) continue;

      for (const s of slots) {
        // ¿está activo el slot s en esta fecha y coincide día semana?
        const ds = new Date(s.desde), hs = new Date(s.hasta);
        if (d < ds || d > hs) continue;
        const wk2 = DIAS.find(x => x.js === d.getDay())!.k as Dia;
        if (!s.dias.includes(wk2)) continue;

        if (overlap(ini - bufferMin, fin + bufferMin, toMin(s.horaInicio) - s.bufferMin, toMin(s.horaFin) + s.bufferMin)) {
          conflictos.push(d.toISOString().slice(0,10));
          break;
        }
      }
    }
    return conflictos.slice(0,5); // acotamos para el mensaje
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const err = validar();
    if (err) { setMsg({type:"err", text: err}); return; }

    const conflictos = hayChoqueConExistentes();
    if (conflictos.length) {
      setMsg({type:"err", text:`Choque de disponibilidad en: ${conflictos.join(", ")} ...`});
      return;
    }

    setCargando(true);
    await new Promise(r=>setTimeout(r,500));

    const nvo: Slot = {
      id: uuid(),
      tutorId: TUTOR_DEMO_ID,
      dias: [...dias],
      horaInicio,
      horaFin,
      desde,
      hasta,
      bufferMin,
      creadoEn: new Date().toISOString(),
    };

    const store = [...readDisp(), nvo];
    writeDisp(store);
    setSlots(store.sort((a,b)=> (a.desde+a.horaInicio).localeCompare(b.desde+b.horaInicio)));
    setCargando(false);
    setMsg({type:"ok", text:"Disponibilidad publicada."});
  }

  const wrap: React.CSSProperties = { maxWidth: 960, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
  const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #e1e4ea", borderRadius: 10, width: "100%" };
  const tag: React.CSSProperties = { display:"inline-block", padding:"6px 10px", border:"1px solid #dadde6", borderRadius: 999, margin:"6px 8px 0 0", cursor:"pointer", userSelect:"none" };
  const lbl: React.CSSProperties = { fontSize: 14, fontWeight: 600, marginBottom: 4 };
  const btn: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #d0d5e2", background:"#0ea5e9", color:"#fff", cursor:"pointer" };
  const btnGhost: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #d0d5e2", background:"#f5f7fb", cursor:"pointer" };

  return (
    <div style={wrap}>
      <h2>Registrar disponibilidad de tutor</h2>
      <p style={{opacity:.9, marginBottom:12}}>
        Define en qué días y horarios estarás disponible. Se validan choques con disponibilidades existentes (considerando el buffer).
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
        <div>
          <label style={lbl}>Días *</label>
          <div>
            {DIAS.map(d => (
              <span key={d.k}
                    style={{...tag, background: dias.includes(d.k) ? "#e0f2fe" : "#fff"}}
                    onClick={()=>toggleDia(d.k)}>
                {dias.includes(d.k) ? "✓ " : ""}{d.label}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          <div>
            <label style={lbl}>Hora inicio *</label>
            <input style={input} type="time" value={horaInicio} onChange={e=>setHoraInicio(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Hora fin *</label>
            <input style={input} type="time" value={horaFin} onChange={e=>setHoraFin(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Buffer (min)</label>
            <input style={input} type="number" min={0} value={bufferMin} onChange={e=>setBufferMin(parseInt(e.target.value||"0"))} />
            <small style={{opacity:.7}}>Duración: <b>{duracion}</b> min (sin buffer).</small>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div>
            <label style={lbl}>Desde *</label>
            <input style={input} type="date" value={desde} onChange={e=>setDesde(e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Hasta *</label>
            <input style={input} type="date" value={hasta} onChange={e=>setHasta(e.target.value)} />
          </div>
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button type="submit" disabled={cargando} style={{...btn, opacity: cargando ? .7 : 1}}>
            {cargando ? "Publicando..." : "Publicar disponibilidad"}
          </button>
          <Link to="/" style={{...btnGhost, textDecoration:"none", lineHeight:"36px"}}>← Volver al inicio</Link>
        </div>
      </form>

      <hr style={{margin:"24px 0"}} />

      <Listado slots={slots}/>
    </div>
  );
}

function Listado({ slots }: { slots: Slot[] }) {
  if (!slots.length) return null;
  const chip: React.CSSProperties = { display:"inline-block", padding:"4px 8px", background:"#eef2ff", borderRadius:999, marginRight:6 };
  return (
    <div>
      <h3 style={{marginBottom:8}}>Disponibilidades publicadas</h3>
      <div style={{ display:"grid", gap:10 }}>
        {slots.map(s => (
          <div key={s.id} style={{ border:"1px solid #e6e8ef", borderRadius:12, padding:12, background:"#fafbff" }}>
            <div>
              {s.desde} → {s.hasta} · {s.horaInicio}-{s.horaFin} · Buffer: {s.bufferMin} min
            </div>
            <div style={{marginTop:6}}>
              {s.dias.map(d => <span key={d} style={chip}>{d}</span>)}
            </div>
            <small>Creado: {new Date(s.creadoEn).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
