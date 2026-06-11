import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "../controllers/category.controller.js";
import { requireAdmin, requireAuth, requireVerifiedEmail } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { categoryParamsSchema, categorySchema } from "../validators/category.validators.js";

export const categoryRouter = Router();

categoryRouter.get("/", requireAuth, requireVerifiedEmail, listCategories);
categoryRouter.post("/", requireAuth, requireVerifiedEmail, requireAdmin, validate(categorySchema), createCategory);
categoryRouter.put(
  "/:id",
  requireAuth,
  requireVerifiedEmail,
  requireAdmin,
  validate(categoryParamsSchema),
  validate(categorySchema),
  updateCategory
);
categoryRouter.delete("/:id", requireAuth, requireVerifiedEmail, requireAdmin, validate(categoryParamsSchema), deleteCategory);
