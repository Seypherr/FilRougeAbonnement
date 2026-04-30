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

export function formatMoney(value) {
  return `${Number(value ?? 0).toFixed(2)} EUR`;
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
    price: Number(form.price),
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
