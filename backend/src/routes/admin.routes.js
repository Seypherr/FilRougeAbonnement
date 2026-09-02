import { Router } from "express";
import {
  deleteSubscriptionAsAdmin,
  listAllSubscriptions
} from "../controllers/subscription.controller.js";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser
} from "../controllers/user.controller.js";
import {
  createBetaInvite,
  exportBetaInvites,
  listBetaInvites,
  revokeBetaInvite
} from "../controllers/betaInvite.controller.js";
import { requireAdmin, requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { subscriptionListSchema, subscriptionParamsSchema } from "../validators/subscription.validators.js";
import { userCreateSchema, userParamsSchema, userUpdateSchema } from "../validators/user.validators.js";
import { betaInviteParamsSchema, createBetaInviteSchema } from "../validators/betaInvite.validators.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireVerifiedEmail, requireAdmin);

adminRouter.get("/users", listUsers);
adminRouter.post("/users", validate(userCreateSchema), createUser);
adminRouter.get("/users/:id", validate(userParamsSchema), getUser);
adminRouter.put("/users/:id", validate(userUpdateSchema), updateUser);
adminRouter.delete("/users/:id", validate(userParamsSchema), deleteUser);

adminRouter.get("/beta-invites", listBetaInvites);
adminRouter.get("/beta-invites/export", exportBetaInvites);
adminRouter.post("/beta-invites", validate(createBetaInviteSchema), createBetaInvite);
adminRouter.delete("/beta-invites/:id", validate(betaInviteParamsSchema), revokeBetaInvite);

adminRouter.get("/subscriptions", validate(subscriptionListSchema), listAllSubscriptions);
adminRouter.delete("/subscriptions/:id", validate(subscriptionParamsSchema), deleteSubscriptionAsAdmin);
