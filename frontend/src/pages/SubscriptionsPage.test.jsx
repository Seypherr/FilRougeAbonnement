import { afterEach, describe, expect, it, vi } from "vitest";
import { getDictionary } from "../i18n/dictionaries.js";
import { getRenewalLabel } from "./SubscriptionsPage.jsx";

describe("SubscriptionsPage renewal labels", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("distinguishes today's renewal from tomorrow's renewal", () => {
    const t = getDictionary("fr");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-03T12:00:00+02:00"));

    expect(getRenewalLabel({ status: "ACTIVE", renewalDate: "2026-09-03" }, t)).toBe("Aujourd'hui");
    expect(getRenewalLabel({ status: "ACTIVE", renewalDate: "2026-09-04" }, t)).toBe("Renouvelle demain");
    expect(getRenewalLabel({ status: "ACTIVE", renewalDate: "2026-09-06" }, t)).toBe("Renouvelle dans 3 jours");
  });
});
