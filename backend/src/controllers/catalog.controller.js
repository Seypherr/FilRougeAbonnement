import { asyncHandler } from "../utils/asyncHandler.js";
import { searchSubscriptionCatalog } from "../data/subscriptionCatalog.js";

export const searchCatalogSubscriptions = asyncHandler(async (req, res) => {
  const result = searchSubscriptionCatalog(req.validatedQuery ?? req.query);
  res.json(result);
});
