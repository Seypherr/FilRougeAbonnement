import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  Edit3,
  Globe2,
  Headphones,
  KeyRound,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  X
} from "lucide-react";
import { UserAvatar } from "../components/UserAvatar.jsx";
import { SUPPORTED_LANGUAGES } from "../i18n/dictionaries.js";
import { cycleLabels, formatMoney } from "../utils/subscriptions.js";
import { getBrowserTimeZone, getCurrencyLabel, SUPPORTED_CURRENCIES } from "../utils/international.js";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const AVATAR_MIN_SIZE = 300;
const AVATAR_MAX_SIZE = 4096;
const AVATAR_RATIO_MIN = 0.75;
const AVATAR_RATIO_MAX = 1.33;
const AVATAR_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function getCompletionPercent(form) {
  const checks = [
    Boolean(form.name.trim()),
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    Boolean(form.preferredCurrency),
    Boolean(form.timeZone.trim()),
    Boolean(form.avatarUrl.trim())
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function createProfileForm(user, currency) {
  return {
    name: user.name ?? "",
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ?? "",
    preferredCurrency: user.preferredCurrency ?? currency,
    timeZone: user.timeZone ?? getBrowserTimeZone(),
    reminderEmailEnabled: user.reminderEmailEnabled ?? true,
    reminderDaysBefore: user.reminderDaysBefore ?? [7, 3, 1]
  };
}

function EmailValue({ email }) {
  const [localPart, domainPart] = String(email || "").split("@");
  if (!localPart || !domainPart) return email || "-";
  return <>{localPart}@<wbr />{domainPart}</>;
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid size-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#7047EB]/30 hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function ProfileInfoCard({ icon: Icon, label, value, tone = "default", valueWrap = "normal" }) {
  const accent = tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-[#F4F0FF] text-[#7047EB]";
  const valueWrapClass = valueWrap === "anywhere" ? "[overflow-wrap:anywhere]" : "break-words";
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)]">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${accent}`}>
        <Icon size={20} strokeWidth={2.4} />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`mt-1 block ${valueWrapClass} text-sm font-black leading-snug ${tone === "danger" ? "text-rose-700" : "text-slate-950"}`}>{value || "-"}</span>
      </span>
    </div>
  );
}

function MenuAction({ icon: Icon, label, tone = "default", onClick, children }) {
  const color = tone === "danger" ? "text-rose-600" : "text-slate-800";
  const iconColor = tone === "danger" ? "bg-rose-50 text-rose-600" : "bg-[#F4F0FF] text-[#7047EB]";
  return (
    <div className="flex min-w-0 items-center gap-3 border-t border-slate-100 py-3 first:border-t-0 first:pt-0">
      <span className={`grid size-10 shrink-0 place-items-center rounded-2xl ${iconColor}`}>
        <Icon size={18} strokeWidth={2.35} />
      </span>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`min-w-0 flex-1 text-left ${color}`}
      >
        <span className="block text-sm font-black">{label}</span>
      </button>
      {children ?? <ChevronRight className={tone === "danger" ? "text-rose-400" : "text-slate-300"} size={18} />}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Invalid image"));
    };
    image.src = url;
  });
}

async function validateAvatarFile(file, t) {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
    return t.avatarUploadInvalidType;
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return t.avatarUploadInvalidSize;
  }
  try {
    const { width, height } = await readImageDimensions(file);
    const ratio = width / height;
    if (width < AVATAR_MIN_SIZE || height < AVATAR_MIN_SIZE || width > AVATAR_MAX_SIZE || height > AVATAR_MAX_SIZE || ratio < AVATAR_RATIO_MIN || ratio > AVATAR_RATIO_MAX) {
      return t.avatarUploadInvalidDimensions;
    }
  } catch {
    return t.avatarUploadReadError;
  }
  return "";
}

