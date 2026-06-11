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
      forgotPassword: async (payload) => {
        await apiRequest("/auth/forgot-password", { method: "POST", body: payload });
      },
      resetPassword: async (payload) => {
        await apiRequest("/auth/reset-password", { method: "POST", body: payload });
      },
      verifyEmail: async (payload) => {
        const data = await apiRequest("/auth/verify-email", { method: "POST", body: payload });
        setUser(data.user);
        return data.user;
      },
      resendVerification: async () => {
        await apiRequest("/auth/resend-verification", { method: "POST" });
      },
      logout: async () => {
        await apiRequest("/auth/logout", { method: "POST" });
        setUser(null);
      },
      updateProfile: async (payload) => {
        const data = await apiRequest("/auth/me", { method: "PUT", body: payload });
        setUser(data.user);
        return data.user;
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
