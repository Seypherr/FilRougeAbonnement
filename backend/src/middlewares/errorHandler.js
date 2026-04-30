import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode ?? 500;
  let message = error.message ?? "Internal server error";
  let details = error.details;

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    details = error.flatten();
  }

  if (
    Prisma.PrismaClientKnownRequestError &&
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists";
    }
  }

  logger.error(message, { statusCode, details });

  res.status(statusCode).json({
    message,
    details,
    stack: env.NODE_ENV === "production" ? undefined : error.stack
  });
};
