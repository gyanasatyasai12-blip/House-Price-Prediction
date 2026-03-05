import { useState } from "react";
import { useAuth } from "../context/AuthContext";

/* ─── tiny icon helpers ─────────────────────────────── */
const Eye = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
    {off ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="20" height="20">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

/* ─── Field component ────────────────────────────────── */
function Field({ label, type = "text", value, onChange, placeholder, showToggle, onToggle, showPw, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94a3b8" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={showToggle ? (showPw ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "off"}
          style={{
            width: "100%",
            padding: showToggle ? "13px 44px 13px 16px" : "13px 16px",
            background: error ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 10,
            color: "#f1f5f9",
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.2s, background 0.2s",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "#6366f1";
            e.target.style.background = "rgba(99,102,241,0.06)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? "#ef4444" : "rgba(255,255,255,0.1)";
            e.target.style.background = error ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.04)";
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            style={{
              position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 2,
            }}
          >
            <Eye off={showPw} />
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: "#ef4444" }}>{error}</span>}
    </div>
  );
}

/* ─── Strength bar ───────────────────────────────────── */
function PasswordStrength({ pw }) {
  const checks = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)];
  const score = checks.filter(Boolean).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  if (!pw) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < score ? colors[score - 1] : "rgba(255,255,255,0.1)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : "#64748b" }}>
        {score > 0 ? labels[score - 1] : ""}
      </span>
    </div>
  );
}

/* ─── Main Auth Page ─────────────────────────────────── */
export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Field errors
  const [errs, setErrs] = useState({});

  const switchMode = (m) => {
    setAnimating(true);
    setTimeout(() => {
      setMode(m);
      setGlobalErr("");
      setSuccess("");
      setErrs({});
      setName(""); setEmail(""); setPassword(""); setConfirm("");
      setAnimating(false);
    }, 220);
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (mode === "signup" && password.length < 6) e.password = "At least 6 characters";
    if (mode === "signup" && password !== confirm) e.confirm = "Passwords don't match";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setGlobalErr("");
    setSuccess("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(name, email, password);
        setSuccess("Account created! Redirecting…");
      }
    } catch (err) {
      setGlobalErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "#0a0f1e",
    }}>
      {/* ── Left Panel ─────────────────────── */}
      <div style={{
        flex: 1,
        display: "none",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
      }}
        className="auth-left-panel"
      >
        {/* Grid pattern */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Glowing orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "30%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(20px)",
        }} />
        <div style={{
          position: "absolute", bottom: "25%", right: "20%", width: 300, height: 300,
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(15px)",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "flex-start", padding: "60px 64px", height: "100%",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 80 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}>
              <HomeIcon />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
              PropPredict
            </span>
          </div>

          <div style={{ maxWidth: 440 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
              AI-Powered Valuations
            </p>
            <h1 style={{
              fontSize: 52, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.1,
              letterSpacing: "-0.03em", marginBottom: 24,
            }}>
              Know Your Home's True Value
            </h1>
            <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.7, marginBottom: 56 }}>
              Machine learning models trained on thousands of properties give you accurate, instant price predictions you can trust.
            </p>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              {[["400+", "Properties"], ["94%", "Accuracy"], ["3", "ML Models"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ─────────────── */}
      <div style={{
        width: "100%",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        minHeight: "100vh",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 400,
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}>
          {/* Logo (mobile) */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(99,102,241,0.35)",
            }}>
              <HomeIcon />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>PropPredict</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
              {mode === "login"
                ? "Sign in to access your dashboard"
                : "Start predicting property prices today"}
            </p>
          </div>

          {/* Global error / success */}
          {globalErr && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)", marginBottom: 20,
              fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span> {globalErr}
            </div>
          )}
          {success && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.3)", marginBottom: 20,
              fontSize: 13, color: "#86efac", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>✓</span> {success}
            </div>
          )}

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }} onKeyDown={handleKey}>
            {mode === "signup" && (
              <Field label="Full Name" value={name} onChange={setName} placeholder="Jane Smith" error={errs.name} />
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" error={errs.email} />
            <div>
              <Field
                label="Password" value={password} onChange={setPassword}
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                showToggle showPw={showPw} onToggle={() => setShowPw(!showPw)} error={errs.password}
              />
              {mode === "signup" && <div style={{ marginTop: 8 }}><PasswordStrength pw={password} /></div>}
            </div>
            {mode === "signup" && (
              <Field
                label="Confirm Password" value={confirm} onChange={setConfirm}
                placeholder="Repeat password"
                showToggle showPw={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} error={errs.confirm}
              />
            )}

            {/* Forgot password */}
            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: -8 }}>
                <button style={{
                  background: "none", border: "none", color: "#6366f1",
                  fontSize: 13, cursor: "pointer", padding: 0,
                }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", borderRadius: 10, color: "#fff", fontWeight: 700,
                fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4, letterSpacing: "-0.01em",
                boxShadow: loading ? "none" : "0 0 20px rgba(99,102,241,0.35)",
                transition: "all 0.2s", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; }}
            >
              {loading
                ? (mode === "login" ? "Signing in…" : "Creating account…")
                : (mode === "login" ? "Sign in" : "Create account")}
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "28px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "#475569" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Switch mode */}
          <p style={{ textAlign: "center", fontSize: 14, color: "#64748b", margin: 0 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              style={{
                background: "none", border: "none", color: "#6366f1",
                fontWeight: 600, fontSize: 14, cursor: "pointer", padding: 0,
                fontFamily: "inherit",
              }}
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          {/* Terms */}
          {mode === "signup" && (
            <p style={{ textAlign: "center", fontSize: 11, color: "#334155", marginTop: 20, lineHeight: 1.6 }}>
              By creating an account, you agree to our{" "}
              <span style={{ color: "#6366f1" }}>Terms of Service</span> and{" "}
              <span style={{ color: "#6366f1" }}>Privacy Policy</span>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @media (min-width: 768px) {
          .auth-left-panel { display: flex !important; }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}