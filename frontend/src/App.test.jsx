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

const adminUser = {
  ...user,
  role: "ADMIN"
};

const subscriptionsResponse = {
  subscriptions: [
    {
      id: "sub-1",
      name: "Netflix",
      price: 12,
      monthlyAmount: 12,
      billingCycle: "MONTHLY",
      renewalDate: "2026-06-05T00:00:00.000Z",
      status: "ACTIVE",
      categoryId: null,
      category: { name: "Streaming" }
    },
    {
      id: "sub-2",
      name: "Figma",
      price: 120,
      monthlyAmount: 10,
      billingCycle: "ANNUAL",
      renewalDate: "2026-06-20T00:00:00.000Z",
      status: "ACTIVE",
      categoryId: null,
      category: { name: "Software" }
    },
    {
      id: "sub-3",
      name: "Archived Cloud",
      price: 99,
      monthlyAmount: 99,
      billingCycle: "MONTHLY",
      renewalDate: "2026-06-10T00:00:00.000Z",
      status: "ARCHIVED",
      categoryId: null,
      category: { name: "Software" }
    },
    {
      id: "sub-4",
      name: "Paused Music",
      price: 5,
      monthlyAmount: 21.65,
      billingCycle: "WEEKLY",
      renewalDate: "2026-06-02T00:00:00.000Z",
      status: "INACTIVE",
      categoryId: null,
      category: { name: "Music" }
    }
  ],
  totalMonthlyAmount: 22
};

