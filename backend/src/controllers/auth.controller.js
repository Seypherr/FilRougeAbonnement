import { prisma } from "../config/prisma.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import {
  clearAuthCookie,
  createSecureToken,
  getTokenExpiry,
  hashToken,
  hashPassword,
  publicUserSelect,
  setAuthCookie,
  signAuthToken,
  verifyPassword
} from "../services/auth.service.js";
import { isEmailDeliveryConfigured, sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";
import { clearCsrfCookie } from "../middlewares/csrf.js";
import { recordMetric } from "../services/metrics.service.js";
import { getPublicOrigin, saveAvatarUpload } from "../services/avatar.service.js";

function canUsePremiumFeatures(user) {
  return user.accessPlan === "BETA" || user.accessPlan === "PREMIUM";
}

function assertPremiumAccessForReminders(user, body) {
  const requestsPremiumReminder = body.reminderDaysBefore || body.reminderEmailEnabled === true;
  if (env.PREMIUM_FEATURES_ENABLED && requestsPremiumReminder && !canUsePremiumFeatures(user)) {
    throw new HttpError(403, "Premium access required for renewal reminders");
  }
}

export const register = asyncHandler(async (req, res) => {
  if (!env.PUBLIC_REGISTRATION_ENABLED && !env.BETA_INVITE_ONLY) {
    throw new HttpError(503, "Public registration is not available yet");
  }

  const { name, email, password, preferredLanguage, inviteToken } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, "Email already used");
  }

  const verificationToken = createSecureToken();
  const userData = {
    name,
    email,
    password: await hashPassword(password),
    emailVerified: false,
    preferredLanguage,
    accessPlan: "FREE",
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationTokenExpiresAt: getTokenExpiry(24 * 60)
  };
  let user;

  if (env.BETA_INVITE_ONLY) {
    if (!inviteToken) throw new HttpError(403, "A valid beta invitation is required");
    const now = new Date();
    user = await prisma.$transaction(async (transaction) => {
      const invite = await transaction.betaInvite.findUnique({ where: { tokenHash: hashToken(inviteToken) } });
      if (!invite || invite.email !== email || invite.usedAt || invite.revokedAt || invite.expiresAt <= now) {
        throw new HttpError(403, "This beta invitation is invalid, expired, or already used");
      }

      const createdUser = await transaction.user.create({ data: userData, select: publicUserSelect });
      const consumed = await transaction.betaInvite.updateMany({
        where: { id: invite.id, usedAt: null, revokedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now }
      });
      if (consumed.count !== 1) throw new HttpError(409, "This beta invitation is no longer available");
      return createdUser;
    });
  } else {
    user = await prisma.user.create({ data: userData, select: publicUserSelect });
  }

  const verificationUrl = await sendVerificationEmail(user, verificationToken);

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    user,
    emailDeliveryConfigured: isEmailDeliveryConfigured(),
    ...(env.NODE_ENV !== "production" ? { verificationUrl } : {})
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userWithPassword = await prisma.user.findUnique({ where: { email } });
  if (!userWithPassword || !userWithPassword.isActive) {
    throw new HttpError(401, "Invalid credentials");
  }

  const passwordIsValid = await verifyPassword(password, userWithPassword.password);
  if (!passwordIsValid) {
    throw new HttpError(401, "Invalid credentials");
  }

  const { password: _password, ...user } = userWithPassword;
  const token = signAuthToken(user);
  setAuthCookie(res, token);

  res.json({ user });
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  if (req.user.emailVerified) {
    return res.json({ message: "Email already verified" });
  }

  const verificationToken = createSecureToken();
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationTokenExpiresAt: getTokenExpiry(24 * 60)
    }
  });

  const verificationUrl = await sendVerificationEmail(req.user, verificationToken);
  res.json({
    message: "Verification email sent",
    emailDeliveryConfigured: isEmailDeliveryConfigured(),
    ...(env.NODE_ENV !== "production" ? { verificationUrl } : {})
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const tokenHash = hashToken(req.body.token);
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpiresAt: { gt: new Date() }
    }
  });

  if (!user) {
    throw new HttpError(400, "Invalid or expired verification token");
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      ...(env.BETA_ACCESS_ENABLED ? { accessPlan: "BETA" } : {}),
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null
    },
    select: publicUserSelect
  });

  await recordMetric("SIGNUP_VERIFIED");

  const authToken = signAuthToken(verifiedUser);
  setAuthCookie(res, authToken);
  res.json({ user: verifiedUser });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  let resetUrl = null;

  if (user?.isActive) {
    const resetToken = createSecureToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: hashToken(resetToken),
        passwordResetTokenExpiresAt: getTokenExpiry(30)
      }
    });
    resetUrl = await sendPasswordResetEmail(user, resetToken);
  }

  res.json({
    message: "If an account exists, a password reset email has been sent",
    ...(env.NODE_ENV !== "production" && resetUrl ? { resetUrl } : {})
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const tokenHash = hashToken(req.body.token);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { gt: new Date() },
      isActive: true
    }
  });

  if (!user) {
    throw new HttpError(400, "Invalid or expired reset token");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(req.body.password),
      passwordResetTokenHash: null,
      passwordResetTokenExpiresAt: null
    }
  });

  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.json({ message: "Password updated" });
});

