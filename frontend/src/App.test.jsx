import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.jsx";
import { apiRequest } from "./api/client.js";
import { useAuth } from "./context/AuthContext.jsx";

vi.mock("./api/client.js", () => ({
  apiRequest: vi.fn()
}));

vi.mock("./context/AuthContext.jsx", () => ({
  useAuth: vi.fn()
}));

const user = {
  id: "user-1",
  name: "Ethan",
  email: "ethan@test.local",
  role: "USER"
};

const subscriptionsResponse = {
  subscriptions: [
    {
      id: "sub-1",
      name: "Netflix",
      price: 12,
      monthlyAmount: 12,
      billingCycle: "MONTHLY",
      renewalDate: "2026-05-15T00:00:00.000Z",
      status: "ACTIVE",
      categoryId: null,
      category: { name: "Streaming" }
    }
  ],
  totalMonthlyAmount: 12
};

beforeEach(() => {
  apiRequest.mockImplementation((path) => {
    if (path.startsWith("/subscriptions")) {
      return Promise.resolve(subscriptionsResponse);
    }

    if (path === "/categories") {
      return Promise.resolve({ categories: [] });
    }

    return Promise.resolve({});
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("App", () => {
  it("renders the login page", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn()
    });

    render(<App />);

    expect(screen.getByRole("heading", { name: "Subscription Manager" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Connexion" }).length).toBeGreaterThan(0);
  });

  it("switches the login page from French to English", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "FR" }));

    expect(screen.getAllByRole("button", { name: "Login" }).length).toBeGreaterThan(0);
  });

  it("renders the dashboard for an authenticated user", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText("12.00 EUR")).toBeInTheDocument());
    expect(screen.getByText("Prochains renouvellements")).toBeInTheDocument();
    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
  });

  it("shows the subscription form from navigation", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /Abonnements/i }));

    await waitFor(() => expect(screen.getByText("Ajouter un abonnement")).toBeInTheDocument());
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
    expect(screen.getByLabelText("Prix")).toBeInTheDocument();
  });
});
