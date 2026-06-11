import { useState } from "react";

export function EmailVerificationRequiredPage({ t, user, resendVerification, logout }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setMessage("");
    setError("");
    try {
      setLoading(true);
      await resendVerification();
      setMessage(t.verificationEmailSent);
    } catch (err) {
      setError(err.message || t.apiErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#EEF0F4] p-4 text-slate-950">
      <section className="w-full max-w-md rounded-[32px] bg-white p-6 text-center shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)]">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#F4F1FF] text-[#7047EB]">
          <i className="ph-fill ph-envelope-simple text-2xl" />
        </div>
        <h1 className="mt-5 text-2xl font-black">{t.verifyYourEmail}</h1>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
          {t.verifyYourEmailHelp.replace("{email}", user.email)}
        </p>
        {message && <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={resend}
            className="rounded-2xl bg-[#7047EB] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#6338DF] disabled:opacity-60"
          >
            {loading ? t.loading : t.resendVerificationEmail}
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50"
          >
            {t.logout}
          </button>
        </div>
      </section>
    </main>
  );
}

