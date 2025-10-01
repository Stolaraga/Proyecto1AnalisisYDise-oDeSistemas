import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Gestión simple de roles y permisos:
 * - Usuarios (solo email como identificador en demo)
 * - Roles predefinidos: Estudiante, Tutor, Coordinacion
 * - Permisos por rol (CRUD simplificado)
 * Persistencia en localStorage (keys: usersRoles, rolesPermisos).
 */

type Rol = "Estudiante" | "Tutor" | "Coordinacion";
type Permiso =
  | "ver_bloques"
  | "crear_bloques"
  | "inscribirse"
  | "cancelar"
  | "gestionar_roles"
  | "ver_reportes";

type UserRole = { email: string; roles: Rol[] };
type RolePerms = { rol: Rol; permisos: Permiso[] };

const PERMISOS: Permiso[] = [
  "ver_bloques",
  "crear_bloques",
  "inscribirse",
  "cancelar",
  "gestionar_roles",
  "ver_reportes",
];

const ROLES: Rol[] = ["Estudiante", "Tutor", "Coordinacion"];

function readUserRoles(): UserRole[] {
  try { return JSON.parse(localStorage.getItem("usersRoles") || "[]"); } catch { return []; }
}
function writeUserRoles(arr: UserRole[]) {
  localStorage.setItem("usersRoles", JSON.stringify(arr));
}
function readRolePerms(): RolePerms[] {
  try { return JSON.parse(localStorage.getItem("rolesPermisos") || "[]"); } catch { return []; }
}
function writeRolePerms(arr: RolePerms[]) {
  localStorage.setItem("rolesPermisos", JSON.stringify(arr));
}

/** Inicializa permisos por rol si no existen */
function ensureDefaults() {
  const current = readRolePerms();
  if (current.length) return current;
  const defaults: RolePerms[] = [
    { rol: "Estudiante", permisos: ["ver_bloques", "inscribirse", "cancelar"] },
    { rol: "Tutor", permisos: ["ver_bloques", "crear_bloques", "cancelar"] },
    { rol: "Coordinacion", permisos: ["ver_bloques", "crear_bloques", "gestionar_roles", "ver_reportes", "cancelar"] },
  ];
  writeRolePerms(defaults);
  return defaults;
}

export default function AccesosPermisos() {
  // Usuarios
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<Rol[]>([]);
  const [users, setUsers] = useState<UserRole[]>([]);

  // Permisos por rol
  const [rolePerms, setRolePerms] = useState<RolePerms[]>([]);

  // UI
  const [msg, setMsg] = useState<{type:"ok"|"err"; text:string}|null>(null);

  useEffect(() => {
    setUsers(readUserRoles());
    setRolePerms(ensureDefaults());
  }, []);

  function toggleRole(r: Rol) {
    setRoles(prev => prev.includes(r) ? prev.filter(x=>x!==r) : [...prev, r]);
  }

  function addUser(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const mail = email.trim().toLowerCase();
    if (!mail || !mail.includes("@")) { setMsg({type:"err", text:"Email inválido."}); return; }
    if (roles.length === 0) { setMsg({type:"err", text:"Asigna al menos un rol."}); return; }
    const all = readUserRoles();
    const idx = all.findIndex(u => u.email === mail);
    if (idx >= 0) all[idx].roles = Array.from(new Set([...all[idx].roles, ...roles]));
    else all.push({ email: mail, roles: Array.from(new Set(roles)) });
    writeUserRoles(all);
    setUsers(all);
    setEmail(""); setRoles([]);
    setMsg({type:"ok", text:"Usuario actualizado."});
  }

  function removeUser(mail: string) {
    const all = readUserRoles().filter(u => u.email !== mail);
    writeUserRoles(all);
    setUsers(all);
  }

  function togglePerm(rol: Rol, p: Permiso) {
    const copy = rolePerms.map(rp => rp.rol === rol
      ? { ...rp, permisos: rp.permisos.includes(p) ? rp.permisos.filter(x=>x!==p) : [...rp.permisos, p] }
      : rp
    );
    setRolePerms(copy);
    writeRolePerms(copy);
  }

  const wrap: React.CSSProperties = { maxWidth: 1000, margin:"0 auto", padding:24, fontFamily:"system-ui, sans-serif" };
  const input: React.CSSProperties = { padding:"10px 12px", border:"1px solid #e1e4ea", borderRadius:10, width:"100%" };
  const lbl: React.CSSProperties = { fontSize:14, fontWeight:600, marginBottom:4 };
  const tag: React.CSSProperties = { display:"inline-block", padding:"6px 10px", border:"1px solid #dadde6", borderRadius:999, margin:"6px 8px 0 0", cursor:"pointer", userSelect:"none" };
  const box: React.CSSProperties = { background:"#fff", border:"1px solid #e6e8ef", borderRadius:12, padding:16 };
  const btn: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #d0d5e2", background:"#0ea5e9", color:"#fff", cursor:"pointer" };
  const btnGhost: React.CSSProperties = { padding:"10px 14px", borderRadius:10, border:"1px solid #d0d5e2", background:"#f5f7fb", cursor:"pointer" };

  return (
    <div style={wrap}>
      <h2>Registrar accesos y permisos</h2>
      <p style={{opacity:.9}}>
        Asigna <b>roles</b> a usuarios y ajusta los <b>permisos</b> de cada rol. Los cambios se guardan en el navegador (prototipo).
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

      {/* Alta/edición de usuarios */}
      <form onSubmit={addUser} style={{ display:"grid", gap:16 }}>
        <div>
          <label style={lbl}>Email de usuario *</label>
          <input style={input} value={email} onChange={e=>setEmail(e.target.value)} placeholder="usuario@correo.com" />
        </div>
        <div style={box}>
          <label style={lbl}>Roles *</label>
          <div>
            {ROLES.map(r => (
              <span key={r}
                    onClick={()=>toggleRole(r)}
                    style={{...tag, background: roles.includes(r) ? "#e0f2fe" : "#fff"}}>
                {roles.includes(r) ? "✓ " : ""}{r}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <button type="submit" style={btn}>Guardar</button>
          <Link to="/" style={{...btnGhost, textDecoration:"none", lineHeight:"36px"}}>← Volver al inicio</Link>
        </div>
      </form>

      <hr style={{margin:"24px 0"}} />

      {/* Usuarios y roles asignados */}
      <section>
        <h3>Usuarios y roles</h3>
        {!users.length ? <p style={{opacity:.8}}>Aún no hay usuarios.</p> : (
          <div style={{ display:"grid", gap:10 }}>
            {users.map(u => (
              <div key={u.email} style={{ border:"1px solid #e6e8ef", borderRadius:12, padding:12, background:"#fafbff" }}>
                <strong>{u.email}</strong><br/>
                Roles: {u.roles.join(", ")}
                <div style={{marginTop:8}}>
                  <button onClick={()=>removeUser(u.email)} style={{...btnGhost}}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <hr style={{margin:"24px 0"}} />

      {/* Permisos por rol */}
      <section>
        <h3>Permisos por rol</h3>
        <div style={{ display:"grid", gap:12 }}>
          {rolePerms.map(rp => (
            <div key={rp.rol} style={box}>
              <strong>{rp.rol}</strong>
              <div style={{marginTop:8}}>
                {PERMISOS.map(p => {
                  const activo = rp.permisos.includes(p);
                  return (
                    <label key={p} style={{ display:"inline-flex", alignItems:"center", gap:6, marginRight:12, marginBottom:8 }}>
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={()=>togglePerm(rp.rol, p)}
                      />
                      <span>{p}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
