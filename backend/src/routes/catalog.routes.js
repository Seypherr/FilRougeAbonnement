import { Router } from "express";
import { searchCatalogSubscriptions } from "../controllers/catalog.controller.js";
import { requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { catalogSearchSchema } from "../validators/catalog.validators.js";

export const catalogRouter = Router();

catalogRouter.use(requireAuth, requireVerifiedEmail);
catalogRouter.get("/subscriptions", validate(catalogSearchSchema), searchCatalogSubscriptions);
