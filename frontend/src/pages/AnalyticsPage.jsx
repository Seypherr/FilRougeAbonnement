import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StatePanel } from "../components/StatePanel.jsx";
import { SubscriptionLogo } from "../components/SubscriptionLogo.jsx";
import { getLanguageLocale, translateCategoryName } from "../i18n/dictionaries.js";
import { formatMoney, getSubscriptionStats, parseCalendarDate } from "../utils/subscriptions.js";

const colors = ["#8255FF", "#0055FF", "#00C48C", "#CBD5E1", "#F59E0B"];

function CategoryBar({ name, amount, width, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[13px] font-bold text-slate-700">{name}</span>
        </div>
        <span className="text-[13px] font-bold text-slate-800">{amount}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width, backgroundColor: color }} />
      </div>
    </div>
  );
}

function formatRenewalDate(value, language) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(getLanguageLocale(language), {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(parseCalendarDate(value) ?? new Date(value));
}

function buildPieGradient(entries) {
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!total) return "conic-gradient(#e2e8f0 0deg 360deg)";

  let progress = 0;
  return `conic-gradient(${entries.map(([, value], index) => {
    const start = progress;
    progress += (value / total) * 360;
    return `${colors[index % colors.length]} ${start}deg ${progress}deg`;
  }).join(", ")})`;
}

