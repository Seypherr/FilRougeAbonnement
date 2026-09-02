import { describe, expect, it } from "vitest";
import { getFriendlyApiError } from "./client.js";

describe("getFriendlyApiError", () => {
  it("hides infrastructure messages from users", () => {
    expect(getFriendlyApiError("Error validating datasource db: prisma://", 500)).toBe(
      "Le service rencontre un probleme temporaire. Reessayez dans quelques instants."
    );
  });

  it("keeps clear validation messages", () => {
    expect(getFriendlyApiError("Le mot de passe doit contenir 8 caracteres.", 400)).toBe(
      "Le mot de passe doit contenir 8 caracteres."
    );
  });

  it("explains invalid login credentials without calling them an expired session", () => {
    expect(getFriendlyApiError("Invalid credentials", 401, "/auth/login")).toBe(
      "Adresse e-mail ou mot de passe incorrect."
    );
    expect(getFriendlyApiError("Unauthorized", 401, "/subscriptions")).toBe(
      "Votre session a expire. Connectez-vous a nouveau."
    );
  });
});
