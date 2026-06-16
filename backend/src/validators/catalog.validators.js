import { z } from "zod";

export const catalogSearchSchema = z.object({
  query: z.object({
    search: z.string().trim().max(80).optional(),
    categoryId: z.string().trim().max(40).optional(),
    limit: z.coerce.number().int().positive().max(50).optional()
  })
});
