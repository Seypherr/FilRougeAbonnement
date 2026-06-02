import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { categoryRouter } from "./routes/category.routes.js";
import { subscriptionRouter } from "./routes/subscription.routes.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.CLIENT_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(
  morgan("dev", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);
