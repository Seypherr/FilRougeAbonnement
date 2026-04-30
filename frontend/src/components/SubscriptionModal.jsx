import { useState } from "react";
import { cycleLabels, emptySubscription, statusLabels, toApiPayload, toFormData } from "../utils/subscriptions.js";

function Field({ label, children, error }) {
  return (
    <div className="w-full">
      <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-[12px] font-semibold text-red-500">{error}</p>}
    </div>
  );
}

export function SubscriptionModal({ t, subscription, categories, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormData(subscription ?? emptySubscription));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const isEditing = Boolean(subscription);

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async () => {
    setError("");
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

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-slate-900/40 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full flex-col rounded-t-[32px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:mx-auto lg:mb-8 lg:max-w-2xl lg:rounded-[32px]">
        <div className="flex w-full justify-center pb-1 pt-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[32px] border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{isEditing ? "Edit Subscription" : "Add Subscription"}</h2>
            <p className="text-xs font-medium text-slate-500">{isEditing ? `Update ${form.name} details` : "Enter your new subscription details"}</p>
          </div>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100">
            <i className="ph-bold ph-x text-sm" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-white p-6">
          {(saved || error) && (
            <div className={`flex items-start gap-3 rounded-[14px] border p-3 ${error ? "border-red-200/60 bg-red-50" : "border-emerald-200/60 bg-emerald-50"}`}>
              <i className={`ph-fill ${error ? "ph-warning-circle text-red-600" : "ph-check-circle text-emerald-600"} mt-0.5 text-[20px] shrink-0`} />
              <div>
                <p className={`text-[13px] font-bold ${error ? "text-red-800" : "text-emerald-800"}`}>{error ? t.error : "Changes saved successfully"}</p>
                <p className={`mt-0.5 text-[12px] font-medium ${error ? "text-red-600" : "text-emerald-600"}`}>{error || "Your subscription details have been updated."}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Field label="Name">
              <input value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="e.g. Spotify" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
            <Field label="Price">
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[14px] font-medium text-slate-400">$</span>
                <input type="number" step="0.01" value={form.price} onChange={(event) => change("price", event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-7 pr-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
              </div>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select value={form.categoryId} onChange={(event) => change("categoryId", event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100">
                <option value="">Category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Billing Cycle">
              <select value={form.billingCycle} onChange={(event) => change("billingCycle", event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100">
                {Object.entries(cycleLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
              </select>
            </Field>
            <Field label="Renewal Date">
              <input type="date" value={form.renewalDate} onChange={(event) => change("renewalDate", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
            <Field label="Payment Method">
              <input value={form.paymentMethod} onChange={(event) => change("paymentMethod", event.target.value)} placeholder="Visa •••• 4242" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
          </div>

          <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div>
              <span className="block text-[14px] font-bold text-slate-900">Active Status</span>
              <span className="mt-0.5 block text-[12px] font-medium text-slate-500">Pause to stop tracking this cost</span>
            </div>
            <button onClick={toggleActive} className={`relative flex h-7 w-12 items-center rounded-full pl-0.5 shadow-inner transition-colors ${form.status === "ACTIVE" ? "bg-[#7B42FF]" : "bg-slate-300"}`}>
              <span className={`size-6 rounded-full bg-white shadow-sm transition-transform ${form.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <Field label="Description (Optional)">
            <textarea rows={2} value={form.description} onChange={(event) => change("description", event.target.value)} placeholder="Add notes, e.g. shared with family..." className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
          </Field>
        </div>

        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-5 pb-8">
          <button onClick={onClose} className="flex-1 rounded-[14px] border border-slate-200 px-4 py-3.5 text-[15px] font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95">
            Cancel
          </button>
          <button onClick={submit} className="flex-[1.5] rounded-[14px] border border-[#7B42FF] bg-[#7B42FF] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(123,66,255,0.25)] transition-colors hover:bg-[#6B32EF] active:scale-95">
            {isEditing ? "Save Changes" : "Add Subscription"}
          </button>
        </div>
      </div>
    </div>
  );
}
