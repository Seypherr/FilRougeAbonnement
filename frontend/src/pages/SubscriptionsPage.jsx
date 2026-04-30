import { Archive, Edit3, Plus, Search } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "../api/client.js";
import { Badge } from "../components/Badge.jsx";
import { Button } from "../components/Button.jsx";
import { Card } from "../components/Card.jsx";
import { SubscriptionModal } from "../components/SubscriptionModal.jsx";
import { cycleLabels, formatMoney, statusLabels } from "../utils/subscriptions.js";

export function SubscriptionsPage({ t, subscriptions, categories, loading, error, load, notify, modalState, setModalState }) {
  const [filters, setFilters] = useState({ search: "", status: "" });

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
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
    if (!window.confirm(t.confirmArchive)) {
      return;
    }
    try {
      await apiRequest(`/subscriptions/${subscription.id}`, { method: "DELETE" });
      notify(t.subscriptionArchived);
      load();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  return (
    <div className="grid gap-5">
      <Card>
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <div className="input-shell">
            <Search size={18} />
            <input className="input-plain" placeholder={t.search} value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          </div>
          <select className="input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="">{t.all}</option>
            {Object.entries(statusLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
          </select>
          <div className="grid gap-2 sm:grid-cols-2 lg:flex">
            <Button variant="secondary" onClick={applyFilters}><Search size={16} />{t.search}</Button>
            <Button onClick={() => setModalState({ open: true, subscription: null })}><Plus size={16} />{t.addSubscription}</Button>
          </div>
        </div>
      </Card>

      {error && <Card><p className="text-sm font-bold text-rose-700">{error}</p></Card>}
      {loading ? <Card>{t.loading}</Card> : subscriptions.length === 0 ? <Card>{t.empty}</Card> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id} className="grid gap-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black">{subscription.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{subscription.category?.name ?? t.category} - {t[cycleLabels[subscription.billingCycle]]}</p>
                </div>
                <Badge tone={subscription.status}>{t[statusLabels[subscription.status]]}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">{t.price}</p>
                  <p className="font-black">{formatMoney(subscription.price)}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase text-slate-400">{t.perMonth}</p>
                  <p className="font-black">{formatMoney(subscription.monthlyAmount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-black uppercase text-slate-400">{t.renewalDate}</p>
                  <p className="font-black">{new Date(subscription.renewalDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => setModalState({ open: true, subscription })}><Edit3 size={16} />{t.updateSubscription}</Button>
                <Button variant="danger" onClick={() => archive(subscription)}><Archive size={16} />{t.archived}</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

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
