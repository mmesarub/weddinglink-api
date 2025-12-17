import "../styles/Auth.css";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/login", {
        email,
        password,
      });

      login(res.data.user);
      navigate("/dashboard");

    } catch (err) {
      setMsg(err.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="auth-container">
      {/* 👇 aquí añado laser-box */}
      <div className="auth-card laser-box">

        <h2>Iniciar sesión</h2>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input 
            type="email" 
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Contraseña</label>
          <input 
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn-primary full">Entrar</button>
        </form>

        {msg && <p className="auth-message">{msg}</p>}

        <p className="auth-switch">
          ¿No tienes una cuenta?
          <Link to="/register"> Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

