import { describe, expect, it } from "vitest";
import { dictionaries } from "./dictionaries.js";

describe("dictionaries", () => {
  it("keeps French and English dictionaries aligned", () => {
    const frenchKeys = Object.keys(dictionaries.fr).sort();
    const englishKeys = Object.keys(dictionaries.en).sort();

    expect(englishKeys).toEqual(frenchKeys);
  });
});
