import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET = "test-secret-with-more-than-24-characters";
process.env.JWT_EXPIRES_IN = "7d";
process.env.COOKIE_NAME = "subscription_manager_token";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    subscription: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    $disconnect: vi.fn()
  }
}));

vi.mock("../src/config/prisma.js", () => ({
  prisma: mockPrisma
}));

const { app } = await import("../src/app.js");

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Test User",
  email: "user@test.local",
  role: "USER",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const admin = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Admin",
  email: "admin@test.local",
  role: "ADMIN",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth API", () => {
  it("registers a user and sets an HTTP-only cookie", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    expect(response.body.user.email).toBe(user.email);
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
  });

  it("logs in a user with valid credentials", async () => {
    const password = await bcrypt.hash("Password123!", 12);
    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...user, password });

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "Password123!" })
      .expect(200);

    expect(response.body.user.email).toBe(user.email);
    expect(response.body.user.password).toBeUndefined();
  });

  it("rejects protected routes without a cookie", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });
});

describe("subscription API", () => {
  it("scopes subscription listing to the authenticated user", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findMany.mockResolvedValueOnce([
      {
        id: "33333333-3333-4333-8333-333333333333",
        name: "Netflix",
        description: null,
        price: 12,
        billingCycle: "MONTHLY",
        renewalDate: new Date(),
        status: "ACTIVE",
        paymentMethod: null,
        userId: user.id,
        categoryId: null,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const response = await agent.get("/api/subscriptions").expect(200);

    expect(response.body.totalMonthlyAmount).toBe(12);
    expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: user.id })
      })
    );
  });
});

describe("admin API", () => {
  it("allows an admin to list users", async () => {
    const password = await bcrypt.hash("Admin123!", 12);
    const agent = request.agent(app);

    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...admin, password });
    await agent.post("/api/auth/login").send({ email: admin.email, password: "Admin123!" }).expect(200);

    mockPrisma.user.findUnique.mockResolvedValueOnce(admin);
    mockPrisma.user.findMany.mockResolvedValueOnce([{ ...user, _count: { subscriptions: 0 } }]);

    const response = await agent.get("/api/admin/users").expect(200);

    expect(response.body.users).toHaveLength(1);
  });

  it("rejects admin routes for regular users", async () => {
    const password = await bcrypt.hash("Password123!", 12);
    const agent = request.agent(app);

    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...user, password });
    await agent.post("/api/auth/login").send({ email: user.email, password: "Password123!" }).expect(200);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);

    await agent.get("/api/admin/users").expect(403);
  });
});
