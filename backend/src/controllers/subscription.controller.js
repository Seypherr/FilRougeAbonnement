import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import {
  getTotalMonthlyAmount,
  serializeSubscription
} from "../services/subscription.service.js";

const subscriptionInclude = {
  category: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
};

const buildSubscriptionFilters = (query, userId = undefined) => ({
  ...(userId ? { userId } : {}),
  ...(query.status ? { status: query.status } : {}),
  ...(query.billingCycle ? { billingCycle: query.billingCycle } : {}),
  ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  ...(query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } }
        ]
      }
    : {})
});

export const listMySubscriptions = asyncHandler(async (req, res) => {
  const filters = req.validatedQuery ?? req.query;
  const subscriptions = await prisma.subscription.findMany({
    where: buildSubscriptionFilters(filters, req.user.id),
    include: { category: true },
    orderBy: { renewalDate: "asc" }
  });

  res.json({
    subscriptions: subscriptions.map(serializeSubscription),
    totalMonthlyAmount: Number(getTotalMonthlyAmount(subscriptions).toFixed(2))
  });
});

export const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id
    },
    include: { category: true }
  });

  if (!subscription) {
    throw new HttpError(404, "Subscription not found");
  }

  res.json({ subscription: serializeSubscription(subscription) });
});

export const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.create({
    data: {
      ...req.body,
      userId: req.user.id
    },
    include: { category: true }
  });

  res.status(201).json({ subscription: serializeSubscription(subscription) });
});

export const updateMySubscription = asyncHandler(async (req, res) => {
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!existingSubscription) {
    throw new HttpError(404, "Subscription not found");
  }

  const subscription = await prisma.subscription.update({
    where: { id: req.params.id },
    data: req.body,
    include: { category: true }
  });

  res.json({ subscription: serializeSubscription(subscription) });
});

export const archiveMySubscription = asyncHandler(async (req, res) => {
  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!existingSubscription) {
    throw new HttpError(404, "Subscription not found");
  }

  const subscription = await prisma.subscription.update({
    where: { id: req.params.id },
    data: { status: "ARCHIVED" },
    include: { category: true }
  });

  res.json({ subscription: serializeSubscription(subscription) });
});

export const listAllSubscriptions = asyncHandler(async (req, res) => {
  const filters = req.validatedQuery ?? req.query;
  const subscriptions = await prisma.subscription.findMany({
    where: buildSubscriptionFilters(filters),
    include: subscriptionInclude,
    orderBy: { createdAt: "desc" }
  });

  res.json({
    subscriptions: subscriptions.map(serializeSubscription),
    totalMonthlyAmount: Number(getTotalMonthlyAmount(subscriptions).toFixed(2))
  });
});

export const deleteSubscriptionAsAdmin = asyncHandler(async (req, res) => {
  await prisma.subscription.delete({
    where: { id: req.params.id }
  });

  res.status(204).send();
});
