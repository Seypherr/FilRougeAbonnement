import { Archive, CalendarDays, CheckCircle2, Plus, WalletCards } from "lucide-react";
import { Button } from "../components/Button.jsx";
import { Card } from "../components/Card.jsx";
import { MetricCard } from "../components/MetricCard.jsx";
import { formatMoney, getSubscriptionStats } from "../utils/subscriptions.js";

export function DashboardPage({ t, subscriptions, totalMonthlyAmount, loading, setTab, onAddSubscription }) {
  const stats = getSubscriptionStats(subscriptions, totalMonthlyAmount);

  return (
    <div className="grid gap-5">
      <section className="overflow-hidden rounded-[2rem] bg-violet-600 p-7 text-white shadow-2xl shadow-violet-200">
        <p className="text-center text-sm font-black text-violet-100">{t.totalMonthly}</p>
        <p className="mt-2 text-center text-5xl font-black tracking-normal">{loading ? "..." : formatMoney(totalMonthlyAmount)}</p>
        <div className="mx-auto mt-5 w-fit rounded-2xl bg-white/15 px-4 py-2 text-sm font-extrabold text-violet-50">
          {t.estimatedYearly}: {formatMoney(stats.totalYearly)}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title={t.activeSubscriptions} value={stats.active.length} icon={CheckCircle2} compact />
        <MetricCard title={t.archived} value={stats.archived.length} icon={Archive} compact />
        <MetricCard title={t.estimatedYearly} value={formatMoney(stats.totalYearly)} icon={WalletCards} compact />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">{t.nextRenewals}</h2>
            <Button variant="ghost" onClick={() => setTab("subscriptions")}>{t.all}</Button>
          </div>
          <div className="grid gap-3">
            {stats.upcomingRenewals.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">{t.noRenewals}</p>
            ) : (
              stats.upcomingRenewals.map((item) => (
                <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4" key={item.id}>
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="text-sm font-semibold text-slate-500">{item.category?.name ?? t.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black">{formatMoney(item.monthlyAmount)}</p>
                    <p className="text-xs font-semibold text-slate-400">{new Date(item.renewalDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="grid content-between gap-5">
          <div>
            <h2 className="text-xl font-black">{t.subscriptions}</h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">{subscriptions.slice(0, 4).map((item) => item.name).join(", ") || t.empty}</p>
          </div>
          <Button className="min-h-14 rounded-2xl" onClick={onAddSubscription}><Plus size={18} />{t.addSubscription}</Button>
        </Card>
      </div>
    </div>
  );
}
