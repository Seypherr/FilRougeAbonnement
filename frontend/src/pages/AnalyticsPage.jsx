import { useState } from "react";
import { formatMoney, getSubscriptionStats } from "../utils/subscriptions.js";

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

export function AnalyticsPage({ t, subscriptions, totalMonthlyAmount, loading }) {
  const [period, setPeriod] = useState("month");
  const stats = getSubscriptionStats(subscriptions, totalMonthlyAmount);
  const total = period === "year" ? stats.totalYearly : totalMonthlyAmount;
  const categoryEntries = Object.entries(stats.categoryTotals);
  const maxCategory = Math.max(...categoryEntries.map(([, value]) => value), 1);

  if (loading) {
    return <div className="p-6 text-sm font-semibold text-slate-500">{t.loading}</div>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9FB] pb-32 text-slate-900 lg:min-h-0 lg:rounded-[32px] lg:bg-transparent lg:pb-8">
      <div className="relative lg:hidden">
        <div className="absolute left-0 top-0 z-0 h-[360px] w-full rounded-b-[48px] bg-[linear-gradient(145deg,#6C51FF_0%,#9542FF_100%)]" />
        <header className="relative z-30 flex items-center justify-between px-6 pb-4 pt-12">
          <div className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white shadow-sm transition-colors hover:bg-white/20">
            <i className="ph-bold ph-caret-left text-lg" />
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-white">Analytics</h1>
          <div className="w-10" />
        </header>

        <div className="relative z-20 mb-6 mt-2 px-6">
          <div className="relative flex w-full items-center rounded-xl bg-[#6E3BEA] p-1.5">
            <div className={`absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-lg bg-white shadow-sm transition-transform duration-300 ${period === "year" ? "translate-x-full" : "translate-x-0"}`} />
            <button onClick={() => setPeriod("month")} className="relative z-10 flex-1 py-2 text-[13px] font-bold transition-colors" style={{ color: period === "month" ? "#8255FF" : "rgba(255,255,255,0.8)" }}>This Month</button>
            <button onClick={() => setPeriod("year")} className="relative z-10 flex-1 py-2 text-[13px] font-semibold transition-colors" style={{ color: period === "year" ? "#8255FF" : "rgba(255,255,255,0.8)" }}>This Year</button>
          </div>
        </div>

        <section className="relative z-10 mb-6 px-6">
          <div className="flex flex-col items-center border-none bg-transparent p-4">
            <span className="mb-2 text-[13px] font-medium tracking-wide text-white/80">Total Spend</span>
            <div className="mb-2 flex items-baseline justify-center gap-1.5">
              <span className="text-4xl font-semibold text-white/70">$</span>
              <span className="text-[64px] font-bold leading-none tracking-tight text-white">{Number(total || 0).toFixed(2)}</span>
            </div>
            <div className="mx-auto mt-2 flex w-max items-center justify-center gap-3 rounded-[12px] px-4 py-2" style={{ backgroundColor: "#6E3BEA" }}>
              <i className="ph-fill ph-calendar-blank text-sm text-white/80" />
              <span className="text-xs font-medium text-white/80">Yearly Est.</span>
              <span className="text-xs font-bold text-white">{formatMoney(stats.totalYearly)}</span>
            </div>
          </div>
        </section>

        <section className="relative z-10 mb-8 grid grid-cols-2 gap-4 px-6">
          <div className="grid items-center gap-x-3 gap-y-0.5 rounded-[24px] bg-white p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]" style={{ gridTemplateColumns: "auto 1fr" }}>
            <div className="row-span-2 flex size-11 items-center justify-center rounded-full bg-[#E8F8F0]">
              <i className="ph-bold ph-trend-up text-xl text-[#00C48C]" />
            </div>
            <span className="self-end text-[11px] font-bold uppercase tracking-widest text-slate-400">Avg Cost</span>
            <span className="self-start text-[20px] font-bold leading-none text-slate-800">{formatMoney(stats.averageMonthly)}</span>
          </div>
          <div className="grid items-center gap-x-3 gap-y-0.5 rounded-[24px] bg-white p-4 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]" style={{ gridTemplateColumns: "auto 1fr" }}>
            <div className="row-span-2 flex size-11 items-center justify-center rounded-full bg-[#F1F3F5]">
              <i className="ph-bold ph-crown text-xl text-slate-500" />
            </div>
            <span className="self-end text-[11px] font-bold uppercase tracking-widest text-slate-400">Highest</span>
            <span className="self-start text-[20px] font-bold leading-none text-slate-800">{formatMoney(stats.highestMonthly)}</span>
          </div>
        </section>
      </div>

      <div className="hidden lg:block">
        <section className="rounded-[32px] bg-[linear-gradient(145deg,#6C51FF_0%,#9542FF_100%)] p-8 text-center text-white shadow-[0_14px_34px_-16px_rgba(123,66,255,0.65)]">
          <p className="text-sm font-medium text-white/80">Total Spend</p>
          <p className="mt-2 text-[64px] font-bold leading-none">{formatMoney(total)}</p>
          <div className="mx-auto mt-5 flex max-w-sm rounded-xl bg-[#6E3BEA] p-1.5">
            <button onClick={() => setPeriod("month")} className={`flex-1 rounded-lg py-2 text-sm font-bold ${period === "month" ? "bg-white text-[#8255FF]" : "text-white/80"}`}>This Month</button>
            <button onClick={() => setPeriod("year")} className={`flex-1 rounded-lg py-2 text-sm font-bold ${period === "year" ? "bg-white text-[#8255FF]" : "text-white/80"}`}>This Year</button>
          </div>
        </section>
      </div>

      <section className="relative z-10 mb-8 px-6 lg:mt-8 lg:px-0">
        <h2 className="mb-4 px-1 text-[17px] font-bold text-slate-800">Categories</h2>
        <div className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
          {categoryEntries.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400">{t.empty}</p>
          ) : (
            categoryEntries.map(([name, value], index) => (
              <CategoryBar key={name} name={name} amount={formatMoney(value)} width={`${Math.max((value / maxCategory) * 100, 6)}%`} color={colors[index % colors.length]} />
            ))
          )}
        </div>
      </section>

      <section className="relative z-10 mb-4 px-6 lg:px-0">
        <h2 className="mb-4 px-1 text-[17px] font-bold text-slate-800">Top Expenses</h2>
        <div className="flex flex-col gap-3.5">
          {stats.topCosts.length === 0 ? (
            <p className="rounded-[20px] bg-white p-5 text-sm font-semibold text-slate-400">{t.empty}</p>
          ) : (
            stats.topCosts.map((item, index) => (
              <div key={item.id} className="flex items-center gap-4 rounded-[20px] bg-white p-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#F4F0FF] text-[#8255FF]">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-slate-800">{item.name}</p>
                  <p className="text-[13px] font-medium text-slate-500">{item.category?.name ?? "Other"}</p>
                </div>
                <p className="text-[15px] font-bold text-slate-800">{formatMoney(item.monthlyAmount)}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
