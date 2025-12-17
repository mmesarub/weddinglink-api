import "../styles/Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">

      <div className="dashboard-card">
        <h2>
          Hola, {user?.name} 💗
        </h2>
        <p className="dashboard-subtitle">
          Bienvenida a tu panel de WeddingLink
        </p>

        {/* GRID DE OPCIONES */}
        <div className="dashboard-grid">

          <Link to="/dashboard/configuracion" className="dash-box laser">
            <h3>Configuración de la Boda</h3>
            <p>Edita toda la información y ajustes principales</p>
          </Link>

<Link to="/dashboard/cambiar-plantilla" className="dash-box laser">
  <h3>Cambiar Plantilla</h3>
  <p>Elige una plantilla y visualízala en tiempo real</p>
</Link>



<Link to="/dashboard/album" className="dash-box laser">
    <h3>Álbum de Invitados</h3>
    <p>Fotos subidas por tus invitados</p>
</Link>


          <Link to="/generador" className="dash-box laser">
            <h3>Generar Web / APK</h3>
            <p>Exporta la versión final de tu web</p>
          </Link>

<Link to="/dashboard/gestion-invitados" className="dash-box laser">
  <h3>Gestión de Invitados</h3>
  <p>RSVP, invitaciones, asistencia y códigos</p>
</Link>


        </div>

        {/* CERRAR SESIÓN */}
        <button className="logout-btn" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
