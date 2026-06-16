import { useState } from "react";
import { apiRequest } from "../api/client.js";
import { StatePanel } from "../components/StatePanel.jsx";
import { SubscriptionModal } from "../components/SubscriptionModal.jsx";
import { SubscriptionLogo } from "../components/SubscriptionLogo.jsx";
import { translateCategoryName } from "../i18n/dictionaries.js";
import { cycleLabels, formatMoney } from "../utils/subscriptions.js";

const filterOptions = [
  ["", "all"],
  ["ACTIVE", "active"],
  ["INACTIVE", "paused"],
  ["ARCHIVED", "archived"]
];

function buildFilterQuery(filters) {
  const params = new URLSearchParams();
  const search = filters.search.trim();
  if (search) params.set("search", search);
  if (filters.status) params.set("status", filters.status);
  return params.toString() ? `?${params.toString()}` : "";
}

function getRenewalLabel(subscription, t) {
  if (subscription.status === "ARCHIVED") return t.archived;
  if (subscription.status === "INACTIVE") return t.billingSuspended;
  const now = new Date();
  const date = new Date(subscription.renewalDate);
  const diff = Math.ceil((date.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / 86400000);
  if (diff <= 1) return t.renewsTomorrow;
  return t.renewsInDays.replace("{count}", diff);
}

function StatusBadge({ status, t }) {
  if (status === "ACTIVE") {
    return <span className="rounded border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-emerald-700">{t.active}</span>;
  }
  if (status === "INACTIVE") {
    return <span className="rounded border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-amber-700">{t.paused}</span>;
  }
  return <span className="rounded border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-slate-500">{t.archived}</span>;
}

function SubscriptionCard({ t, sub, onEdit, onArchive, onDeletePermanent }) {
  const isArchived = sub.status === "ARCHIVED";
  const isPaused = sub.status === "INACTIVE";
  const color = isArchived || isPaused ? "bg-slate-300" : "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]";
  const cycleLabel = sub.billingCycle ? t[cycleLabels[sub.billingCycle]] : t.monthly;
  const hasDescription = Boolean(sub.description?.trim());

  return (
    <div className="flex flex-col gap-3.5 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <SubscriptionLogo name={sub.name} className="size-10 rounded-xl" muted={isArchived || isPaused} />
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">{sub.name}</h3>
            <p className="mt-0.5 truncate text-[13px] font-medium text-slate-500">{translateCategoryName(sub.category?.name, t)} · {cycleLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className={`text-[15px] font-bold leading-tight ${isArchived || isPaused ? "text-slate-400" : "text-slate-900"}`}>{formatMoney(sub.price)}</p>
          <StatusBadge status={sub.status} t={t} />
        </div>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {hasDescription && (
        <details className="group rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-bold uppercase tracking-wide text-slate-500 transition-colors hover:text-slate-700">
            <span>{t.viewDescription}</span>
            <i className="ph ph-caret-down text-sm transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-600">{sub.description}</p>
        </details>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1">
          <span className={`size-2 shrink-0 rounded-full ${color}`} />
          <span className={`truncate text-[12px] font-semibold ${isArchived || isPaused ? "font-medium text-slate-500" : "text-slate-700"}`}>{getRenewalLabel(sub, t)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button aria-label={`Edit ${sub.name}`} onClick={() => onEdit(sub)} className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:scale-95">
            <i className="ph ph-pencil-simple text-[15px]" />
          </button>
          {!isArchived && (
            <button aria-label={`Archive ${sub.name}`} onClick={() => onArchive(sub)} className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600 active:scale-95">
              <i className="ph ph-archive text-[15px]" />
            </button>
          )}
          <button aria-label={`${t.deleteSubscription} ${sub.name}`} onClick={() => onDeletePermanent(sub)} className="flex size-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 active:scale-95">
            <i className="ph ph-trash text-[15px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsPage({ t, language, subscriptions, categories, loading, error, load, notify, modalState, setModalState }) {
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [appliedQuery, setAppliedQuery] = useState("");

  const applyFilters = (nextFilters = filters, { force = false } = {}) => {
    const nextQuery = buildFilterQuery(nextFilters);
    if (!force && nextQuery === appliedQuery) return;
    setAppliedQuery(nextQuery);
    load(nextQuery);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    applyFilters();
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
    applyFilters(filters, { force: true });
  };

  const archive = async (subscription) => {
    if (!window.confirm(t.confirmArchive)) return;
    try {
      await apiRequest(`/subscriptions/${subscription.id}`, { method: "DELETE" });
      notify(t.subscriptionArchived);
      applyFilters(filters, { force: true });
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const deletePermanent = async (subscription) => {
    if (!window.confirm(t.confirmDeletePermanentSubscription)) return;
    try {
      if (subscription.status !== "ARCHIVED") {
        await apiRequest(`/subscriptions/${subscription.id}`, { method: "DELETE" });
      }
      await apiRequest(`/subscriptions/${subscription.id}/permanent`, { method: "DELETE" });
      notify(t.subscriptionDeleted);
      applyFilters(filters, { force: true });
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
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 pb-4 pt-12 shadow-sm lg:static lg:rounded-[24px] lg:px-6 lg:pt-5">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">{t.subscriptions}</h1>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{t.manageRecurringCosts}</p>
          </div>
          <button aria-label={t.addSubscription} onClick={() => setModalState({ open: true, subscription: null })} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7B42FF] text-white shadow-md transition-colors hover:bg-[#6B32EF] active:scale-95">
            <i className="ph-bold ph-plus text-lg" />
          </button>
        </header>

        <section className="border-b border-slate-100 bg-white px-5 py-4 lg:mt-4 lg:rounded-[24px] lg:border lg:border-slate-100">
          <form className="flex gap-2" onSubmit={submitSearch}>
            <div className="relative min-w-0 flex-1">
              <i className="ph ph-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                aria-label={t.search}
                type="text"
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                placeholder={t.searchSubscriptions}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
            <button type="submit" className="shrink-0 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-95">
              {t.applySearch}
            </button>
          </form>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
            {filterOptions.map(([value, key]) => (
              <button
                key={key}
                onClick={() => updateStatus(value)}
                className={`shrink-0 rounded-xl px-4 py-2 text-[13px] font-bold transition-all ${filters.status === value ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}
              >
                {t[key]}
              </button>
            ))}
          </div>

          {error && subscriptions.length > 0 && <div className="mt-3"><StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" /></div>}
        </section>

        <section className="flex-1 px-5 py-5 lg:px-0">
          {loading ? (
            <StatePanel title={t.loadingSubscriptions} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" />
          ) : error && subscriptions.length === 0 ? (
            <StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" />
          ) : subscriptions.length === 0 ? (
            <StatePanel title={t.emptySubscriptionsTitle} message={t.emptySubscriptionsMessage} tone="empty" icon="ph-receipt" />
          ) : (
            <div className="grid gap-3.5 lg:grid-cols-2">
              {subscriptions.map((subscription) => (
                <SubscriptionCard key={subscription.id} t={t} sub={subscription} onEdit={(sub) => setModalState({ open: true, subscription: sub })} onArchive={archive} onDeletePermanent={deletePermanent} />
              ))}
            </div>
          )}
        </section>
      </main>

      {modalState.open && (
        <SubscriptionModal
          t={t}
          language={language}
          subscription={modalState.subscription}
          categories={categories}
          onClose={() => setModalState({ open: false, subscription: null })}
          onSubmit={saveSubscription}
        />
      )}
    </div>
  );
}
