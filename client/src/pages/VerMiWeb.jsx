import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import "../styles/CambiarPlantilla.css";

function VerMiWeb() {
  const { user } = useAuth();
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    if (!user || !user.domain) return;

    const domain = user.domain;
    const isLocal = window.location.hostname.includes("localhost");

    if (isLocal) {
      // ✅ LOCAL: ruta dinámica
      setPublicUrl(`http://localhost:5173/${domain}`);
    } else {
      // ✅ PRODUCCIÓN: subdominio real
      setPublicUrl(`https://${domain}.weddinglink.com`);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="plantilla-container-preview">
        <h2 className="title">Ver mi Web 💍</h2>
        <p className="subtitle">Debes iniciar sesión para ver tu web.</p>
      </div>
    );
  }

  const copiar = () => {
    navigator.clipboard.writeText(publicUrl);
  };

  const abrir = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <div className="plantilla-container-preview">
      <h2 className="title">Ver mi Web 💍</h2>
      <p className="subtitle">
        Comparte el enlace con tus invitados y visualiza tu web pública.
      </p>

      {/* URL */}
      <div className="verweb-url-card laser-box" style={{ marginBottom: "30px" }}>
        <p className="plantilla-thumb-name">Tu enlace público</p>

        <div className="url-box">
          <input type="text" readOnly value={publicUrl} />
          <button className="btn-copy" onClick={copiar}>
            Copiar
          </button>
        </div>

        <button className="btn-open" onClick={abrir}>
          Abrir web
        </button>
      </div>

      {/* Vista previa */}
      <div className="vista-previa">
        <div className="vista-previa-header">
          <h3>Vista previa interactiva</h3>
        </div>

        <div className="iframe-wrapper">
          {publicUrl && (
            <iframe
              src={publicUrl}
              className="iframe-preview"
              title="Vista previa web pública"
            />
          )}
        </div>

        <p className="preview-helper-text">
          Desplázate dentro de la vista previa para ver toda la web.
        </p>
      </div>
    </div>
  );
}

export default VerMiWeb;