beforeEach(() => {
  apiRequest.mockImplementation((path) => {
    if (path.startsWith("/subscriptions")) {
      return Promise.resolve(subscriptionsResponse);
    }

    if (path === "/categories") {
      return Promise.resolve({ categories: [{ id: "cat-1", name: "Streaming" }] });
    }

    return Promise.resolve({});
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
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

    await waitFor(() => expect(screen.getAllByText("$22.00").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Ethan").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Prochains renouvellements").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Figma").length).toBeGreaterThan(0);
    expect(screen.queryByText("Paused Music")).not.toBeInTheDocument();
    expect(screen.getAllByText("$264.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getByText("A payer sous 7 jours: $12.00")).toBeInTheDocument();
  });

  it("shows a reliable zero-subscription dashboard", async () => {
    apiRequest.mockImplementation((path) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);

    await waitFor(() => expect(screen.getAllByText("$0.00").length).toBeGreaterThan(0));
    expect(screen.getAllByText("0").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Aucun renouvellement a venir").length).toBeGreaterThan(0);
  });

  it("refreshes dashboard values after creating a subscription", async () => {
    let currentResponse = { subscriptions: [], totalMonthlyAmount: 0 };
    apiRequest.mockImplementation((path, options = {}) => {
      if (path.startsWith("/subscriptions") && options.method === "POST") {
        currentResponse = {
          subscriptions: [
            {
              id: "sub-new",
              name: "Canva",
              price: 9.99,
              monthlyAmount: 9.99,
              billingCycle: "MONTHLY",
              renewalDate: "2026-06-03T00:00:00.000Z",
              status: "ACTIVE",
              categoryId: null,
              category: { name: "Design" }
            }
          ],
          totalMonthlyAmount: 9.99
        };
        return Promise.resolve({ subscription: currentResponse.subscriptions[0] });
      }

      if (path.startsWith("/subscriptions")) {
        return Promise.resolve(currentResponse);
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);

    await waitFor(() => expect(screen.getAllByText("$0.00").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: "Ajouter un abonnement" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Canva" } });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "9.99" } });
    fireEvent.change(screen.getByLabelText("Renewal Date"), { target: { value: "2026-06-03" } });
    fireEvent.click(screen.getByRole("button", { name: "Add Subscription" }));

    await waitFor(() => expect(screen.getAllByText("$9.99").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Canva").length).toBeGreaterThan(0);
  });

  it("shows a clear dashboard error state when subscriptions fail to load", async () => {
    apiRequest.mockImplementation((path) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.reject(new Error("API offline"));
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);

    await waitFor(() => expect(screen.getAllByText("Impossible de charger les donnees").length).toBeGreaterThan(0));
    expect(screen.getAllByText("API offline").length).toBeGreaterThan(0);
  });

  it("shows the subscription form from navigation", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Abonnements").length).toBeGreaterThan(0));
    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Figma").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Archived Cloud").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paused Music").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Add Subscription" })[0]);
    expect(screen.getAllByText("Add Subscription").length).toBeGreaterThan(0);
    expect(screen.getByText("Price")).toBeInTheDocument();
  });

  it("opens the edit subscription modal with existing data", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: "Edit Netflix" }));

    expect(screen.getByRole("heading", { name: "Edit Subscription" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Netflix");
    expect(screen.getByLabelText("Price")).toHaveValue(12);
    expect(screen.getByLabelText("Billing Cycle")).toHaveValue("MONTHLY");
    expect(screen.getByLabelText("Renewal Date")).toHaveValue("2026-06-05");
  });

  it("shows an empty subscriptions state when no subscriptions match", async () => {
    apiRequest.mockImplementation((path) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getByText("Aucun abonnement trouve")).toBeInTheDocument());
  });

  it("applies subscription search, status filters, and reset without duplicate calls", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Abonnements").length).toBeGreaterThan(0));
    apiRequest.mockClear();

    fireEvent.change(screen.getByLabelText("Rechercher"), { target: { value: "Figma" } });
    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/subscriptions?search=Figma"));
    expect(apiRequest).toHaveBeenCalledWith("/categories");

    apiRequest.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Archivés" }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/subscriptions?search=Figma&status=ARCHIVED"));

    apiRequest.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Archivés" }));
    expect(apiRequest).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Reinitialiser" }));
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/subscriptions"));
  });

  it("keeps active subscription filters after archiving an item", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Abonnements").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: "Actif" }));
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/subscriptions?status=ACTIVE"));

    apiRequest.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Archive Netflix" }));

    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/subscriptions/sub-1", expect.objectContaining({ method: "DELETE" })));
    expect(apiRequest).toHaveBeenCalledWith("/subscriptions?status=ACTIVE");
  });

  it("prevents subscription submission when required fields are invalid", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Abonnements").length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByRole("button", { name: "Add Subscription" })[0]);
    fireEvent.change(screen.getByLabelText("Renewal Date"), { target: { value: "" } });

    const postCallsBefore = apiRequest.mock.calls.filter(([, options]) => options?.method === "POST").length;
    const submitButtons = screen.getAllByRole("button", { name: "Add Subscription" });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Price must be greater than 0.")).toBeInTheDocument();
    expect(screen.getByText("Renewal date is required.")).toBeInTheDocument();
    expect(screen.getByText("Please correct the highlighted fields.")).toBeInTheDocument();
    expect(apiRequest.mock.calls.filter(([, options]) => options?.method === "POST")).toHaveLength(postCallsBefore);
  });

  it("submits a valid subscription payload from the modal", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: /Abonnements/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Abonnements").length).toBeGreaterThan(0));
    fireEvent.click(screen.getAllByRole("button", { name: "Add Subscription" })[0]);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Spotify" } });
    fireEvent.change(screen.getByLabelText("Price"), { target: { value: "9.99" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "cat-1" } });
    fireEvent.change(screen.getByLabelText("Billing Cycle"), { target: { value: "WEEKLY" } });
    fireEvent.change(screen.getByLabelText("Renewal Date"), { target: { value: "2026-06-15" } });
    fireEvent.change(screen.getByPlaceholderText(/Visa/), { target: { value: "Visa 4242" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Shared account" } });
    fireEvent.click(screen.getByRole("button", { name: "Toggle active status" }));

    const submitButtons = screen.getAllByRole("button", { name: "Add Subscription" });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/subscriptions",
        expect.objectContaining({
          method: "POST",
          body: expect.objectContaining({
            name: "Spotify",
            price: 9.99,
            billingCycle: "WEEKLY",
            status: "INACTIVE",
            renewalDate: "2026-06-15T00:00:00.000Z",
            categoryId: "cat-1",
            paymentMethod: "Visa 4242",
            description: "Shared account"
          })
        })
      );
    });
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
    expect(screen.queryByText("Depenses mensuelles")).not.toBeInTheDocument();
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

    await waitFor(() => expect(screen.getAllByText("Prochains renouvellements").length).toBeGreaterThan(0));
  });

  it("shows coherent analytics totals, averages, categories and top expenses", async () => {
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Statistiques" })[0]);

    await waitFor(() => expect(screen.getAllByText("Total depense").length).toBeGreaterThan(0));
    expect(screen.getAllByText("$22.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$264.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$11.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("$12.00").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Streaming").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Software").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Netflix").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Figma").length).toBeGreaterThan(0);
    expect(screen.queryByText("Archived Cloud")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Cette annee" })[0]);
    expect(screen.getAllByText("$264.00").length).toBeGreaterThan(0);
  });

  it("shows a clean empty analytics state", async () => {
    apiRequest.mockImplementation((path) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Statistiques" })[0]);

    await waitFor(() => expect(screen.getAllByText("Pas encore de statistiques").length).toBeGreaterThan(0));
    expect(screen.getAllByText("$0.00").length).toBeGreaterThan(0);
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

  it("shows clear admin empty states", async () => {
    apiRequest.mockImplementation((path) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      if (path === "/admin/users") {
        return Promise.resolve({ users: [] });
      }

      if (path === "/admin/subscriptions") {
        return Promise.resolve({ subscriptions: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user: adminUser,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Admin" })[0]);

    await waitFor(() => expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Admin Abonnements" }));
    expect(screen.getByText("Aucun abonnement global")).toBeInTheDocument();
  });

  it("shows global admin subscriptions with owner, status and monthly amount", async () => {
    apiRequest.mockImplementation((path) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      if (path === "/admin/users") {
        return Promise.resolve({ users: [] });
      }

      if (path === "/admin/subscriptions") {
        return Promise.resolve({
          subscriptions: [
            {
              id: "admin-sub-1",
              name: "Netflix Business",
              status: "ACTIVE",
              monthlyAmount: 19.99,
              user: { name: "Jamie", email: "member@test.local" }
            }
          ]
        });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user: adminUser,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Admin" })[0]);

    await waitFor(() => expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Admin Abonnements" }));

    expect(screen.getByText("Tous les abonnements")).toBeInTheDocument();
    expect(screen.getByText("Netflix Business")).toBeInTheDocument();
    expect(screen.getByText("Jamie")).toBeInTheDocument();
    expect(screen.getByText("member@test.local")).toBeInTheDocument();
    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(screen.getByText(/\$19.99/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Supprimer l'abonnement Netflix Business" })).toBeInTheDocument();
  });

  it("deletes an admin subscription with confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    apiRequest.mockImplementation((path, options = {}) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      if (path === "/admin/users") {
        return Promise.resolve({ users: [] });
      }

      if (path === "/admin/subscriptions/admin-sub-1" && options.method === "DELETE") {
        return Promise.resolve({});
      }

      if (path === "/admin/subscriptions") {
        return Promise.resolve({
          subscriptions: [
            {
              id: "admin-sub-1",
              name: "Netflix Business",
              status: "ACTIVE",
              monthlyAmount: 19.99,
              user: { name: "Jamie", email: "member@test.local" }
            }
          ]
        });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user: adminUser,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Admin" })[0]);

    await waitFor(() => expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Admin Abonnements" }));
    fireEvent.click(await screen.findByRole("button", { name: "Supprimer l'abonnement Netflix Business" }));

    await waitFor(() => expect(window.confirm).toHaveBeenCalledWith("Supprimer cet abonnement ?"));
    expect(apiRequest).toHaveBeenCalledWith("/admin/subscriptions/admin-sub-1", expect.objectContaining({ method: "DELETE" }));
  });

  it("creates an admin user from the admin panel", async () => {
    apiRequest.mockImplementation((path, options = {}) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      if (path === "/admin/users" && options.method === "POST") {
        return Promise.resolve({ user: { id: "user-3", name: "Taylor", email: "taylor@test.local", role: "ADMIN", isActive: true } });
      }

      if (path === "/admin/users") {
        return Promise.resolve({ users: [] });
      }

      if (path === "/admin/subscriptions") {
        return Promise.resolve({ subscriptions: [] });
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user: adminUser,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Admin" })[0]);

    await waitFor(() => expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Nom complet"), { target: { value: "Taylor" } });
    fireEvent.change(screen.getByLabelText("Adresse email"), { target: { value: "taylor@test.local" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Password123!" } });
    fireEvent.change(screen.getByLabelText(/R/), { target: { value: "ADMIN" } });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter" }));

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith(
        "/admin/users",
        expect.objectContaining({
          method: "POST",
          body: expect.objectContaining({
            name: "Taylor",
            email: "taylor@test.local",
            password: "Password123!",
            role: "ADMIN",
            isActive: true
          })
        })
      );
    });
  });

  it("updates admin user role/status and deletes with confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    apiRequest.mockImplementation((path, options = {}) => {
      if (path.startsWith("/subscriptions")) {
        return Promise.resolve({ subscriptions: [], totalMonthlyAmount: 0 });
      }

      if (path === "/categories") {
        return Promise.resolve({ categories: [] });
      }

      if (path === "/admin/users") {
        return Promise.resolve({
          users: [
            { ...adminUser, email: "ethan@test.local", role: "ADMIN", _count: { subscriptions: 0 } },
            { id: "user-2", name: "Jamie", email: "member@test.local", role: "USER", isActive: true, _count: { subscriptions: 2 } }
          ]
        });
      }

      if (path === "/admin/subscriptions") {
        return Promise.resolve({ subscriptions: [] });
      }

      if (path.startsWith("/admin/users/user-2")) {
        return Promise.resolve({});
      }

      return Promise.resolve({});
    });
    useAuth.mockReturnValue({
      user: adminUser,
      loading: false,
      logout: vi.fn()
    });

    render(<App />);
    fireEvent.click(screen.getAllByRole("button", { name: "Admin" })[0]);

    await waitFor(() => expect(screen.getByText("Jamie")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Supprimer.*ethan@test.local/ })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/R.*member@test.local/), { target: { value: "ADMIN" } });
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/admin/users/user-2", expect.objectContaining({ method: "PUT", body: { role: "ADMIN" } })));

    fireEvent.click(screen.getByLabelText(/Compte actif member@test.local/));
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith("/admin/users/user-2", expect.objectContaining({ method: "PUT", body: { isActive: false } })));

    fireEvent.click(screen.getByRole("button", { name: /Supprimer.*member@test.local/ }));
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(apiRequest).toHaveBeenCalledWith("/admin/users/user-2", expect.objectContaining({ method: "DELETE" }));
  });
});
