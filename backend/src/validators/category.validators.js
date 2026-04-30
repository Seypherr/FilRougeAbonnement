import { z } from "zod";

export const categorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(60),
    color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/).default("#2563eb")
  })
});

export const categoryParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
