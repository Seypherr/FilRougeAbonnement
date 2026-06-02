import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8).max(120)
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(1)
  })
});

export const profileUpdateSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      email: z.string().trim().email().toLowerCase().optional(),
      avatarUrl: z
        .string()
        .trim()
        .url()
        .max(500)
        .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
          message: "Avatar URL must use HTTP or HTTPS"
        })
        .nullable()
        .optional()
    })
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one profile field is required"
    })
});
