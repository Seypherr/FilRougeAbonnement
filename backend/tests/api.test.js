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
      findFirst: vi.fn(),
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

async function csrfHeaders(agent) {
  const response = await agent.get("/api/auth/csrf").expect(200);

  return { "x-csrf-token": response.body.csrfToken };
}

const user = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Test User",
  email: "user@test.local",
  avatarUrl: null,
  emailVerified: true,
  role: "USER",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const admin = {
  id: "22222222-2222-4222-8222-222222222222",
  name: "Admin",
  email: "admin@test.local",
  emailVerified: true,
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
  renewalDate: new Date("2099-05-15T00:00:00.000Z"),
  status: "ACTIVE",
  paymentMethod: null,
  userId: user.id,
  categoryId: null,
  category: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

beforeEach(() => {
  vi.resetAllMocks();
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

  it("rejects malformed emails during registration", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ name: user.name, email: "bad..email@test.local", password: "Password123!" })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
  });

  it("prepares a password reset without revealing whether the email exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "missing@test.local" })
      .expect(200);

    expect(response.body.message).toContain("If an account exists");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("resets a password with a valid reset token", async () => {
    mockPrisma.user.findFirst.mockResolvedValueOnce(user);
    mockPrisma.user.update.mockResolvedValueOnce(user);

    await request(app)
      .post("/api/auth/reset-password")
      .send({ token: "a".repeat(43), password: "NewPassword123!" })
      .expect(200);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: user.id },
        data: expect.objectContaining({
          passwordResetTokenHash: null,
          passwordResetTokenExpiresAt: null
        })
      })
    );
  });

  it("verifies an email with a valid verification token", async () => {
    const verifiedUser = { ...user, emailVerified: true };
    mockPrisma.user.findFirst.mockResolvedValueOnce({ ...user, emailVerified: false });
    mockPrisma.user.update.mockResolvedValueOnce(verifiedUser);

    const response = await request(app)
      .post("/api/auth/verify-email")
      .send({ token: "b".repeat(43) })
      .expect(200);

    expect(response.body.user.emailVerified).toBe(true);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailVerified: true,
          emailVerificationTokenHash: null,
          emailVerificationTokenExpiresAt: null
        })
      })
    );
  });

  it("blocks full subscription access when email is not verified", async () => {
    const agent = request.agent(app);
    const unverifiedUser = { ...user, emailVerified: false };
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(unverifiedUser);
    mockPrisma.user.update.mockResolvedValueOnce(unverifiedUser);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(unverifiedUser);

    await agent.get("/api/subscriptions").expect(403);
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
      .set(await csrfHeaders(agent))
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
        data: expect.objectContaining({
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl,
          email: updatedUser.email,
          emailVerified: false
        })
      })
    );
  });

  it("rejects imported image data URLs for the profile avatar", async () => {
    const agent = request.agent(app);
    const importedAvatar = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);

    const response = await agent
      .put("/api/auth/me")
      .set(await csrfHeaders(agent))
      .send({ avatarUrl: importedAvatar })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects protected mutations without a CSRF token", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    await agent
      .put("/api/auth/me")
      .send({ name: "Blocked Update" })
      .expect(403);

    expect(mockPrisma.user.update).not.toHaveBeenCalled();
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
      .set(await csrfHeaders(agent))
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
      .set(await csrfHeaders(agent))
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
      .set(await csrfHeaders(agent))
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
      .set(await csrfHeaders(agent))
      .send({
        name: "Netflix",
        price: 12,
        billingCycle: "MONTHLY",
        renewalDate: "2099-05-15T00:00:00.000Z"
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
      .set(await csrfHeaders(agent))
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

  it("rejects subscription creation with a past renewal date", async () => {
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
      .set(await csrfHeaders(agent))
      .send({
        name: "Old Plan",
        price: 9.99,
        billingCycle: "MONTHLY",
        renewalDate: "2000-01-01T00:00:00.000Z"
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
      .set(await csrfHeaders(agent))
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

    const response = await agent
      .delete(`/api/subscriptions/${subscription.id}`)
      .set(await csrfHeaders(agent))
      .expect(200);

    expect(response.body.subscription.status).toBe("ARCHIVED");
    expect(mockPrisma.subscription.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: "ARCHIVED" }
      })
    );
  });

  it("permanently deletes an archived subscription owned by the authenticated user", async () => {
    const agent = request.agent(app);
    const archivedSubscription = { ...subscription, status: "ARCHIVED" };
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(archivedSubscription);
    mockPrisma.subscription.delete.mockResolvedValueOnce(archivedSubscription);

    await agent
      .delete(`/api/subscriptions/${subscription.id}/permanent`)
      .set(await csrfHeaders(agent))
      .expect(204);

    expect(mockPrisma.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: subscription.id,
          userId: user.id
        }
      })
    );
    expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({
      where: { id: subscription.id }
    });
  });

  it("rejects permanent deletion when the subscription is not archived", async () => {
    const agent = request.agent(app);
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    mockPrisma.user.create.mockResolvedValueOnce(user);

    await agent
      .post("/api/auth/register")
      .send({ name: user.name, email: user.email, password: "Password123!" })
      .expect(201);

    mockPrisma.user.findUnique.mockResolvedValueOnce(user);
    mockPrisma.subscription.findFirst.mockResolvedValueOnce(subscription);

    const response = await agent
      .delete(`/api/subscriptions/${subscription.id}/permanent`)
      .set(await csrfHeaders(agent))
      .expect(400);

    expect(response.body.message).toBe("Only archived subscriptions can be permanently deleted");
    expect(mockPrisma.subscription.delete).not.toHaveBeenCalled();
  });

  it("does not allow permanent deletion of another user's subscription", async () => {
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
      .delete(`/api/subscriptions/${subscription.id}/permanent`)
      .set(await csrfHeaders(agent))
      .expect(404);

    expect(mockPrisma.subscription.delete).not.toHaveBeenCalled();
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
      .set(await csrfHeaders(agent))
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

    await agent
      .delete(`/api/admin/users/${user.id}`)
      .set(await csrfHeaders(agent))
      .expect(204);

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

    await agent
      .delete(`/api/admin/subscriptions/${subscription.id}`)
      .set(await csrfHeaders(agent))
      .expect(204);

    expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({
      where: { id: subscription.id }
    });
  });
});
