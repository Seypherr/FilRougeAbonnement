import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, uploadAvatarFile } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationDelivery, setVerificationDelivery] = useState(null);

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
        setVerificationDelivery({
          emailDeliveryConfigured: data.emailDeliveryConfigured !== false,
          verificationUrl: data.verificationUrl ?? ""
        });
        return data;
      },
      forgotPassword: async (payload) => {
        return apiRequest("/auth/forgot-password", { method: "POST", body: payload });
      },
      resetPassword: async (payload) => {
        return apiRequest("/auth/reset-password", { method: "POST", body: payload });
      },
      verifyEmail: async (payload) => {
        const data = await apiRequest("/auth/verify-email", { method: "POST", body: payload });
        setUser(data.user);
        setVerificationDelivery(null);
        return data.user;
      },
      resendVerification: async () => {
        const data = await apiRequest("/auth/resend-verification", { method: "POST" });
        setVerificationDelivery({
          emailDeliveryConfigured: data.emailDeliveryConfigured !== false,
          verificationUrl: data.verificationUrl ?? ""
        });
        return data;
      },
      logout: async () => {
        await apiRequest("/auth/logout", { method: "POST" });
        setUser(null);
        setVerificationDelivery(null);
      },
      updateProfile: async (payload) => {
        const data = await apiRequest("/auth/me", { method: "PUT", body: payload });
        setUser(data.user);
        return data.user;
      },
      uploadAvatar: async (file) => {
        const data = await uploadAvatarFile(file);
        setUser(data.user);
        return data.user;
      },
      completeOnboarding: async (payload) => {
        const data = await apiRequest("/auth/onboarding/complete", { method: "POST", body: payload });
        setUser(data.user);
        return data.user;
      },
      exportData: async () => apiRequest("/auth/me/export"),
      refreshUser: async () => {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
      },
      verificationDelivery
    }),
    [user, loading, verificationDelivery]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
