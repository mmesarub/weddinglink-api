import { useState } from "react";
import axios from "axios";
import "../styles/GuestAlbum.css";

function GuestAlbum({ enabled, message }) {
  const [code, setCode] = useState("");
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!enabled) return null;

  const submit = async () => {
    if (!code || !photo) {
      setStatus("Introduce el código y selecciona una foto");
      return;
    }

    const formData = new FormData();
    formData.append("code", code);
    formData.append("photo", photo);

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:3001/public/upload-photo",
        formData
      );
      setStatus("¡Foto subida con éxito! 💗");
      setPhoto(null);
    } catch {
      setStatus("Código incorrecto o error al subir");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="guest-album">
      <h2>Comparte tus fotos 📸</h2>
      {message && <p className="guest-message">{message}</p>}

      <input
        placeholder="Código de invitados"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setPhoto(e.target.files[0])}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Subiendo..." : "Subir foto"}
      </button>

      {status && <p className="status">{status}</p>}
    </section>
  );
}

export default GuestAlbum;
