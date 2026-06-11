import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SubscriptionLogo } from "./SubscriptionLogo.jsx";
import {
  getPaymentMethodLogo,
  getPaymentMethodSuggestions,
  getServicePlanSuggestion,
  getServiceSuggestions,
  normalizeServiceName
} from "../utils/subscriptionLogos.js";
import { cycleLabels, emptySubscription, parsePrice, toApiPayload, toFormData } from "../utils/subscriptions.js";

const validBillingCycles = Object.keys(cycleLabels);
const priceShortcuts = [".99", ".50", ".00"];

function normalizeSearchValue(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function validateForm(form, t) {
  const nextErrors = {};
  const price = parsePrice(form.price);
  const selectedDate = parseDateValue(form.renewalDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
  } else if (!selectedDate || selectedDate < today) {
    nextErrors.renewalDate = t.renewalDatePast;
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

function formatEuroHints(prices = []) {
  if (!prices.length) return "";
  return prices.map((price) => `${String(price).replace(".", ",")} €`).join(" / ");
}

function applyPriceShortcut(value, shortcut) {
  const numeric = parsePrice(value);
  const base = Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 0;
  const cents = Number(`0${shortcut}`);

  return (base + cents).toFixed(2).replace(".", ",");
}

function ServiceNameInput({ t, value, error, onChange, onSelectService }) {
  const [focused, setFocused] = useState(false);
  const suggestions = getServiceSuggestions(value, 6);
  const hasSearch = normalizeSearchValue(value).length >= 2;
  const showSuggestions = focused && suggestions.length > 0;
  const showUnknown = focused && hasSearch && suggestions.length === 0;

  const selectSuggestion = (service) => {
    onSelectService(service);
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
        <div className="floating-menu-enter absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)]">
          <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{t.serviceSuggestions}</p>
          <div className="grid gap-1">
            {suggestions.map((service) => (
              <button
                key={service.name}
                type="button"
                aria-label={`${t.chooseService} ${service.name}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(service)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50 active:scale-[0.99]"
              >
                <SubscriptionLogo name={service.name} className="size-8 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-slate-800">{service.name}</span>
                  <span className="block truncate text-[11px] font-semibold text-slate-400">
                    {[service.category, formatEuroHints(service.priceHints)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="hidden truncate text-[11px] font-semibold text-slate-400 sm:block">{service.domain}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {showUnknown && (
        <div className="floating-menu-enter absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-[12px] font-bold leading-relaxed text-amber-700 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)]">
          {t.serviceUnknownNotified}
        </div>
      )}
    </div>
  );
}

function PaymentLogo({ name }) {
  const [source, setSource] = useState("logo");
  const logo = getPaymentMethodLogo(name);
  const showImage = logo?.hasLogo && source !== "fallback";
  const imageSrc = source === "favicon" ? logo?.fallbackUrl : logo?.url;

  useEffect(() => {
    setSource("logo");
  }, [logo?.domain]);

  return (
    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
      {showImage ? (
        <img
          src={imageSrc}
          alt={`${logo.brand} logo`}
          className="size-full object-contain p-1.5"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setSource((current) => (current === "logo" ? "favicon" : "fallback"))}
        />
      ) : (
        <span className="grid size-full place-items-center text-[11px] font-black" style={logo?.style}>
          {logo?.initials ?? "?"}
        </span>
      )}
    </span>
  );
}

function PaymentMethodInput({ t, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const suggestions = getPaymentMethodSuggestions(value, 8);
  const showSuggestions = focused && suggestions.length > 0;

  const selectSuggestion = (method) => {
    onChange(method.name);
    setFocused(false);
  };

  return (
    <div className="relative">
      <div className="flex w-full min-w-0 items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3.5 transition-all focus-within:border-slate-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-slate-100">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F4F0FF] text-[#7047EB]">
          <i className="ph-fill ph-credit-card text-lg" />
        </span>
        <input
          aria-label={t.paymentMethod}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          placeholder={t.paymentMethodPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-bold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
      {showSuggestions && (
        <div className="floating-menu-enter absolute bottom-[calc(100%+8px)] left-0 right-0 top-auto z-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)] sm:bottom-auto sm:top-[calc(100%+8px)]">
          <div className="grid max-h-56 gap-1 overflow-y-auto no-scrollbar sm:max-h-64">
            {suggestions.map((method) => (
              <button
                key={method.name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(method)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 active:scale-[0.99]"
              >
                <PaymentLogo name={method.name} />
                <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-800">{method.name}</span>
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

function getCurrentMonthDays(monthDate) {
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), index + 1);
    return {
      date,
      value: formatDateValue(date),
      inCurrentMonth: true
    };
  });
}

function CalendarPanel({ t, language, value, visibleMonth, setVisibleMonth, onSelect, onClose, mobile = false }) {
  const today = new Date();
  const todayValue = formatDateValue(today);
  const calendarDays = mobile ? getCurrentMonthDays(visibleMonth) : getCalendarDays(visibleMonth);
  const weekDays = language === "fr" ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div data-calendar-panel="true" className={`${mobile ? "animate-[calendar-sheet_180ms_ease-out] rounded-[22px] p-2.5" : "animate-[calendar-pop_160ms_ease-out] rounded-[20px] p-3"} border border-slate-200 bg-white shadow-[0_22px_60px_-24px_rgba(15,23,42,0.45)]`}>
      {mobile && (
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.renewalDate}</p>
            <p className="mt-0.5 truncate text-sm font-black text-slate-900">{formatSelectedDate(value, language) || t.noDateSelected}</p>
          </div>
          <button type="button" aria-label={t.closeModal} onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
            <i className="ph-bold ph-x text-sm" />
          </button>
        </div>
      )}

      <div className={`${mobile ? "mb-2" : "mb-2.5"} flex items-center justify-between gap-2`}>
        <button
          type="button"
          aria-label={t.previousMonth}
          onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
          className={`${mobile ? "size-8" : "size-9"} grid place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#7047EB]/30 hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-95`}
        >
          <i className="ph-bold ph-caret-left text-sm" />
        </button>
        <p className={`${mobile ? "text-[13px]" : "text-[15px]"} min-w-0 flex-1 truncate text-center font-black capitalize text-slate-900`}>
          {getMonthLabel(visibleMonth, language)}
        </p>
        <button
          type="button"
          aria-label={t.nextMonth}
          onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
          className={`${mobile ? "size-8" : "size-9"} grid place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#7047EB]/30 hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-95`}
        >
          <i className="ph-bold ph-caret-right text-sm" />
        </button>
      </div>

      <div className={`${mobile ? "mb-1 grid grid-cols-7 gap-0.5 text-[9px]" : "mb-1.5 grid grid-cols-7 gap-0.5 text-[10px]"} text-center font-black uppercase tracking-wider text-slate-400`}>
        {weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className={`grid grid-cols-7 ${mobile ? "gap-0.5" : "gap-0.5"}`}>
        {calendarDays.map((day) => {
          const isSelected = value === day.value;
          const isToday = day.value === todayValue;
          return (
            <button
              key={day.value}
              type="button"
              aria-label={`${t.selectDate} ${formatSelectedDate(day.value, language)}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(day.value)}
              className={`grid w-full place-items-center rounded-lg font-black transition active:scale-95 ${mobile ? "h-6 text-[10px]" : "h-8 text-[12px] sm:h-9"} ${
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
        onClick={() => onSelect(todayValue)}
        className={`${mobile ? "mt-1.5 py-1.5 text-[11px]" : "mt-2 py-2 text-[12px]"} w-full rounded-xl bg-slate-100 px-3 font-black text-slate-600 transition hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-[0.98]`}
      >
        {t.today}
      </button>
    </div>
  );
}

function RenewalDateInput({ t, language, value, error, onChange }) {
  const selectedLabel = formatSelectedDate(value, language);
  const selectedDate = parseDateValue(value);
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? today);
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 360 });
  const fieldRef = useRef(null);
  const popoverRef = useRef(null);
  const buttonLabel = selectedLabel ? `${t.renewalDate}: ${selectedLabel}` : t.renewalDate;

  const updatePosition = () => {
    const rect = fieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    const preferredWidth = Math.min(Math.max(rect.width, 320), window.innerWidth - 24);
    const left = Math.min(Math.max(rect.left, 12), window.innerWidth - preferredWidth - 12);
    const estimatedHeight = 328;
    const naturalTop = rect.bottom + 8;
    const maxTop = window.innerHeight - estimatedHeight - 12;
    setPosition({
      left,
      top: Math.max(12, Math.min(naturalTop, maxTop)),
      width: preferredWidth
    });
  };

  const close = () => setOpen(false);

  const selectDate = (nextValue) => {
    onChange(nextValue);
    close();
  };

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [value]);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const query = window.matchMedia("(min-width: 1024px)");
    const updateMode = () => setIsDesktop(query.matches);
    updateMode();
    query.addEventListener?.("change", updateMode);
    return () => query.removeEventListener?.("change", updateMode);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();

    const handlePointerDown = (event) => {
      if (fieldRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) {
        return;
      }
      close();
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };
    const handleResize = () => updatePosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [open]);

  const desktopPopover = open && isDesktop ? createPortal(
    <div
      ref={popoverRef}
      className="fixed z-[95] hidden lg:block"
      style={{ left: `${position.left}px`, top: `${position.top}px`, width: `${position.width}px` }}
    >
      <CalendarPanel
        t={t}
        language={language}
        value={value}
        visibleMonth={visibleMonth}
        setVisibleMonth={setVisibleMonth}
        onSelect={selectDate}
        onClose={close}
      />
    </div>,
    document.body
  ) : null;

  const mobilePopover = open && !isDesktop ? createPortal(
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-transparent px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden" onMouseDown={close}>
      <div ref={popoverRef} className="w-full max-w-[360px]" onMouseDown={(event) => event.stopPropagation()}>
        <CalendarPanel
          t={t}
          language={language}
          value={value}
          visibleMonth={visibleMonth}
          setVisibleMonth={setVisibleMonth}
          onSelect={selectDate}
          onClose={close}
          mobile
        />
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={fieldRef} className="relative">
      <button
        type="button"
        aria-label={buttonLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full min-w-0 items-center gap-3 rounded-[18px] border bg-slate-50 p-3.5 text-left transition-all active:scale-[0.99] ${
          error ? "border-red-200 ring-4 ring-red-50" : "border-slate-200 hover:border-slate-300 hover:bg-white focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        }`}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F4F0FF] text-[#7047EB]">
          <i className="ph-fill ph-calendar-blank text-lg" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-black uppercase tracking-widest text-slate-400">{t.dateSelected}</span>
          <span className="mt-0.5 block truncate text-[14px] font-bold capitalize text-slate-900">{selectedLabel || t.noDateSelected}</span>
        </span>
        <i className={`ph-bold ph-caret-down shrink-0 text-sm text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

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
      {desktopPopover}
      {mobilePopover}
    </div>
  );
}

export function SubscriptionModal({ t, language = "fr", subscription, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormData(subscription ?? emptySubscription));
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const isEditing = Boolean(subscription);

  const findCategoryId = (categoryName) => {
    const normalizedTarget = normalizeServiceName(categoryName);
    if (!normalizedTarget) return "";

    const aliases = {
      music: ["music", "musique"],
      streaming: ["streaming"],
      software: ["software", "logiciel", "logiciels"],
      fitness: ["fitness", "sport"],
      other: ["other", "autre"]
    };
    const acceptedNames = aliases[normalizedTarget] ?? [normalizedTarget];

    return categories.find((category) => acceptedNames.includes(normalizeServiceName(category.name)))?.id ?? "";
  };

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const selectServiceSuggestion = (service) => {
    const plan = getServicePlanSuggestion(service.name);
    const categoryId = findCategoryId(plan?.category);
    const defaultPrice = plan?.defaultPrice;

    setForm((prev) => {
      const shouldSuggestPrice = !prev.price && defaultPrice !== null && defaultPrice !== undefined;

      return {
        ...prev,
        name: service.name,
        categoryId: prev.categoryId || categoryId || "",
        price: shouldSuggestPrice ? String(defaultPrice) : prev.price
      };
    });
    setError("");
    setFieldErrors((prev) => {
      const { name: _name, price: _price, ...rest } = prev;
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
    <div
      className="modal-backdrop-enter fixed inset-0 z-[80] flex items-end justify-center overscroll-contain bg-slate-900/40 p-0 backdrop-blur-[2px] lg:items-center lg:p-6"
      onMouseDown={onClose}
    >
      <div
        className="subscription-modal-panel flex max-h-[calc(100dvh-12px)] min-h-0 w-full max-w-full touch-pan-y flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:max-h-[min(92dvh,760px)] lg:max-w-3xl lg:rounded-[32px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain bg-white p-4 sm:gap-5 sm:p-6">
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
                onSelectService={selectServiceSuggestion}
              />
            </Field>
            <Field label={t.price} error={fieldErrors.price}>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[14px] font-bold text-slate-400">€</span>
                <input aria-label={t.price} aria-invalid={Boolean(fieldErrors.price)} type="text" inputMode="decimal" value={form.price} onChange={(event) => change("price", event.target.value)} placeholder="0,00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
                <div className="mt-2 flex gap-2">
                  {priceShortcuts.map((shortcut) => (
                    <button
                      key={shortcut}
                      type="button"
                      aria-label={`${t.priceShortcut} ${shortcut}`}
                      onClick={() => change("price", applyPriceShortcut(form.price, shortcut))}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-black text-slate-500 transition hover:border-[#7047EB]/20 hover:bg-[#F4F0FF] hover:text-[#7047EB] active:scale-95"
                    >
                      {shortcut}
                    </button>
                  ))}
                </div>
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
              <PaymentMethodInput
                t={t}
                value={form.paymentMethod}
                onChange={(value) => change("paymentMethod", value)}
              />
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

        <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.85rem)] sm:px-6 sm:py-5 sm:pb-8">
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
