import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Públicas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Terminos from "./pages/Terminos";

// Dashboard
import Dashboard from "./pages/Dashboard";
import ConfiguracionBoda from "./pages/ConfiguracionBoda";
import CambiarPlantilla from "./pages/CambiarPlantilla";
import GestionInvitados from "./pages/GestionInvitados";
import AlbumInvitados from "./pages/AlbumInvitados";

// Web pública
import PublicWedding from "./components/PublicWedding";

function AppContent() {
  const location = useLocation();

  // Ocultar navbar en web pública y preview
  const hideNavbar =
    location.pathname.startsWith("/boda") ||
    (
      !location.pathname.startsWith("/dashboard") &&
      !["/", "/login", "/register", "/terminos"].includes(location.pathname)
    );

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terminos" element={<Terminos />} />

        {/* Preview */}
        <Route path="/boda/:id" element={<PublicWedding />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/configuracion"
          element={<ProtectedRoute><ConfiguracionBoda /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/cambiar-plantilla"
          element={<ProtectedRoute><CambiarPlantilla /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/gestion-invitados"
          element={<ProtectedRoute><GestionInvitados /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/album"
          element={<ProtectedRoute><AlbumInvitados /></ProtectedRoute>}
        />

        {/* ⚠️ SIEMPRE LA ÚLTIMA */}
        <Route path="/:domain" element={<PublicWedding />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
