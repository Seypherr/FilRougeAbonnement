import { z } from "zod";

const billingCycle = z.enum(["MONTHLY", "ANNUAL", "WEEKLY"]);
const status = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

export const subscriptionCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional().nullable(),
    price: z.coerce.number().positive().max(100000),
    billingCycle,
    renewalDate: z.coerce.date(),
    status: status.default("ACTIVE"),
    paymentMethod: z.string().trim().max(80).optional().nullable(),
    categoryId: z.string().uuid().optional().nullable()
  })
});

export const subscriptionUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: subscriptionCreateSchema.shape.body.partial()
});

export const subscriptionParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const subscriptionListSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    status: status.optional(),
    billingCycle: billingCycle.optional(),
    categoryId: z.string().uuid().optional()
  })
});
