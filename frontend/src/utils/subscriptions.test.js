import { describe, expect, it } from "vitest";
import { getSubscriptionStats } from "./subscriptions.js";

describe("getSubscriptionStats", () => {
  it("calculates analytics from active subscriptions only", () => {
    const subscriptions = [
      {
        id: "sub-1",
        name: "Netflix",
        monthlyAmount: 12,
        renewalDate: "2026-06-05T00:00:00.000Z",
        status: "ACTIVE",
        category: { name: "Streaming" }
      },
      {
        id: "sub-2",
        name: "Figma",
        monthlyAmount: 10,
        renewalDate: "2026-06-20T00:00:00.000Z",
        status: "ACTIVE",
        category: { name: "Software" }
      },
      {
        id: "sub-3",
        name: "Archived Cloud",
        monthlyAmount: 99,
        renewalDate: "2026-06-10T00:00:00.000Z",
        status: "ARCHIVED",
        category: { name: "Software" }
      },
      {
        id: "sub-4",
        name: "Paused Music",
        monthlyAmount: 21.65,
        renewalDate: "2026-06-02T00:00:00.000Z",
        status: "INACTIVE",
        category: { name: "Music" }
      }
    ];

    const stats = getSubscriptionStats(subscriptions, 22);

    expect(stats.active).toHaveLength(2);
    expect(stats.archived).toHaveLength(1);
    expect(stats.totalYearly).toBe(264);
    expect(stats.averageMonthly).toBe(11);
    expect(stats.highestMonthly).toBe(12);
    expect(stats.categoryTotals).toEqual({ Streaming: 12, Software: 10 });
    expect(stats.topCosts.map((item) => item.name)).toEqual(["Netflix", "Figma"]);
  });
});
