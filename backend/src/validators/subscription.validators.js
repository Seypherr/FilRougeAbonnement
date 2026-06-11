import { z } from "zod";

const billingCycle = z.enum(["MONTHLY", "ANNUAL", "WEEKLY"]);
const status = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

const renewalDate = z.coerce.date().refine((value) => {
  const selected = new Date(value);
  selected.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selected >= today;
}, {
  message: "Renewal date cannot be in the past"
});

export const subscriptionCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional().nullable(),
    price: z.coerce.number().positive("Price must be greater than 0").max(100000),
    billingCycle,
    renewalDate,
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
