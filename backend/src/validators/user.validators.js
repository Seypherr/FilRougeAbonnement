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

export const userCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: strictEmailSchema,
    password: z.string().min(8).max(120),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
    isActive: z.boolean().default(true)
  })
});

export const userUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    email: strictEmailSchema.optional(),
    password: z.string().min(8).max(120).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.boolean().optional()
  })
});

export const userParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
