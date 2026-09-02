import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, sendRenewalReminderEmail } = vi.hoisted(() => ({
  mockPrisma: {
    subscription: { findMany: vi.fn() },
    reminderDelivery: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() }
  },
  sendRenewalReminderEmail: vi.fn()
}));

vi.mock("../src/config/prisma.js", () => ({ prisma: mockPrisma }));
vi.mock("../src/config/env.js", () => ({ env: { REMINDER_BATCH_SIZE: 250 } }));
vi.mock("../src/services/email.service.js", () => ({ sendRenewalReminderEmail }));

const { processRenewalReminders } = await import("../src/services/reminder.service.js");

const dueSubscription = {
  id: "33333333-3333-4333-8333-333333333333",
  name: "Netflix",
  price: 12,
  billingCycle: "MONTHLY",
  renewalDate: new Date("2026-09-05T00:00:00.000Z"),
  user: {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Test User",
    email: "user@test.local",
    timeZone: "UTC",
    reminderDaysBefore: [3]
  }
};

describe("renewal reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends one email and skips a duplicate delivery", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([dueSubscription]);
    mockPrisma.reminderDelivery.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "delivery-1", status: "SENT" });
    mockPrisma.reminderDelivery.create
      .mockResolvedValueOnce({ id: "delivery-1" });
    mockPrisma.reminderDelivery.update.mockResolvedValue({ id: "delivery-1" });
    sendRenewalReminderEmail.mockResolvedValue({ id: "email-1" });

    const now = new Date("2026-09-02T12:00:00.000Z");
    const firstRun = await processRenewalReminders({ now });
    const secondRun = await processRenewalReminders({ now });

    expect(firstRun).toMatchObject({ scanned: 1, sent: 1, failed: 0 });
    expect(secondRun).toMatchObject({ scanned: 1, skipped: 1, sent: 0 });
    expect(sendRenewalReminderEmail).toHaveBeenCalledTimes(1);
    expect(mockPrisma.reminderDelivery.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SENT" })
    }));
  });

  it("retries a failed delivery without creating a duplicate", async () => {
    mockPrisma.subscription.findMany.mockResolvedValue([dueSubscription]);
    mockPrisma.reminderDelivery.findUnique.mockResolvedValue({ id: "delivery-1", status: "FAILED" });
    mockPrisma.reminderDelivery.update.mockResolvedValue({ id: "delivery-1" });
    sendRenewalReminderEmail.mockResolvedValue({ id: "email-2" });

    const summary = await processRenewalReminders({ now: new Date("2026-09-02T12:00:00.000Z") });

    expect(summary).toMatchObject({ scanned: 1, sent: 1, failed: 0 });
    expect(mockPrisma.reminderDelivery.create).not.toHaveBeenCalled();
    expect(mockPrisma.reminderDelivery.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "delivery-1" },
      data: { status: "PENDING", failureReason: null }
    }));
  });
});
