import { useEffect, useState } from "react";
import { UserAvatar } from "../components/UserAvatar.jsx";

function isValidOptionalUrl(value) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ProfilePage({ t, user, language, setLanguage, logout, updateProfile }) {
  const [profileError, setProfileError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ?? ""
  });
  const isActive = user.isActive ?? true;
  const previewUser = {
    ...user,
    name: form.name || user.name,
    email: form.email || user.email,
    avatarUrl: form.avatarUrl || null
  };

  useEffect(() => {
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      avatarUrl: user.avatarUrl ?? ""
    });
  }, [user.name, user.email, user.avatarUrl]);

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setProfileError("");
    setSaved(false);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setSaved(false);

    if (!form.name.trim()) {
      setProfileError(t.nameRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setProfileError(t.invalidEmail);
      return;
    }

    if (!isValidOptionalUrl(form.avatarUrl)) {
      setProfileError(t.avatarUrlInvalid);
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        avatarUrl: form.avatarUrl.trim() || null
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      const message = err.message === "Email already used" ? t.emailAlreadyUsed : err.message;
      setProfileError(message || t.apiErrorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await logout();
    } catch (err) {
      setLogoutError(err.message || t.logoutFailed);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-5 pb-28 pt-12 text-slate-900 lg:min-h-0 lg:px-0 lg:pb-8 lg:pt-0">
      <section className="mx-auto max-w-xl">
        <header className="mb-8 text-center">
          <UserAvatar
            user={previewUser}
            className="mx-auto size-28 border-4 border-white bg-[#7047EB] text-white shadow-[0_14px_30px_-12px_rgba(112,71,235,0.65)]"
            textClassName="text-4xl"
          />
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900">{t.profile}</h1>
          <p className="mx-auto mt-1 max-w-full break-all px-2 text-sm font-semibold text-slate-500">{previewUser.email}</p>
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
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.editProfile}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{t.profileHelp}</p>
            </div>
            <form className="grid gap-4" onSubmit={handleProfileSubmit} noValidate>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">{t.fullName}</label>
                <input
                  aria-label={t.fullName}
                  aria-invalid={Boolean(profileError === t.nameRequired)}
                  value={form.name}
                  onChange={(event) => change("name", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">{t.emailAddress}</label>
                <input
                  aria-label={t.emailAddress}
                  aria-invalid={Boolean(profileError === t.invalidEmail)}
                  type="email"
                  value={form.email}
                  onChange={(event) => change("email", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">{t.avatarUrl}</label>
                <input
                  aria-label={t.avatarUrl}
                  aria-invalid={Boolean(profileError === t.avatarUrlInvalid)}
                  type="url"
                  value={form.avatarUrl}
                  onChange={(event) => change("avatarUrl", event.target.value)}
                  placeholder={t.avatarUrlPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF]"
                />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.role}</p>
                <p className="mt-1 text-base font-black text-slate-900">{user.role}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{t.profileProtectedFields}</p>
              </div>
              {profileError && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{profileError}</p>}
              {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{t.profileSaved}</p>}
              <button
                type="submit"
                disabled={saving}
                className="rounded-[18px] bg-[#7047EB] px-5 py-4 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? t.loading : t.saveChanges}
              </button>
            </form>
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

          {logoutError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{logoutError}</p>}

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
