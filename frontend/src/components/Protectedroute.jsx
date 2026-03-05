import { useAuth } from "../context/AuthContext";
import AuthPage from "../pages/Authpage";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0a0f1e",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{
            width: 40, height: 40, border: "2px solid rgba(99,102,241,0.3)",
            borderTopColor: "#6366f1", borderRadius: "50%",
            animation: "spin 0.7s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Loading…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return children;
}