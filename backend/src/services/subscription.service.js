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

export const serializeSubscription = (subscription) => ({
  ...subscription,
  price: Number(subscription.price),
  monthlyAmount: calculateMonthlyAmount(subscription.price, subscription.billingCycle)
});

export const getTotalMonthlyAmount = (subscriptions) =>
  subscriptions
    .filter((subscription) => subscription.status === "ACTIVE")
    .reduce((total, subscription) => total + calculateMonthlyAmount(subscription.price, subscription.billingCycle), 0);
