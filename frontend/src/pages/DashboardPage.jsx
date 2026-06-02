import { StatePanel } from "../components/StatePanel.jsx";
import { formatMoney, getSubscriptionStats } from "../utils/subscriptions.js";

function getDaysUntil(dateValue) {
  const today = new Date();
  const due = new Date(dateValue);
  return Math.ceil((due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
}

function getDueLabel(dateValue, t) {
  const diff = getDaysUntil(dateValue);
  if (diff < 0) return { text: t.overdue, urgent: true };
  if (diff === 0) return { text: t.today, urgent: true };
  if (diff === 1) return { text: t.tomorrow, urgent: true };
  return { text: t.inDays.replace("{count}", diff), urgent: diff <= 7 };
}

function getServiceStyle(index) {
  const styles = [
    { icon: "ph-film-strip", iconColor: "text-rose-500", bgColor: "bg-rose-50" },
    { icon: "ph-music-notes", iconColor: "text-emerald-500", bgColor: "bg-emerald-50" },
    { icon: "ph-pen-nib", iconColor: "text-blue-500", bgColor: "bg-blue-50" },
    { icon: "ph-figma-logo", iconColor: "text-fuchsia-500", bgColor: "bg-fuchsia-50" },
    { icon: "ph-credit-card", iconColor: "text-violet-500", bgColor: "bg-violet-50" }
  ];
  return styles[index % styles.length];
}

function RenewalCard({ t, item, index, desktop = false }) {
  const style = getServiceStyle(index);
  const due = getDueLabel(item.renewalDate, t);
  return (
    <div className={`flex items-center gap-4 bg-white transition-all ${desktop ? "rounded-[20px] px-6 py-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)]" : "rounded-[20px] p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)]"}`}>
      <div className={`${desktop ? "size-10" : "size-[52px]"} flex shrink-0 items-center justify-center rounded-full ${style.bgColor}`}>
        <i className={`ph-fill ${style.icon} ${desktop ? "text-xl" : "text-2xl"} ${style.iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-bold leading-tight text-slate-800">{item.name}</h3>
        <p className="mt-0.5 truncate text-[13px] font-medium text-slate-500">{item.category?.name ?? "Student Plan"}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1 text-right">
        {desktop ? (
          <span className={`text-xs ${due.urgent ? "rounded-md bg-rose-100 px-2 py-1 font-bold uppercase tracking-widest text-rose-600" : "font-medium text-slate-400"}`}>{due.text}</span>
        ) : (
          <>
            <span className="text-[15px] font-bold leading-tight text-slate-800">{formatMoney(item.price)}</span>
            <span className={`mt-0.5 ${due.urgent ? "rounded-md bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest leading-none text-rose-600" : "text-[12px] font-medium text-slate-400"}`}>{due.text}</span>
          </>
        )}
        {desktop && <span className="text-[15px] font-bold text-slate-800">{formatMoney(item.price)}</span>}
      </div>
    </div>
  );
}

export function DashboardPage({ t, subscriptions, totalMonthlyAmount, loading, error, user, setTab, onAddSubscription }) {
  const stats = getSubscriptionStats(subscriptions, totalMonthlyAmount);
  const renewals = stats.upcomingRenewals.slice(0, 5);
  const dueNext7Days = stats.upcomingRenewals
    .filter((item) => {
      const daysUntil = getDaysUntil(item.renewalDate);
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .reduce((sum, item) => sum + Number(item.monthlyAmount ?? 0), 0);
  const displayName = user?.name ?? "User";
  const avatarName = encodeURIComponent(displayName);

  return (
    <>
      <div className="relative min-h-screen overflow-x-hidden bg-[#F8F9FB] pb-32 lg:hidden">
        <div className="absolute left-0 top-0 z-0 h-[360px] w-full rounded-b-[48px] bg-[linear-gradient(145deg,#6C51FF_0%,#9542FF_100%)]" />
        <main className="relative z-10 flex min-h-screen flex-col">
          <header className="relative z-20 flex items-center justify-between px-6 pb-6 pt-12">
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">{t.welcomeBack}</span>
              <h1 className="max-w-[220px] truncate text-xl font-bold tracking-tight text-white">{displayName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={t.openProfile}
                className="flex size-11 items-center justify-center overflow-hidden rounded-[14px] border border-white/30 bg-transparent text-sm font-bold text-white shadow-sm transition hover:bg-white/10"
                onClick={() => setTab("profile")}
              >
                <img src={`https://ui-avatars.com/api/?name=${avatarName}&background=E0E7FF&color=4338CA&bold=true`} alt="Profile" className="size-full object-cover" />
              </button>
            </div>
          </header>

          <section className="relative z-10 px-6">
            <div className="flex w-full flex-col items-center pb-8 pt-2 text-white">
              <span className="text-[13px] font-medium text-white/80">{t.monthlySpending}</span>
              <div className="mt-4 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-semibold text-white/70">$</span>
                <span className="text-[58px] font-bold leading-none tracking-tight text-white">{Number(totalMonthlyAmount || 0).toFixed(2)}</span>
              </div>
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/15 px-4 py-2 backdrop-blur-md">
                  <i className="ph-fill ph-calendar-blank text-sm text-white/80" />
                  <span className="text-xs font-medium text-white/80">{t.estimatedYearly}</span>
                  <span className="text-xs font-bold text-white">{formatMoney(stats.totalYearly)}</span>
                </div>
              </div>
            </div>

            <div className="-mt-2 flex gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[24px] bg-white p-3.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <i className="ph-fill ph-check-circle text-[22px] text-emerald-500" />
                </div>
                <div className="flex flex-col-reverse items-start">
                  <span className="mt-1 text-[26px] font-bold leading-none text-slate-800">{stats.active.length}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.active}</span>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[24px] bg-white p-3.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.06)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <i className="ph-fill ph-archive-box text-[22px] text-slate-500" />
                </div>
                <div className="flex flex-col-reverse items-start">
                  <span className="mt-1 text-[26px] font-bold leading-none text-slate-800">{stats.archived.length}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t.archived}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="relative z-20 mt-8 flex flex-1 flex-col px-6">
            <div className="mb-5 flex items-center justify-between px-1">
              <h2 className="text-[18px] font-bold text-slate-800">{t.nextRenewals}</h2>
              <button type="button" aria-label={t.viewAllSubscriptions} onClick={() => setTab("subscriptions")} className="rounded-lg bg-[#6C51FF]/10 px-3 py-1.5 text-[13px] font-semibold text-[#6C51FF] transition-colors hover:bg-[#6C51FF]/20">
                {t.seeAll}
              </button>
            </div>
            <div className="flex flex-col gap-3.5">
              {loading ? (
                <StatePanel title={t.loadingDashboard} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" />
              ) : error ? (
                <StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" />
              ) : renewals.length === 0 ? (
                <StatePanel title={t.emptyRenewalsTitle} message={t.emptyRenewalsMessage} tone="empty" icon="ph-calendar-x" />
              ) : (
                renewals.map((item, index) => <RenewalCard key={item.id} t={t} item={item} index={index} />)
              )}
            </div>
          </section>
        </main>
      </div>

      <div className="hidden lg:block">
        <div className="grid gap-6 xl:grid-cols-[1fr_180px_180px]">
          <section className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#7B42FF_0%,#6C51FF_100%)] p-8 text-white shadow-[0_14px_34px_-16px_rgba(123,66,255,0.65)]">
            <div className="absolute left-1/4 top-1/2 size-24 rounded-full bg-white/5" />
            <div className="absolute bottom-0 right-24 size-32 rounded-full bg-white/5" />
            <div className="relative z-10 text-center">
              <p className="text-sm font-medium tracking-wide text-white/90">{t.monthlyTotal}</p>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-[56px] font-bold leading-none tracking-tight text-white">{formatMoney(totalMonthlyAmount).replace("$", "$")}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white/70">{t.dueNext7Days}: {formatMoney(dueNext7Days)}</p>
            </div>
          </section>
          <section className="flex flex-col justify-between rounded-[24px] bg-[linear-gradient(145deg,#7B42FF_0%,#6C51FF_100%)] p-6 text-white shadow-[0_14px_34px_-18px_rgba(123,66,255,0.65)]">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15">
              <i className="ph-fill ph-calendar-blank text-xl" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-white/80">{t.estimatedYearly}</p>
              <p className="text-3xl font-bold">{formatMoney(stats.totalYearly)}</p>
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <div className="flex flex-1 items-center justify-between rounded-[24px] bg-white p-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)]">
              <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.active}</p><p className="mt-2 text-3xl font-bold text-slate-800">{stats.active.length}</p></div>
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50"><i className="ph-fill ph-check-circle text-xl text-emerald-500" /></div>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-[24px] bg-white p-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)]">
              <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.archived}</p><p className="mt-2 text-3xl font-bold text-slate-800">{stats.archived.length}</p></div>
              <div className="flex size-12 items-center justify-center rounded-full bg-slate-100"><i className="ph-fill ph-archive-box text-xl text-slate-500" /></div>
            </div>
          </section>
        </div>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between px-1">
            <h2 className="text-[18px] font-bold text-slate-900">{t.nextRenewals}</h2>
            <button type="button" aria-label={t.viewAllSubscriptions} onClick={() => setTab("subscriptions")} className="rounded-lg bg-[#F4F0FF] px-3.5 py-1.5 text-[13px] font-bold text-[#7B42FF] transition-colors hover:bg-[#EAE0FF]">{t.viewAll}</button>
          </div>
          <div className="flex flex-col gap-3">
            {loading ? (
              <StatePanel title={t.loadingDashboard} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" />
            ) : error ? (
              <StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" />
            ) : renewals.length === 0 ? (
              <StatePanel title={t.emptyRenewalsTitle} message={t.emptyRenewalsMessage} tone="empty" icon="ph-calendar-x" />
            ) : (
              renewals.map((item, index) => <RenewalCard key={item.id} t={t} item={item} index={index} desktop />)
            )}
          </div>
        </section>
      </div>
    </>
  );
}
