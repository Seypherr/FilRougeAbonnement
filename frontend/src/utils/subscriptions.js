export const emptySubscription = {
  name: "",
  description: "",
  price: "",
  billingCycle: "MONTHLY",
  renewalDate: new Date().toISOString().slice(0, 10),
  status: "ACTIVE",
  paymentMethod: "",
  categoryId: ""
};

export const statusLabels = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived"
};

export const cycleLabels = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
  WEEKLY: "weekly"
};

export function parsePrice(value) {
  if (typeof value === "number") {
    return value;
  }

  return Number(String(value ?? "").replace(",", ".").replace(/[^\d.-]/g, ""));
}

export function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
    .format(Number(value ?? 0))
    .replace(/\u00a0|\u202f/g, " ");
}

export function toFormData(subscription = emptySubscription) {
  return {
    name: subscription.name ?? "",
    description: subscription.description ?? "",
    price: subscription.price ?? "",
    billingCycle: subscription.billingCycle ?? "MONTHLY",
    renewalDate: subscription.renewalDate ? subscription.renewalDate.slice(0, 10) : emptySubscription.renewalDate,
    status: subscription.status ?? "ACTIVE",
    paymentMethod: subscription.paymentMethod ?? "",
    categoryId: subscription.categoryId ?? ""
  };
}

export function toApiPayload(form) {
  return {
    ...form,
    price: parsePrice(form.price),
    categoryId: form.categoryId || null,
    description: form.description || null,
    paymentMethod: form.paymentMethod || null,
    renewalDate: new Date(form.renewalDate).toISOString()
  };
}

export function getSubscriptionStats(subscriptions, totalMonthlyAmount) {
  const active = subscriptions.filter((item) => item.status === "ACTIVE");
  const archived = subscriptions.filter((item) => item.status === "ARCHIVED");
  const topCosts = [...active].sort((a, b) => b.monthlyAmount - a.monthlyAmount).slice(0, 5);
  const upcomingRenewals = [...active].sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate)).slice(0, 5);
  const categoryTotals = active.reduce((acc, item) => {
    const key = item.category?.name ?? "Other";
    acc[key] = (acc[key] ?? 0) + item.monthlyAmount;
    return acc;
  }, {});
  const averageMonthly = active.length ? totalMonthlyAmount / active.length : 0;

  return {
    active,
    archived,
    topCosts,
    upcomingRenewals,
    categoryTotals,
    averageMonthly,
    highestMonthly: topCosts[0]?.monthlyAmount ?? 0,
    totalYearly: totalMonthlyAmount * 12
  };
}

export function getRenewalAlerts(subscriptions, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  return subscriptions
    .filter((item) => item.status === "ACTIVE" && item.renewalDate)
    .map((item) => {
      const renewal = new Date(item.renewalDate);
      renewal.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((renewal - today) / 86400000);
      return {
        ...item,
        daysUntil,
        alertWindow: daysUntil <= 3 ? 3 : 7
      };
    })
    .filter((item) => item.daysUntil >= 0 && item.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
