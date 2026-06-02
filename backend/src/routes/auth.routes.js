import { Router } from "express";
import { login, logout, me, register, updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { authRateLimiter } from "../middlewares/authRateLimit.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, profileUpdateSchema, registerSchema } from "../validators/auth.validators.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, validate(registerSchema), register);
authRouter.post("/login", authRateLimiter, validate(loginSchema), login);
authRouter.get("/me", me);
authRouter.put("/me", requireAuth, validate(profileUpdateSchema), updateMe);
authRouter.post("/logout", requireAuth, logout);
