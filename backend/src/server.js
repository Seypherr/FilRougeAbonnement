import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, "0.0.0.0", () => {
  logger.info(`API listening on 0.0.0.0:${env.PORT}`);
});

const shutdown = async () => {
  logger.info("Shutting down API");
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
