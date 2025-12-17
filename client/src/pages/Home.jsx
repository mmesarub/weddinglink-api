import "../styles/Home.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import hero from "../assets/hero.jpg";

import p1 from "../assets/p1.png";
import p2 from "../assets/p2.png";
import p3 from "../assets/p3.png";
import p4 from "../assets/p4.png";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) navigate("/dashboard/cambiar-plantilla");
    else navigate("/register");
  };

  const [active, setActive] = useState(0);

  const templates = [
    { img: p1, name: "Romántica floral" },
    { img: p2, name: "Editorial minimal" },
    { img: p3, name: "Moderna glass" },
    { img: p4, name: "Boho natural" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % templates.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [templates.length]);

  return (
    <div className="landing">

      {/* HERO */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${hero})` }}
      >
        <h1>Crea la web perfecta para tu boda</h1>
        <p>Diseños elegantes, personalizables y listos para compartir.</p>

        <button className="btn-primary" onClick={handleStart}>
          Comenzar ahora
        </button>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="steps">
        <h2>¿Cómo funciona?</h2>

        <div className="step-list">
          <div className="step">
            <h3>Elige una plantilla</h3>
            <p>Diseños modernos y elegantes listos para usar.</p>
          </div>

          <div className="step">
            <h3>Personaliza</h3>
            <p>Edita textos, fotos, menús y detalles.</p>
          </div>

          <div className="step">
            <h3>Publica y comparte</h3>
            <p>Obtén tu enlace personalizado para tus invitados.</p>
          </div>
        </div>
      </section>

      {/* SLIDER */}
      <section className="templates">
        <h2>Plantillas disponibles</h2>

        <div className="template-list">
          {templates.map((tpl, i) => (
            <div
              key={i}
              className={`template-card ${i === active ? "active" : ""}`}
              onClick={() => navigate("/dashboard/cambiar-plantilla")}
            >
              <img src={tpl.img} alt={tpl.name} />
              <h3>{tpl.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta">
        <h2>¿Preparado para crear tu web de boda?</h2>
        <button className="btn-primary" onClick={handleStart}>
          Crear mi web
        </button>
      </section>

      <footer>
        © {new Date().getFullYear()} Wedding Creator — Todos los derechos reservados.
      </footer>

    </div>
  );
}

export default Home;

