import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

export const requireAuth = async (req, _res, next) => {
  try {
    const token = req.cookies?.[env.COOKIE_NAME];

    if (!token) {
      throw new HttpError(401, "Authentication required");
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user || !user.isActive) {
      throw new HttpError(401, "Invalid or inactive account");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new HttpError(401, "Invalid token"));
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "ADMIN") {
    return next(new HttpError(403, "Admin role required"));
  }

  next();
};
