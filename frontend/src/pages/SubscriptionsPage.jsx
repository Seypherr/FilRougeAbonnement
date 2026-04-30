import { useState } from "react";
import { apiRequest } from "../api/client.js";
import { SubscriptionModal } from "../components/SubscriptionModal.jsx";
import { cycleLabels, formatMoney, statusLabels } from "../utils/subscriptions.js";

const filterOptions = [
  ["", "All"],
  ["ACTIVE", "Active"],
  ["INACTIVE", "Paused"],
  ["ARCHIVED", "Archived"]
];

function getRenewalLabel(subscription) {
  if (subscription.status === "ARCHIVED") return "Archived";
  if (subscription.status === "INACTIVE") return "Billing suspended";
  const now = new Date();
  const date = new Date(subscription.renewalDate);
  const diff = Math.ceil((date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / 86400000);
  if (diff <= 1) return "Renews Tomorrow";
  return `Renews in ${diff} days`;
}

function StatusBadge({ status }) {
  if (status === "ACTIVE") {
    return <span className="rounded border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-emerald-700">Active</span>;
  }
  if (status === "INACTIVE") {
    return <span className="rounded border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-amber-700">Paused</span>;
  }
  return <span className="rounded border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-slate-500">Archived</span>;
}

function SubscriptionCard({ sub, onEdit, onArchive }) {
  const isArchived = sub.status === "ARCHIVED";
  const isPaused = sub.status === "INACTIVE";
  const color = isArchived || isPaused ? "bg-slate-300" : "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]";

  return (
    <div className="flex flex-col gap-3.5 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
            <i className={`ph-fill ph-receipt ${isArchived || isPaused ? "text-slate-400" : "text-slate-700"} text-2xl`} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold leading-tight text-slate-900">{sub.name}</h3>
            <p className="mt-0.5 text-[13px] font-medium text-slate-500">{sub.category?.name ?? "Category"} · {sub.billingCycle ? cycleLabels[sub.billingCycle] : "monthly"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <p className={`text-[15px] font-bold leading-tight ${isArchived || isPaused ? "text-slate-400" : "text-slate-900"}`}>{formatMoney(sub.price)}</p>
          <StatusBadge status={sub.status} />
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
          <span className={`size-2 rounded-full ${color}`} />
          <span className={`text-[12px] font-semibold ${isArchived || isPaused ? "font-medium text-slate-500" : "text-slate-700"}`}>{getRenewalLabel(sub)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onEdit(sub)} className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:scale-95">
            <i className="ph ph-pencil-simple text-[15px]" />
          </button>
          <button onClick={() => onArchive(sub)} className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600 active:scale-95">
            <i className="ph ph-archive text-[15px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsPage({ t, subscriptions, categories, loading, error, load, notify, modalState, setModalState }) {
  const [filters, setFilters] = useState({ search: "", status: "" });

  const applyFilters = (nextFilters = filters) => {
    const params = new URLSearchParams();
    if (nextFilters.search) params.set("search", nextFilters.search);
    if (nextFilters.status) params.set("status", nextFilters.status);
    load(params.toString() ? `?${params.toString()}` : "");
  };

  const saveSubscription = async (payload, isEditing) => {
    if (isEditing) {
      await apiRequest(`/subscriptions/${modalState.subscription.id}`, { method: "PUT", body: payload });
      notify(t.subscriptionUpdated);
    } else {
      await apiRequest("/subscriptions", { method: "POST", body: payload });
      notify(t.subscriptionCreated);
    }
    setModalState({ open: false, subscription: null });
    load();
  };

  const archive = async (subscription) => {
    if (!window.confirm(t.confirmArchive)) return;
    try {
      await apiRequest(`/subscriptions/${subscription.id}`, { method: "DELETE" });
      notify(t.subscriptionArchived);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const updateStatus = (value) => {
    const next = { ...filters, status: value };
    setFilters(next);
    applyFilters(next);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFC] pb-28 text-slate-900 lg:min-h-0 lg:bg-transparent lg:pb-8">
      <main className="flex h-full w-full flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 pb-4 pt-12 shadow-sm lg:static lg:rounded-[24px] lg:px-6 lg:pt-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Subscriptions</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Manage your recurring costs</p>
          </div>
          <button aria-label="Add Subscription" onClick={() => setModalState({ open: true, subscription: null })} className="flex size-10 items-center justify-center rounded-full bg-[#7B42FF] text-white shadow-md transition-colors hover:bg-[#6B32EF] active:scale-95">
            <i className="ph-bold ph-plus text-lg" />
          </button>
        </header>

        <section className="border-b border-slate-100 bg-white px-5 py-4 lg:mt-4 lg:rounded-[24px] lg:border lg:border-slate-100">
          <div className="relative">
            <i className="ph ph-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
              onKeyDown={(event) => event.key === "Enter" && applyFilters()}
              placeholder="Search subscriptions..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {filterOptions.map(([value, label]) => (
              <button
                key={label}
                onClick={() => updateStatus(value)}
                className={`shrink-0 rounded-xl px-4 py-2 text-[13px] font-bold transition-all ${filters.status === value ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {error && <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        </section>

        <section className="flex-1 px-5 py-5 lg:px-0">
          {loading ? (
            <p className="py-16 text-center text-sm font-semibold text-slate-400">{t.loading}</p>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100">
                <i className="ph ph-receipt text-2xl text-slate-400" />
              </div>
              <p className="text-[15px] font-semibold text-slate-600">No subscriptions found</p>
              <p className="mt-1 text-[13px] text-slate-400">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {subscriptions.map((subscription) => (
                <SubscriptionCard key={subscription.id} sub={subscription} onEdit={(sub) => setModalState({ open: true, subscription: sub })} onArchive={archive} />
              ))}
            </div>
          )}
        </section>
      </main>

      {modalState.open && (
        <SubscriptionModal
          t={t}
          subscription={modalState.subscription}
          categories={categories}
          onClose={() => setModalState({ open: false, subscription: null })}
          onSubmit={saveSubscription}
        />
      )}
    </div>
  );
}
