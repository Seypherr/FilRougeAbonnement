import { EyeOff, Languages, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button.jsx";
import { FormField } from "../components/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export function AuthPage({ t, language, setLanguage }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <main className="min-h-screen bg-[#F6F7FB] px-4 py-8 text-slate-950">
      <div className="mx-auto grid max-w-md gap-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-violet-600">{t.appName}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{mode === "login" ? "Welcome back" : t.createAccount}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">React + Express + Prisma</p>
          </div>
          <Button variant="secondary" className="px-3" onClick={() => setLanguage(language === "fr" ? "en" : "fr")}>
            <Languages size={16} />
            {language.toUpperCase()}
          </Button>
        </header>

        <section className="rounded-[2rem] bg-white p-5 shadow-xl shadow-slate-200/70">
          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button className={`rounded-xl py-3 text-sm font-black ${mode === "login" ? "bg-white shadow-sm" : "text-slate-500"}`} onClick={() => setMode("login")}>
              {t.login}
            </button>
            <button className={`rounded-xl py-3 text-sm font-black ${mode === "register" ? "bg-white shadow-sm" : "text-slate-500"}`} onClick={() => setMode("register")}>
              {t.register}
            </button>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            {mode === "register" && (
              <FormField label={t.name}>
                <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </FormField>
            )}
            <FormField label={t.email}>
              <div className="input-shell">
                <Mail size={18} />
                <input className="input-plain" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              </div>
            </FormField>
            <FormField label={t.password}>
              <div className="input-shell">
                <Lock size={18} />
                <input className="input-plain" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
                <EyeOff size={18} className="ml-auto text-slate-400" />
              </div>
            </FormField>
            {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{t.error}: {error}</p>}
            <Button className="min-h-14 rounded-2xl" disabled={loading}>{mode === "login" ? t.login : t.createAccount}</Button>
          </form>
        </section>
      </div>
    </main>
  );
}
