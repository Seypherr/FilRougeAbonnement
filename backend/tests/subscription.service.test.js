import { describe, expect, it } from "vitest";
import {
  calculateMonthlyAmount,
  getTotalMonthlyAmount
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
});
