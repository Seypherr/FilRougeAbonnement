import { describe, expect, it } from "vitest";
import {
  calculateMonthlyAmount,
  getTotalMonthlyAmount,
  normalizeNextRenewalDate
} from "../src/services/subscription.service.js";

describe("subscription monthly amount", () => {
  it("keeps monthly prices unchanged", () => {
    expect(calculateMonthlyAmount(12.99, "MONTHLY")).toBe(12.99);
  });

  it("converts annual prices to a monthly estimate", () => {
    expect(calculateMonthlyAmount(120, "ANNUAL")).toBe(10);
  });

  it("converts weekly prices to a monthly estimate", () => {
    expect(calculateMonthlyAmount(5, "WEEKLY")).toBe(21.65);
  });

  it("ignores inactive and archived subscriptions in totals", () => {
    const subscriptions = [
      { price: 10, billingCycle: "MONTHLY", status: "ACTIVE" },
      { price: 120, billingCycle: "ANNUAL", status: "ACTIVE" },
      { price: 99, billingCycle: "MONTHLY", status: "ARCHIVED" }
    ];

    expect(getTotalMonthlyAmount(subscriptions)).toBe(20);
  });

  it("rolls a past monthly renewal date to the next upcoming occurrence", () => {
    const normalized = normalizeNextRenewalDate(
      new Date("2026-07-15T00:00:00.000Z"),
      "MONTHLY",
      new Date("2026-09-03T12:00:00.000Z")
    );

    expect(normalized.toISOString()).toBe("2026-09-15T00:00:00.000Z");
  });

  it("rolls annual and weekly renewal dates forward", () => {
    const annual = normalizeNextRenewalDate(
      new Date("2025-10-10T00:00:00.000Z"),
      "ANNUAL",
      new Date("2026-09-03T12:00:00.000Z")
    );
    const weekly = normalizeNextRenewalDate(
      new Date("2026-08-20T00:00:00.000Z"),
      "WEEKLY",
      new Date("2026-09-03T12:00:00.000Z")
    );

    expect(annual.toISOString()).toBe("2026-10-10T00:00:00.000Z");
    expect(weekly.toISOString()).toBe("2026-09-03T00:00:00.000Z");
  });

  it("keeps month-end renewals valid when the target month is shorter", () => {
    const normalized = normalizeNextRenewalDate(
      new Date("2026-01-31T00:00:00.000Z"),
      "MONTHLY",
      new Date("2026-02-03T12:00:00.000Z")
    );

    expect(normalized.toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });
});
