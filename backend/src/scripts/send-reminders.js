import { prisma } from "../config/prisma.js";
import { processRenewalReminders } from "../services/reminder.service.js";
import { logger } from "../utils/logger.js";

try {
  const summary = await processRenewalReminders();
  logger.info("Renewal reminder run completed", summary);
} finally {
  await prisma.$disconnect();
}
