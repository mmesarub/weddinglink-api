import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AlbumInvitados.css";

function AlbumInvitados() {
  const [photos, setPhotos] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:3001/user/info/${userId}`)
      .then((res) => {
        setPhotos(res.data.photos_json || []);
      })
      .catch((err) => {
        console.error("Error cargando álbum:", err);
      });
  }, [userId]);

  const eliminarFoto = async (photoUrl) => {
    const nuevasFotos = photos.filter((p) => p !== photoUrl);

    try {
      await axios.put(`http://localhost:3001/user/info/${userId}`, {
        photos_json: nuevasFotos,
      });
      setPhotos(nuevasFotos);
    } catch (err) {
      console.error("Error eliminando foto:", err);
    }
  };

  return (
    <div className="album-dashboard">
      <h2>Álbum de invitados</h2>

      {photos.length === 0 ? (
        <p className="empty-album">
          Aún no hay fotos subidas por los invitados.
        </p>
      ) : (
        <div className="album-grid">
          {photos.map((photo, i) => (
            <div key={i} className="album-card laser">
              <img src={photo} alt="Foto invitado" />

              <button
                className="delete-btn"
                onClick={() => eliminarFoto(photo)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlbumInvitados;

