import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import {
  clearAuthCookie,
  hashPassword,
  publicUserSelect,
  setAuthCookie,
  signAuthToken,
  verifyPassword
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new HttpError(409, "Email already used");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password)
    },
    select: publicUserSelect
  });

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  res.status(201).json({ user });
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

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.status(204).send();
});
