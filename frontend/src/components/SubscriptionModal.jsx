import { useState } from "react";
import { createPortal } from "react-dom";
import { cycleLabels, emptySubscription, toApiPayload, toFormData } from "../utils/subscriptions.js";

const validBillingCycles = Object.keys(cycleLabels);

function validateForm(form, t) {
  const nextErrors = {};
  const price = Number(form.price);

  if (!form.name.trim()) {
    nextErrors.name = t.nameRequired;
  }

  if (!Number.isFinite(price) || price <= 0) {
    nextErrors.price = t.priceRequired;
  }

  if (!form.billingCycle || !validBillingCycles.includes(form.billingCycle)) {
    nextErrors.billingCycle = t.billingCycleRequired;
  }

  if (!form.renewalDate) {
    nextErrors.renewalDate = t.renewalDateRequired;
  }

  return nextErrors;
}

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const isEditing = Boolean(subscription);

  const change = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const submit = async () => {
    setError("");
    const nextErrors = validateForm(form, t);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(t.formValidationError);
      return;
    }

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

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-end justify-center overscroll-contain bg-slate-900/40 p-0 backdrop-blur-[2px] lg:items-center lg:p-6">
      <div className="flex max-h-[calc(100dvh-16px)] min-h-0 w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:max-h-[min(92dvh,760px)] lg:max-w-3xl lg:rounded-[32px]">
        <div className="flex w-full shrink-0 justify-center pb-1 pt-3">
          <div className="h-1.5 w-12 rounded-full bg-slate-200" />
        </div>

        <div className="z-10 flex shrink-0 items-center justify-between gap-4 rounded-t-[32px] border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">{isEditing ? t.editSubscription : t.addSubscription}</h2>
            <p className="text-xs font-medium text-slate-500">
              {isEditing ? t.updateSubscriptionDetails.replace("{name}", form.name || t.name) : t.newSubscriptionDetails}
            </p>
          </div>
          <button type="button" aria-label={t.closeModal} onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100">
            <i className="ph-bold ph-x text-sm" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-white p-5 sm:p-6">
          {(saved || error) && (
            <div className={`flex items-start gap-3 rounded-[14px] border p-3 ${error ? "border-red-200/60 bg-red-50" : "border-emerald-200/60 bg-emerald-50"}`}>
              <i className={`ph-fill ${error ? "ph-warning-circle text-red-600" : "ph-check-circle text-emerald-600"} mt-0.5 shrink-0 text-[20px]`} />
              <div>
                <p className={`text-[13px] font-bold ${error ? "text-red-800" : "text-emerald-800"}`}>{error ? t.error : t.changesSaved}</p>
                <p className={`mt-0.5 text-[12px] font-medium ${error ? "text-red-600" : "text-emerald-600"}`}>{error || t.subscriptionDetailsSaved}</p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.name} error={fieldErrors.name}>
              <input aria-label={t.name} aria-invalid={Boolean(fieldErrors.name)} value={form.name} onChange={(event) => change("name", event.target.value)} placeholder="e.g. Spotify" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
            <Field label={t.price} error={fieldErrors.price}>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-[14px] font-medium text-slate-400">$</span>
                <input aria-label={t.price} aria-invalid={Boolean(fieldErrors.price)} type="number" step="0.01" value={form.price} onChange={(event) => change("price", event.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-7 pr-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
              </div>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.category}>
              <select aria-label={t.category} value={form.categoryId} onChange={(event) => change("categoryId", event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100">
                <option value="">{t.categoryPlaceholder}</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </Field>
            <Field label={t.billingCycle} error={fieldErrors.billingCycle}>
              <select aria-label={t.billingCycle} aria-invalid={Boolean(fieldErrors.billingCycle)} value={form.billingCycle} onChange={(event) => change("billingCycle", event.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100">
                {Object.entries(cycleLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
              </select>
            </Field>
            <Field label={t.renewalDate} error={fieldErrors.renewalDate}>
              <input aria-label={t.renewalDate} aria-invalid={Boolean(fieldErrors.renewalDate)} type="date" value={form.renewalDate} onChange={(event) => change("renewalDate", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
            <Field label={t.paymentMethod}>
              <input aria-label={t.paymentMethod} value={form.paymentMethod} onChange={(event) => change("paymentMethod", event.target.value)} placeholder={t.paymentMethodPlaceholder} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
            </Field>
          </div>

          <div className="mt-1 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="min-w-0">
              <span className="block text-[14px] font-bold text-slate-900">{t.activeStatus}</span>
              <span className="mt-0.5 block text-[12px] font-medium text-slate-500">{t.activeStatusHelp}</span>
            </div>
            <button type="button" aria-label={t.toggleActiveStatus} onClick={toggleActive} className={`relative flex h-7 w-12 shrink-0 items-center rounded-full pl-0.5 shadow-inner transition-colors ${form.status === "ACTIVE" ? "bg-[#7B42FF]" : "bg-slate-300"}`}>
              <span className={`size-6 rounded-full bg-white shadow-sm transition-transform ${form.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          <Field label={t.descriptionOptional}>
            <textarea aria-label={t.description} rows={2} value={form.description} onChange={(event) => change("description", event.target.value)} placeholder={t.descriptionPlaceholder} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[14px] font-medium text-slate-900 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100" />
          </Field>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 sm:py-5 sm:pb-8">
          <button type="button" onClick={onClose} className="flex-1 rounded-[14px] border border-slate-200 px-4 py-3.5 text-[15px] font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-95">
            {t.cancel}
          </button>
          <button type="button" onClick={submit} className="flex-[1.5] rounded-[14px] border border-[#7B42FF] bg-[#7B42FF] px-4 py-3.5 text-[15px] font-bold text-white shadow-[0_4px_12px_rgba(123,66,255,0.25)] transition-colors hover:bg-[#6B32EF] active:scale-95">
            {isEditing ? t.saveChanges : t.addSubscription}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
