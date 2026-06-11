import crypto from "crypto";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const exemptPaths = new Set([
  "/api/auth/csrf",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email"
]);

const csrfCookieOptions = () => ({
  httpOnly: false,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  maxAge: 2 * 60 * 60 * 1000,
  path: "/"
});

export function createCsrfToken() {
  const nonce = crypto.randomBytes(32).toString("hex");
  const signature = crypto.createHmac("sha256", env.JWT_SECRET).update(nonce).digest("hex");

  return `${nonce}.${signature}`;
}

function safeEqual(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function isValidCsrfToken(token) {
  const [nonce, signature] = String(token ?? "").split(".");
  if (!nonce || !signature) {
    return false;
  }

  const expectedSignature = crypto.createHmac("sha256", env.JWT_SECRET).update(nonce).digest("hex");
  return safeEqual(signature, expectedSignature);
}

export function setCsrfCookie(res, token = createCsrfToken()) {
  res.cookie(env.CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return token;
}

export function clearCsrfCookie(res) {
  res.clearCookie(env.CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    path: "/"
  });
}

export function csrfToken(_req, res) {
  const token = setCsrfCookie(res);
  res.json({ csrfToken: token });
}

export function csrfProtection(req, _res, next) {
  if (!unsafeMethods.has(req.method) || exemptPaths.has(req.path)) {
    next();
    return;
  }

  const headerToken = req.get(env.CSRF_HEADER_NAME);

  if (!isValidCsrfToken(headerToken)) {
    next(new HttpError(403, "Invalid CSRF token"));
    return;
  }

  next();
}
