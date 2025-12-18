import { useState, useEffect } from "react";
import api from "../api";
import "../styles/CambiarPlantilla.css";

// ✅ Importa las imágenes (Vite/React las empaqueta y ya no dependes de /public)
import p1 from "../styles/plantillas/p1.png";
import p2 from "../styles/plantillas/p2.png";
import p3 from "../styles/plantillas/p3.png";
import p4 from "../styles/plantillas/p4.png";

function CambiarPlantilla() {
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error("Error leyendo user de localStorage", e);
  }

  const userId = user?.id;

  const [selected, setSelected] = useState("plantilla1");
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const plantillas = [
    {
      id: "plantilla1",
      thumb: p1,
      nombre: "Romántica floral",
      descripcion: "Colores suaves, detalles delicados",
    },
    {
      id: "plantilla2",
      thumb: p2,
      nombre: "Editorial minimal",
      descripcion: "Diseño limpio, moderno y elegante",
    },
    {
      id: "plantilla3",
      thumb: p3,
      nombre: "Moderna glass",
      descripcion: "Transparencias y sensación actual",
    },
    {
      id: "plantilla4",
      thumb: p4,
      nombre: "Boho natural",
      descripcion: "Tonos tierra, textura y aire orgánico",
    },
  ];

  useEffect(() => {
    if (!userId) {
      setLoadingTemplate(false);
      return;
    }

    setLoadingTemplate(true);
    api.get(`/user/info/${userId}`)

      .then((res) => {
        setSelected(res.data.selected_template || "plantilla1");
      })
      .catch(() => {
        setStatus({
          type: "error",
          text: "No se ha podido cargar tu plantilla actual.",
        });
      })
      .finally(() => {
        setLoadingTemplate(false);
      });
  }, [userId]);

  const guardar = () => {
    if (!userId) {
      setStatus({ type: "error", text: "No se ha encontrado el usuario." });
      return;
    }

    setSaving(true);
    setStatus(null);

    api.put(`/user/info/${userId}`, {
        selected_template: selected,
      })
      .then(() => {
        setStatus({
          type: "success",
          text: "Plantilla actualizada correctamente.",
        });
      })
      .catch(() => {
        setStatus({
          type: "error",
          text: "Ha ocurrido un error al guardar la plantilla.",
        });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  if (!userId) {
    return (
      <div className="plantilla-container-preview">
        <h2 className="title">Elige tu plantilla</h2>
        <p className="status-msg error">Vuelve a iniciar sesión.</p>
      </div>
    );
  }

  return (
    <div className="plantilla-container-preview">
      <h2 className="title">Elige tu plantilla 💍</h2>
      <p className="subtitle">
        Previsualiza en tiempo real cómo quedará tu web de boda.
      </p>

      <div className="selector-layout">
        {/* MINIATURAS */}
        <div className="plantilla-list" aria-label="Listado de plantillas">
          {plantillas.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`plantilla-thumb-card ${
                selected === p.id ? "active" : ""
              }`}
              onClick={() => setSelected(p.id)}
            >
              <div className="plantilla-thumb-inner laser-box">
                {/* ✅ IMPORT: p.thumb es una URL válida generada por Vite */}
                <img
                  src={p.thumb}
                  alt={p.nombre}
                  onError={(e) => {
                    console.error("No carga miniatura:", p.id, p.thumb);
                    e.currentTarget.style.display = "none";
                  }}
                />
                <p className="plantilla-thumb-name">{p.nombre}</p>
                {p.descripcion && (
                  <p className="plantilla-thumb-desc">{p.descripcion}</p>
                )}

                {selected === p.id && (
                  <span className="plantilla-badge-actual">Seleccionada</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* IFRAME */}
        <div className="vista-previa">
          <div className="vista-previa-header">
            <h3>Vista previa interactiva</h3>
            {loadingTemplate && (
              <span className="preview-loading">Cargando…</span>
            )}
          </div>

          <div className="iframe-wrapper">
            {loadingTemplate && <div className="iframe-skeleton" />}
            <iframe
              src={`/boda/${userId}?plantilla=${selected}&preview=1`}
              className="iframe-preview"
              title="Vista previa de la plantilla"
            />
          </div>

          <p className="preview-helper-text">
            Haz scroll dentro de la vista previa.
          </p>
        </div>
      </div>

      {status && <p className={`status-msg ${status.type}`}>{status.text}</p>}

      <button className="btn-guardar" onClick={guardar} disabled={saving}>
        {saving ? "Guardando..." : "Guardar plantilla 💗"}
      </button>

      <div className="verweb-url-card laser-box">
        <div className="label">Tu enlace público</div>

        <div className="url-box">
          <input
            value={`https://tudominio.com/${user?.domain || ""}`}
            readOnly
          />
          <button
            className="btn-copy"
            onClick={() =>
              navigator.clipboard.writeText(
                `https://tudominio.com/${user?.domain || ""}`
              )
            }
          >
            Copiar
          </button>
        </div>

        <button
          className="btn-open"
          onClick={() =>
            window.open(`/${user?.domain || ""}`, "_blank")
          }
        >
          Abrir web
        </button>
      </div>
    </div>
  );
}

export default CambiarPlantilla;
