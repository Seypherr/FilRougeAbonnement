import { z } from "zod";

const strictEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email()
  .refine((value) => !value.includes(".."), {
    message: "Invalid email format"
  })
  .refine((value) => {
    const [, domain = ""] = value.split("@");
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);
  }, {
    message: "Invalid email domain"
  });

const publicTokenSchema = z.string().trim().min(32).max(256);

const avatarValueSchema = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const url = new URL(value);
      return ["https:"].includes(url.protocol) || (process.env.NODE_ENV !== "production" && url.protocol === "http:");
    } catch {
      return false;
    }
  }, {
    message: "Avatar must be an HTTPS URL"
  });

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: strictEmailSchema,
    password: z.string().min(8).max(120)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: strictEmailSchema,
    password: z.string().min(1)
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: strictEmailSchema
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: publicTokenSchema,
    password: z.string().min(8).max(120)
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: publicTokenSchema
  })
});

export const profileUpdateSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      email: strictEmailSchema.optional(),
      avatarUrl: z
        .union([avatarValueSchema, z.literal("")])
        .nullable()
        .optional()
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one profile field is required"
    })
});
