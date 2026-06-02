import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.JWT_SECRET = "test-secret-with-more-than-24-characters";
process.env.JWT_EXPIRES_IN = "7d";
process.env.COOKIE_NAME = "subscription_manager_token";
process.env.COOKIE_SECURE = "false";
process.env.COOKIE_SAME_SITE = "lax";
process.env.AUTH_RATE_LIMIT_WINDOW_MS = "60000";
process.env.AUTH_RATE_LIMIT_MAX = "100";

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
  avatarUrl: null,
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

const subscription = {
  id: "33333333-3333-4333-8333-333333333333",
  name: "Netflix",
  description: null,
  price: 12,
  billingCycle: "MONTHLY",
  renewalDate: new Date("2026-05-15T00:00:00.000Z"),
  status: "ACTIVE",
  paymentMethod: null,
  userId: user.id,
  categoryId: null,
  category: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("auth API", () => {
  it("sets security headers on API responses", async () => {
    const response = await request(app).get("/api/health").expect(200);

    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBeDefined();
  });

  it("allows configured CORS origin with credentials", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("adds rate limit headers to auth endpoints", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "missing@test.local", password: "Password123!" })
      .expect(401);

    expect(response.headers["ratelimit-limit"] ?? response.headers["x-ratelimit-limit"]).toBeDefined();
  });

  it("registers a user and sets an HTTP-only cookie", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    expect(response.body.user.email).toBe(user.email);
    expect(response.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(response.headers["set-cookie"][0]).toContain("SameSite=Lax");
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

  it("returns an empty session without a cookie", async () => {
    const response = await request(app).get("/api/auth/me").expect(200);

    expect(response.body.user).toBeNull();
  });

  it("updates the authenticated user's profile fields", async () => {
    const agent = request.agent(app);
    const updatedUser = {
      ...user,
      name: "Updated User",
      email: "updated@test.local",
      avatarUrl: "https://example.com/avatar.png"
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.update.mockResolvedValueOnce(updatedUser);

    const response = await agent
      .put("/api/auth/me")
      .send({
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl
      })
      .expect(200);

    expect(response.body.user).toEqual(expect.objectContaining({
      name: updatedUser.name,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl
    }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: user.id },
        data: {
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl,
          email: updatedUser.email
        }
      })
    );
  });

  it("rejects a profile update when the email is already used", async () => {
    const agent = request.agent(app);
    const otherUser = {
      ...user,
      id: "44444444-4444-4444-8444-444444444444",
      email: "taken@test.local"
    };
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.user.findUnique.mockResolvedValueOnce(otherUser);

    await agent
      .put("/api/auth/me")
      .send({ email: otherUser.email })
      .expect(409);

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects invalid profile update data", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);

    const response = await agent
      .put("/api/auth/me")
      .send({ email: "not-an-email" })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("does not allow profile updates to change role or active status", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);

    const response = await agent
      .put("/api/auth/me")
      .send({ name: "Still User", role: "ADMIN", isActive: false })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects protected subscription routes without a cookie", async () => {
    await request(app).get("/api/subscriptions").expect(401);
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
    mockPrisma.subscription.findMany.mockResolvedValueOnce([subscription]);

    const response = await agent.get("/api/subscriptions").expect(200);

    expect(response.body.totalMonthlyAmount).toBe(12);
    expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: user.id })
      })
    );
  });

  it("applies search and status filters when listing subscriptions", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findMany.mockResolvedValueOnce([subscription]);

    await agent.get("/api/subscriptions?search=netflix&status=ACTIVE").expect(200);

    expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: user.id,
          status: "ACTIVE",
          OR: [
            { name: { contains: "netflix", mode: "insensitive" } },
            { description: { contains: "netflix", mode: "insensitive" } }
          ]
        })
      })
    );
  });

  it("creates a subscription for the authenticated user", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.create.mockResolvedValueOnce(subscription);

    const response = await agent
      .post("/api/subscriptions")
      .send({
        name: "Netflix",
        price: 12,
        billingCycle: "MONTHLY",
        renewalDate: "2026-05-15T00:00:00.000Z"
      })
      .expect(201);

    expect(response.body.subscription.name).toBe("Netflix");
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: user.id })
      })
    );
  });

  it("rejects invalid subscription creation", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);

    const response = await agent
      .post("/api/subscriptions")
      .send({
        name: "",
        price: 0,
        billingCycle: "MONTHLY",
        renewalDate: ""
      })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled();
  });

  it("updates a subscription owned by the authenticated user", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(subscription);
    mockPrisma.subscription.update.mockResolvedValueOnce({ ...subscription, name: "Netflix Premium" });

    const response = await agent
      .put(`/api/subscriptions/${subscription.id}`)
      .send({ name: "Netflix Premium" })
      .expect(200);

    expect(response.body.subscription.name).toBe("Netflix Premium");
  });

  it("archives a subscription instead of deleting it for a user", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(subscription);
    mockPrisma.subscription.update.mockResolvedValueOnce({ ...subscription, status: "ARCHIVED" });

    const response = await agent.delete(`/api/subscriptions/${subscription.id}`).expect(200);

    expect(response.body.subscription.status).toBe("ARCHIVED");
    expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "ARCHIVED" }
      })
    );
  });

  it("does not allow a user to update another user's subscription", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(null);

    await agent
      .put(`/api/subscriptions/${subscription.id}`)
      .send({ name: "Forbidden update" })
      .expect(404);
  });

  it("does not allow a user to read another user's subscription", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(null);

    await agent.get(`/api/subscriptions/${subscription.id}`).expect(404);

    expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: subscription.id,
          userId: user.id
        }
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

  it("allows an admin to list all subscriptions", async () => {
    const password = await bcrypt.hash("Admin123!", 12);
    const agent = request.agent(app);

    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...admin, password });
    await agent.post("/api/auth/login").send({ email: admin.email, password: "Admin123!" }).expect(200);

    mockPrisma.user.findUnique.mockResolvedValueOnce(admin);
    mockPrisma.subscription.findMany.mockResolvedValueOnce([
      { ...subscription, user: { id: user.id, name: user.name, email: user.email } }
    ]);

    const response = await agent.get("/api/admin/subscriptions").expect(200);

    expect(response.body.subscriptions).toHaveLength(1);
    expect(response.body.subscriptions[0].user.email).toBe(user.email);
    expect(response.body.totalMonthlyAmount).toBe(12);
    expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: expect.any(Object)
        })
      })
    );
  });

  it("rejects admin routes for regular users", async () => {
    const password = await bcrypt.hash("Password123!", 12);
    const agent = request.agent(app);

    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...user, password });
    await agent.post("/api/auth/login").send({ email: user.email, password: "Password123!" }).expect(200);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);

    await agent.get("/api/admin/users").expect(403);
  });

  it("allows an admin to delete another user", async () => {
    const password = await bcrypt.hash("Admin123!", 12);
    const agent = request.agent(app);

    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...admin, password });
    await agent.post("/api/auth/login").send({ email: admin.email, password: "Admin123!" }).expect(200);

    mockPrisma.user.findUnique.mockResolvedValueOnce(admin);
    mockPrisma.user.delete.mockResolvedValueOnce(user);

    await agent.delete(`/api/admin/users/${user.id}`).expect(204);

    expect(mockPrisma.user.delete).toHaveBeenCalledWith({
      where: { id: user.id }
    });
  });

  it("allows an admin to delete a subscription", async () => {
    const password = await bcrypt.hash("Admin123!", 12);
    const agent = request.agent(app);

    mockPrisma.user.findUnique.mockResolvedValueOnce({ ...admin, password });
    await agent.post("/api/auth/login").send({ email: admin.email, password: "Admin123!" }).expect(200);

    mockPrisma.user.findUnique.mockResolvedValueOnce(admin);
    mockPrisma.subscription.delete.mockResolvedValueOnce(subscription);

    await agent.delete(`/api/admin/subscriptions/${subscription.id}`).expect(204);

    expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({
      where: { id: subscription.id }
    });
  });
});
