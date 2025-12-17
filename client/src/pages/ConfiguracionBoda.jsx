import "../styles/ConfiguracionBoda.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function ConfiguracionBoda() {
  const { user } = useAuth();
  const userId = user?.id;

  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);

  const [info, setInfo] = useState({
    // Datos generales
    bride_name: "",
    groom_name: "",
    phone: "",
    wedding_date: "",
    wedding_time: "",
    city: "",
    venue_name: "",
    venue_address: "",
    maps_link: "",

    // Historia
    story_title: "",
    story_description: "",

    // Redes
    instagram: "",
    tiktok: "",

      // 🔽 NUEVO — MENÚS
    menu_options_json: [],

    // Listas dinámicas
    program_json: [],
    lodging_json: [],
    gift_list_json: [],
    hashtags_json: [],

    // RSVP (configuración, NO invitados)
    rsvp_email: "",
    rsvp_message: "",

    // Fotos destacadas
    profile_photo: "",
    cover_photo: "",
    photos_json: [],

    // Acceso invitados (subida fotos)
    guest_upload_enabled: true,
    guest_upload_code: "",
    guest_upload_message: "",
  });

  const [previewProfile, setPreviewProfile] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  const [msg, setMsg] = useState({
    info: "",
    historia: "",
    programa: "",
    alojamiento: "",
    regalos: "",
    redes: "",
    hashtags: "",
    rsvp: "",
    acceso: "",
    fotos: "",
  });

  /* ===================== HELPERS ===================== */

  const parseJson = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  const setMessage = (section, text) => {
    setMsg((p) => ({ ...p, [section]: text }));
    if (text) {
      setTimeout(() => {
        setMsg((p) => ({ ...p, [section]: "" }));
      }, 3000);
    }
  };

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/user/info/${userId}`);
        const d = res.data || {};

        setInfo({
          // Datos generales
          bride_name: d.bride_name || "",
          groom_name: d.groom_name || "",
          phone: d.phone || "",
          wedding_date: d.wedding_date ? String(d.wedding_date).slice(0, 10) : "",
          wedding_time: d.wedding_time ? String(d.wedding_time).slice(0, 5) : "",
          city: d.city || "",
          venue_name: d.venue_name || "",
          venue_address: d.venue_address || "",
          maps_link: d.maps_link || "",

          // Historia
          story_title: d.story_title || "",
          story_description: d.story_description || "",

          // Redes
          instagram: d.instagram || "",
          tiktok: d.tiktok || "",

          // Listas dinámicas
          program_json: parseJson(d.program_json),
          lodging_json: parseJson(d.lodging_json),
          gift_list_json: parseJson(d.gift_list_json),
          hashtags_json: parseJson(d.hashtags_json),

  // 🔽 MENÚS
          menu_options_json: parseJson(d.menu_options_json),

          // RSVP (solo config)
          rsvp_email: d.rsvp_email || "",
          rsvp_message: d.rsvp_message || "",

          // Fotos
          profile_photo: d.profile_photo || "",
          cover_photo: d.cover_photo || "",
          photos_json: parseJson(d.photos_json),

          // Acceso invitados
          guest_upload_enabled: d.guest_upload_enabled ?? true,
          guest_upload_code: d.guest_upload_code || "",
          guest_upload_message: d.guest_upload_message || "",
        });

        setPreviewProfile(d.profile_photo || null);
        setPreviewCover(d.cover_photo || null);
      } catch (e) {
        console.error("Error cargando configuración:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  /* ===================== SAVE ===================== */

  const guardarSeccion = async (section) => {
    if (!userId) return;
    setSavingSection(section);

    let payload = {};

    switch (section) {
      case "info":
        payload = {
          bride_name: info.bride_name,
          groom_name: info.groom_name,
          phone: info.phone,
          wedding_date: info.wedding_date,
          wedding_time: info.wedding_time,
          city: info.city,
          venue_name: info.venue_name,
          venue_address: info.venue_address,
          maps_link: info.maps_link,
        };
        break;

      case "historia":
        payload = {
          story_title: info.story_title,
          story_description: info.story_description,
        };
        break;

      case "programa":
        payload = { program_json: info.program_json };
        break;

      case "alojamiento":
        payload = { lodging_json: info.lodging_json };
        break;

      case "regalos":
        payload = { gift_list_json: info.gift_list_json };
        break;

      case "redes":
        payload = {
          instagram: info.instagram,
          tiktok: info.tiktok,
        };
        break;

      case "hashtags":
        payload = { hashtags_json: info.hashtags_json };
        break;

       case "menus":
  payload = { menu_options_json: info.menu_options_json };
  break;

      case "rsvp":
        payload = {
          rsvp_email: info.rsvp_email,
          rsvp_message: info.rsvp_message,
        };
        break;

      case "acceso":
        payload = {
          guest_upload_enabled: info.guest_upload_enabled,
          guest_upload_code: info.guest_upload_code,
          guest_upload_message: info.guest_upload_message,
        };
        break;

      case "fotos":
        payload = {
          profile_photo: info.profile_photo,
          cover_photo: info.cover_photo,
          photos_json: info.photos_json,
        };
        break;

      default:
        break;
    }

    try {
      await axios.put(`http://localhost:3001/user/info/${userId}`, payload);
      setMessage(section, "Cambios guardados 💗");
    } catch (e) {
      console.error("Error guardando sección:", section, e);
      setMessage(section, "Error al guardar");
    } finally {
      setSavingSection(null);
    }
  };

  /* ===================== LIST HELPERS ===================== */

  // PROGRAMA
  const updateProgramItem = (index, field, value) => {
    const updated = [...(info.program_json || [])];
    updated[index] = { ...(updated[index] || {}), [field]: value };
    setInfo({ ...info, program_json: updated });
  };

  const addProgramItem = () => {
    setInfo({
      ...info,
      program_json: [...(info.program_json || []), { time: "", activity: "" }],
    });
  };

  const deleteProgramItem = (index) => {
    const updated = (info.program_json || []).filter((_, i) => i !== index);
    setInfo({ ...info, program_json: updated });
  };

  // ALOJAMIENTO
  const updateLodgingItem = (index, field, value) => {
    const updated = [...(info.lodging_json || [])];
    updated[index] = { ...(updated[index] || {}), [field]: value };
    setInfo({ ...info, lodging_json: updated });
  };

  const addLodgingItem = () => {
    setInfo({
      ...info,
      lodging_json: [
        ...(info.lodging_json || []),
        { hotel: "", address: "", price: "" },
      ],
    });
  };

  const deleteLodgingItem = (index) => {
    const updated = (info.lodging_json || []).filter((_, i) => i !== index);
    setInfo({ ...info, lodging_json: updated });
  };

  // REGALOS
  const updateGiftItem = (index, field, value) => {
    const updated = [...(info.gift_list_json || [])];
    updated[index] = { ...(updated[index] || {}), [field]: value };
    setInfo({ ...info, gift_list_json: updated });
  };

  const addGiftItem = () => {
    setInfo({
      ...info,
      gift_list_json: [
        ...(info.gift_list_json || []),
        { name: "", link: "", price: "" },
      ],
    });
  };

  const deleteGiftItem = (index) => {
    const updated = (info.gift_list_json || []).filter((_, i) => i !== index);
    setInfo({ ...info, gift_list_json: updated });
  };

  // HASHTAGS
  const updateHashtag = (index, value) => {
    const updated = [...(info.hashtags_json || [])];
    updated[index] = value;
    setInfo({ ...info, hashtags_json: updated });
  };

  const addHashtag = () => {
    setInfo({
      ...info,
      hashtags_json: [...(info.hashtags_json || []), ""],
    });
  };

  const deleteHashtag = (index) => {
    const updated = (info.hashtags_json || []).filter((_, i) => i !== index);
    setInfo({ ...info, hashtags_json: updated });
  };
