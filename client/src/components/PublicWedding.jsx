import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import GuestAlbum from "./GuestAlbum";
import RSVPForm from "./RSVP";

/* =========================
   IMPORTAR PLANTILLAS
========================= */
import "../styles/plantillas/Plantilla1.css";
import "../styles/plantillas/Plantilla2.css";
import "../styles/plantillas/Plantilla3.css";
import "../styles/plantillas/Plantilla4.css";

function PublicWedding() {
  const { id, domain } = useParams();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     CARGA DE DATOS
     /boda/:id      → preview / acceso directo
     /:domain       → web pública real
  ========================= */
  useEffect(() => {
    async function fetchWedding() {
      try {
        let res;

        if (id) {
          res = await axios.get(
            `http://localhost:3001/user/info/${id}`
          );
        } else if (domain) {
          res = await axios.get(
            `http://localhost:3001/public/${domain}`
          );
        } else {
          throw new Error("No hay id ni domain");
        }

        setData(res.data);
      } catch (err) {
        console.error("Error cargando boda:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchWedding();
  }, [id, domain]);

  /* =========================
     PROTECCIÓN DE RENDER
  ========================= */
  if (loading) {
    return <div className="loading">Cargando…</div>;
  }

  if (!data) {
    return <div className="error">No se encontró esta boda</div>;
  }

  /* =========================
     PLANTILLA
  ========================= */
  const plantillaPreview = searchParams.get("plantilla");
  const plantillaFinal =
    plantillaPreview || data?.selected_template || "plantilla1";

  return (
    <div className={`public-wedding ${plantillaFinal}`}>
      {/* =========================
          PORTADA
      ========================= */}
      <header
        className="pw-cover"
        style={{
          backgroundImage: `url(${data.cover_photo || data.profile_photo || ""})`,
        }}
      >
        <div className="pw-overlay">
          <h1 className="pw-names">
            {data.bride_name} & {data.groom_name}
          </h1>
          <p className="pw-date">
            {data.wedding_date
              ? new Date(data.wedding_date).toLocaleDateString("es-ES")
              : ""}{" "}
            {data.wedding_time && `· ${data.wedding_time}`}
          </p>
        </div>
      </header>

      {/* =========================
          HISTORIA
      ========================= */}
      {data.story_title && (
        <section className="pw-section pw-history">
          <h2>{data.story_title}</h2>
          <p>{data.story_description}</p>
        </section>
      )}

      {/* =========================
          PROGRAMA
      ========================= */}
      {data.program_json?.length > 0 && (
        <section className="pw-section pw-program">
          <h2>Programa</h2>
          <ul>
            {data.program_json.map((item, i) => (
              <li key={i}>
                <span className="pw-time">{item.time}</span>
                <span>{item.activity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* =========================
          ALOJAMIENTO
      ========================= */}
      {data.lodging_json?.length > 0 && (
        <section className="pw-section pw-lodging">
          <h2>Alojamiento</h2>
          {data.lodging_json.map((h, i) => (
            <div className="pw-card" key={i}>
              <h3>{h.hotel}</h3>
              <p>{h.address}</p>
              {h.price && <p className="pw-price">{h.price}</p>}
            </div>
          ))}
        </section>
      )}

      {/* =========================
          REGALOS
      ========================= */}
      {data.gift_list_json?.length > 0 && (
        <section className="pw-section pw-gifts">
          <h2>Lista de regalos</h2>
          {data.gift_list_json.map((g, i) => (
            <div className="pw-card gift" key={i}>
              <h3>{g.name}</h3>
              {g.price && <p>Precio: {g.price}</p>}
              {g.link && (
                <a href={g.link} target="_blank" rel="noreferrer">
                  Ver regalo
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* =========================
          REDES SOCIALES
      ========================= */}
      {(data.instagram || data.tiktok) && (
        <section className="pw-section pw-social">
          <h2>Redes sociales</h2>
          <div className="pw-social-icons">
            {data.instagram && (
              <a
                href={`https://instagram.com/${data.instagram}`}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}
            {data.tiktok && (
              <a
                href={`https://tiktok.com/@${data.tiktok}`}
                target="_blank"
                rel="noreferrer"
              >
                TikTok
              </a>
            )}
          </div>
        </section>
      )}

      {/* =========================
          HASHTAGS
      ========================= */}
      {data.hashtags_json?.length > 0 && (
        <section className="pw-section pw-hashtags">
          <h2>Hashtags</h2>
          <div className="pw-hashtag-list">
            {data.hashtags_json.map((h, i) => (
              <span key={i}>#{h}</span>
            ))}
          </div>
        </section>
      )}

      {/* =========================
          GALERÍA
      ========================= */}
      {data.photos_json?.length > 0 && (
        <section className="pw-section pw-gallery">
          <h2>Galería</h2>
          <div className="pw-gallery-grid">
            {data.photos_json.map((p, i) => (
              <img key={i} src={p} alt="foto boda" />
            ))}
          </div>
          {/* =========================
    ÁLBUM DE INVITADOS (SUBIDA DE FOTOS)
========================= */}
<GuestAlbum
  enabled={data.guest_upload_enabled}
  message={data.guest_upload_message}
/>

        </section>
      )}

      {/* =========================
          RSVP
      ========================= */}
{/* =========================
    RSVP
========================= */}
{(data.rsvp_message || data.rsvp_email) && (
  <section className="pw-section pw-rsvp">
    <RSVPForm
      userId={data.id}
      guestsJson={data.guests_json}
      menuOptionsJson={data.menu_options_json}   
      title="Confirmación de asistencia"
      message={data.rsvp_message}
    />
  </section>
)}


      {/* =========================
          MAPA
      ========================= */}
      {(data.venue_name || data.maps_link) && (
        <section className="pw-section pw-map">
          <h2>Lugar de la boda</h2>
          <p>{data.venue_name}</p>
          <p>{data.venue_address}</p>
          {data.maps_link && (
            <a
              className="pw-map-btn"
              href={data.maps_link}
              target="_blank"
              rel="noreferrer"
            >
              Ver ubicación
            </a>
          )}
        </section>
      )}
    </div>
  );
}

export default PublicWedding;
