import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  Languages,
  LogOut,
  Plus,
  Save,
  Search,
  Shield,
  UserRound
} from "lucide-react";
import { apiRequest } from "./api/client.js";
import { Button } from "./components/Button.jsx";
import { Card } from "./components/Card.jsx";
import { FormField } from "./components/FormField.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { dictionaries } from "./i18n/dictionaries.js";

const emptySubscription = {
  name: "",
  description: "",
  price: "",
  billingCycle: "MONTHLY",
  renewalDate: new Date().toISOString().slice(0, 10),
  status: "ACTIVE",
  paymentMethod: "",
  categoryId: ""
};

const statusLabels = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived"
};

const cycleLabels = {
  MONTHLY: "monthly",
  ANNUAL: "annual",
  WEEKLY: "weekly"
};

export function App() {
  const [language, setLanguage] = useState("fr");
  const t = dictionaries[language];
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-surface text-ink">{t.loading}</main>;
  }

  if (!user) {
    return <AuthScreen t={t} language={language} setLanguage={setLanguage} />;
  }

  return (
    <Shell t={t} language={language} setLanguage={setLanguage} user={user} logout={logout} />
  );
}

function AuthScreen({ t, language, setLanguage }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-8 text-ink">
      <div className="mx-auto grid max-w-md gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.appName}</h1>
            <p className="mt-1 text-sm text-gray-600">React + Express + Prisma</p>
          </div>
          <LanguageButton language={language} setLanguage={setLanguage} />
        </header>

        <Card>
          <div className="mb-4 grid grid-cols-2 rounded-md border border-line p-1">
            <button
              className={`rounded px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-ink text-white" : "text-gray-600"}`}
              onClick={() => setMode("login")}
            >
              {t.login}
            </button>
            <button
              className={`rounded px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-ink text-white" : "text-gray-600"}`}
              onClick={() => setMode("register")}
            >
              {t.register}
            </button>
          </div>

          <form className="grid gap-4" onSubmit={submit}>
            {mode === "register" && (
              <FormField label={t.name}>
                <input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </FormField>
            )}
            <FormField label={t.email}>
              <input className="input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </FormField>
            <FormField label={t.password}>
              <input className="input" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
            </FormField>
            {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{t.error}: {error}</p>}
            <Button disabled={loading}>{mode === "login" ? t.login : t.createAccount}</Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

function Shell({ t, language, setLanguage, user, logout }) {
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const navItems = [
    ["dashboard", t.dashboard, CircleDollarSign],
    ["subscriptions", t.subscriptions, Search],
    ["statistics", t.statistics, BarChart3],
    ...(user.role === "ADMIN" ? [["admin", t.admin, Shield]] : [])
  ];

  return (
    <main className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">{t.appName}</h1>
            <p className="flex items-center gap-2 text-sm text-gray-600"><UserRound size={16} /> {user.name} - {user.role}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageButton language={language} setLanguage={setLanguage} />
            <Button variant="secondary" onClick={logout}><LogOut size={16} />{t.logout}</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        <nav className="flex gap-2 overflow-x-auto">
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold ${tab === id ? "bg-ink text-white" : "border border-line bg-white text-gray-700"}`}
              onClick={() => setTab(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {tab === "dashboard" && <Dashboard t={t} setTab={setTab} />}
        {tab === "subscriptions" && <SubscriptionsPage t={t} notify={notify} />}
        {tab === "statistics" && <StatisticsPage t={t} />}
        {tab === "admin" && user.role === "ADMIN" && <AdminPage t={t} notify={notify} />}
      </div>
      <Toast toast={toast} />
    </main>
  );
}

function LanguageButton({ language, setLanguage }) {
  return (
    <Button variant="secondary" onClick={() => setLanguage(language === "fr" ? "en" : "fr")}>
      <Languages size={16} />
      {language.toUpperCase()}
    </Button>
  );
}

function Toast({ toast }) {
  if (!toast) {
    return null;
  }

  const color = toast.type === "error" ? "bg-red-700" : "bg-emerald-700";

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 rounded-md px-4 py-3 text-sm font-semibold text-white shadow-lg sm:left-auto sm:right-6 sm:w-96 ${color}`}>
      {toast.message}
    </div>
  );
}

