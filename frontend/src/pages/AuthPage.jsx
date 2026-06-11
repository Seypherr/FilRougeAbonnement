import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

function isStrictEmail(value) {
  const email = value.trim().toLowerCase();
  if (email.length > 254 || email.includes("..")) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const domain = email.split("@")[1] ?? "";
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);
}

export function AuthPage({ t, language, setLanguage }) {
  const { forgotPassword, login, register, resetPassword, verifyEmail } = useAuth();
  const [mode, setMode] = useState(() => {
    const path = window.location.pathname;
    if (path.includes("reset-password")) return "reset";
    if (path.includes("verify-email")) return "verify";
    return "login";
  });
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [questionnaire, setQuestionnaire] = useState({
    currency: "EUR",
    discoverySource: "tiktok",
    discoveryOther: "",
    wantsNotifications: false,
    acceptedPrivacy: false,
    stayConnected: true
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailInvalid = form.email.length > 0 && !isStrictEmail(form.email);
  const isRegisterMode = mode === "register";
  const isPasswordMode = mode === "login" || mode === "register" || mode === "reset";
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const updateQuestionnaire = (field, value) => {
    setQuestionnaire((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  useEffect(() => {
    if (mode !== "verify") return undefined;

    const runVerification = async () => {
      setError("");
      setMessage("");

      if (!token) {
        setError(t.invalidVerificationLink);
        return;
      }

      try {
        setLoading(true);
        await verifyEmail({ token });
        setMessage(t.emailVerifiedSuccess);
      } catch (err) {
        setError(err.message || t.invalidVerificationLink);
      } finally {
        setLoading(false);
      }
    };

    runVerification();
    return undefined;
  }, [mode, token, t, verifyEmail]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (isRegisterMode && !questionnaire.acceptedPrivacy) {
      setError(t.privacyRequired);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else if (mode === "register") {
        await register({
          name: form.name,
          email: form.email,
          password: form.password
        });
      } else if (mode === "forgot") {
        await forgotPassword({ email: form.email });
        setMessage(t.passwordResetEmailSent);
      } else if (mode === "reset") {
        if (!token) {
          setError(t.invalidResetLink);
          return;
        }
        await resetPassword({ token, password: form.password });
        setMessage(t.passwordResetSuccess);
        setMode("login");
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
            className="flex min-h-10 items-center gap-2 rounded-2xl border border-[#7047EB]/10 bg-[#F4F1FF] px-3.5 text-sm font-black text-[#7047EB] shadow-[0_8px_20px_-16px_rgba(112,71,235,0.6)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_-18px_rgba(112,71,235,0.9)] focus:outline-none focus:ring-4 focus:ring-[#7047EB]/10"
            onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          >
            <span className="grid size-6 place-items-center rounded-full bg-white text-[#7047EB]">
              <i className="ph ph-globe text-sm" />
            </span>
            <span>{language.toUpperCase()}</span>
            <i className="ph ph-caret-down ml-0.5 text-xs" />
          </button>
        </header>

        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-6 py-6">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#1B1D28]">
              {mode === "forgot" ? t.forgotPassword : mode === "reset" ? t.resetPassword : mode === "verify" ? t.verifyEmailTitle : isRegisterMode ? t.createAccount : t.loginTitle}
            </h1>
            <p className="text-sm font-medium text-[#8E95A9]">{mode === "forgot" ? t.forgotPasswordHelp : mode === "reset" ? t.resetPasswordHelp : mode === "verify" ? t.verifyEmailHelp : t.authSubtitle}</p>
          </div>

          {["login", "register"].includes(mode) && <div className="mb-8 flex shrink-0 rounded-full border border-[#EAECEF] bg-[#F8F9FB] p-1.5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 rounded-full py-2.5 text-sm transition-all ${mode === "login" ? "bg-white font-bold text-[#1B1D28] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]" : "font-medium text-[#8E95A9] hover:text-[#1B1D28]"}`}
            >
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 rounded-full py-2.5 text-sm transition-all ${mode === "register" ? "bg-white font-bold text-[#1B1D28] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]" : "font-medium text-[#8E95A9] hover:text-[#1B1D28]"}`}
            >
              {t.register}
            </button>
          </div>}

          <form className="flex flex-1 flex-col gap-5" onSubmit={submit}>
            {isRegisterMode && (
              <div>
                <label className="mb-2 ml-1 block text-sm font-semibold text-[#1B1D28]">{t.name}</label>
                <input
                  aria-label={t.name}
                  className="block w-full rounded-full border-2 border-[#EAECEF] bg-[#F8F9FB] px-5 py-3.5 text-sm font-medium text-[#1B1D28] outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#7047EB]/20"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </div>
            )}

            {isRegisterMode && (
              <section className="grid gap-4 rounded-[28px] border border-[#EAECEF] bg-[#F8F9FB] p-4">
                <div>
                  <p className="mb-2 ml-1 text-sm font-semibold text-[#1B1D28]">{t.currencyQuestion}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      ["EUR", "€"],
                      ["USD", "$"],
                      ["GBP", "£"],
                      ["OTHER", t.other]
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateQuestionnaire("currency", value)}
                        className={`rounded-2xl border px-2 py-2.5 text-sm font-black transition-all ${questionnaire.currency === value ? "border-[#7047EB] bg-[#7047EB] text-white shadow-[0_10px_24px_-18px_rgba(112,71,235,0.9)]" : "border-[#EAECEF] bg-white text-[#8E95A9] hover:text-[#1B1D28]"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-sm font-semibold text-[#1B1D28]" htmlFor="discovery-source">{t.discoveryQuestion}</label>
                  <select
                    id="discovery-source"
                    aria-label={t.discoveryQuestion}
                    value={questionnaire.discoverySource}
                    onChange={(event) => updateQuestionnaire("discoverySource", event.target.value)}
                    className="block w-full rounded-2xl border-2 border-[#EAECEF] bg-white px-4 py-3 text-sm font-bold text-[#1B1D28] outline-none transition-all focus:border-[#7047EB] focus:ring-4 focus:ring-[#7047EB]/20"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="friends">{t.friends}</option>
                    <option value="network">{t.network}</option>
                    <option value="ads">{t.advertising}</option>
                    <option value="other">{t.other}</option>
                  </select>
                  {questionnaire.discoverySource === "other" && (
                    <input
                      aria-label={t.discoveryOther}
                      value={questionnaire.discoveryOther}
                      onChange={(event) => updateQuestionnaire("discoveryOther", event.target.value)}
                      placeholder={t.discoveryOtherPlaceholder}
                      className="mt-3 block w-full rounded-2xl border-2 border-[#EAECEF] bg-white px-4 py-3 text-sm font-medium text-[#1B1D28] outline-none transition-all focus:border-[#7047EB] focus:ring-4 focus:ring-[#7047EB]/20"
                    />
                  )}
                </div>

                <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-[#1B1D28]">
                  <input
                    type="checkbox"
                    checked={questionnaire.wantsNotifications}
                    onChange={(event) => updateQuestionnaire("wantsNotifications", event.target.checked)}
                    className="mt-1 size-4 accent-[#7047EB]"
                  />
                  <span>{t.notificationsQuestion}</span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl bg-white p-3 text-sm font-bold text-[#1B1D28]">
                  <input
                    type="checkbox"
                    checked={questionnaire.acceptedPrivacy}
                    onChange={(event) => updateQuestionnaire("acceptedPrivacy", event.target.checked)}
                    className="mt-1 size-4 accent-[#7047EB]"
                  />
                  <span>{t.acceptPrivacy}</span>
                </label>
              </section>
            )}

            {mode !== "reset" && mode !== "verify" && <div>
              <label className="mb-2 ml-1 block text-sm font-semibold text-[#1B1D28]">{t.emailAddress}</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <i className={`ph-fill ph-envelope-simple text-lg ${emailInvalid ? "text-[#FF3E5D]" : "text-[#8E95A9]"}`} />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className={`block w-full rounded-full border-2 py-3.5 pl-11 pr-11 text-sm font-medium text-[#1B1D28] placeholder-[#8E95A9] outline-none transition-all ${emailInvalid ? "border-[#FF3E5D]/30 bg-[#FFF0F3] focus:border-[#FF3E5D] focus:ring-4 focus:ring-[#FF3E5D]/20" : "border-[#EAECEF] bg-[#F8F9FB] focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#7047EB]/20"}`}
                  placeholder={t.emailPlaceholder}
                  required
                />
                {emailInvalid && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <i className="ph-fill ph-warning-circle text-lg text-[#FF3E5D]" />
                  </div>
                )}
              </div>
              {emailInvalid && <p className="ml-1 mt-2 text-sm font-medium text-[#FF3E5D]">{t.invalidEmail}</p>}
            </div>}

            {isPasswordMode && mode !== "forgot" && <div>
              <div className="mb-2 ml-1 flex items-center justify-between">
                <label className="block text-sm font-semibold text-[#1B1D28]">{t.password}</label>
                {mode === "login" && (
                  <button type="button" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="text-xs font-black text-[#7047EB]">
                    {t.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <i className="ph-fill ph-lock-key text-lg text-[#8E95A9]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="block w-full rounded-full border-2 border-[#EAECEF] bg-[#F8F9FB] py-3.5 pl-11 pr-12 text-sm font-medium text-[#1B1D28] outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#7047EB]/20"
                  placeholder={t.passwordPlaceholder}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8E95A9] transition-colors hover:text-[#7047EB]"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <i className={`ph-fill ${showPassword ? "ph-eye" : "ph-eye-slash"} text-lg`} />
                </button>
              </div>
            </div>}

            {["login", "register"].includes(mode) && <label className="flex items-center gap-3 px-1 text-sm font-bold text-[#1B1D28]">
              <input
                type="checkbox"
                checked={questionnaire.stayConnected}
                onChange={(event) => updateQuestionnaire("stayConnected", event.target.checked)}
                className="size-4 accent-[#7047EB]"
              />
              <span>{t.stayConnected}</span>
            </label>}

            {error && <p className="rounded-2xl bg-[#FFF0F3] p-3 text-sm font-semibold text-[#FF3E5D]">{error}</p>}
            {message && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}

            {mode !== "verify" && <button
              type="submit"
              disabled={loading || emailInvalid}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#7047EB] py-4 font-bold text-white shadow-[0_8px_24px_-6px_rgba(112,71,235,0.4)] transition-all hover:bg-[#5E35D9] active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? t.loading : mode === "forgot" ? t.sendResetLink : mode === "reset" ? t.resetPassword : isRegisterMode ? t.createAccount : t.signIn}
              <i className="ph-bold ph-arrow-right text-lg" />
            </button>}

            {["forgot", "reset", "verify"].includes(mode) && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                className="rounded-full border border-[#EAECEF] bg-white py-3 text-sm font-black text-[#7047EB] transition hover:bg-[#F4F1FF]"
              >
                {t.backToLogin}
              </button>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
