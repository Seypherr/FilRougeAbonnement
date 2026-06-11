import { prisma } from "../config/prisma.js";
import { hashPassword, publicUserSelect } from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      ...publicUserSelect,
      _count: {
        select: { subscriptions: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ users });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      ...publicUserSelect,
      subscriptions: {
        include: { category: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({ user });
});

export const createUser = asyncHandler(async (req, res) => {
  const { password, ...data } = req.body;
  const user = await prisma.user.create({
    data: {
      ...data,
      password: await hashPassword(password),
      emailVerified: true
    },
    select: publicUserSelect
  });

  res.status(201).json({ user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { password, ...data } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(password ? { password: await hashPassword(password) } : {})
    },
    select: publicUserSelect
  });

  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    throw new HttpError(400, "An admin cannot delete their own account");
  }

  await prisma.user.delete({
    where: { id: req.params.id }
  });

  res.status(204).send();
});
