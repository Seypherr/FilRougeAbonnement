export const calculateMonthlyAmount = (price, billingCycle) => {
  const numericPrice = Number(price);

  if (billingCycle === "ANNUAL") {
    return Number((numericPrice / 12).toFixed(2));
  }

  if (billingCycle === "WEEKLY") {
    return Number((numericPrice * 4.33).toFixed(2));
  }

  return Number(numericPrice.toFixed(2));
};

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcMonths(date, amount) {
  const monthIndex = date.getUTCMonth() + amount;
  const targetYear = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(date.getUTCDate(), lastDayOfTargetMonth);

  return new Date(Date.UTC(targetYear, targetMonth, targetDay));
}

function addUtcDays(date, amount) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount));
}

export function normalizeNextRenewalDate(renewalDate, billingCycle, referenceDate = new Date()) {
  const today = startOfUtcDay(referenceDate);
  let nextRenewal = startOfUtcDay(renewalDate);

  if (Number.isNaN(nextRenewal.getTime()) || nextRenewal >= today) {
    return nextRenewal;
  }

  const advance = {
    ANNUAL: (date) => addUtcMonths(date, 12),
    WEEKLY: (date) => addUtcDays(date, 7),
    MONTHLY: (date) => addUtcMonths(date, 1)
  }[billingCycle] ?? ((date) => addUtcMonths(date, 1));

  while (nextRenewal < today) {
    nextRenewal = advance(nextRenewal);
  }

  return nextRenewal;
}

export const serializeSubscription = (subscription) => ({
  ...subscription,
  price: Number(subscription.price),
  monthlyAmount: calculateMonthlyAmount(subscription.price, subscription.billingCycle)
});

export const getTotalMonthlyAmount = (subscriptions) =>
  subscriptions
    .filter((subscription) => subscription.status === "ACTIVE")
    .reduce((total, subscription) => total + calculateMonthlyAmount(subscription.price, subscription.billingCycle), 0);
