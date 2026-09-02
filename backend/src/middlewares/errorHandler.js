import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode ?? 500;
  let message = error.message ?? "Une erreur technique est survenue.";
  let details = error.details;
  const rawMessage = error.message ?? "Unknown error";

  if (error instanceof ZodError) {
    statusCode = 400;
    message = "Certaines informations sont invalides. Verifiez les champs puis reessayez.";
    details = error.flatten();
  }

  if (
    Prisma.PrismaClientKnownRequestError &&
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === "P2002") {
      statusCode = 409;
      message = "Cette information est deja utilisee.";
      details = undefined;
    }
  }

  const isPrismaConfigurationError =
    (Prisma.PrismaClientInitializationError &&
      error instanceof Prisma.PrismaClientInitializationError) ||
    (Prisma.PrismaClientValidationError &&
      error instanceof Prisma.PrismaClientValidationError) ||
    /invalid `prisma\.|error validating datasource|prisma:\/\/|prisma\+postgres:\/\//i.test(rawMessage);

  if (isPrismaConfigurationError) {
    statusCode = 503;
    message = "Le service est temporairement indisponible. Reessayez dans quelques instants.";
    details = undefined;
  } else if (!error.statusCode && statusCode >= 500) {
    message = "Une erreur technique est survenue. Reessayez dans quelques instants.";
    details = undefined;
  }

  // Keep the original diagnostic on the server, never expose it to the user.
  logger.error("API request failed", { statusCode, message: rawMessage, details });

  res.status(statusCode).json({ message, ...(details ? { details } : {}) });
};
