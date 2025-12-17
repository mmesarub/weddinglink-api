import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import logo from "../assets/logo-weddinglink.png";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">
          <img src={logo} alt="WeddingLink Logo" />
        </Link>
      </div>

      <ul className="nav-links">
        {!user ? (
          <>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/login">Iniciar sesión</Link></li>
            <li>
              <Link to="/register" className="nav-btn">
                Crear cuenta
              </Link>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>

            {/* 👉 AQUÍ ESTABA EL PROBLEMA */}
            <li>
              <Link to="/dashboard/cambiar-plantilla">
                Plantillas
              </Link>
            </li>

<li>
  <Link to={`/${user.domain}`}>
    Ver mi web
  </Link>
</li>

            <li>
              <button className="nav-link-btn" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

