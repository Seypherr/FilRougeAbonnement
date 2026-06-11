import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resendVerificationEmail,
  resetPassword,
  updateMe,
  verifyEmail
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { authRateLimiter } from "../middlewares/authRateLimit.js";
import { csrfToken } from "../middlewares/csrf.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), register);
authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), resetPassword);
authRouter.post("/verify-email", authRateLimiter, validate(verifyEmailSchema), verifyEmail);
authRouter.get("/csrf", csrfToken);
authRouter.get("/me", me);
authRouter.post("/resend-verification", requireAuth, resendVerificationEmail);
authRouter.put("/me", requireAuth, validate(profileUpdateSchema), updateMe);
authRouter.post("/logout", requireAuth, logout);
