import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";

export function useSubscriptions(initialQuery = "", enabled = true) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMonthlyAmount, setTotalMonthlyAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (query = initialQuery) => {
    setLoading(true);
    setError("");
    try {
      const [subscriptionData, categoryData] = await Promise.all([
        apiRequest(`/subscriptions${query}`),
        apiRequest("/categories")
      ]);
      setSubscriptions(subscriptionData.subscriptions);
      setTotalMonthlyAmount(subscriptionData.totalMonthlyAmount ?? 0);
      setCategories(categoryData.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      load(initialQuery);
    }
  }, [initialQuery, enabled]);

  return { subscriptions, totalMonthlyAmount, categories, loading, error, load };
}