function AvatarPhotoModal({ t, user, value, saving, onClose, onUpload, onRemove }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(value ?? "");
  const [error, setError] = useState("");
  const previewUser = { ...user, avatarUrl: previewUrl || null };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(value ?? "");
      return undefined;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile, value]);

  const chooseFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validationError = await validateAvatarFile(file, t);
    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      event.target.value = "";
      return;
    }
    setSelectedFile(file);
    setError("");
  };

  const apply = async () => {
    if (!selectedFile) {
      setError(t.avatarUploadRequired);
      return;
    }
    try {
      setError("");
      await onUpload(selectedFile);
    } catch (err) {
      setError(err.message || t.apiErrorMessage);
    }
  };

  const removeCurrentAvatar = async () => {
    try {
      setSelectedFile(null);
      setPreviewUrl("");
      setError("");
      await onRemove();
    } catch (err) {
      setError(err.message || t.apiErrorMessage);
    }
  };

  return createPortal(
    <div className="modal-backdrop-enter fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-photo-title" className="modal-panel-enter max-h-[calc(100dvh-12px)] w-full overflow-y-auto overscroll-contain rounded-t-[28px] bg-white p-5 shadow-[0_-12px_40px_-20px_rgba(15,23,42,0.4)] sm:max-w-md sm:rounded-[28px] sm:p-6" onMouseDown={(event) => event.stopPropagation()}>
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="profile-photo-title" className="text-lg font-black text-slate-900">{t.profilePhotoTitle}</h2>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{t.profilePhotoHelp}</p>
          </div>
          <IconButton label={t.closeModal} onClick={onClose} className="size-9 rounded-full">
            <X size={16} />
          </IconButton>
        </header>
        <div className="mb-5 rounded-[24px] bg-slate-50 py-6 text-center">
          <UserAvatar user={previewUser} className="mx-auto size-28 border-4 border-white bg-[#7047EB] text-white shadow-[0_14px_30px_-12px_rgba(112,71,235,0.45)]" textClassName="text-4xl" />
        </div>
        <label className="grid min-h-32 cursor-pointer place-items-center rounded-[24px] border border-dashed border-[#7047EB]/30 bg-[#F4F0FF] p-5 text-center transition hover:border-[#7047EB]/60 hover:bg-[#EEE8FF]">
          <input aria-label={t.avatarUploadAction} type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseFile} className="sr-only" />
          <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#7047EB] shadow-sm">
            <Camera size={20} />
          </span>
          <span className="mt-3 block text-sm font-black text-slate-950">{selectedFile?.name || t.avatarUploadAction}</span>
          <span className="mt-1 block text-xs font-bold leading-relaxed text-slate-500">{t.avatarUploadCriteria}</span>
        </label>
        {error && <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{error}</p>}
        <button type="button" onClick={removeCurrentAvatar} disabled={saving} className="mt-4 w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-100 active:scale-[0.98]">{t.removeAvatar}</button>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]">{t.cancel}</button>
          <button type="button" onClick={apply} disabled={saving} className="rounded-2xl bg-[#7047EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98]">{saving ? t.loading : t.save}</button>
        </div>
      </section>
    </div>,
    document.body
  );
}

