import { Router } from "express";
import {
  archiveMySubscription,
  createSubscription,
  deleteMyArchivedSubscription,
  getMySubscription,
  listMySubscriptions,
  updateMySubscription
} from "../controllers/subscription.controller.js";
import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  subscriptionCreateSchema,
  subscriptionListSchema,
  subscriptionParamsSchema,
  subscriptionUpdateSchema
} from "../validators/subscription.validators.js";

export const subscriptionRouter = Router();

subscriptionRouter.use(requireAuth, requireVerifiedEmail);
subscriptionRouter.get("/", validate(subscriptionListSchema), listMySubscriptions);
subscriptionRouter.post("/", validate(subscriptionCreateSchema), createSubscription);
subscriptionRouter.get("/:id", validate(subscriptionParamsSchema), getMySubscription);
subscriptionRouter.put("/:id", validate(subscriptionUpdateSchema), updateMySubscription);
subscriptionRouter.delete("/:id/permanent", validate(subscriptionParamsSchema), deleteMyArchivedSubscription);
subscriptionRouter.delete("/:id", validate(subscriptionParamsSchema), archiveMySubscription);
