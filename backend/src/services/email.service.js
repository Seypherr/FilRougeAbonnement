import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

function buildFrontendUrl(path, token) {
  const origin = env.CLIENT_ORIGINS[0] ?? "http://localhost:5173";
  const url = new URL(path, origin);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function sendVerificationEmail(user, token) {
  const url = buildFrontendUrl("/verify-email", token);
  logger.info(`Email verification link prepared for ${user.email}: ${url}`);
}

export async function sendPasswordResetEmail(user, token) {
  const url = buildFrontendUrl("/reset-password", token);
  logger.info(`Password reset link prepared for ${user.email}: ${url}`);
}