function Dashboard({ t, setTab }) {
  const { subscriptions, totalMonthlyAmount, loading } = useSubscriptions(t);
  const activeCount = subscriptions.filter((item) => item.status === "ACTIVE").length;
  const archivedCount = subscriptions.filter((item) => item.status === "ARCHIVED").length;
  const upcomingRenewals = [...subscriptions]
    .filter((item) => item.status === "ACTIVE")
    .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
    .slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Metric title={t.totalMonthly} value={`${totalMonthlyAmount.toFixed(2)} EUR`} loading={loading} highlight />
      <Metric title={t.activeSubscriptions} value={activeCount} loading={loading} />
      <Metric title={t.estimatedYearly} value={`${(totalMonthlyAmount * 12).toFixed(2)} EUR`} loading={loading} />
      <Card className="md:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{t.subscriptions}</h2>
            <p className="text-sm text-gray-600">{subscriptions.slice(0, 3).map((item) => item.name).join(", ") || t.empty}</p>
          </div>
          <Button onClick={() => setTab("subscriptions")}><Plus size={16} />{t.addSubscription}</Button>
        </div>
      </Card>
      <Metric title={t.archived} value={archivedCount} loading={loading} />
      <Card className="md:col-span-3">
        <h2 className="mb-3 text-lg font-bold">{t.nextRenewals}</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {upcomingRenewals.length === 0 ? (
            <p className="text-sm text-gray-600">{t.noRenewals}</p>
          ) : (
            upcomingRenewals.map((item) => (
              <div className="rounded-md bg-surface p-3" key={item.id}>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">{new Date(item.renewalDate).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function Metric({ title, value, loading, highlight = false }) {
  return (
    <Card className={highlight ? "border-ink" : ""}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-normal">{loading ? "..." : value}</p>
    </Card>
  );
}

function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalMonthlyAmount, setTotalMonthlyAmount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const [subscriptionData, categoryData] = await Promise.all([
        apiRequest(`/subscriptions${query}`),
        apiRequest("/categories")
      ]);
      setSubscriptions(subscriptionData.subscriptions);
      setTotalMonthlyAmount(subscriptionData.totalMonthlyAmount ?? 0);
      setCategories(categoryData.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { subscriptions, totalMonthlyAmount, categories, loading, error, load };
}

function SubscriptionsPage({ t, notify }) {
  const { subscriptions, categories, loading, error, load } = useSubscriptions();
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [form, setForm] = useState(emptySubscription);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    load(params.toString() ? `?${params.toString()}` : "");
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");

    const payload = {
      ...form,
      price: Number(form.price),
      categoryId: form.categoryId || null,
      renewalDate: new Date(form.renewalDate).toISOString()
    };

    try {
      if (editingId) {
        await apiRequest(`/subscriptions/${editingId}`, { method: "PUT", body: payload });
        notify(t.subscriptionUpdated);
      } else {
        await apiRequest("/subscriptions", { method: "POST", body: payload });
        notify(t.subscriptionCreated);
      }
      setForm(emptySubscription);
      setEditingId(null);
      load();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const edit = (subscription) => {
    setEditingId(subscription.id);
    setForm({
      name: subscription.name,
      description: subscription.description ?? "",
      price: subscription.price,
      billingCycle: subscription.billingCycle,
      renewalDate: subscription.renewalDate.slice(0, 10),
      status: subscription.status,
      paymentMethod: subscription.paymentMethod ?? "",
      categoryId: subscription.categoryId ?? ""
    });
  };

  const archive = async (subscription) => {
    if (!window.confirm(t.confirmArchive)) {
      return;
    }

    try {
      await apiRequest(`/subscriptions/${subscription.id}`, { method: "DELETE" });
      notify(t.subscriptionArchived);
      load();
    } catch (err) {
      setFormError(err.message);
      notify(err.message, "error");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <h2 className="mb-4 text-lg font-bold">{editingId ? t.updateSubscription : t.addSubscription}</h2>
        <form className="grid gap-3" onSubmit={submit}>
          <FormField label={t.name}><input className="input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></FormField>
          <FormField label={t.price}><input className="input" type="number" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></FormField>
          <FormField label={t.cycle}>
            <select className="input" value={form.billingCycle} onChange={(event) => setForm({ ...form, billingCycle: event.target.value })}>
              {Object.entries(cycleLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
            </select>
          </FormField>
          <FormField label={t.status}>
            <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {Object.entries(statusLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
            </select>
          </FormField>
          <FormField label={t.renewalDate}><input className="input" type="date" value={form.renewalDate} onChange={(event) => setForm({ ...form, renewalDate: event.target.value })} required /></FormField>
          <FormField label={t.category}>
            <select className="input" value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              <option value="">{t.all}</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </FormField>
          <FormField label={t.paymentMethod}><input className="input" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })} /></FormField>
          <FormField label={t.description}><textarea className="input min-h-20" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
          {formError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button><Save size={16} />{t.save}</Button>
            {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptySubscription); }}>{t.cancel}</Button>}
          </div>
        </form>
      </Card>

      <section className="grid gap-4">
        <Card>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input className="input" placeholder={t.search} value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
            <select className="input" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="">{t.all}</option>
              {Object.entries(statusLabels).map(([value, key]) => <option key={value} value={value}>{t[key]}</option>)}
            </select>
            <Button type="button" onClick={applyFilters}><Search size={16} />{t.search}</Button>
          </div>
        </Card>
        {error && <Card><p className="text-sm text-red-700">{error}</p></Card>}
        {loading ? <Card>{t.loading}</Card> : subscriptions.length === 0 ? <Card>{t.empty}</Card> : subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{subscription.name}</h3>
                <p className="text-sm text-gray-600">{subscription.category?.name ?? t.category} · {t[cycleLabels[subscription.billingCycle]]}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-bold">{subscription.price.toFixed(2)} EUR</p>
                <p className="text-sm text-gray-600">{subscription.monthlyAmount.toFixed(2)} EUR / {t.perMonth}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
              <span className="badge">{t[statusLabels[subscription.status]]}</span>
              <span className="badge">{new Date(subscription.renewalDate).toLocaleDateString()}</span>
              <Button variant="secondary" onClick={() => edit(subscription)}>{t.updateSubscription}</Button>
              <Button variant="danger" onClick={() => archive(subscription)}>{t.archived}</Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

function StatisticsPage({ t }) {
  const { subscriptions, totalMonthlyAmount, loading } = useSubscriptions();
  const active = subscriptions.filter((item) => item.status === "ACTIVE");
  const totalAnnual = totalMonthlyAmount * 12;
  const byCategory = useMemo(() => {
    return active.reduce((acc, item) => {
      const key = item.category?.name ?? t.category;
      acc[key] = (acc[key] ?? 0) + item.monthlyAmount;
      return acc;
    }, {});
  }, [active, t.category]);
  const topCosts = [...active].sort((a, b) => b.monthlyAmount - a.monthlyAmount).slice(0, 5);

  if (loading) return <Card>{t.loading}</Card>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Metric title={t.totalMonthly} value={`${totalMonthlyAmount.toFixed(2)} EUR`} />
      <Metric title={t.annualEstimate} value={`${totalAnnual.toFixed(2)} EUR`} />
      <Card>
        <h2 className="mb-3 text-lg font-bold">{t.byCategory}</h2>
        <Bars data={byCategory} emptyText={t.empty} />
      </Card>
      <Card>
        <h2 className="mb-3 text-lg font-bold">{t.topCosts}</h2>
        <div className="grid gap-2">
          {topCosts.length === 0 ? t.empty : topCosts.map((item) => (
            <div className="flex justify-between rounded-md bg-surface p-3" key={item.id}>
              <span>{item.name}</span>
              <strong>{item.monthlyAmount.toFixed(2)} EUR</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Bars({ data, emptyText }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, value]) => value), 1);

  if (entries.length === 0) return <p className="text-sm text-gray-600">{emptyText}</p>;

  return (
    <div className="grid gap-3">
      {entries.map(([label, value]) => (
        <div key={label}>
          <div className="mb-1 flex justify-between text-sm"><span>{label}</span><strong>{value.toFixed(2)} EUR</strong></div>
          <div className="h-3 rounded bg-gray-200"><div className="h-3 rounded bg-emerald-600" style={{ width: `${(value / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function AdminPage({ t, notify }) {
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER", isActive: true });
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [userData, subscriptionData] = await Promise.all([
        apiRequest("/admin/users"),
        apiRequest("/admin/subscriptions")
      ]);
      setUsers(userData.users);
      setSubscriptions(subscriptionData.subscriptions);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateUser = async (user, patch) => {
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "PUT", body: patch });
      notify(t.userUpdated);
      load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/admin/users", { method: "POST", body: newUser });
      setNewUser({ name: "", email: "", password: "", role: "USER", isActive: true });
      notify(t.userCreated);
      load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(t.confirmDeleteUser)) {
      return;
    }

    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "DELETE" });
      notify(t.userDeleted);
      load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    }
  };

  return (
    <div className="grid gap-6">
      {error && <Card><p className="text-sm text-red-700">{error}</p></Card>}
      <Card>
        <h2 className="mb-4 text-lg font-bold">{t.createUser}</h2>
        <form className="grid gap-3 md:grid-cols-5" onSubmit={createUser}>
          <input className="input" placeholder={t.name} value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} required />
          <input className="input" placeholder={t.email} type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} required />
          <input className="input" placeholder={t.password} type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} required minLength={8} />
          <select className="input" value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <Button><Plus size={16} />{t.save}</Button>
        </form>
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-bold">{t.manageUsers}</h2>
        <div className="grid gap-3 md:hidden">
          {users.map((item) => (
            <div className="rounded-md bg-surface p-3" key={item.id}>
              <div className="mb-3">
                <p className="font-bold">{item.name}</p>
                <p className="break-all text-sm text-gray-600">{item.email}</p>
                <p className="mt-1 text-sm text-gray-600">{t.subscriptionCount}: {item._count?.subscriptions ?? 0}</p>
              </div>
              <div className="grid gap-2">
                <select className="input" value={item.role} onChange={(event) => updateUser(item, { role: event.target.value })}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <Button variant="secondary" onClick={() => updateUser(item, { isActive: !item.isActive })}>
                  {item.isActive ? t.disabled : t.enabled}
                </Button>
                <Button variant="danger" onClick={() => deleteUser(item)}>{t.delete}</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="table">
            <thead><tr><th>{t.name}</th><th>{t.email}</th><th>{t.role}</th><th>{t.status}</th><th>{t.actions}</th></tr></thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <select className="input" value={item.role} onChange={(event) => updateUser(item, { role: event.target.value })}>
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>{item.isActive ? t.enabled : t.disabled}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => updateUser(item, { isActive: !item.isActive })}>
                        {item.isActive ? t.disabled : t.enabled}
                      </Button>
                      <Button variant="danger" onClick={() => deleteUser(item)}>{t.delete}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="mb-4 text-lg font-bold">{t.allSubscriptions}</h2>
        <div className="grid gap-2">
          {subscriptions.map((item) => (
            <div key={item.id} className="flex flex-wrap justify-between gap-3 rounded-md bg-surface p-3">
              <span>{item.name} - {item.user?.email}</span>
              <strong>{item.monthlyAmount.toFixed(2)} EUR / {t.perMonth}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
