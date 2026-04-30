import { Crown, TrendingUp, WalletCards } from "lucide-react";
import { Card } from "../components/Card.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { formatMoney, getSubscriptionStats } from "../utils/subscriptions.js";

export function AnalyticsPage({ t, subscriptions, totalMonthlyAmount, loading }) {
  const stats = getSubscriptionStats(subscriptions, totalMonthlyAmount);
  const categoryEntries = Object.entries(stats.categoryTotals);
  const maxCategory = Math.max(...categoryEntries.map(([, value]) => value), 1);

  if (loading) {
    return <Card>{t.loading}</Card>;
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[2rem] bg-violet-600 p-7 text-white shadow-2xl shadow-violet-200">
        <p className="text-center text-sm font-black text-violet-100">{t.totalMonthly}</p>
        <p className="mt-2 text-center text-5xl font-black tracking-normal">{formatMoney(totalMonthlyAmount)}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title={t.annualEstimate} value={formatMoney(stats.totalYearly)} icon={WalletCards} compact />
        <MetricCard title="Avg cost" value={formatMoney(stats.averageMonthly)} icon={TrendingUp} compact />
        <MetricCard title="Highest" value={formatMoney(stats.highestMonthly)} icon={Crown} compact />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-xl font-black">{t.byCategory}</h2>
          <div className="grid gap-4">
            {categoryEntries.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">{t.empty}</p>
            ) : (
              categoryEntries.map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm font-black">
                    <span>{label}</span>
                    <span>{formatMoney(value)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-violet-600" style={{ width: `${(value / maxCategory) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-xl font-black">{t.topCosts}</h2>
          <div className="grid gap-3">
            {stats.topCosts.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">{t.empty}</p>
            ) : (
              stats.topCosts.map((item, index) => (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4" key={item.id}>
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-full bg-violet-100 text-sm font-black text-violet-700">{index + 1}</div>
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm font-semibold text-slate-500">{item.category?.name ?? t.category}</p>
                    </div>
                  </div>
                  <p className="font-black">{formatMoney(item.monthlyAmount)}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
