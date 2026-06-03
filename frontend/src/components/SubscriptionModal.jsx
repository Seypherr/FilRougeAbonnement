import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SubscriptionLogo } from "./SubscriptionLogo.jsx";
import { getServiceSuggestions } from "../utils/subscriptionLogos.js";
import { cycleLabels, emptySubscription, toApiPayload, toFormData } from "../utils/subscriptions.js";

const validBillingCycles = Object.keys(cycleLabels);

function validateForm(form, t) {
  const nextErrors = {};
  const price = Number(form.price);

  if (!form.name.trim()) {
    nextErrors.name = t.nameRequired;
  }

  if (!Number.isFinite(price) || price <= 0) {
    nextErrors.price = t.priceRequired;
  }

  if (!form.billingCycle || !validBillingCycles.includes(form.billingCycle)) {
    nextErrors.billingCycle = t.billingCycleRequired;
  }

  if (!form.renewalDate) {
    nextErrors.renewalDate = t.renewalDateRequired;
  }

  return nextErrors;
}

function Field({ label, children, error }) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-[12px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}

function ServiceNameInput({ t, value, error, onChange }) {
  const [focused, setFocused] = useState(false);
  const suggestions = getServiceSuggestions(value, 6);
  const showSuggestions = focused && suggestions.length > 0;

  const selectSuggestion = (serviceName) => {
    onChange(serviceName);
    setFocused(false);
  };

  return (
    <div className="relative">
      <input
        aria-label={t.name}
        aria-invalid={Boolean(error)}
        aria-autocomplete="list"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder="e.g. Spotify"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
      />
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)]">
          <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.serviceSuggestions}</p>
          <div className="grid gap-1">
            {suggestions.map((service) => (
              <button
                key={service.name}
                type="button"
                aria-label={`${t.chooseService} ${service.name}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(service.name)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 active:scale-[0.99]"
              >
                <SubscriptionLogo name={service.name} className="size-8 rounded-lg" />
                <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">{service.name}</span>
                <span className="hidden truncate text-[11px] font-semibold text-slate-400 sm:block">{service.domain}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatSelectedDate(value, language) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
}

function parseDateValue(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthLabel(date, language) {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getCalendarDays(monthDate) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      value: formatDateValue(date),
      inCurrentMonth: date.getMonth() === monthDate.getMonth()
    };
  });
}

function RenewalDateInput({ t, language, value, error, onChange }) {
  const selectedLabel = formatSelectedDate(value, language);
  const selectedDate = parseDateValue(value);
  const today = new Date();
  const todayValue = formatDateValue(today);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? today);
  const calendarDays = getCalendarDays(visibleMonth);
  const weekDays = language === "fr" ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  return (
    <div className={`grid gap-4 rounded-[18px] border bg-slate-50 p-3.5 transition-all ${error ? "border-red-200 ring-4 ring-red-50" : "border-slate-200 focus-within:border-slate-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100"}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F4F0FF] text-[#7047EB]">
          <i className="ph-fill ph-calendar-blank text-lg" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t.dateSelected}</p>
          <p className="mt-0.5 truncate text-[14px] font-bold capitalize text-slate-900">
            {selectedLabel || t.noDateSelected}
          </p>
        </div>
      </div>

      <div className="rounded-[16px] border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label={t.previousMonth}
            onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#7047EB]/30 hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-95"
          >
            <i className="ph-bold ph-caret-left text-sm" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-[14px] font-black capitalize text-slate-900">
            {getMonthLabel(visibleMonth, language)}
          </p>
          <button
            type="button"
            aria-label={t.nextMonth}
            onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#7047EB]/30 hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-95"
          >
            <i className="ph-bold ph-caret-right text-sm" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
          {weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const isSelected = value === day.value;
            const isToday = day.value === todayValue;
            return (
              <button
                key={day.value}
                type="button"
                aria-label={`${t.selectDate} ${formatSelectedDate(day.value, language)}`}
                aria-pressed={isSelected}
                onClick={() => onChange(day.value)}
                className={`grid aspect-square min-h-9 place-items-center rounded-xl text-[12px] font-black transition active:scale-95 ${
                  isSelected
                    ? "bg-[#7047EB] text-white shadow-[0_8px_18px_-10px_rgba(112,71,235,0.9)]"
                    : isToday
                      ? "bg-[#F4F0FF] text-[#7047EB] ring-1 ring-[#7047EB]/20"
                      : day.inCurrentMonth
                        ? "text-slate-700 hover:bg-slate-100"
                        : "text-slate-300 hover:bg-slate-50"
                }`}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onChange(todayValue)}
          className="mt-3 w-full rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-black text-slate-600 transition hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-[0.98]"
        >
          {t.today}
        </button>
      </div>

      <input
        aria-label={t.renewalDate}
        aria-invalid={Boolean(error)}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => onChange(event.currentTarget.value)}
        onBlur={(event) => onChange(event.currentTarget.value)}
        className="sr-only"
      />
    </div>
  );
}

export function SubscriptionModal({ t, language = "fr", subscription, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormData(subscription ?? emptySubscription));
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const isEditing = Boolean(subscription);

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const submit = async () => {
    setError("");
    const nextErrors = validateForm(form, t);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(t.formValidationError);
      return;
    }

    try {
      await onSubmit(toApiPayload(form), isEditing);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleActive = () => {
    change("status", form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
  };

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overscroll-contain bg-slate-900/40 p-0 backdrop-blur-[2px] lg:items-center lg:p-6">
      <div className="flex max-h-[calc(100dvh-16px)] min-h-0 w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:max-h-[min(92dvh,760px)] lg:max-w-3xl lg:rounded-[32px]">
        <div className="flex w-full shrink-0 justify-center pb-1 pt-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <div className="z-10 flex shrink-0 items-center justify-between gap-4 rounded-t-[32px] border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{isEditing ? t.editSubscription : t.addSubscription}</h2>
            <p className="text-xs font-medium text-slate-500">
              {isEditing ? t.updateSubscriptionDetails.replace("{name}", form.name || t.name) : t.newSubscriptionDetails}
            </p>
          </div>
          <button type="button" aria-label={t.closeModal} onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100">
            <i className="ph-bold ph-x text-sm" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-white p-5 sm:p-6">
          {(saved || error) && (
            <div className={`flex items-start gap-3 rounded-[14px] border p-3 ${error ? "border-red-200/60 bg-red-50" : "border-emerald-200/60 bg-emerald-50"}`}>
              <i className={`ph-fill ${error ? "ph-warning-circle text-red-600" : "ph-check-circle text-emerald-600"} mt-0.5 shrink-0 text-[20px]`} />
              <div>
                <p className={`text-[13px] font-bold ${error ? "text-red-800" : "text-emerald-800"}`}>{error ? t.error : t.changesSaved}</p>
                <p className={`mt-0.5 text-[12px] font-medium ${error ? "text-red-600" : "text-emerald-600"}`}>{error || t.subscriptionDetailsSaved}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.name} error={fieldErrors.name}>
              <ServiceNameInput
                t={t}
                value={form.name}
                error={fieldErrors.name}
                onChange={(value) => change("name", value)}
              />
            </Field>
            <Field label={t.price} error={fieldErrors.price}>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[14px] font-medium text-slate-400">$</span>
                <input aria-label={t.price} aria-invalid={Boolean(fieldErrors.price)} type="number" step="0.01" value={form.price} onChange={(event) => change("price", event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-7 pr-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
              </div>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.category}>
              <select aria-label={t.category} value={form.categoryId} onChange={(event) => change("categoryId", event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100">
                <option value="">{t.categoryPlaceholder}</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label={t.billingCycle} error={fieldErrors.billingCycle}>
              <select aria-label={t.billingCycle} aria-invalid={Boolean(fieldErrors.billingCycle)} value={form.billingCycle} onChange={(event) => change("billingCycle", event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100">
                {Object.entries(cycleLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
              </select>
            </Field>
            <Field label={t.renewalDate} error={fieldErrors.renewalDate}>
              <RenewalDateInput
                t={t}
                language={language}
                value={form.renewalDate}
                error={fieldErrors.renewalDate}
                onChange={(value) => change("renewalDate", value)}
              />
            </Field>
            <Field label={t.paymentMethod}>
              <input aria-label={t.paymentMethod} value={form.paymentMethod} onChange={(event) => change("paymentMethod", event.target.value)} placeholder={t.paymentMethodPlaceholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
          </div>

          <div className="mt-1 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="min-w-0">
              <span className="block text-[14px] font-bold text-slate-900">{t.activeStatus}</span>
              <span className="mt-0.5 block text-[12px] font-medium text-slate-500">{t.activeStatusHelp}</span>
            </div>
            <button type="button" aria-label={t.toggleActiveStatus} onClick={toggleActive} className={`relative flex h-7 w-12 shrink-0 items-center rounded-full pl-0.5 shadow-inner transition-colors ${form.status === "ACTIVE" ? "bg-[#7B42FF]" : "bg-slate-300"}`}>
              <span className={`size-6 rounded-full bg-white shadow-sm transition-transform ${form.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <Field label={t.descriptionOptional}>
            <textarea aria-label={t.description} rows={2} value={form.description} onChange={(event) => change("description", event.target.value)} placeholder={t.descriptionPlaceholder} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
          </Field>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 sm:py-5 sm:pb-8">
          <button type="button" onClick={onClose} className="flex-1 rounded-[14px] border border-slate-200 px-4 py-3.5 text-[15px] font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95">
            {t.cancel}
          </button>
          <button type="button" onClick={submit} className="flex-[1.5] rounded-[14px] border border-[#7B42FF] bg-[#7B42FF] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(123,66,255,0.25)] transition-colors hover:bg-[#6B32EF] active:scale-95">
            {isEditing ? t.saveChanges : t.addSubscription}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
