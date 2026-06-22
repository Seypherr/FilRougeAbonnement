import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UserAvatar } from "../components/UserAvatar.jsx";
import { SUPPORTED_LANGUAGES } from "../i18n/dictionaries.js";
import { cycleLabels, formatMoney } from "../utils/subscriptions.js";

function isValidOptionalAvatarValue(value) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function AvatarPhotoModal({ t, user, value, saving, onClose, onSave, onRemove }) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState("");
  const trimmedDraft = draft.trim();
  const draftIsValid = isValidOptionalAvatarValue(draft);
  const previewUser = { ...user, avatarUrl: draftIsValid ? trimmedDraft || null : null };
  const title = t.profilePhotoTitle;
  const help = t.profilePhotoHelp;
  const importLabel = t.avatarUploadComingSoon;
  const deleteLabel = t.removeAvatar;
  const urlLabel = t.avatarHttpsUrl;
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

function ConfirmationModal({ title, message, cancelLabel, confirmLabel, loading = false, onCancel, onConfirm }) {
  const modal = (
    <div
      className="modal-backdrop-enter fixed inset-0 z-[90] grid place-items-end bg-slate-900/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-6"
      onMouseDown={onCancel}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-confirmation-title"
        className="modal-panel-enter w-full rounded-t-[26px] bg-white p-5 shadow-[0_-14px_42px_-22px_rgba(15,23,42,0.55)] sm:max-w-sm sm:rounded-[26px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#F4F0FF] text-[#7047EB]">
            <i className="ph-bold ph-check-circle text-lg" />
          </span>
          <div className="min-w-0">
            <h2 id="profile-confirmation-title" className="text-base font-black text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-[16px] bg-[#7047EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );

  return createPortal(modal, document.body);
}

function getAppPlan(user) {
  return user.appSubscription ?? user.appPlan ?? user.subscriptionPlan ?? user.plan ?? null;
}

function getPlanValue(plan, keys, fallback = null) {
  if (!plan) return fallback;
  return keys.reduce((value, key) => value ?? plan[key], null) ?? fallback;
}

function formatPlanDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export function ProfilePage({ t, user, language, setLanguage, forgotPassword, updateProfile }) {
  const [profileError, setProfileError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingProfileSave, setPendingProfileSave] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [forgotPasswordConfirmationOpen, setForgotPasswordConfirmationOpen] = useState(false);
  const notificationsStorageKey = `frovely:push-notifications:${user.id ?? user.email}`;
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(() => window.localStorage.getItem(notificationsStorageKey) === "enabled");
  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ?? ""
  });
  const previewUser = {
    ...user,
    name: form.name || user.name,
    email: form.email || user.email,
    avatarUrl: form.avatarUrl || null
  };
  const editAvatarLabel = t.editProfilePhoto;
  const editProfileLabel = t.editProfile;
  const appPlan = getAppPlan(user);
  const appPlanName = getPlanValue(appPlan, ["name", "planName", "plan", "title"], t.noAppPlanTitle);
  const appPlanPrice = getPlanValue(appPlan, ["price", "amount", "monthlyPrice", "subscriptionPrice"]);
  const appPlanCycle = getPlanValue(appPlan, ["billingCycle", "cycle", "interval"], "MONTHLY");
  const appPlanStatus = getPlanValue(appPlan, ["status"], appPlan ? t.active : t.disabled);
  const appPlanNextPayment = getPlanValue(appPlan, ["nextPaymentDate", "nextBillingDate", "renewalDate", "currentPeriodEnd"]);
  const appPlanStartedAt = getPlanValue(appPlan, ["startedAt", "createdAt", "startDate"]);

  useEffect(() => {
    setPushNotificationsEnabled(window.localStorage.getItem(notificationsStorageKey) === "enabled");
  }, [notificationsStorageKey]);

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

  const validateProfile = (nextForm) => {
    if (!nextForm.name.trim()) {
      setProfileError(t.nameRequired);
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextForm.email.trim())) {
      setProfileError(t.invalidEmail);
      return false;
    }

    if (!isValidOptionalAvatarValue(nextForm.avatarUrl)) {
      setProfileError(t.avatarUrlInvalid);
      return false;
    }

    return true;
  };

  const saveProfile = async (nextForm) => {
    setProfileError("");
    setSaved(false);

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

    setProfileError("");
    setSaved(false);

    if (!validateProfile(form)) {
      return;
    }

    setPendingProfileSave({ ...form });
  };

  const confirmProfileSave = async () => {
    if (!pendingProfileSave) {
      return;
    }

    try {
      await saveProfile(pendingProfileSave);
      setPendingProfileSave(null);
    } catch {
      setPendingProfileSave(null);
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

  const togglePushNotifications = () => {
    setSupportMessage("");
    setPushNotificationsEnabled((enabled) => {
      const nextEnabled = !enabled;
      window.localStorage.setItem(notificationsStorageKey, nextEnabled ? "enabled" : "disabled");
      return nextEnabled;
    });
  };

  const requestPasswordReset = async () => {
    setForgotPasswordConfirmationOpen(false);
    setSupportMessage("");
    try {
      await forgotPassword?.({ email: user.email });
      setSupportMessage(t.passwordResetEmailSent);
    } catch (err) {
      setSupportMessage(err.message || t.logoutFailed);
    }
  };

  const openSupportEmail = () => {
    window.location.href = `mailto:support@frovely.local?subject=${encodeURIComponent(t.supportSection)}`;
  };

  return (
    <div className="min-h-[100svh] overflow-y-auto bg-[#F8F9FB] px-4 pb-[calc(env(safe-area-inset-bottom)+5.25rem)] pt-5 text-slate-900 sm:px-5 lg:h-full lg:min-h-0 lg:overflow-hidden lg:px-0 lg:pb-0 lg:pt-0">
      <section className="mx-auto flex min-h-full max-w-xl flex-col justify-center gap-3 lg:grid lg:h-full lg:max-w-none lg:grid-cols-[minmax(230px,0.82fr)_minmax(0,1.7fr)] lg:items-stretch lg:gap-4 xl:grid-cols-[minmax(300px,0.95fr)_minmax(0,1.9fr)] xl:gap-5">
        <header className="shrink-0 rounded-[28px] border border-slate-100 bg-white p-5 text-left shadow-[0_18px_42px_-32px_rgba(15,23,42,0.35)] lg:flex lg:min-h-0 lg:flex-col lg:justify-between lg:overflow-hidden lg:p-5 xl:p-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t.subscriptionDetails}</p>
            {appPlan ? (
              <div className="mt-4 grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-2xl font-black tracking-tight text-slate-950">{appPlanName}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{t.currentPlan}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#F4F0FF] px-3 py-1.5 text-xs font-black uppercase text-[#7047EB]">{appPlanStatus}</span>
                </div>
                <div className="rounded-[24px] bg-[#F4F0FF] p-4">
                  <p className="text-3xl font-black text-[#7047EB]">
                    {appPlanPrice !== null ? formatMoney(appPlanPrice) : "-"}
                    <span className="ml-1 text-sm font-black text-[#7047EB]/60">/ {t[cycleLabels[String(appPlanCycle).toUpperCase()]] ?? appPlanCycle}</span>
                  </p>
                </div>
                <div className="grid gap-3 text-sm font-semibold text-slate-500">
                  <div className="flex items-center justify-between gap-3">
                    <span>{t.nextPayment}</span>
                    <span className="text-right font-black text-slate-900">{formatPlanDate(appPlanNextPayment)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{t.startedOn}</span>
                    <span className="text-right font-black text-slate-900">{formatPlanDate(appPlanStartedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{t.paymentStatus}</span>
                    <span className="text-right font-black text-slate-900">{appPlanStatus}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(true)}
                  className="rounded-[16px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100 active:scale-[0.98]"
                >
                  {t.cancelPlan}
                </button>
              </div>
            ) : (
              <div className="mt-4 grid gap-3.5">
                <div className="rounded-[24px] bg-[#F4F0FF] p-4 lg:p-3 xl:p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[#7047EB]/60">{t.currentPlan}</p>
                  <p className="mt-1.5 text-2xl font-black text-slate-950">{t.freePlan}</p>
                  <p className="mt-2 text-3xl font-black text-[#7047EB] lg:text-2xl xl:text-3xl">{formatMoney(0)}</p>
                </div>
                <div className="grid gap-2.5 text-sm font-semibold text-slate-500">
                  <div className="flex items-center justify-between gap-3">
                    <span>{t.paymentStatus}</span>
                    <span className="text-right font-black text-slate-900">{t.noAppPlanTitle}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{t.nextPayment}</span>
                    <span className="text-right font-black text-slate-900">{t.noPaymentScheduled}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>{t.cancelPlan}</span>
                    <span className="text-right font-black text-slate-900">{t.noCancellationNeeded}</span>
                  </div>
                </div>
                <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-relaxed text-slate-500 lg:p-3 xl:p-4">{t.noAppPlanHelp}</p>
              </div>
            )}
          </div>
        </header>

        <section className="grid min-h-0 shrink gap-3 lg:h-full lg:grid-rows-[minmax(0,0.9fr)_minmax(0,0.75fr)_minmax(0,1fr)] lg:gap-4 xl:gap-5">
          <div className="rounded-[22px] border border-slate-100 bg-white p-3.5 shadow-[0_12px_34px_-28px_rgba(15,23,42,0.3)] lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:overflow-hidden lg:rounded-[28px] lg:p-5 xl:p-6">
            {isEditing ? (
              <form className="grid gap-3 xl:grid-cols-2 xl:gap-4" onSubmit={handleProfileSubmit} noValidate>
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
                {profileError && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700 xl:col-span-2">{profileError}</p>}
                {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 xl:col-span-2">{t.profileSaved}</p>}
                <div className="grid grid-cols-2 gap-3 xl:col-span-2">
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
              <div className="grid gap-3 xl:grid-cols-2 xl:gap-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.fullName}</p>
                  <p className="mt-1 break-words text-sm font-black text-slate-900 lg:text-lg">{form.name || "-"}</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{t.emailAddress}</p>
                  <p className="mt-1 break-all text-sm font-black text-slate-900 lg:text-lg">{form.email || "-"}</p>
                </div>
                {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 xl:col-span-2">{t.profileSaved}</p>}
                <button
                  type="button"
                  onClick={startEditing}
                  className="rounded-[16px] bg-[#7047EB] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98] xl:col-span-2 lg:rounded-[18px] lg:py-4"
                >
                  {editProfileLabel}
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-slate-100 bg-white p-3.5 shadow-[0_12px_34px_-28px_rgba(15,23,42,0.3)] lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:overflow-hidden lg:rounded-[28px] lg:p-5 xl:p-6">
            <p className="mb-2.5 text-xs font-black uppercase tracking-widest text-slate-400 lg:mb-4">{t.preferences}</p>
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
                  {SUPPORTED_LANGUAGES.map((option) => (
                    <option key={option} value={option}>{option.toUpperCase()}</option>
                  ))}
                </select>
                <i className="ph-bold ph-caret-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7047EB]" />
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-100 bg-white p-3.5 shadow-[0_12px_34px_-28px_rgba(15,23,42,0.3)] lg:flex lg:min-h-0 lg:flex-col lg:justify-center lg:overflow-hidden lg:rounded-[28px] lg:p-5 xl:p-6">
            <p className="mb-2.5 text-xs font-black uppercase tracking-widest text-slate-400 lg:mb-4">{t.supportSection}</p>
            <div className="grid gap-2.5 xl:grid-cols-3 xl:gap-3">
              <button
                type="button"
                onClick={() => setSupportModalOpen(true)}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-left transition hover:border-[#7047EB]/20 hover:bg-[#F4F0FF]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-900">{t.contactSupport}</span>
                  <span className="block truncate text-xs font-semibold text-slate-500">{t.supportHelp}</span>
                </span>
                <i className="ph-bold ph-lifebuoy shrink-0 text-lg text-[#7047EB]" />
              </button>
              <button
                type="button"
                onClick={() => setForgotPasswordConfirmationOpen(true)}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-left transition hover:border-[#7047EB]/20 hover:bg-[#F4F0FF]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-900">{t.forgotPassword}</span>
                  <span className="block truncate text-xs font-semibold text-slate-500">{t.forgotPasswordProfileHelp}</span>
                </span>
                <i className="ph-bold ph-key shrink-0 text-lg text-[#7047EB]" />
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={pushNotificationsEnabled}
                onClick={togglePushNotifications}
                className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-left transition hover:border-[#7047EB]/20 hover:bg-[#F4F0FF]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-black text-slate-900">{t.pushNotifications}</span>
                  <span className="block truncate text-xs font-semibold text-slate-500">{pushNotificationsEnabled ? t.enabled : t.disabled}</span>
                </span>
                <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${pushNotificationsEnabled ? "bg-[#7047EB]" : "bg-slate-300"}`}>
                  <span className={`absolute top-1 grid size-5 place-items-center rounded-full bg-white shadow-sm transition ${pushNotificationsEnabled ? "left-6" : "left-1"}`} />
                </span>
              </button>
            </div>
            {supportMessage && <p role="status" className="mt-2.5 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{supportMessage}</p>}
          </div>

        </section>
      </section>
      {avatarModalOpen && (
        <AvatarPhotoModal
          t={t}
          user={previewUser}
          value={form.avatarUrl}
          saving={saving}
          onClose={() => setAvatarModalOpen(false)}
          onSave={saveAvatarFromModal}
          onRemove={() => saveAvatarFromModal("")}
        />
      )}
      {pendingProfileSave && (
        <ConfirmationModal
          title={t.profileConfirmSaveTitle}
          message={t.profileConfirmSaveMessage}
          cancelLabel={t.cancel}
          confirmLabel={t.profileConfirmSaveAction}
          loading={saving}
          onCancel={() => setPendingProfileSave(null)}
          onConfirm={confirmProfileSave}
        />
      )}
      {supportModalOpen && (
        <ConfirmationModal
          title={t.supportModalTitle}
          message={t.supportModalMessage}
          cancelLabel={t.cancel}
          confirmLabel={t.supportEmailAction}
          onCancel={() => setSupportModalOpen(false)}
          onConfirm={openSupportEmail}
        />
      )}
      {forgotPasswordConfirmationOpen && (
        <ConfirmationModal
          title={t.forgotPasswordConfirmTitle}
          message={t.forgotPasswordConfirmMessage.replace("{email}", user.email)}
          cancelLabel={t.cancel}
          confirmLabel={t.sendResetLink}
          onCancel={() => setForgotPasswordConfirmationOpen(false)}
          onConfirm={requestPasswordReset}
        />
      )}
    </div>
  );
}