/* ===================== MENÚS ===================== */

const addMenu = () => {
  setInfo((prev) => ({
    ...prev,
    menu_options_json: [
      ...(prev.menu_options_json || []),
      {
        id: crypto.randomUUID(),
        label: "",
      },
    ],
  }));
};

const updateMenu = (index, value) => {
  const updated = [...(info.menu_options_json || [])];
  updated[index] = { ...updated[index], label: value };
  setInfo({ ...info, menu_options_json: updated });
};

const deleteMenu = (index) => {
  const updated = (info.menu_options_json || []).filter(
    (_, i) => i !== index
  );
  setInfo({ ...info, menu_options_json: updated });
};

  /* ===================== UPLOAD PHOTOS ===================== */

  const uploadSinglePhoto = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await axios.post("http://localhost:3001/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.imageUrl;
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      const url = await uploadSinglePhoto(file);
      setPreviewProfile(URL.createObjectURL(file));
      setInfo((prev) => ({ ...prev, profile_photo: url }));

      await axios.put(`http://localhost:3001/user/info/${userId}`, {
        profile_photo: url,
      });

      setMessage("fotos", "Foto de perfil actualizada 💗");
    } catch (err) {
      console.error("Error subiendo foto perfil:", err);
      setMessage("fotos", "Error al subir foto de perfil");
    } finally {
      e.target.value = "";
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      const url = await uploadSinglePhoto(file);
      setPreviewCover(URL.createObjectURL(file));
      setInfo((prev) => ({ ...prev, cover_photo: url }));

      await axios.put(`http://localhost:3001/user/info/${userId}`, {
        cover_photo: url,
      });

      setMessage("fotos", "Foto de portada actualizada 💗");
    } catch (err) {
      console.error("Error subiendo portada:", err);
      setMessage("fotos", "Error al subir foto de portada");
    } finally {
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !userId) return;

    try {
      const uploadedUrls = [];
      for (const f of files) {
        const url = await uploadSinglePhoto(f);
        uploadedUrls.push(url);
      }

      const newPhotos = [...(info.photos_json || []), ...uploadedUrls];
      setInfo((prev) => ({ ...prev, photos_json: newPhotos }));

      await axios.put(`http://localhost:3001/user/info/${userId}`, {
        photos_json: newPhotos,
      });

      setMessage("fotos", "Galería actualizada 💗");
    } catch (err) {
      console.error("Error subiendo galería:", err);
      setMessage("fotos", "Error al subir fotos a la galería");
    } finally {
      e.target.value = "";
    }
  };

  const eliminarFotoGaleria = async (index) => {
    const updated = (info.photos_json || []).filter((_, i) => i !== index);
    setInfo((prev) => ({ ...prev, photos_json: updated }));

    try {
      await axios.put(`http://localhost:3001/user/info/${userId}`, {
        photos_json: updated,
      });
      setMessage("fotos", "Foto eliminada 💗");
    } catch (err) {
      console.error("Error eliminando foto:", err);
      setMessage("fotos", "Error al eliminar foto");
    }
  };

  /* ===================== RENDER ===================== */

  if (loading) {
    return <div className="config-container">Cargando configuración...</div>;
  }

  return (
    <div className="config-container">
      {/* SIDEBAR */}
      <aside className="config-sidebar">
        <div className="sidebar-header">
          <span>Configuración de la boda</span>
        </div>

        {/* FOTO PERFIL EN SIDEBAR */}
        <div className="sidebar-photo">
          <div className="photo-wrapper">
            {previewProfile || info.profile_photo ? (
              <img
                src={previewProfile || info.profile_photo}
                alt="Foto perfil"
                className="profile-photo"
              />
            ) : (
              <div className="photo-placeholder">
                <span>Sin foto</span>
              </div>
            )}
          </div>

          <label className="btn-foto">
            Cambiar foto
            <input type="file" accept="image/*" hidden onChange={handleProfileUpload} />
          </label>
        </div>

        <nav className="menu-tabs">
          <button
            className={`menu-item ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <span>Datos generales</span>
          </button>

          <button
            className={`menu-item ${activeTab === "historia" ? "active" : ""}`}
            onClick={() => setActiveTab("historia")}
          >
            <span>Historia</span>
          </button>

          <button
            className={`menu-item ${activeTab === "programa" ? "active" : ""}`}
            onClick={() => setActiveTab("programa")}
          >
            <span>Programa</span>
          </button>

          <button
            className={`menu-item ${activeTab === "alojamiento" ? "active" : ""}`}
            onClick={() => setActiveTab("alojamiento")}
          >
            <span>Alojamiento</span>
          </button>

          <button
            className={`menu-item ${activeTab === "regalos" ? "active" : ""}`}
            onClick={() => setActiveTab("regalos")}
          >
            <span>Regalos</span>
          </button>

          <button
            className={`menu-item ${activeTab === "redes" ? "active" : ""}`}
            onClick={() => setActiveTab("redes")}
          >
            <span>Redes sociales</span>
          </button>

          <button
            className={`menu-item ${activeTab === "hashtags" ? "active" : ""}`}
            onClick={() => setActiveTab("hashtags")}
          >
            <span>Hashtags</span>
          </button>

<button
  className={`menu-item ${activeTab === "menus" ? "active" : ""}`}
  onClick={() => setActiveTab("menus")}
>
  <span>Menús</span>
</button>


                    <button
            className={`menu-item ${activeTab === "rsvp" ? "active" : ""}`}
            onClick={() => setActiveTab("rsvp")}
          >
            <span>RSVP</span>
          </button>

          <button
            className={`menu-item ${activeTab === "acceso" ? "active" : ""}`}
            onClick={() => setActiveTab("acceso")}
          >
            <span>Acceso invitados</span>
          </button>

          <button
            className={`menu-item ${activeTab === "fotos" ? "active" : ""}`}
            onClick={() => setActiveTab("fotos")}
          >
            <span>Fotos</span>
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="config-main">
        {/* TAB 1 - DATOS GENERALES */}
        {activeTab === "info" && (
          <div className="config-card">
            <h2>Datos generales</h2>

            <div className="two-cols">
              <div>
                <label>Nombre 1</label>
                <input
                  value={info.bride_name}
                  onChange={(e) => setInfo({ ...info, bride_name: e.target.value })}
                />
              </div>

              <div>
                <label>Nombre 2</label>
                <input
                  value={info.groom_name}
                  onChange={(e) => setInfo({ ...info, groom_name: e.target.value })}
                />
              </div>
            </div>

            <label>Teléfono de contacto</label>
            <input
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            />

            <div className="two-cols">
              <div>
                <label>Fecha de la boda</label>
                <input
                  type="date"
                  value={info.wedding_date}
                  onChange={(e) => setInfo({ ...info, wedding_date: e.target.value })}
                />
              </div>

              <div>
                <label>Hora</label>
                <input
                  type="time"
                  value={info.wedding_time}
                  onChange={(e) => setInfo({ ...info, wedding_time: e.target.value })}
                />
              </div>
            </div>

            <div className="two-cols">
              <div>
                <label>Ciudad</label>
                <input
                  value={info.city}
                  onChange={(e) => setInfo({ ...info, city: e.target.value })}
                />
              </div>

              <div>
                <label>Lugar de la celebración</label>
                <input
                  value={info.venue_name}
                  onChange={(e) => setInfo({ ...info, venue_name: e.target.value })}
                />
              </div>
            </div>

            <label>Dirección del lugar</label>
            <input
              value={info.venue_address}
              onChange={(e) => setInfo({ ...info, venue_address: e.target.value })}
            />

            <label>Enlace a Google Maps</label>
            <input
              value={info.maps_link}
              onChange={(e) => setInfo({ ...info, maps_link: e.target.value })}
            />

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("info")}
              disabled={savingSection === "info"}
            >
              {savingSection === "info" ? "Guardando..." : "Guardar datos generales"}
            </button>

            {msg.info && <p className="save-msg">{msg.info}</p>}
          </div>
        )}

        {/* TAB 2 - HISTORIA */}
        {activeTab === "historia" && (
          <div className="config-card">
            <h2>Nuestra historia</h2>

            <label>Título</label>
            <input
              value={info.story_title}
              onChange={(e) => setInfo({ ...info, story_title: e.target.value })}
            />

            <label>Descripción</label>
            <textarea
              rows={8}
              value={info.story_description}
              onChange={(e) =>
                setInfo({
                  ...info,
                  story_description: e.target.value,
                })
              }
            />

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("historia")}
              disabled={savingSection === "historia"}
            >
              {savingSection === "historia" ? "Guardando..." : "Guardar historia"}
            </button>

            {msg.historia && <p className="save-msg">{msg.historia}</p>}
          </div>
        )}

        {/* TAB 3 - PROGRAMA */}
        {activeTab === "programa" && (
          <div className="config-card">
            <h2>Programa del día</h2>

            {(info.program_json || []).map((item, index) => (
              <div key={index} className="sub-card">
                <div className="two-cols">
                  <div>
                    <label>Hora</label>
                    <input
                      placeholder="17:00"
                      value={item.time || ""}
                      onChange={(e) => updateProgramItem(index, "time", e.target.value)}
                    />
                  </div>

                  <div>
                    <label>Actividad</label>
                    <input
                      placeholder="Ceremonia, cóctel..."
                      value={item.activity || ""}
                      onChange={(e) =>
                        updateProgramItem(index, "activity", e.target.value)
                      }
                    />
                  </div>
                </div>

                <button type="button" className="btn-delete" onClick={() => deleteProgramItem(index)}>
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addProgramItem}>
              ➕ Añadir bloque
            </button>

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("programa")}
              disabled={savingSection === "programa"}
            >
              {savingSection === "programa" ? "Guardando..." : "Guardar programa"}
            </button>

            {msg.programa && <p className="save-msg">{msg.programa}</p>}
          </div>
        )}

        {/* TAB 4 - ALOJAMIENTO */}
        {activeTab === "alojamiento" && (
          <div className="config-card">
            <h2>Alojamiento para invitados</h2>

            {(info.lodging_json || []).map((item, index) => (
              <div key={index} className="sub-card">
                <label>Hotel</label>
                <input
                  value={item.hotel || ""}
                  onChange={(e) => updateLodgingItem(index, "hotel", e.target.value)}
                />

                <label>Dirección</label>
                <input
                  value={item.address || ""}
                  onChange={(e) => updateLodgingItem(index, "address", e.target.value)}
                />

                <label>Precio aprox.</label>
                <input
                  placeholder="100€ / noche"
                  value={item.price || ""}
                  onChange={(e) => updateLodgingItem(index, "price", e.target.value)}
                />

                <button type="button" className="btn-delete" onClick={() => deleteLodgingItem(index)}>
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addLodgingItem}>
              ➕ Añadir alojamiento
            </button>

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("alojamiento")}
              disabled={savingSection === "alojamiento"}
            >
              {savingSection === "alojamiento" ? "Guardando..." : "Guardar alojamiento"}
            </button>

            {msg.alojamiento && <p className="save-msg">{msg.alojamiento}</p>}
          </div>
        )}

        {/* TAB 5 - REGALOS */}
        {activeTab === "regalos" && (
          <div className="config-card">
            <h2>Lista de regalos</h2>

            {(info.gift_list_json || []).map((item, index) => (
              <div key={index} className="sub-card">
                <label>Nombre del regalo</label>
                <input
                  value={item.name || ""}
                  onChange={(e) => updateGiftItem(index, "name", e.target.value)}
                />

                <label>Enlace</label>
                <input
                  placeholder="https://..."
                  value={item.link || ""}
                  onChange={(e) => updateGiftItem(index, "link", e.target.value)}
                />

                <label>Precio aprox.</label>
                <input
                  placeholder="150€"
                  value={item.price || ""}
                  onChange={(e) => updateGiftItem(index, "price", e.target.value)}
                />

                <button type="button" className="btn-delete" onClick={() => deleteGiftItem(index)}>
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addGiftItem}>
              ➕ Añadir regalo
            </button>

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("regalos")}
              disabled={savingSection === "regalos"}
            >
              {savingSection === "regalos" ? "Guardando..." : "Guardar lista de regalos"}
            </button>

            {msg.regalos && <p className="save-msg">{msg.regalos}</p>}
          </div>
        )}

        {/* TAB 6 - REDES */}
        {activeTab === "redes" && (
          <div className="config-card">
            <h2>Redes sociales</h2>

            <label>Instagram</label>
            <input
              placeholder="@usuario"
              value={info.instagram}
              onChange={(e) => setInfo({ ...info, instagram: e.target.value })}
            />

            <label>TikTok</label>
            <input
              placeholder="@usuario"
              value={info.tiktok}
              onChange={(e) => setInfo({ ...info, tiktok: e.target.value })}
            />

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("redes")}
              disabled={savingSection === "redes"}
            >
              {savingSection === "redes" ? "Guardando..." : "Guardar redes"}
            </button>

            {msg.redes && <p className="save-msg">{msg.redes}</p>}
          </div>
        )}

        {/* TAB 7 - HASHTAGS */}
        {activeTab === "hashtags" && (
          <div className="config-card">
            <h2>Hashtags</h2>

            {(info.hashtags_json || []).map((tag, index) => (
              <div key={index} className="sub-card">
                <label>Hashtag</label>
                <input
                  placeholder="#NuestraBodaPerfecta"
                  value={tag || ""}
                  onChange={(e) => updateHashtag(index, e.target.value)}
                />
                <button type="button" className="btn-delete" onClick={() => deleteHashtag(index)}>
                  Eliminar
                </button>
              </div>
            ))}

            <button type="button" className="btn-add" onClick={addHashtag}>
              ➕ Añadir hashtag
            </button>

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("hashtags")}
              disabled={savingSection === "hashtags"}
            >
              {savingSection === "hashtags" ? "Guardando..." : "Guardar hashtags"}
            </button>

            {msg.hashtags && <p className="save-msg">{msg.hashtags}</p>}
          </div>
        )}

        {/* TAB 8 - RSVP LIMPIO */}
        {activeTab === "rsvp" && (
          <div className="config-card">
            <h2>Formulario RSVP</h2>

            <label>Email de contacto</label>
            <input
              type="email"
              value={info.rsvp_email}
              onChange={(e) => setInfo({ ...info, rsvp_email: e.target.value })}
            />

            <label>Mensaje para los invitados</label>
            <textarea
              rows={5}
              value={info.rsvp_message}
              onChange={(e) => setInfo({ ...info, rsvp_message: e.target.value })}
            />

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("rsvp")}
              disabled={savingSection === "rsvp"}
            >
              {savingSection === "rsvp" ? "Guardando..." : "Guardar RSVP"}
            </button>

            {msg.rsvp && <p className="save-msg">{msg.rsvp}</p>}
          </div>
        )}

        {/* TAB 9 - ACCESO INVITADOS */}
        {activeTab === "acceso" && (
          <div className="config-card">
            <h2>Acceso de invitados</h2>

            <label>
              <input
                type="checkbox"
                checked={info.guest_upload_enabled}
                onChange={(e) =>
                  setInfo({ ...info, guest_upload_enabled: e.target.checked })
                }
              />{" "}
              Permitir subida de fotos por invitados
            </label>

            <label>Código de acceso</label>
            <input
              placeholder="BODA2025"
              value={info.guest_upload_code}
              onChange={(e) =>
                setInfo({
                  ...info,
                  guest_upload_code: e.target.value.toUpperCase(),
                })
              }
            />

            <label>Mensaje para invitados</label>
            <textarea
              rows={4}
              value={info.guest_upload_message}
              onChange={(e) =>
                setInfo({
                  ...info,
                  guest_upload_message: e.target.value,
                })
              }
            />

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("acceso")}
              disabled={savingSection === "acceso"}
            >
              {savingSection === "acceso" ? "Guardando..." : "Guardar acceso"}
            </button>

            {msg.acceso && <p className="save-msg">{msg.acceso}</p>}
          </div>
        )}

        {/* TAB 10 - FOTOS */}
        {activeTab === "fotos" && (
          <div className="config-card">
            <h2>Fotos</h2>

            {/* PORTADA */}
            <div className="sub-card">
              <h3>Foto de portada</h3>

              <div style={{ marginBottom: "12px" }}>
                {previewCover || info.cover_photo ? (
                  <img
                    src={previewCover || info.cover_photo}
                    alt="Portada"
                    style={{
                      width: "100%",
                      maxHeight: "220px",
                      objectFit: "cover",
                      borderRadius: "14px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      background: "rgba(0,0,0,0.04)",
                    }}
                  >
                    Sin portada
                  </div>
                )}
              </div>

              <label className="btn-secundario">
                Cambiar portada
                <input type="file" accept="image/*" hidden onChange={handleCoverUpload} />
              </label>
            </div>

            {/* GALERÍA DESTACADA */}
            <div className="sub-card" style={{ marginTop: "18px" }}>
              <h3>Galería destacada</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {(info.photos_json || []).map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`Foto ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                    />
                    <button
                      type="button"
                      className="btn-delete"
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                      }}
                      onClick={() => eliminarFotoGaleria(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <label className="btn-secundario" style={{ marginTop: "12px" }}>
                Añadir fotos
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  multiple
                  onChange={handleGalleryUpload}
                />
              </label>
            </div>

            <button
              type="button"
              className="btn-guardar"
              onClick={() => guardarSeccion("fotos")}
              disabled={savingSection === "fotos"}
              style={{ marginTop: "18px" }}
            >
              {savingSection === "fotos" ? "Guardando..." : "Guardar fotos"}
            </button>

            {msg.fotos && <p className="save-msg">{msg.fotos}</p>}
          </div>







        )}{activeTab === "menus" && (
          <div className="config-card">
            <h2>Menús disponibles</h2>
            <p>Estos menús aparecerán en el formulario RSVP.</p>

{(info.menu_options_json || []).map((m, i) => (
  <div key={m.id || i} className="sub-card">
                <label>Nombre del menú</label>
                <input
                  placeholder="Ej: Menú vegetariano"
                  value={m.label}
                  onChange={(e) => updateMenu(i, e.target.value)}
                />
                <button className="btn-delete" onClick={() => deleteMenu(i)}>
                  Eliminar
                </button>
              </div>
            ))}

            <button className="btn-add" onClick={addMenu}>
              ➕ Añadir menú
            </button>

            <button
              className="btn-guardar"
              onClick={() => guardarSeccion("menus")}
            >
              Guardar menús

            </button>

            {msg.menus && <p className="save-msg">{msg.menus}</p>}
          </div>
         )}
      </main>
    </div>
  );
}

export default ConfiguracionBoda;
