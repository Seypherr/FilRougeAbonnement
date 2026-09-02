import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().max(254).email();
const languageSchema = z.enum(["fr", "en", "es"]);

export const createBetaInviteSchema = z.object({
  body: z.object({
    email: emailSchema,
    preferredLanguage: languageSchema.default("fr")
  }).strict()
});

export const betaInviteParamsSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});
