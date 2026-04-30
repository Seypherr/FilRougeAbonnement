import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (payload) => {
        const data = await apiRequest("/auth/login", { method: "POST", body: payload });
        setUser(data.user);
      },
      register: async (payload) => {
        const data = await apiRequest("/auth/register", { method: "POST", body: payload });
        setUser(data.user);
      },
      logout: async () => {
        await apiRequest("/auth/logout", { method: "POST" });
        setUser(null);
      },
      refreshUser: async () => {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
