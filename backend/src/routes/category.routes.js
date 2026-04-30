import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "../controllers/category.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { categoryParamsSchema, categorySchema } from "../validators/category.validators.js";

export const categoryRouter = Router();

categoryRouter.get("/", requireAuth, listCategories);
categoryRouter.post("/", requireAuth, requireAdmin, validate(categorySchema), createCategory);
categoryRouter.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(categoryParamsSchema),
  validate(categorySchema),
  updateCategory
);
categoryRouter.delete("/:id", requireAuth, requireAdmin, validate(categoryParamsSchema), deleteCategory);
