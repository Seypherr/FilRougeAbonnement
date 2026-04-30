import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button.jsx";
import { FormField } from "./FormField.jsx";
import { Modal } from "./Modal.jsx";
import { cycleLabels, emptySubscription, statusLabels, toApiPayload, toFormData } from "../utils/subscriptions.js";

export function SubscriptionModal({ t, subscription, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormData(subscription ?? emptySubscription));
  const [error, setError] = useState("");
  const isEditing = Boolean(subscription);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await onSubmit(toApiPayload(form), isEditing);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title={isEditing ? t.updateSubscription : t.addSubscription} subtitle={isEditing ? subscription.name : t.demoReady} onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t.name}>
            <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </FormField>
          <FormField label={t.price}>
            <input className="input" type="number" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          </FormField>
          <FormField label={t.cycle}>
            <select className="input" value={form.billingCycle} onChange={(event) => setForm({ ...form, billingCycle: event.target.value })}>
              {Object.entries(cycleLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
            </select>
          </FormField>
          <FormField label={t.status}>
            <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {Object.entries(statusLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
            </select>
          </FormField>
          <FormField label={t.renewalDate}>
            <input className="input" type="date" value={form.renewalDate} onChange={(event) => setForm({ ...form, renewalDate: event.target.value })} required />
          </FormField>
          <FormField label={t.category}>
            <select className="input" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">{t.all}</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </FormField>
          <FormField label={t.paymentMethod}>
            <input className="input" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })} />
          </FormField>
        </div>
        <FormField label={t.description}>
          <textarea className="input min-h-24 resize-none" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </FormField>
        {error && <p className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button><Save size={16} />{isEditing ? t.updateSubscription : t.save}</Button>
          <Button type="button" variant="secondary" onClick={onClose}>{t.cancel}</Button>
        </div>
      </form>
    </Modal>
  );
}
