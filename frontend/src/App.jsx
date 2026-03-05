import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/Protectedroute";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Properties from "./pages/Properties";
import Analytics from "./pages/Analytics";

function UserMenu() {
  const { user, logout } = useAuth();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
        alt={user?.name}
        style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(99,102,241,0.4)" }}
      />
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{user?.name}</span>
      <button
        onClick={logout}
        style={{
          padding: "6px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.25)", color: "#f87171",
          fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.target.style.background = "rgba(239,68,68,0.2)"; }}
        onMouseLeave={(e) => { e.target.style.background = "rgba(239,68,68,0.1)"; }}
      >
        Sign out
      </button>
    </div>
  );
}

function Layout({ children }) {
  const navStyle = ({ isActive }) => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
    textDecoration: "none", transition: "all 0.2s",
    color: isActive ? "#f1f5f9" : "#64748b",
    background: isActive ? "rgba(99,102,241,0.2)" : "transparent",
    border: `1px solid ${isActive ? "rgba(99,102,241,0.4)" : "transparent"}`,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,15,30,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "0 24px", display: "flex", alignItems: "center", height: 60, gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 24 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(99,102,241,0.4)",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="16" height="16">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>PropPredict</span>
        </div>
        <NavLink to="/dashboard" style={navStyle}>Dashboard</NavLink>
        <NavLink to="/predict" style={navStyle}>Predict</NavLink>
        <NavLink to="/properties" style={navStyle}>Properties</NavLink>
        <NavLink to="/analytics" style={navStyle}>Analytics</NavLink>
        <div style={{ marginLeft: "auto" }}><UserMenu /></div>
      </nav>
      <main>{children}</main>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      } />
      <Route path="/predict" element={
        <ProtectedRoute><Layout><Predict /></Layout></ProtectedRoute>
      } />
      <Route path="/properties" element={
        <ProtectedRoute><Layout><Properties /></Layout></ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}