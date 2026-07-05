import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
  };

  const register = async (formData) => {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);