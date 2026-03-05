import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API = "http://localhost:5010/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("hp_token"));
  const [loading, setLoading] = useState(true);

  const authFetch = useCallback(
    async (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
          ...(options.headers || {}),
        },
      });
    },
    [token]
  );

  // Verify token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authFetch(`${API}/auth/me`)
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
        else { localStorage.removeItem("hp_token"); setToken(null); }
      })
      .catch(() => { localStorage.removeItem("hp_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []);  // eslint-disable-line

  const signup = async (name, email, password) => {
    const r = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Signup failed");
    localStorage.setItem("hp_token", d.token);
    setToken(d.token);
    setUser(d.user);
    return d;
  };

  const login = async (email, password) => {
    const r = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Login failed");
    localStorage.setItem("hp_token", d.token);
    setToken(d.token);
    setUser(d.user);
    return d;
  };

  const logout = async () => {
    try {
      await authFetch(`${API}/auth/logout`, { method: "POST" });
    } catch (_) {}
    localStorage.removeItem("hp_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, authFetch, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};