import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Tutor = {
  id: string;
  nombre: string;
  identificacion: string;
  correo: string;
  telefono?: string;
  materias: string[];
  modalidad: ("Presencial" | "Virtual" | "Mixta")[];
  estado: "Pendiente de verificación" | "Activo";
  creadoEn: string;   // ISO
  ipSimulada: string; // demo de auditoría
};

const MATERIAS = [
  "Matemática General",
  "Cálculo",
  "Estadística",
  "Programación I",
  "Programación II",
  "Bases de Datos",
  "Redacción Académica",
  "Otra (especificar en comentarios)",
];

const POLITICA_PASSWORD = "Mínimo 8 caracteres, con letras y números";

/** Utilidades de demo **/
const emailInstitRegex = /^[A-Za-z0-9._%+-]+@(?:uned\.ac\.cr|universidad\.edu)$/i;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

function readStore(): Tutor[] {
  try { return JSON.parse(localStorage.getItem("tutores") || "[]"); } catch { return []; }
}
function writeStore(arr: Tutor[]) {
  localStorage.setItem("tutores", JSON.stringify(arr));
}
function generarCodigo(n = 6) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

export default function RegistrarTutor() {
  /** estado del formulario */
  const [nombre, setNombre] = useState("");
  const [identificacion, setIdentificacion] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [materias, setMaterias] = useState<string[]>([]);
  const [modalidad, setModalidad] = useState<Tutor["modalidad"]>(["Presencial"]);
  const [password, setPassword] = useState("");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  const [comentarios, setComentarios] = useState("");

  /** verificación simulada */
  const [codigoEnviado, setCodigoEnviado] = useState<string | null>(null);
  const [codigoIngresado, setCodigoIngresado] = useState("");
  const [verificado, setVerificado] = useState(false);

  /** UI */
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /** mostrar política */
  const politica = useMemo(() => POLITICA_PASSWORD, []);

  /** helpers de selección múltiple */
  function toggleMateria(m: string) {
    setMaterias((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }
  function toggleModalidad(m: "Presencial" | "Virtual" | "Mixta") {
    setModalidad((prev) => (prev.includes(m) ? (prev.length === 1 ? prev : prev.filter(x => x !== m)) : [...prev, m]));
  }

  /** enviar código de verificación (simulado) */
  function enviarCodigo() {
    if (!emailInstitRegex.test(correo)) {
      setMsg({ type: "err", text: "Debes ingresar un correo institucional válido (@uned.ac.cr o @universidad.edu)." });
      return;
    }
    const code = generarCodigo();
    setCodigoEnviado(code);
    setMsg({ type: "ok", text: `Se envió un código de verificación a ${correo} (demo: código visible aquí: ${code}).` });
  }

  /** validar antes de guardar */
  function validarCampos(): string | null {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (!identificacion.trim()) return "La identificación es obligatoria.";
    if (!emailInstitRegex.test(correo)) return "Correo institucional inválido (permitidos: @uned.ac.cr, @universidad.edu).";
    if (!passwordRegex.test(password)) return `La contraseña no cumple la política: ${politica}.`;
    if (materias.length === 0) return "Selecciona al menos una materia/tema.";
    if (modalidad.length === 0) return "Selecciona al menos una modalidad.";
    if (!aceptaPoliticas) return "Debes aceptar los Términos y la Política de datos.";
    if (!verificado) return "Debes verificar el correo con el código enviado.";
    // unicidad
    const store = readStore();
    if (store.some(t => t.correo.toLowerCase() === correo.toLowerCase())) return "Ese correo ya está registrado.";
    if (store.some(t => t.identificacion === identificacion)) return "Esa identificación ya está registrada.";
    return null;
  }

  /** registrar tutor */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const err = validarCampos();
    if (err) { setMsg({ type: "err", text: err }); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 650)); // simular latencia

    const nuevo: Tutor = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      identificacion: identificacion.trim(),
      correo: correo.trim(),
      telefono: telefono.trim() || undefined,
      materias: [...materias],
      modalidad: [...modalidad],
      estado: "Activo", // en prototipo, al verificar pasa a Activo
      creadoEn: new Date().toISOString(),
      ipSimulada: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`
    };

    const store = readStore();
    store.push(nuevo);
    writeStore(store);

    setLoading(false);
    setMsg({ type: "ok", text: "Registro exitoso. El tutor quedó Activo y listo para usar el sistema." });
    // limpiar (dejamos correo por si quiere registrar otro similar)
    setNombre(""); setIdentificacion(""); setTelefono("");
    setMaterias([]); setModalidad(["Presencial"]);
    setPassword(""); setAceptaPoliticas(false); setComentarios("");
    setCodigoEnviado(null); setCodigoIngresado(""); setVerificado(false);
  }

  /** ingresar código de verificación */
  function verificar() {
    if (!codigoEnviado) { setMsg({ type: "err", text: "Primero envía el código." }); return; }
    if (codigoIngresado.trim() !== codigoEnviado) { setMsg({ type: "err", text: "Código incorrecto o vencido." }); return; }
    setVerificado(true);
    setMsg({ type: "ok", text: "Correo verificado. Puedes completar el registro." });
  }

  /** estilos mínimos */
  const wrap: React.CSSProperties = { maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const lbl: React.CSSProperties = { fontSize: 14, fontWeight: 600, marginBottom: 4 };
  const input: React.CSSProperties = { padding: "10px 12px", border: "1px solid #e1e4ea", borderRadius: 10, width: "100%" };
  const box: React.CSSProperties  = { background: "#fff", border: "1px solid #e6e8ef", borderRadius: 12, padding: 16 };
  const tag: React.CSSProperties  = { display:"inline-block", padding:"6px 10px", border:"1px solid #dadde6", borderRadius: 999, margin:"6px 8px 0 0", cursor:"pointer", userSelect:"none" };
  const btn: React.CSSProperties  = { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d5e2", background: "#0ea5e9", color:"#fff", cursor:"pointer" };
  const btnGhost: React.CSSProperties = { padding: "10px 14px", borderRadius: 10, border: "1px solid #d0d5e2", background: "#f5f7fb", cursor:"pointer" };

  return (
    <div style={wrap}>
      <h2>Registrar tutor</h2>
      <p style={{opacity:.9, marginBottom:12}}>
        Completa los datos del tutor/a. Este prototipo valida formato, unicidad de correo/identificación,
        políticas de contraseña, aceptación de términos y verificación de correo con código simulado.
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
        <div style={row}>
          <div>
            <label style={lbl}>Nombre completo *</label>
            <input style={input} value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej. Ana María Solano" />
          </div>
          <div>
            <label style={lbl}>Identificación *</label>
            <input style={input} value={identificacion} onChange={e=>setIdentificacion(e.target.value)} placeholder="Cédula / ID" />
          </div>
        </div>

        <div style={row}>
          <div>
            <label style={lbl}>Correo institucional *</label>
            <input style={input} value={correo} onChange={e=>setCorreo(e.target.value)} placeholder="usuario@uned.ac.cr" />
          </div>
          <div>
            <label style={lbl}>Teléfono (opcional)</label>
            <input style={input} value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="+506 8888-8888" />
          </div>
        </div>

        <div style={row}>
          <div>
            <label style={lbl}>Contraseña *</label>
            <input type="password" style={input} value={password} onChange={e=>setPassword(e.target.value)} placeholder="********" />
            <small style={{opacity:.7}}>Política: {politica}</small>
          </div>

          <div>
            <label style={lbl}>Verificación de correo *</label>
            <div style={{ display:"flex", gap:8 }}>
              <button type="button" style={btnGhost} onClick={enviarCodigo}>Enviar código</button>
              <input style={{...input, flex:1}} value={codigoIngresado} onChange={e=>setCodigoIngresado(e.target.value)} placeholder="Código de 6 dígitos" />
              <button type="button" style={btn} onClick={verificar}>Verificar</button>
            </div>
            <small style={{opacity:.7}}>{verificado ? "Correo verificado ✅" : "Aún no verificado"}</small>
          </div>
        </div>

        <div style={box}>
          <label style={lbl}>Materias / temas que puede atender *</label>
          <div>
            {MATERIAS.map(m => (
              <span
                key={m}
                onClick={()=>toggleMateria(m)}
                style={{ ...tag, background: materias.includes(m) ? "#e0f2fe" : "#fff" }}
                title="Click para (des)seleccionar"
              >
                {materias.includes(m) ? "✓ " : ""}{m}
              </span>
            ))}
          </div>
        </div>

        <div style={box}>
          <label style={lbl}>Modalidad *</label>
          <div>
            {(["Presencial","Virtual","Mixta"] as const).map(m => (
              <span
                key={m}
                onClick={()=>toggleModalidad(m)}
                style={{ ...tag, background: modalidad.includes(m) ? "#e0f2fe" : "#fff" }}
              >
                {modalidad.includes(m) ? "✓ " : ""}{m}
              </span>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Comentarios (opcional)</label>
          <textarea style={{...input, minHeight: 90}} value={comentarios} onChange={e=>setComentarios(e.target.value)} placeholder="Observaciones, horarios preferentes, campus, etc." />
        </div>

        <label style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <input type="checkbox" checked={aceptaPoliticas} onChange={e=>setAceptaPoliticas(e.target.checked)} />
          <span>Acepto los <a href="#" onClick={e=>e.preventDefault()}>Términos y Condiciones</a> y la <a href="#" onClick={e=>e.preventDefault()}>Política de tratamiento de datos</a>.</span>
        </label>

        <div style={{ display:"flex", gap:12 }}>
          <button disabled={loading} type="submit" style={{...btn, opacity: loading ? .7 : 1}}>
            {loading ? "Guardando..." : "Registrar tutor"}
          </button>
          <Link to="/" style={{...btnGhost, textDecoration:"none", lineHeight:"36px"}}>← Volver al inicio</Link>
        </div>
      </form>

      <hr style={{margin:"24px 0"}} />

      <Historial />
    </div>
  );
}

/** Componente de apoyo: muestra tutores guardados (auditoría simple) */
function Historial() {
  const [data, setData] = useState<Tutor[]>([]);
  useEffect(() => {
    setData(readStore().sort((a,b)=> b.creadoEn.localeCompare(a.creadoEn)));
  }, []);
  if (!data.length) return null;

  return (
    <div>
      <h3 style={{marginBottom:8}}>Tutores registrados (demo)</h3>
      <div style={{ display:"grid", gap:10 }}>
        {data.map(t => (
          <div key={t.id} style={{ border:"1px solid #e6e8ef", borderRadius:12, padding:12, background:"#fafbff" }}>
            <strong>{t.nombre}</strong> — {t.correo} · <em>{t.estado}</em><br/>
            ID: {t.identificacion} · Modalidad: {t.modalidad.join(", ")}<br/>
            Materias: {t.materias.join(", ")}<br/>
            <small>Creado: {new Date(t.creadoEn).toLocaleString()} · IP (demo): {t.ipSimulada}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