function CategoryPie({ entries, t, money }) {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(10rem,0.72fr)_minmax(0,1fr)]">
      <div className="mx-auto grid size-44 place-items-center rounded-full" style={{ background: buildPieGradient(entries) }}>
        <div className="grid size-28 place-items-center rounded-full bg-white text-center shadow-sm">
          <span className="text-xs font-bold text-slate-400">{t.categories}</span>
          <span className="-mt-3 text-lg font-black text-slate-900">{entries.length}</span>
        </div>
      </div>
      <div className="grid gap-3">
        {entries.map(([name, value], index) => (
          <div key={name} className="flex min-w-0 items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-bold text-slate-700"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="truncate">{translateCategoryName(name, t)}</span></span>
            <span className="shrink-0 font-black text-slate-900">{money(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRenewalDaysForMonth(subscription, year, month) {
  const renewalDate = parseCalendarDate(subscription.renewalDate);
  if (!renewalDate) return [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  if (subscription.billingCycle === "MONTHLY") {
    return [Math.min(renewalDate.getDate(), daysInMonth)];
  }
  if (subscription.billingCycle === "ANNUAL") {
    return renewalDate.getMonth() === month ? [Math.min(renewalDate.getDate(), daysInMonth)] : [];
  }
  if (subscription.billingCycle === "WEEKLY") {
    const renewalWeekday = renewalDate.getDay();
    const firstWeekday = new Date(year, month, 1).getDay();
    const firstRenewalDay = 1 + (renewalWeekday - firstWeekday + 7) % 7;
    return Array.from({ length: Math.ceil((daysInMonth - firstRenewalDay + 1) / 7) }, (_, index) => firstRenewalDay + index * 7)
      .filter((day) => day <= daysInMonth);
  }

  return renewalDate.getFullYear() === year && renewalDate.getMonth() === month ? [renewalDate.getDate()] : [];
}

function getRenewalDensityStyle(count, maxCount) {
  if (!count) return { className: "text-slate-700", style: undefined };
  const density = Math.max(1, Math.ceil((count / maxCount) * 5));
  const backgrounds = ["#F0EBFF", "#DDD2FF", "#C4B0FF", "#9B76F5", "#7047EB"];
  return {
    className: density >= 4 ? "text-white" : "text-[#5F3CC5]",
    style: { backgroundColor: backgrounds[density - 1] }
  };
}

function RenewalCalendar({ subscriptions, t, language }) {
  const [calendarDate, setCalendarDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const locale = getLanguageLocale(language);
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const renewalsByDay = subscriptions
    .filter((subscription) => subscription.status === "ACTIVE")
    .reduce((counts, subscription) => {
      getRenewalDaysForMonth(subscription, year, month).forEach((day) => {
        counts[day] = (counts[day] ?? 0) + 1;
      });
      return counts;
    }, {});
  const hasRenewals = Object.keys(renewalsByDay).length > 0;
  const maxRenewalCount = Math.max(...Object.values(renewalsByDay), 1);
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(calendarDate);
  const cells = Array.from({ length: Math.ceil((firstDayOffset + daysInMonth) / 7) * 7 }, (_, index) => index - firstDayOffset + 1);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <button type="button" aria-label={t.previousMonth} onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"><i className="ph-bold ph-caret-left" /></button>
        <p className="min-w-0 truncate text-center text-sm font-black capitalize text-slate-900">{monthLabel}</p>
        <button type="button" aria-label={t.nextMonth} onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"><i className="ph-bold ph-caret-right" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {Array.from({ length: 7 }, (_, index) => <span key={index} className="py-1 text-[11px] font-black uppercase text-slate-400">{weekdayFormatter.format(new Date(2024, 0, 1 + index))}</span>)}
        {cells.map((day, index) => {
          const count = renewalsByDay[day] ?? 0;
          const inMonth = day > 0 && day <= daysInMonth;
          const density = getRenewalDensityStyle(count, maxRenewalCount);
          return (
            <div key={`${day}-${index}`} aria-label={count ? t.renewalsCount.replace("{count}", count) : undefined} className={`grid min-h-10 place-items-center rounded-xl text-xs font-black ${inMonth ? density.className : "text-transparent"}`} style={inMonth ? density.style : undefined}>
              {inMonth && <span>{day}</span>}
            </div>
          );
        })}
      </div>
      {!hasRenewals && <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-500">{t.noRenewalsThisMonth}</p>}
    </div>
  );
}

function HighestSubscriptionModal({ t, language, currency, subscription, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/45 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:place-items-center sm:p-6" onMouseDown={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="highest-subscription-title"
        className="w-full max-w-lg rounded-t-[28px] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[28px] sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t.analytics}</p>
            <h2 id="highest-subscription-title" className="mt-1 text-xl font-black text-slate-950">{t.highestSubscription}</h2>
          </div>
          <button type="button" aria-label={t.closeModal} onClick={onClose} className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <i className="ph ph-x text-lg" />
          </button>
        </header>

        {subscription ? (
          <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <SubscriptionLogo name={subscription.name} className="size-16 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-black text-slate-950">{subscription.name}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">{translateCategoryName(subscription.category?.name, t)}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.monthlyTotal}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{formatMoney(subscription.monthlyAmount, currency, getLanguageLocale(language))}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.renewalDate}</p>
                <p className="mt-2 text-base font-black text-slate-950">{formatRenewalDate(subscription.renewalDate, language)}</p>
              </div>
            </div>
          </div>
        ) : (
          <StatePanel title={t.emptyAnalyticsTitle} message={t.emptyAnalyticsMessage} tone="empty" icon="ph-crown" />
        )}
      </section>
    </div>
    , document.body
  );
}

export function AnalyticsPage({ t, language = "fr", currency = "EUR", subscriptions, totalMonthlyAmount, loading, error, setTab }) {
  const money = (value) => formatMoney(value, currency, getLanguageLocale(language));
  const [period, setPeriod] = useState("month");
  const [chartType, setChartType] = useState("bars");
  const [highestModalOpen, setHighestModalOpen] = useState(false);
  const stats = getSubscriptionStats(subscriptions, totalMonthlyAmount);
  const total = period === "year" ? stats.totalYearly : totalMonthlyAmount;
  const categoryEntries = Object.entries(stats.categoryTotals);
  const maxCategory = Math.max(...categoryEntries.map(([, value]) => value), 1);
  const highestSubscription = stats.topCosts[0] ?? null;

  if (loading) {
    return (
      <div className="mobile-page min-h-[100svh] bg-[#F8F9FB] p-5 lg:min-h-0 lg:bg-transparent">
        <StatePanel title={t.loadingAnalytics} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-page min-h-[100svh] bg-[#F8F9FB] p-5 lg:min-h-0 lg:bg-transparent">
        <StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" />
      </div>
    );
  }

  return (
    <div className="mobile-page min-h-[100svh] overflow-x-hidden bg-[#F8F9FB] text-slate-900 lg:min-h-0 lg:rounded-[32px] lg:bg-transparent lg:pb-8">
      <div className="relative lg:hidden">
        <div className="absolute left-0 top-0 z-0 h-[360px] w-full rounded-b-[48px] bg-[linear-gradient(145deg,#6C51FF_0%,#9542FF_100%)]" />
        <header className="mobile-top-safe relative z-30 flex items-center justify-between px-5 pb-4 sm:px-6">
          <button
            type="button"
            aria-label={t.backToDashboard}
            className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/20"
            onClick={() => setTab("dashboard")}
          >
            <i className="ph-bold ph-caret-left text-lg" />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight text-white">{t.analytics}</h1>
          <div className="w-10" />
        </header>

        <div className="relative z-20 mb-6 mt-2 px-5 sm:px-6">
          <div className="relative flex w-full items-center rounded-xl bg-[#6E3BEA] p-1.5">
            <div className={`absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ${period === "year" ? "translate-x-full" : "translate-x-0"}`} />
            <button onClick={() => setPeriod("month")} className="relative z-10 flex-1 py-2 text-[13px] font-bold transition-colors" style={{ color: period === "month" ? "#8255FF" : "rgba(255,255,255,0.8)" }}>{t.thisMonth}</button>
            <button onClick={() => setPeriod("year")} className="relative z-10 flex-1 py-2 text-[13px] font-semibold transition-colors" style={{ color: period === "year" ? "#8255FF" : "rgba(255,255,255,0.8)" }}>{t.thisYear}</button>
          </div>
        </div>

        <section className="relative z-10 mb-6 px-6">
          <div className="flex flex-col items-center border-none bg-transparent p-4">
            <span className="mb-2 text-[13px] font-medium tracking-wide text-white/80">{t.totalSpend}</span>
            <div className="mb-2 flex items-baseline justify-center gap-1.5">
              <span className="max-w-full truncate text-4xl font-bold leading-none tracking-tight text-white">{money(total)}</span>
            </div>
            <div className="mx-auto mt-2 flex w-max items-center justify-center gap-3 rounded-[12px] px-4 py-2" style={{ backgroundColor: "#6E3BEA" }}>
              <i className="ph-fill ph-calendar-blank text-sm text-white/80" />
              <span className="text-xs font-medium text-white/80">{t.estimatedYearly}</span>
              <span className="text-xs font-bold text-white">{money(stats.totalYearly)}</span>
            </div>
          </div>
        </section>

        <section className="relative z-10 mb-8 grid grid-cols-2 gap-3 px-5 sm:px-6">
          <div className="grid min-w-0 items-center gap-x-3 gap-y-0.5 rounded-[24px] bg-white p-3.5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]" style={{ gridTemplateColumns: "auto minmax(0,1fr)" }}>
            <div className="row-span-2 flex size-11 items-center justify-center rounded-full bg-[#E8F8F0]">
              <i className="ph-bold ph-trend-up text-xl text-[#00C48C]" />
            </div>
            <span className="self-end text-[10px] font-bold uppercase leading-tight tracking-wide text-slate-400">{t.averageCost}</span>
            <span className="self-start text-[20px] font-bold leading-none text-slate-800">{money(stats.averageMonthly)}</span>
          </div>
          <button type="button" onClick={() => setHighestModalOpen(true)} className="grid min-w-0 items-center gap-x-3 gap-y-0.5 rounded-[24px] bg-white p-3.5 text-left shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(15,23,42,0.35)] active:scale-[0.99]" style={{ gridTemplateColumns: "auto minmax(0,1fr)" }}>
            <div className="row-span-2 flex size-11 items-center justify-center rounded-full bg-[#F1F3F5]">
              <i className="ph-bold ph-crown text-xl text-slate-500" />
            </div>
            <span className="self-end text-[10px] font-bold uppercase leading-tight tracking-wide text-slate-400">{t.highestSubscription}</span>
            <span className="self-start text-[20px] font-bold leading-none text-slate-800">{money(stats.highestMonthly)}</span>
          </button>
        </section>
      </div>

      <div className="hidden lg:block">
        <section className="rounded-[32px] bg-[linear-gradient(145deg,#6C51FF_0%,#9542FF_100%)] p-8 text-center text-white shadow-[0_14px_34px_-16px_rgba(123,66,255,0.65)]">
          <p className="text-sm font-medium text-white/80">{t.totalSpend}</p>
          <p className="mt-2 text-[64px] font-bold leading-none">{money(total)}</p>
          <div className="mx-auto mt-5 flex max-w-sm rounded-xl bg-[#6E3BEA] p-1.5">
            <button onClick={() => setPeriod("month")} className={`flex-1 rounded-lg py-2 text-sm font-bold ${period === "month" ? "bg-white text-[#8255FF]" : "text-white/80"}`}>{t.thisMonth}</button>
            <button onClick={() => setPeriod("year")} className={`flex-1 rounded-lg py-2 text-sm font-bold ${period === "year" ? "bg-white text-[#8255FF]" : "text-white/80"}`}>{t.thisYear}</button>
          </div>
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] bg-white p-5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.monthlyTotal}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{money(totalMonthlyAmount)}</p>
          </div>
          <div className="rounded-[20px] bg-white p-5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.averageCost}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{money(stats.averageMonthly)}</p>
          </div>
          <button type="button" onClick={() => setHighestModalOpen(true)} className="rounded-[20px] bg-white p-5 text-left shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-20px_rgba(15,23,42,0.35)] active:scale-[0.99]">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{t.highestSubscription}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{money(stats.highestMonthly)}</p>
          </button>
        </section>
      </div>

      <section className="relative z-10 mb-8 px-5 sm:px-6 lg:mt-8 lg:px-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <h2 className="text-[17px] font-bold text-slate-800">{t.categories}</h2>
          <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label={t.statistics}>
            {[
              ["bars", "ph-chart-bar", t.chartBars],
              ["pie", "ph-chart-pie-slice", t.chartPie],
              ["calendar", "ph-calendar-blank", t.chartCalendar]
            ].map(([type, icon, label]) => <button key={type} type="button" aria-pressed={chartType === type} onClick={() => setChartType(type)} className={`flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-black transition ${chartType === type ? "bg-white text-[#7047EB] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><i className={`ph-bold ${icon} text-sm`} /><span className="hidden sm:inline">{label}</span></button>)}
          </div>
        </div>
        <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
          {chartType === "calendar" ? (
            <RenewalCalendar subscriptions={subscriptions} t={t} language={language} />
          ) : categoryEntries.length === 0 ? (
            <StatePanel title={t.emptyAnalyticsTitle} message={t.emptyAnalyticsMessage} tone="empty" icon="ph-chart-pie-slice" />
          ) : chartType === "pie" ? (
            <CategoryPie entries={categoryEntries} t={t} money={money} />
          ) : (
            categoryEntries.map(([name, value], index) => (
              <CategoryBar key={name} name={translateCategoryName(name, t)} amount={money(value)} width={`${Math.max((value / maxCategory) * 100, 6)}%`} color={colors[index % colors.length]} />
            ))
          )}
        </div>
      </section>

      <section className="relative z-10 mb-4 px-5 sm:px-6 lg:px-0">
        <h2 className="mb-4 px-1 text-[17px] font-bold text-slate-800">{t.topCosts}</h2>
        <div className="flex flex-col gap-3.5">
          {stats.topCosts.length === 0 ? (
            <StatePanel title={t.emptyAnalyticsTitle} message={t.emptyAnalyticsMessage} tone="empty" icon="ph-chart-bar" />
          ) : (
            stats.topCosts.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)]">
                <SubscriptionLogo name={item.name} className="size-10 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-slate-800">{item.name}</p>
                  <p className="truncate text-[13px] font-medium text-slate-500">{translateCategoryName(item.category?.name, t)}</p>
                </div>
                <p className="shrink-0 text-[15px] font-bold text-slate-800">{money(item.monthlyAmount)}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {highestModalOpen && (
        <HighestSubscriptionModal
          t={t}
          language={language}
          currency={currency}
          subscription={highestSubscription}
          onClose={() => setHighestModalOpen(false)}
        />
      )}
    </div>
  );
}