function ConfirmationModal({ title, message, cancelLabel, confirmLabel, loading = false, onCancel, onConfirm }) {
  return createPortal(
    <div className="modal-backdrop-enter fixed inset-0 z-[90] grid place-items-end bg-slate-900/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-6" onMouseDown={onCancel}>
      <section role="dialog" aria-modal="true" aria-labelledby="profile-confirmation-title" className="modal-panel-enter w-full rounded-t-[26px] bg-white p-5 shadow-[0_-14px_42px_-22px_rgba(15,23,42,0.55)] sm:max-w-sm sm:rounded-[26px]" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#F4F0FF] text-[#7047EB]">
            <CheckCircle2 size={18} />
          </span>
          <div className="min-w-0">
            <h2 id="profile-confirmation-title" className="text-base font-black text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{message}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-70">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-2xl bg-[#7047EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98] disabled:opacity-70">{loading ? "..." : confirmLabel}</button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export function ProfilePage({ t, user, language, setLanguage, forgotPassword, updateProfile, uploadAvatar, currency = "EUR", exportData, logout, globalModalOpen = false, onBack, onOpenAdmin }) {
  const [profileError, setProfileError] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [pendingProfileSave, setPendingProfileSave] = useState(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [forgotPasswordConfirmationOpen, setForgotPasswordConfirmationOpen] = useState(false);
  const [reminderDisableConfirmationOpen, setReminderDisableConfirmationOpen] = useState(false);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [form, setForm] = useState(() => createProfileForm(user, currency));
  const appPlan = getAppPlan(user);
  const appPlanName = getPlanValue(appPlan, ["name", "planName", "plan", "title"], t.noAppPlanTitle);
  const appPlanPrice = getPlanValue(appPlan, ["price", "amount", "monthlyPrice", "subscriptionPrice"]);
  const appPlanCycle = getPlanValue(appPlan, ["billingCycle", "cycle", "interval"], "MONTHLY");
  const appPlanStatus = getPlanValue(appPlan, ["status"], t.active);
  const appPlanNextPayment = getPlanValue(appPlan, ["nextPaymentDate", "nextBillingDate", "renewalDate", "currentPeriodEnd"]);
  const previewUser = { ...user, name: form.name.trim() || user.name, email: form.email.trim() || user.email, avatarUrl: form.avatarUrl || null };
  const completionPercent = getCompletionPercent(form);
  const profileIsComplete = completionPercent >= 100;
  const completionText = (t.profileCompletionStatus ?? "{percent}% Complete your profile").replace("{percent}", completionPercent);
  const emailRemindersLabel = t.emailReminders ?? "Email reminders";
  const timeZoneLabel = t.timeZone ?? "Time zone";
  const accessLabel = user.accessPlan === "PREMIUM" ? "Premium" : user.accessPlan === "BETA" ? t.profileBetaAccess : t.freePlan;

  const resetDraft = () => {
    setForm(createProfileForm(user, currency));
    setProfileError("");
    setSaved(false);
    setAvatarModalOpen(false);
  };

  useEffect(() => {
    setForm(createProfileForm(user, currency));
  }, [user.name, user.email, user.avatarUrl, user.preferredCurrency, user.timeZone, user.reminderEmailEnabled, user.reminderDaysBefore, currency]);

  useEffect(() => {
    if (globalModalOpen) setSettingsOpen(false);
  }, [globalModalOpen]);

  useEffect(() => {
    if (!settingsOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [settingsOpen]);

  const change = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
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
    return true;
  };

  const saveProfile = async (nextForm) => {
    setProfileError("");
    setSaved(false);
    try {
      setSaving(true);
      const payload = { name: nextForm.name.trim(), email: nextForm.email.trim().toLowerCase() };
      if (user.preferredCurrency && nextForm.preferredCurrency !== user.preferredCurrency) payload.preferredCurrency = nextForm.preferredCurrency;
      if (user.timeZone && nextForm.timeZone !== user.timeZone) payload.timeZone = nextForm.timeZone;
      await updateProfile(payload);
      setForm((current) => ({ ...current, ...nextForm, name: payload.name, email: payload.email }));
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

  const openEdit = () => {
    setSettingsOpen(false);
    setProfileError("");
    setSaved(false);
    setIsEditing(true);
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    if (validateProfile(form)) setPendingProfileSave({ ...form });
  };

  const removeAvatar = async () => {
    setProfileError("");
    setSaved(false);
    try {
      setSaving(true);
      const updatedUser = await updateProfile({ avatarUrl: null });
      setForm((current) => ({ ...current, avatarUrl: updatedUser.avatarUrl ?? "" }));
      setAvatarModalOpen(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setProfileError(err.message || t.apiErrorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setSaving(true);
    try {
      const updatedUser = await uploadAvatar(file);
      setForm((current) => ({ ...current, avatarUrl: updatedUser.avatarUrl ?? "" }));
      setAvatarModalOpen(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  const setReminderEmails = async (nextEnabled) => {
    setSupportMessage("");
    try {
      setSavingReminder(true);
      await updateProfile({ reminderEmailEnabled: nextEnabled });
      setForm((current) => ({ ...current, reminderEmailEnabled: nextEnabled }));
      setSupportMessage(t.profileSaved);
    } catch (error) {
      setSupportMessage(error.message || t.apiErrorMessage);
    } finally {
      setSavingReminder(false);
    }
  };

  const toggleReminderEmails = async () => {
    if (form.reminderEmailEnabled) {
      setSettingsOpen(false);
      setReminderDisableConfirmationOpen(true);
      return;
    }
    await setReminderEmails(true);
  };

  const requestPasswordReset = async () => {
    setForgotPasswordConfirmationOpen(false);
    try {
      await forgotPassword?.({ email: user.email });
      setSupportMessage(t.passwordResetEmailSent);
    } catch (err) {
      setSupportMessage(err.message || t.logoutFailed);
    }
  };

  const downloadMyData = async () => {
    try {
      const data = await exportData?.();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "frovely-data.json";
      link.click();
      URL.revokeObjectURL(url);
      setSupportMessage(t.dataExportReady);
    } catch (error) {
      setSupportMessage(error.message || t.apiErrorMessage);
    }
  };

  const handleLogout = async () => {
    setLogoutConfirmationOpen(false);
    try {
      await logout?.();
    } catch (error) {
      setSupportMessage(error.message || t.logoutFailed);
    }
  };

  const confirmProfileSave = async () => {
    if (!pendingProfileSave) return;
    try {
      await saveProfile(pendingProfileSave);
    } catch {
      // The localized error is already displayed by saveProfile.
    } finally {
      setPendingProfileSave(null);
    }
  };

  return (
    <div className="mobile-page min-h-[100svh] w-full min-w-0 bg-[#F8F9FB] px-4 pb-8 pt-5 text-slate-900 sm:px-6 lg:min-h-0 lg:px-0 lg:pb-10 lg:pt-0">
      <main className="mx-auto max-w-5xl">
        <section className="relative overflow-visible rounded-[32px] border border-slate-100 bg-white p-5 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.55)] sm:p-7 lg:p-8">
          <header className="flex items-center justify-between">
            <IconButton label={t.dashboard} onClick={onBack} className="text-slate-400">
              <ChevronRight className="rotate-180" size={18} />
            </IconButton>
            <h1 className="text-base font-black text-slate-700">{t.profile}</h1>
            <div className="relative">
              <IconButton label={t.profileSettings} aria-haspopup="menu" aria-expanded={settingsOpen} onClick={() => setSettingsOpen((open) => !open)}>
                <Settings size={18} />
              </IconButton>
              {settingsOpen && (
                <div className="floating-menu-enter absolute right-0 top-12 z-40 max-h-[calc(100dvh-13rem)] w-[min(21rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-[28px] border border-slate-100 bg-white p-4 text-left shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] sm:max-h-[calc(100dvh-7rem)]">
                  <MenuAction icon={Edit3} label={t.editProfile} onClick={openEdit} />
                  <MenuAction icon={Camera} label={t.editProfilePhoto} onClick={() => { setSettingsOpen(false); setAvatarModalOpen(true); }} />
                  {appPlan && <MenuAction icon={Sparkles} label={t.cancelPlan} tone="danger" onClick={() => { setSettingsOpen(false); setSupportModalOpen(true); }} />}
                  {onOpenAdmin && <MenuAction icon={ShieldCheck} label={t.adminPanel} onClick={() => { setSettingsOpen(false); onOpenAdmin(); }} />}
                  <div className="border-t border-slate-100 py-3">
                    <label className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#F4F0FF] text-[#7047EB]">
                        <Globe2 size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-slate-800">{t.language}</span>
                      </span>
                      <select aria-label={t.language} value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 rounded-2xl border border-[#7047EB]/15 bg-[#F4F0FF] px-3 text-sm font-black uppercase text-[#7047EB] outline-none focus:ring-4 focus:ring-[#7047EB]/10">
                        {SUPPORTED_LANGUAGES.map((option) => <option key={option} value={option}>{option.toUpperCase()}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="border-t border-slate-100 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#F4F0FF] text-[#7047EB]">
                        <Bell size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-slate-800">{emailRemindersLabel}</span>
                      </span>
                      <button type="button" role="switch" aria-label={emailRemindersLabel} aria-checked={form.reminderEmailEnabled} onClick={toggleReminderEmails} disabled={savingReminder} className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-wait ${savingReminder ? "bg-slate-400" : form.reminderEmailEnabled ? "bg-[#7047EB]" : "bg-slate-300"}`}>
                        <span className={`absolute top-1 grid size-5 place-items-center rounded-full bg-white shadow-sm transition ${form.reminderEmailEnabled ? "left-6" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                  <MenuAction icon={KeyRound} label={t.forgotPassword} onClick={() => { setSettingsOpen(false); setForgotPasswordConfirmationOpen(true); }} />
                  <MenuAction icon={Headphones} label={t.contactSupport} onClick={() => { setSettingsOpen(false); setSupportModalOpen(true); }} />
                  <MenuAction icon={Download} label={t.exportMyData} onClick={() => { setSettingsOpen(false); downloadMyData(); }} />
                  <MenuAction icon={LogOut} label={t.logout} tone="danger" onClick={() => { setSettingsOpen(false); setLogoutConfirmationOpen(true); }} />
                </div>
              )}
            </div>
          </header>

          <div className="mt-8 grid place-items-center text-center">
            <button type="button" aria-label={t.editProfilePhoto} title={t.editProfilePhoto} onClick={() => setAvatarModalOpen(true)} className="relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-[#7047EB]/20">
              <UserAvatar user={previewUser} className="size-28 border-4 border-white bg-[#7047EB] text-white shadow-[0_18px_34px_-20px_rgba(112,71,235,0.75)]" textClassName="text-4xl" />
              <span className="absolute bottom-1 right-1 grid size-8 place-items-center rounded-full border-2 border-white bg-slate-950 text-white">
                <Camera size={15} />
              </span>
            </button>
            <div className="mt-5 flex max-w-full items-center justify-center gap-2">
              <h2 className="min-w-0 break-words text-2xl font-black tracking-tight text-slate-950">{previewUser.name || t.fallbackUser}</h2>
              <button type="button" aria-label={t.editProfile} title={t.editProfile} onClick={openEdit} className="grid size-8 shrink-0 place-items-center rounded-full text-[#7047EB] transition hover:bg-[#F4F0FF]">
                <Edit3 size={18} />
              </button>
            </div>
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-[#F4F0FF]">
              <div className="h-full rounded-full bg-[#7047EB]" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-400">{completionText}</p>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#7047EB] p-4 text-white shadow-[0_18px_40px_-24px_rgba(112,71,235,0.75)] sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-base font-black">{profileIsComplete ? t.profileCompleteTitle : t.profileCompletionTitle}</p>
              <p className="mt-1 break-words text-sm font-semibold text-white/75">{profileIsComplete ? t.profileCompleteHelp : t.profileCompletionHelp}</p>
            </div>
            <button type="button" onClick={openEdit} className="mt-4 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#7047EB] transition hover:bg-[#F4F0FF] active:scale-[0.98] sm:mt-0">
              {profileIsComplete ? t.editProfile : t.profileCompletionAction}
            </button>
          </div>

          <section className="mt-7">
            <h3 className="text-lg font-black text-slate-950">{t.profileAccountSection}</h3>
            {isEditing ? (
              <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleProfileSubmit} noValidate>
                <Field label={t.fullName}>
                  <input aria-label={t.fullName} aria-invalid={Boolean(profileError === t.nameRequired)} autoComplete="name" value={form.name} onChange={(event) => change("name", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold normal-case tracking-normal text-slate-900 outline-none focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF] sm:text-sm" />
                </Field>
                <Field label={t.emailAddress}>
                  <input aria-label={t.emailAddress} aria-invalid={Boolean(profileError === t.invalidEmail)} autoComplete="email" type="email" value={form.email} onChange={(event) => change("email", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold normal-case tracking-normal text-slate-900 outline-none focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF] sm:text-sm" />
                </Field>
                <Field label={t.currencyQuestion}>
                  <select aria-label={t.currencyQuestion} value={form.preferredCurrency} onChange={(event) => change("preferredCurrency", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold normal-case tracking-normal text-slate-900 outline-none focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF] sm:text-sm">
                    {SUPPORTED_CURRENCIES.map((option) => <option key={option} value={option}>{option} - {getCurrencyLabel(option, language)}</option>)}
                  </select>
                </Field>
                <Field label={timeZoneLabel}>
                  <input aria-label={timeZoneLabel} autoComplete="off" value={form.timeZone} onChange={(event) => change("timeZone", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-bold normal-case tracking-normal text-slate-900 outline-none focus:border-[#7047EB] focus:bg-white focus:ring-4 focus:ring-[#F4F0FF] sm:text-sm" />
                </Field>
                {profileError && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700 sm:col-span-2">{profileError}</p>}
                <div className="grid grid-cols-2 gap-3 pt-1 sm:col-span-2">
                  <button type="button" onClick={() => { resetDraft(); setIsEditing(false); }} disabled={saving} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50">{t.cancel}</button>
                  <button type="submit" disabled={saving} className="rounded-2xl bg-[#7047EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#6338DF]">{saving ? t.loading : t.save}</button>
                </div>
              </form>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ProfileInfoCard icon={UserRound} label={t.fullName} value={form.name} />
                <ProfileInfoCard icon={Mail} label={t.emailAddress} value={<EmailValue email={form.email} />} valueWrap="anywhere" />
                <ProfileInfoCard icon={Sparkles} label={t.currentPlan} value={appPlan ? appPlanName : accessLabel} />
                <ProfileInfoCard icon={Globe2} label={timeZoneLabel} value={form.timeZone} />
                {appPlan && (
                  <div className="rounded-2xl border border-[#7047EB]/10 bg-[#F4F0FF] p-4 md:col-span-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-black text-slate-950">{appPlanName}</p>
                        {appPlanPrice !== null && <p className="mt-1 text-xs font-bold text-slate-500">{formatMoney(appPlanPrice, form.preferredCurrency)}</p>}
                        <p className="mt-1 text-xs font-semibold text-slate-500">{t[cycleLabels[String(appPlanCycle).toUpperCase()]] ?? appPlanCycle}</p>
                        {appPlanNextPayment && <p className="mt-1 text-xs font-semibold text-slate-500">{t.nextPayment}: {formatPlanDate(appPlanNextPayment)}</p>}
                      </div>
                      <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase text-[#7047EB]">{appPlanStatus}</span>
                    </div>
                  </div>
                )}
                {!appPlan && <p className="rounded-2xl bg-[#F4F0FF] p-4 text-sm font-bold leading-relaxed text-[#7047EB] md:col-span-2">{t.profileBetaAccessHelp}</p>}
                {saved && <p role="status" className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700 md:col-span-2">{t.profileSaved}</p>}
              </div>
            )}
          </section>

          {supportMessage && <p role="status" className="mt-5 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{supportMessage}</p>}
        </section>
      </main>
      {avatarModalOpen && <AvatarPhotoModal t={t} user={previewUser} value={form.avatarUrl} saving={saving} onClose={() => setAvatarModalOpen(false)} onUpload={handleAvatarUpload} onRemove={removeAvatar} />}
      {pendingProfileSave && <ConfirmationModal title={t.profileConfirmSaveTitle} message={t.profileConfirmSaveMessage} cancelLabel={t.cancel} confirmLabel={t.profileConfirmSaveAction} loading={saving} onCancel={() => setPendingProfileSave(null)} onConfirm={confirmProfileSave} />}
      {supportModalOpen && <ConfirmationModal title={t.supportModalTitle} message={t.supportModalMessage} cancelLabel={t.cancel} confirmLabel={t.supportEmailAction} onCancel={() => setSupportModalOpen(false)} onConfirm={() => { window.location.href = `mailto:support@frovely.app?subject=${encodeURIComponent(t.supportSection)}`; }} />}
      {forgotPasswordConfirmationOpen && <ConfirmationModal title={t.forgotPasswordConfirmTitle} message={t.forgotPasswordConfirmMessage.replace("{email}", user.email)} cancelLabel={t.cancel} confirmLabel={t.sendResetLink} onCancel={() => setForgotPasswordConfirmationOpen(false)} onConfirm={requestPasswordReset} />}
      {reminderDisableConfirmationOpen && <ConfirmationModal title={t.reminderDisableConfirmTitle} message={t.reminderDisableConfirmMessage} cancelLabel={t.cancel} confirmLabel={t.reminderDisableConfirmAction} loading={savingReminder} onCancel={() => setReminderDisableConfirmationOpen(false)} onConfirm={async () => { await setReminderEmails(false); setReminderDisableConfirmationOpen(false); }} />}
      {logoutConfirmationOpen && <ConfirmationModal title={t.logoutConfirmTitle} message={t.logoutConfirmMessage} cancelLabel={t.cancel} confirmLabel={t.logoutConfirmAction} onCancel={() => setLogoutConfirmationOpen(false)} onConfirm={handleLogout} />}
    </div>
  );
}
