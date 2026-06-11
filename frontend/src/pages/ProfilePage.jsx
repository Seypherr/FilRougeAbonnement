import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserAvatar } from "../components/UserAvatar.jsx";

const languageOptions = ["fr", "en", "es", "it", "de", "pt", "nl", "ar"];

function isValidOptionalAvatarValue(value) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function AvatarPhotoModal({ t, language, user, value, saving, onClose, onSave, onRemove }) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState("");
  const trimmedDraft = draft.trim();
  const draftIsValid = isValidOptionalAvatarValue(draft);
  const previewUser = { ...user, avatarUrl: draftIsValid ? trimmedDraft || null : null };
  const title = language === "fr" ? "Photo de profil" : "Profile photo";
  const help = language === "fr"
    ? "L'import direct sera branché sur un stockage externe avant la production."
    : "Direct upload will be connected to external storage before production.";
  const importLabel = language === "fr" ? "Importer une photo bientôt" : "Photo upload coming soon";
  const deleteLabel = language === "fr" ? "Supprimer l'avatar" : "Remove avatar";
  const urlLabel = language === "fr" ? "URL HTTPS de l'avatar" : "HTTPS avatar URL";
  const urlPlaceholder = "https://example.com/avatar.png";

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const apply = async () => {
    if (!draftIsValid) {
      setError(t.avatarUrlInvalid);
      return;
    }

    try {
      setError("");
      await onSave(trimmedDraft);
    } catch (err) {
      setError(err.message || t.apiErrorMessage);
    }
  };

  const removeAvatar = async () => {
    try {
      setDraft("");
      setError("");
      await onRemove();
    } catch (err) {
      setError(err.message || t.apiErrorMessage);
    }
  };

  const modal = (
    <div
      className="modal-backdrop-enter fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      onMouseDown={onClose}
    >
      <div
        className="modal-panel-enter max-h-[calc(100dvh-12px)] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-white p-4 shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.4)] sm:max-w-md sm:rounded-[28px] sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">{help}</p>
          </div>
          <button
            type="button"
            aria-label={t.closeModal}
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100"
          >
            <i className="ph-bold ph-x text-sm" />
          </button>
        </div>

        <div className="mb-5 rounded-[24px] border border-slate-100 bg-slate-50 p-5 text-center">
          <UserAvatar
            user={previewUser}
            className="mx-auto size-28 border-4 border-white bg-[#7047EB] text-white shadow-[0_14px_30px_-12px_rgba(112,71,235,0.45)]"
            textClassName="text-4xl"
          />
        </div>

        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-[16px] border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-400"
        >
          <i className="ph-bold ph-upload-simple mr-2 text-sm" />
          {importLabel}
        </button>
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">{urlLabel}</label>
          <input
            aria-label={urlLabel}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError("");
            }}
            placeholder={urlPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF]"
          />
        </div>
        {error && <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}

        <button
          type="button"
          onClick={removeAvatar}
          disabled={saving}
          className="mt-4 w-full rounded-[16px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100 active:scale-[0.98]"
        >
          {deleteLabel}
        </button>

        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-[16px] border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={saving}
            className="flex-[1.3] rounded-[16px] bg-[#7047EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98]"
          >
            {saving ? t.loading : t.save}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function ProfilePage({ t, user, language, setLanguage, logout, updateProfile }) {
  const [profileError, setProfileError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
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
  const editAvatarLabel = language === "fr" ? "Modifier la photo de profil" : "Edit profile photo";
  const editProfileLabel = language === "fr" ? "Modifier profil" : "Edit profile";

  const resetDraft = () => {
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      avatarUrl: user.avatarUrl ?? ""
    });
    setProfileError("");
    setSaved(false);
    setAvatarModalOpen(false);
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

  const saveProfile = async (nextForm) => {
    setProfileError("");
    setSaved(false);

    if (!nextForm.name.trim()) {
      setProfileError(t.nameRequired);
      throw new Error(t.nameRequired);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email.trim())) {
      setProfileError(t.invalidEmail);
      throw new Error(t.invalidEmail);
    }

    if (!isValidOptionalAvatarValue(nextForm.avatarUrl)) {
      setProfileError(t.avatarUrlInvalid);
      throw new Error(t.avatarUrlInvalid);
    }

    try {
      setSaving(true);
      await updateProfile({
        name: nextForm.name.trim(),
        email: nextForm.email.trim().toLowerCase(),
        avatarUrl: nextForm.avatarUrl.trim() || null
      });
      setForm({
        name: nextForm.name.trim(),
        email: nextForm.email.trim().toLowerCase(),
        avatarUrl: nextForm.avatarUrl.trim()
      });
      setIsEditing(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      const message = err.message === "Email already used" ? t.emailAlreadyUsed : err.message;
      setProfileError(message || t.apiErrorMessage);
      throw new Error(message || t.apiErrorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      await saveProfile(form);
    } catch {
      // Errors are already surfaced in the profile UI.
    }
  };

  const saveAvatarFromModal = async (avatarUrl) => {
    await saveProfile({ ...form, avatarUrl });
    setAvatarModalOpen(false);
  };

  const startEditing = () => {
    setProfileError("");
    setSaved(false);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    resetDraft();
    setIsEditing(false);
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
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9FB] px-4 pb-24 pt-8 text-slate-900 sm:px-5 lg:min-h-0 lg:px-0 lg:pb-8 lg:pt-0">
      <section className="mx-auto max-w-xl">
        <header className="mb-5 text-center lg:mb-8">
          <div className="group relative mx-auto size-24 lg:size-28">
            <UserAvatar
              user={previewUser}
              className="size-full border-4 border-white bg-[#7047EB] text-white shadow-[0_14px_30px_-12px_rgba(112,71,235,0.65)]"
              textClassName="text-3xl lg:text-4xl"
            />
            {isEditing && (
              <button
                type="button"
                aria-label={editAvatarLabel}
                onClick={() => setAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 grid size-9 place-items-center rounded-full border-4 border-[#F8F9FB] bg-[#7047EB] text-white shadow-[0_10px_24px_-12px_rgba(112,71,235,0.75)] transition hover:bg-[#6338DF] active:scale-95 lg:bottom-1 lg:right-1 lg:size-10"
              >
                <i className="ph-bold ph-pencil-simple text-sm" />
              </button>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 lg:mt-5 lg:text-3xl">{t.profile}</h1>
          <p className="mx-auto mt-1 max-w-full break-all px-2 text-sm font-semibold text-slate-500">{previewUser.email}</p>
          <div className="mt-3 flex justify-center gap-2 lg:mt-4">
            <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7047EB]">
              {user.role}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {isActive ? t.active : t.inactive}
            </span>
          </div>
        </header>

        <section className="grid gap-3 lg:gap-4">
          <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.25)] lg:rounded-[24px] lg:p-5">
            {isEditing ? (
              <form className="grid gap-3.5 lg:gap-4" onSubmit={handleProfileSubmit} noValidate>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">{t.fullName}</label>
                  <input
                    aria-label={t.fullName}
                    aria-invalid={Boolean(profileError === t.nameRequired)}
                    value={form.name}
                    onChange={(event) => change("name", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF] lg:py-3"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF] lg:py-3"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.role}</p>
                  <p className="mt-1 text-base font-black text-slate-900">{user.role}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{t.profileProtectedFields}</p>
                </div>
                {profileError && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{profileError}</p>}
                {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{t.profileSaved}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={saving}
                    className="rounded-[16px] border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 lg:rounded-[18px] lg:py-4"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-[16px] bg-[#7047EB] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 lg:rounded-[18px] lg:py-4"
                  >
                    {saving ? t.loading : t.save}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3.5 lg:gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.fullName}</p>
                  <p className="mt-1 break-words text-sm font-black text-slate-900">{form.name || "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.emailAddress}</p>
                  <p className="mt-1 break-all text-sm font-black text-slate-900">{form.email || "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.role}</p>
                  <p className="mt-1 text-base font-black text-slate-900">{user.role}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{t.profileProtectedFields}</p>
                </div>
                {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{t.profileSaved}</p>}
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-[16px] bg-[#7047EB] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98] lg:rounded-[18px] lg:py-4"
                >
                  {editProfileLabel}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-slate-100 bg-white p-4 shadow-[0_6px_24px_-16px_rgba(15,23,42,0.25)] lg:rounded-[24px] lg:p-5">
            <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400 lg:mb-4">{t.preferences}</p>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-900">{t.language}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">{t.interfaceLanguage}</p>
              </div>
              <div className="relative w-36 shrink-0">
                <i className="ph ph-translate pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base text-[#7047EB]" />
                <select
                  aria-label={t.language}
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#7047EB]/10 bg-[#F4F0FF] pl-10 pr-9 text-sm font-black uppercase text-[#7047EB] shadow-[0_10px_24px_-20px_rgba(112,71,235,0.9)] outline-none transition hover:bg-white focus:border-[#7047EB]/40 focus:bg-white focus:ring-4 focus:ring-[#7047EB]/10"
                >
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>{option.toUpperCase()}</option>
                  ))}
                </select>
                <i className="ph-bold ph-caret-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7047EB]" />
              </div>
            </div>
          </div>

          {logoutError && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{logoutError}</p>}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-slate-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[0.98] lg:rounded-[18px] lg:py-4"
            onClick={handleLogout}
          >
            <i className="ph-bold ph-sign-out text-lg" />
            {t.logout}
          </button>
        </section>
      </section>
      {avatarModalOpen && (
        <AvatarPhotoModal
          t={t}
          language={language}
          user={previewUser}
          value={form.avatarUrl}
          saving={saving}
          onClose={() => setAvatarModalOpen(false)}
          onSave={saveAvatarFromModal}
          onRemove={() => saveAvatarFromModal("")}
        />
      )}
    </div>
  );
}
