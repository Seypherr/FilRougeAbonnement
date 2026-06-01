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
  role: "USER",
  isActive: true
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

    expect(screen.getByText("Bon retour !")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Connexion" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Inscription" }).length).toBeGreaterThan(0);
  });

  it("does not show unavailable social auth buttons", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn()
    });

    render(<App />);

    expect(screen.queryByRole("button", { name: "Google" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apple" })).not.toBeInTheDocument();
  });

  it("toggles password visibility from the auth page", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn()
    });

    render(<App />);
    const passwordInput = screen.getByPlaceholderText("Saisissez votre mot de passe");

    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Masquer le mot de passe" })).toBeInTheDocument();
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

    await waitFor(() => expect(screen.getAllByText("$12.00").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Upcoming Renewals").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
  });

  it("shows the subscription form from navigation", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getByText("Subscriptions")).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole("button", { name: "Add Subscription" })[0]);
    expect(screen.getAllByText("Add Subscription").length).toBeGreaterThan(0);
    expect(screen.getByText("Price")).toBeInTheDocument();
  });

  it("opens profile from navigation and logs out", async () => {
    const logout = vi.fn();
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Profil" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Profil" })).toBeInTheDocument());
    expect(screen.getAllByText(user.email).length).toBeGreaterThan(0);
    expect(screen.getAllByText(user.role).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Déconnexion" }));
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it("opens profile from the user bottom navigation instead of returning to dashboard", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Profil" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Profil" })).toBeInTheDocument());
    expect(screen.queryByText("Monthly Spending")).not.toBeInTheDocument();
  });

  it("returns from analytics to dashboard with the back button", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Statistiques" })[0]);

    await waitFor(() => expect(screen.getByRole("button", { name: "Retour au dashboard" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Retour au dashboard" }));

    await waitFor(() => expect(screen.getAllByText("Upcoming Renewals").length).toBeGreaterThan(0));
  });

  it("logs out from the desktop sidebar", async () => {
    const logout = vi.fn();
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Déconnexion depuis la barre latérale" }));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });

  it("shows a clear sidebar logout error", async () => {
    const logout = vi.fn().mockRejectedValue(new Error("Logout failed"));
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Déconnexion depuis la barre latérale" }));

    await waitFor(() => expect(screen.getByText("Logout failed")).toBeInTheDocument());
  });

  it("switches connected profile labels from French to English", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Profil" }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Profil" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "FR" }));

    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByText("Interface language")).toBeInTheDocument();
  });
});
