import { useEffect, useState } from "react";
import api from "../api";
import "../styles/GestionInvitados.css";

function generarId(invitados) {
  const num = invitados.length + 1;
  return `INV-${String(num).padStart(3, "0")}`;
}

function generarCodigo() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function GestionInvitados() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [invitados, setInvitados] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     CARGAR INVITADOS
  ========================= */
  useEffect(() => {
    if (!userId) return;

   api.get(`/user/info/${userId}`)

      .then((res) => {
        setInvitados(res.data.guests_json || []);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  /* =========================
     GUARDAR EN BBDD
  ========================= */
  const guardarInvitados = async (lista) => {
    setInvitados(lista);
    await api.put(`/user/guests/${userId}`, {
      guests_json: lista,
    });
  };

  /* =========================
     AÑADIR INVITADO
  ========================= */
  const añadirInvitado = async () => {
    if (!nuevoNombre.trim()) return;

    const nuevo = {
      id: generarId(invitados),
      code: generarCodigo(),
      name: nuevoNombre,
      attendees: 0,
      menu: "",
      notes: "",
      confirmed: false,
    };

    const nuevaLista = [...invitados, nuevo];
    setNuevoNombre("");
    await guardarInvitados(nuevaLista);
  };

  /* =========================
     ELIMINAR INVITADO
  ========================= */
  const eliminarInvitado = async (id) => {
    const nuevaLista = invitados.filter((i) => i.id !== id);
    await guardarInvitados(nuevaLista);
  };

  if (loading) return <p>Cargando invitados…</p>;

  return (
    <div className="guest-dashboard">
      <h2>Gestión de invitados</h2>

      {/* AÑADIR */}
      <div className="add-guest">
        <input
          placeholder="Nombre del invitado"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <button onClick={añadirInvitado}>Añadir invitado</button>
      </div>

      {/* LISTA */}
      <div className="guest-list">
        {invitados.length === 0 && (
          <p className="empty">No hay invitados todavía</p>
        )}

        {invitados.map((inv) => (
          <div key={inv.id} className="guest-card">
            <div>
              <strong>{inv.name}</strong>
              <p>ID: {inv.id}</p>
              <p>
                Código: <span className="code">{inv.code}</span>
              </p>
              <p>Estado: {inv.confirmed ? "Confirmado" : "Pendiente"}</p>
            </div>

            <button onClick={() => eliminarInvitado(inv.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GestionInvitados;
