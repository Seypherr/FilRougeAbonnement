import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { sendRenewalReminderEmail } from "./email.service.js";
import { logger } from "../utils/logger.js";

function datePartsInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function utcDay({ year, month, day }) {
  return Date.UTC(year, month - 1, day);
}

function getDaysUntilRenewal(renewalDate, timeZone, now) {
  const renewal = renewalDate.toISOString().slice(0, 10).split("-").map(Number);
  const today = datePartsInTimeZone(now, timeZone);
  return Math.round((Date.UTC(renewal[0], renewal[1] - 1, renewal[2]) - utcDay(today)) / 86400000);
}

function normalizeTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return timeZone;
  } catch {
    return "UTC";
  }
}

export async function processRenewalReminders({ now = new Date() } = {}) {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      user: {
        isActive: true,
        emailVerified: true,
        reminderEmailEnabled: true
      }
    },
    select: {
      id: true,
      name: true,
      price: true,
      billingCycle: true,
      renewalDate: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          preferredLanguage: true,
          timeZone: true,
          reminderDaysBefore: true
        }
      }
    },
    take: env.REMINDER_BATCH_SIZE
  });

  const summary = { scanned: subscriptions.length, sent: 0, skipped: 0, failed: 0 };

  for (const subscription of subscriptions) {
    const timeZone = normalizeTimeZone(subscription.user.timeZone);
    const daysUntil = getDaysUntilRenewal(subscription.renewalDate, timeZone, now);
    if (!subscription.user.reminderDaysBefore.includes(daysUntil)) continue;

    const deliveryKey = {
      subscriptionId_renewalDate_daysBefore_channel: {
        subscriptionId: subscription.id,
        renewalDate: subscription.renewalDate,
        daysBefore: daysUntil,
        channel: "EMAIL"
      }
    };
    const existingDelivery = await prisma.reminderDelivery.findUnique({ where: deliveryKey });

    if (existingDelivery?.status === "SENT" || existingDelivery?.status === "PENDING") {
      summary.skipped += 1;
      continue;
    }

    let delivery;
    if (existingDelivery?.status === "FAILED") {
      delivery = await prisma.reminderDelivery.update({
        where: { id: existingDelivery.id },
        data: { status: "PENDING", failureReason: null }
      });
    } else {
      try {
        delivery = await prisma.reminderDelivery.create({
          data: {
            userId: subscription.user.id,
            subscriptionId: subscription.id,
            renewalDate: subscription.renewalDate,
            daysBefore: daysUntil,
            channel: "EMAIL",
            status: "PENDING"
          }
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          summary.skipped += 1;
          continue;
        }
        throw error;
      }
    }

    try {
      const delivered = await sendRenewalReminderEmail({ user: subscription.user, subscription, daysUntil, timeZone });
      if (!delivered) {
        await prisma.reminderDelivery.update({
          where: { id: delivery.id },
          data: { status: "FAILED", failureReason: "EMAIL_PROVIDER_NOT_CONFIGURED" }
        });
        summary.skipped += 1;
        continue;
      }

      await prisma.reminderDelivery.update({
        where: { id: delivery.id },
        data: { status: "SENT", sentAt: new Date(), failureReason: null }
      });
      summary.sent += 1;
    } catch (error) {
      await prisma.reminderDelivery.update({
        where: { id: delivery.id },
        data: { status: "FAILED", failureReason: String(error.message ?? "EMAIL_DELIVERY_FAILED").slice(0, 500) }
      });
      summary.failed += 1;
      logger.error("Renewal reminder failed", { subscriptionId: subscription.id, error: error.message });
    }
  }

  return summary;
}
