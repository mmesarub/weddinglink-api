import { useMemo, useState } from "react";
import api from "../api";

/* =========================
   ALERGIAS FIJAS
========================= */
const ALLERGY_OPTIONS = [
  { value: "ninguna", label: "Ninguna" },
  { value: "gluten", label: "Gluten" },
  { value: "marisco", label: "Marisco" },
  { value: "lactosa", label: "Lactosa" },
  { value: "frutos_secos", label: "Frutos secos" },
  { value: "huevo", label: "Huevo" },
  { value: "pescado", label: "Pescado" },
  { value: "soja", label: "Soja" },
];

/* =========================
   HELPERS
========================= */
function parseJson(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function RSVPForm({
  userId,
  guestsJson,
  menuOptionsJson,
  title,
  message,
}) {
  const guests = useMemo(() => parseJson(guestsJson), [guestsJson]);
  const menuOptions = useMemo(
    () => parseJson(menuOptionsJson),
    [menuOptionsJson]
  );

  /* =========================
     STATE
  ========================= */
  const [step, setStep] = useState(1);

  const [code, setCode] = useState("");
  const [guest, setGuest] = useState(null);

  const [attending, setAttending] = useState(null);
  const [attendees, setAttendees] = useState(1);

  const [people, setPeople] = useState([]);
  const [currentPerson, setCurrentPerson] = useState(0);

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  /* =========================
     BUSCAR INVITADO
  ========================= */
  const findGuestByCode = () => {
    const c = code.trim().toUpperCase();
    if (!c) return null;

    return (
      guests.find(
        (g) =>
          String(g.code || "").toUpperCase() === c ||
          String(g.id || "").toUpperCase() === c
      ) || null
    );
  };

  const resetAll = () => {
    setStep(1);
    setCode("");
    setGuest(null);
    setAttending(null);
    setAttendees(1);
    setPeople([]);
    setCurrentPerson(0);
    setNotes("");
    setStatus(null);
  };

  /* =========================
     STEP 1 — VALIDAR CÓDIGO
  ========================= */
  const onValidateCode = () => {
    setStatus(null);
    const found = findGuestByCode();

    if (!found) {
      setStatus({ type: "error", text: "Código no válido." });
      return;
    }

    setGuest(found);
    setStep(2);
  };

  /* =========================
     STEP 2 — ASISTENCIA
  ========================= */
  const onAttendingSelect = (value) => {
    setAttending(value);
    if (!value) {
      setStep(6);
    } else {
      setStep(3);
    }
  };

  /* =========================
     STEP 3 — Nº PERSONAS
  ========================= */
  const onAttendeesContinue = () => {
    const n = Number(attendees);

    if (!Number.isInteger(n) || n < 1 || n > 20) {
      setStatus({
        type: "error",
        text: "Número de personas no válido (1–20).",
      });
      return;
    }

    const initialPeople = Array.from({ length: n }).map(() => ({
      menu: "",
      allergy: "ninguna",
    }));

    setPeople(initialPeople);
    setCurrentPerson(0);
    setStep(4);
  };

  /* =========================
     PERSONA ACTUAL
  ========================= */
  const updateCurrentPerson = (data) => {
    setPeople((prev) =>
      prev.map((p, i) => (i === currentPerson ? { ...p, ...data } : p))
    );
  };

  const nextPerson = () => {
    if (!people[currentPerson].menu) {
      setStatus({
        type: "error",
        text: "Selecciona un menú antes de continuar.",
      });
      return;
    }

    setStatus(null);

    if (currentPerson < people.length - 1) {
      setCurrentPerson((p) => p + 1);
    } else {
      setStep(5);
    }
  };

  /* =========================
     ENVÍO FINAL
  ========================= */
  const onSubmit = async () => {
    setSaving(true);
    setStatus(null);

    try {
      await api.post(`/public/rsvp/${userId}`, {

        code,
        attending,
        attendees,
        people,
        notes,
      });

      setStatus({
        type: "success",
        text: "¡Gracias! Tu confirmación se ha guardado correctamente.",
      });
      setStep(6);
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: "No se pudo guardar la confirmación.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <section className="pw-section pw-rsvp">
      <h2>{title || "Confirmación de asistencia"}</h2>
      {message && <p>{message}</p>}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="pw-rsvp-card">
          <label>Código de invitado</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: INV-001"
          />
          <button onClick={onValidateCode}>Continuar</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && guest && (
        <div className="pw-rsvp-card">
          <p>
            Hola, <strong>{guest.name}</strong>
          </p>
          <label>¿Asistiréis a la boda?</label>
          <div className="pw-row">
            <button onClick={() => onAttendingSelect(true)}>Sí</button>
            <button onClick={() => onAttendingSelect(false)}>No</button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="pw-rsvp-card">
          <label>Número de personas</label>
          <input
            type="number"
            min="1"
            max="20"
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
          <button onClick={onAttendeesContinue}>Continuar</button>
        </div>
      )}

      {/* STEP 4 — PERSONAS */}
      {step === 4 && (
        <div className="pw-rsvp-card">
          <h3>
            Persona {currentPerson + 1} de {people.length}
          </h3>

          <label>Menú</label>
          <select
            value={people[currentPerson].menu}
            onChange={(e) => updateCurrentPerson({ menu: e.target.value })}
          >
            <option value="">Selecciona menú</option>
            {menuOptions.map((m) => (
              <option key={m.id} value={m.label}>
                {m.label}
              </option>
            ))}
          </select>

          <label>Alergias</label>
          <select
            value={people[currentPerson].allergy}
            onChange={(e) => updateCurrentPerson({ allergy: e.target.value })}
          >
            {ALLERGY_OPTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          <button onClick={nextPerson}>
            {currentPerson < people.length - 1
              ? "Siguiente persona"
              : "Continuar"}
          </button>
        </div>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <div className="pw-rsvp-card">
          <label>Notas adicionales (opcional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button onClick={onSubmit} disabled={saving}>
            {saving ? "Guardando..." : "Confirmar asistencia"}
          </button>
        </div>
      )}

      {/* STEP 6 */}
      {step === 6 && (
        <div className="pw-rsvp-card">
          <p className="pw-success">
            {status?.text || "Gracias por avisar 💗"}
          </p>
          <button onClick={resetAll}>Confirmar otro código</button>
        </div>
      )}

      {status?.type === "error" && <p className="pw-error">{status.text}</p>}
    </section>
  );
}
