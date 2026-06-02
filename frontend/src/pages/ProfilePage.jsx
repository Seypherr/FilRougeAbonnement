import { useState } from "react";

export function ProfilePage({ t, user, language, setLanguage, logout }) {
  const [error, setError] = useState("");
  const initials = user.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
  const isActive = user.isActive ?? true;

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
    } catch (err) {
      setError(err.message || t.logoutFailed);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-5 pb-28 pt-12 text-slate-900 lg:min-h-0 lg:px-0 lg:pb-8 lg:pt-0">
      <section className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <div className="mx-auto grid size-28 place-items-center rounded-full border-4 border-white bg-[#7047EB] text-4xl font-black text-white shadow-[0_14px_30px_-12px_rgba(112,71,235,0.65)]">
            {initials}
          </div>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">{t.profile}</h1>
          <p className="mx-auto mt-1 max-w-full break-all px-2 text-sm font-semibold text-slate-500">{user.email}</p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7047EB]">
              {user.role}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {isActive ? t.active : t.inactive}
            </span>
          </div>
        </header>

        <section className="grid gap-4">
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.25)]">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">{t.account}</p>
            <div className="grid gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.fullName}</p>
                <p className="mt-1 text-base font-black text-slate-900">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.emailAddress}</p>
                <p className="mt-1 break-all text-base font-black text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.role}</p>
                <p className="mt-1 text-base font-black text-slate-900">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.25)]">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">{t.preferences}</p>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">{t.language}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.interfaceLanguage}</p>
              </div>
              <button
                type="button"
                className="rounded-full bg-[#F4F0FF] px-4 py-2 text-sm font-black uppercase text-[#7047EB] transition hover:bg-[#EAE5FF]"
                onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
              >
                {language.toUpperCase()}
              </button>
            </div>
          </div>

          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-slate-900 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[0.98]"
            onClick={handleLogout}
          >
            <i className="ph-bold ph-sign-out text-lg" />
            {t.logout}
          </button>
        </section>
      </section>
    </div>
  );
}
