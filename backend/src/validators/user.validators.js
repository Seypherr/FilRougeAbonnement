import { z } from "zod";

export const userCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().toLowerCase(),
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
    email: z.string().trim().email().toLowerCase().optional(),
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
