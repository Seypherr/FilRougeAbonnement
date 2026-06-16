import { describe, expect, it } from "vitest";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, dictionaries, getDictionary, normalizeLanguage } from "./dictionaries.js";

describe("dictionaries", () => {
  it("keeps all supported dictionaries aligned", () => {
    const referenceKeys = Object.keys(dictionaries.fr).sort();

    SUPPORTED_LANGUAGES.forEach((language) => {
      expect(Object.keys(dictionaries[language]).sort()).toEqual(referenceKeys);
    });
  });

  it("keeps only complete supported languages enabled", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["fr", "en", "es"]);
    expect(Object.keys(dictionaries).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
  });

  it("falls back to the default language for unsupported locales", () => {
    expect(DEFAULT_LANGUAGE).toBe("fr");
    expect(normalizeLanguage("de")).toBe("fr");
    expect(getDictionary("de")).toBe(dictionaries.fr);
    expect(getDictionary("es")).toBe(dictionaries.es);
  });

  it("keeps onboarding questions structurally aligned", () => {
    const referenceIds = dictionaries.fr.onboardingQuestions.map((question) => question.id);

    SUPPORTED_LANGUAGES.forEach((language) => {
      expect(dictionaries[language].onboardingQuestions.map((question) => question.id)).toEqual(referenceIds);

      dictionaries.fr.onboardingQuestions.forEach((question, index) => {
        expect(dictionaries[language].onboardingQuestions[index].options).toHaveLength(question.options.length);
      });
    });
  });
});
