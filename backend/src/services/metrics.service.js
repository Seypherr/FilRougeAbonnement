import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

// Aggregates are deliberately anonymous: no user id, IP, device, or event payload is retained.
export async function recordMetric(eventType) {
  try {
    await prisma.dailyProductMetric.upsert({
      where: { eventDate_eventType: { eventDate: todayUtc(), eventType } },
      create: { eventDate: todayUtc(), eventType, count: 1 },
      update: { count: { increment: 1 } }
    });
  } catch (error) {
    logger.warn("Unable to record aggregate product metric", { eventType, error: error.message });
  }
}
