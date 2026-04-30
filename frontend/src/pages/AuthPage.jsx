import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function AuthPage({ t, language, setLanguage }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailInvalid = form.email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-[#EEF0F4] p-4 text-[#1B1D28]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <section className="relative mx-auto flex min-h-[calc(100vh-32px)] w-full max-w-md flex-1 flex-col overflow-hidden rounded-[40px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
        <header className="flex shrink-0 items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#7047EB] text-white shadow-[0_4px_16px_rgba(112,71,235,0.3)]">
              <i className="ph-fill ph-squares-four text-xl" />
            </div>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#F4F1FF] px-3 py-1.5 text-sm font-semibold text-[#7047EB] transition-colors hover:bg-[#EAE5FF] hover:text-[#5E35D9]"
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          >
            <i className="ph ph-globe text-base" />
            <span>{language.toUpperCase()}</span>
            <i className="ph ph-caret-down ml-0.5 text-xs" />
          </button>
        </header>

        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#1B1D28]">
              {mode === "login" ? "Welcome back! 👋" : t.createAccount}
            </h1>
            <p className="text-sm font-medium text-[#8E95A9]">Enter your credentials to access your dashboard.</p>
          </div>

          <div className="mb-8 flex shrink-0 rounded-full border border-[#EAECEF] bg-[#F8F9FB] p-1.5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full py-2.5 text-sm transition-all ${mode === "login" ? "bg-white font-bold text-[#1B1D28] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]" : "font-medium text-[#8E95A9] hover:text-[#1B1D28]"}`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full py-2.5 text-sm transition-all ${mode === "register" ? "bg-white font-bold text-[#1B1D28] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]" : "font-medium text-[#8E95A9] hover:text-[#1B1D28]"}`}
            >
              Register
            </button>
          </div>

          <form className="flex flex-1 flex-col gap-5" onSubmit={submit}>
            {mode === "register" && (
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-[#1B1D28]">{t.name}</label>
                <input
                  className="block w-full rounded-full border-2 border-[#EAECEF] bg-[#F8F9FB] px-5 py-3.5 text-sm font-medium text-[#1B1D28] outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#7047EB]/20"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-[#1B1D28]">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <i className={`ph-fill ph-envelope-simple text-lg ${emailInvalid ? "text-[#FF3E5D]" : "text-[#8E95A9]"}`} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className={`block w-full rounded-full border-2 py-3.5 pl-11 pr-11 text-sm font-medium text-[#1B1D28] placeholder-[#8E95A9] outline-none transition-all ${emailInvalid ? "border-[#FF3E5D]/30 bg-[#FFF0F3] focus:border-[#FF3E5D] focus:ring-4 focus:ring-[#FF3E5D]/20" : "border-[#EAECEF] bg-[#F8F9FB] focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#7047EB]/20"}`}
                  placeholder="name@example.com"
                  required
                />
                {emailInvalid && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <i className="ph-fill ph-warning-circle text-lg text-[#FF3E5D]" />
                  </div>
                )}
              </div>
              {emailInvalid && <p className="ml-1 mt-2 text-sm font-medium text-[#FF3E5D]">Please enter a valid email format.</p>}
            </div>

            <div>
              <div className="mb-2 ml-1 flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#1B1D28]">Password</label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <i className="ph-fill ph-lock-key text-lg text-[#8E95A9]" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="block w-full rounded-full border-2 border-[#EAECEF] bg-[#F8F9FB] py-3.5 pl-11 pr-12 text-sm font-medium text-[#1B1D28] outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#7047EB]/20"
                  placeholder="Enter your password"
                  required
                  minLength={8}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[#8E95A9]">
                  <i className="ph-fill ph-eye-slash text-lg" />
                </div>
              </div>
            </div>

            {error && <p className="rounded-2xl bg-[#FFF0F3] p-3 text-sm font-semibold text-[#FF3E5D]">{error}</p>}

            <button
              type="submit"
              disabled={loading || emailInvalid}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#7047EB] py-4 font-bold text-white shadow-[0_8px_24px_-6px_rgba(112,71,235,0.4)] transition-all hover:bg-[#5E35D9] active:scale-[0.98] disabled:opacity-60"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
              <i className="ph-bold ph-arrow-right text-lg" />
            </button>

            <div className="my-3 flex items-center gap-4">
              <div className="h-[2px] flex-1 rounded-full bg-[#EAECEF]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#8E95A9]">Or</span>
              <div className="h-[2px] flex-1 rounded-full bg-[#EAECEF]" />
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2">
              <button type="button" disabled className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#EAECEF] bg-white py-3.5 text-sm font-bold text-[#1B1D28] shadow-sm opacity-70">
                <i className="ph-fill ph-google-logo text-xl" />
                Google
              </button>
              <button type="button" disabled className="flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#EAECEF] bg-white py-3.5 text-sm font-bold text-[#1B1D28] shadow-sm opacity-70">
                <i className="ph-fill ph-apple-logo text-xl" />
                Apple
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
