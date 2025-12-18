import "../styles/Auth.css";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [msg, setMsg] = useState("");
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [domain, setDomain] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMsg("Las contraseñas no coinciden ❌");
      return;
    }

    if (!accepted) {
      setMsg("Debes aceptar los términos y condiciones 💗");
      return;
    }

    try {
      const res = await api.post("/register", {
        name,
        email,
        password,
        bride_name: brideName,
        groom_name: groomName,
        domain,
      });

      // Ahora sí: el backend devuelve "user"
      login(res.data.user);

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setMsg(err.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card laser-box">
        <h2>Crear cuenta</h2>

        <form onSubmit={handleRegister}>
          <label>Nombre</label>
          <input
            className="laser-input"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label>Nombre de la novia</label>
          <input
            className="laser-input"
            type="text"
            placeholder="Nombre de la novia"
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
          />

          <label>Nombre del novio</label>
          <input
            className="laser-input"
            type="text"
            placeholder="Nombre del novio"
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
          />

          <label>Nombre de tu web (subdominio)</label>
          <input
            className="laser-input"
            type="text"
            placeholder="ej: monicaycarlos"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase())}
          />
          <small className="domain-helper">
            Tu web será: https://{domain || "tus-nombres"}.weddinglink.com
          </small>

          <label>Email</label>
          <input
            className="laser-input"
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Contraseña</label>
          <input
            className="laser-input"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Repetir contraseña</label>
          <input
            className="laser-input"
            type="password"
            placeholder="********"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
            />
            <span>
              Acepto los <a href="#">términos y condiciones</a>
            </span>
          </div>

          <button className="btn-primary full">Crear cuenta</button>
        </form>

        {msg && <p className="auth-message">{msg}</p>}

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
