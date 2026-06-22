import "dotenv/config";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
const localHostnames = new Set(["localhost", "127.0.0.1", "::1"]);

const booleanFromEnv = (defaultValue) =>
  z
    .string()
    .optional()
    .transform((value) => {
      if (!value) {
        return defaultValue;
      }

      return ["1", "true", "yes", "on"].includes(value.toLowerCase());
    });

const optionalNonEmptyString = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined);

const optionalEmailFromEnv = z
  .string()
  .optional()
  .transform((value) => value?.trim() || undefined)
  .pipe(z.string().email().optional());

const originsFromEnv = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);
  })
  .pipe(z.array(z.string().url()));

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(4000),
    CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
    CLIENT_ORIGINS: originsFromEnv,
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(24, "JWT_SECRET must contain at least 24 characters"),
    JWT_EXPIRES_IN: z.string().default("7d"),
    COOKIE_NAME: z.string().default("subscription_manager_token"),
    CSRF_COOKIE_NAME: z.string().default("subscription_manager_csrf"),
    CSRF_HEADER_NAME: z.string().default("x-csrf-token"),
    COOKIE_SECURE: booleanFromEnv(isProduction),
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default(isProduction ? "none" : "lax"),
    RESEND_API_KEY: optionalNonEmptyString,
    EMAIL_FROM: z.string().default("Frovely <onboarding@resend.dev>"),
    EMAIL_REPLY_TO: optionalEmailFromEnv,
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(isProduction ? 10 : 100)
  })
  .superRefine((value, context) => {
    if (value.COOKIE_SAME_SITE === "none" && !value.COOKIE_SECURE) {
      context.addIssue({
        code: "custom",
        path: ["COOKIE_SECURE"],
        message: "COOKIE_SECURE must be true when COOKIE_SAME_SITE is none"
      });
    }

    if (value.NODE_ENV === "production" && !value.COOKIE_SECURE) {
      context.addIssue({
        code: "custom",
        path: ["COOKIE_SECURE"],
        message: "COOKIE_SECURE must be true in production"
      });
    }

    if (value.NODE_ENV === "production" && value.COOKIE_SAME_SITE !== "none") {
      context.addIssue({
        code: "custom",
        path: ["COOKIE_SAME_SITE"],
        message: "COOKIE_SAME_SITE must be none in production when frontend and backend are cross-site"
      });
    }

    const weakProductionSecrets = ["change-this-secret-before-production", "secret-long-et-unique"];
    if (value.NODE_ENV === "production" && weakProductionSecrets.includes(value.JWT_SECRET.toLowerCase())) {
      context.addIssue({
        code: "custom",
        path: ["JWT_SECRET"],
        message: "JWT_SECRET must be unique, random, and private in production"
      });
    }

    if (value.NODE_ENV === "production") {
      const localOrigins = [value.CLIENT_ORIGIN, ...value.CLIENT_ORIGINS].filter((origin) => {
        try {
          return localHostnames.has(new URL(origin).hostname);
        } catch {
          return false;
        }
      });

      if (localOrigins.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["CLIENT_ORIGINS"],
          message: "Production CORS origins must not include localhost"
        });
      }
    }
  });

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  CLIENT_ORIGINS: [...new Set([parsedEnv.CLIENT_ORIGIN, ...parsedEnv.CLIENT_ORIGINS])]
};