export const me = asyncHandler(async (req, res) => {
  const token = req.cookies?.[env.COOKIE_NAME];

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect
    });

    if (!user || !user.isActive) {
      clearAuthCookie(res);
      return res.json({ user: null });
    }

    return res.json({ user });
  } catch {
    clearAuthCookie(res);
    return res.json({ user: null });
  }
});

export const updateMe = asyncHandler(async (req, res) => {
  const { email, ...data } = req.body;
  assertPremiumAccessForReminders(req.user, data);

  if (email && email !== req.user.email) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== req.user.id) {
      throw new HttpError(409, "Email already used");
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...data,
      ...(email ? {
        email,
        emailVerified: email === req.user.email ? req.user.emailVerified : false
      } : {})
    },
    select: publicUserSelect
  });

  if (email && email !== req.user.email) {
    const verificationToken = createSecureToken();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationTokenHash: hashToken(verificationToken),
        emailVerificationTokenExpiresAt: getTokenExpiry(24 * 60)
      }
    });
    await sendVerificationEmail(user, verificationToken);
  }

  if (data.reminderEmailEnabled === true && req.user.reminderEmailEnabled !== true) {
    await recordMetric("REMINDER_ENABLED");
  }

  res.json({ user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  const mimeType = req.get("content-type")?.split(";")[0]?.toLowerCase();
  const buffer = req.body;
  const avatarUrl = await saveAvatarUpload({ buffer, mimeType, userId: req.user.id, publicOrigin: getPublicOrigin(req) });
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatarUrl },
    select: publicUserSelect
  });

  res.status(201).json({ user });
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  assertPremiumAccessForReminders(req.user, req.body);
  const wasCompleted = Boolean(req.user.onboardingCompletedAt);
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...req.body,
      onboardingCompletedAt: req.user.onboardingCompletedAt ?? new Date()
    },
    select: publicUserSelect
  });

  if (!wasCompleted) {
    await recordMetric("ONBOARDING_COMPLETED");
  }
  if (req.body.reminderEmailEnabled) {
    await recordMetric("REMINDER_ENABLED");
  }

  res.json({ user });
});

export const exportMyData = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      ...publicUserSelect,
      subscriptions: {
        include: { category: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  res.set({
    "Content-Disposition": `attachment; filename=\"frovely-data-${req.user.id}.json\"`,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.json({ exportedAt: new Date().toISOString(), user });
});

export const deleteMe = asyncHandler(async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.status(204).send();
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.status(204).send();
});
