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
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";
import { clearCsrfCookie } from "../middlewares/csrf.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, "Email already used");
  }

  const verificationToken = createSecureToken();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      emailVerified: false,
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationTokenExpiresAt: getTokenExpiry(24 * 60)
    },
    select: publicUserSelect
  });

  const verificationUrl = await sendVerificationEmail(user, verificationToken);

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    user,
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
      emailVerificationTokenHash: null,
      emailVerificationTokenExpiresAt: null
    },
    select: publicUserSelect
  });

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

  res.json({ user });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  clearCsrfCookie(res);
  res.status(204).send();
});
