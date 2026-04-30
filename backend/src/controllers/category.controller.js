import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  res.json({ categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.create({
    data: req.body
  });

  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: req.body
  });

  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({
    where: { id: req.params.id }
  });

  res.status(204).send();
});
