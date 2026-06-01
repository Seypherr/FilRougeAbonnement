import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import { StatePanel } from "../components/StatePanel.jsx";
import { formatMoney } from "../utils/subscriptions.js";

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" aria-label={label} className="peer sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="h-[18px] w-8 rounded-full bg-[#6B7280] after:absolute after:left-[2px] after:top-[2px] after:size-3.5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#10B981] peer-checked:after:translate-x-[14px]" />
    </label>
  );
}

function getUserColors(role) {
  if (role === "ADMIN") return { avatar: "bg-[#6C51FF]/10", text: "text-[#6C51FF]", badge: "bg-[#6C51FF]/15 text-[#6C51FF]" };
  return { avatar: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-600" };
}

function getSubscriptionStatus(status, t) {
  if (status === "ACTIVE") {
    return { label: t.active, className: "bg-[#10B981]/10 text-[#10B981]" };
  }

  if (status === "INACTIVE") {
    return { label: t.paused, className: "bg-amber-100 text-amber-600" };
  }

  return { label: t.archived, className: "bg-slate-100 text-slate-500" };
}

export function AdminPage({ t, notify, currentUser }) {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "USER", isActive: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyUserId, setBusyUserId] = useState("");
  const [busySubscriptionId, setBusySubscriptionId] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [userData, subscriptionData] = await Promise.all([
        apiRequest("/admin/users"),
        apiRequest("/admin/subscriptions")
      ]);
      setUsers(userData.users);
      setSubscriptions(subscriptionData.subscriptions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await apiRequest("/admin/users", { method: "POST", body: newUser });
      setNewUser({ name: "", email: "", password: "", role: "USER", isActive: true });
      notify(t.userCreated);
      await load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const updateUser = async (user, patch) => {
    if (busyUserId) return;
    setBusyUserId(user.id);
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "PUT", body: patch });
      notify(t.userUpdated);
      await load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setBusyUserId("");
    }
  };

  const deleteUser = async (user) => {
    if (user.id === currentUser?.id || busyUserId) return;
    if (!window.confirm(t.confirmDeleteUser)) return;
    setBusyUserId(user.id);
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: "DELETE" });
      notify(t.userDeleted);
      await load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setBusyUserId("");
    }
  };

  const deleteSubscription = async (subscription) => {
    if (busySubscriptionId) return;
    if (!window.confirm(t.confirmDeleteSubscription)) return;
    setBusySubscriptionId(subscription.id);
    try {
      await apiRequest(`/admin/subscriptions/${subscription.id}`, { method: "DELETE" });
      notify(t.subscriptionDeleted);
      await load();
    } catch (err) {
      setError(err.message);
      notify(err.message, "error");
    } finally {
      setBusySubscriptionId("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-28 text-slate-800 lg:min-h-0 lg:pb-8">
      <header className="sticky top-0 z-30 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] lg:rounded-[24px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 pb-4 pt-12 lg:pt-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#6C51FF]/10 text-[#6C51FF]">
              <i className="ph-fill ph-shield-check text-lg" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">{t.adminPanel}</h1>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-6 border-b border-slate-100 px-5">
          <button aria-label={`${t.admin} ${t.users}`} onClick={() => setTab("users")} className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === "users" ? "border-[#6C51FF] text-[#6C51FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{t.users}</button>
          <button aria-label={`${t.admin} ${t.subscriptions}`} onClick={() => setTab("subscriptions")} className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === "subscriptions" ? "border-[#6C51FF] text-[#6C51FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{t.subscriptions}</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-5 pb-24">
        {error && <StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" />}

        {tab === "users" && (
          <>
            <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-slate-800">
                <i className="ph-fill ph-user-plus text-lg text-[#6C51FF]" />
                {t.createNewUser}
              </h2>
              <form className="flex flex-col gap-4 md:flex-row" onSubmit={createUser}>
                <input aria-label={t.fullName} value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} placeholder={t.fullName} className="w-full rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-medium transition-all placeholder:font-normal focus:border-[#6C51FF] focus:outline-none focus:ring-1 focus:ring-[#6C51FF]" required disabled={creating} />
                <input aria-label={t.emailAddress} value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} placeholder={t.emailAddress} type="email" className="w-full rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-medium transition-all placeholder:font-normal focus:border-[#6C51FF] focus:outline-none focus:ring-1 focus:ring-[#6C51FF]" required disabled={creating} />
                <input aria-label={t.password} value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} placeholder={t.password} type="password" className="w-full rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-medium transition-all placeholder:font-normal focus:border-[#6C51FF] focus:outline-none focus:ring-1 focus:ring-[#6C51FF]" required minLength={8} disabled={creating} />
                <select aria-label={t.role} value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })} className="rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-semibold focus:border-[#6C51FF] focus:outline-none" disabled={creating}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button disabled={creating} className="rounded-xl bg-[#6C51FF] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)] transition-all hover:bg-[#5a46e0] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                  {creating ? t.loading : t.addUser}
                </button>
              </form>
            </section>

            <section>
              <h2 className="mb-4 px-1 text-[18px] font-bold text-slate-800">{t.userManagement}</h2>
              <div className="grid gap-3.5">
                {loading ? (
                  <StatePanel title={t.loadingAdmin} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" />
                ) : users.length === 0 ? (
                  <StatePanel title={t.emptyUsersTitle} message={t.emptyUsersMessage} tone="empty" icon="ph-users" />
                ) : users.map((user) => {
                  const colors = getUserColors(user.role);
                  const isCurrentUser = user.id === currentUser?.id;
                  const isBusy = busyUserId === user.id;
                  return (
                    <div key={user.id} className={`flex flex-col gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] ${!user.isActive ? "opacity-75" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${colors.avatar}`}>
                          <span className={`text-[16px] font-bold ${colors.text}`}>{user.name?.[0] ?? "U"}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate text-[15px] font-bold leading-tight text-slate-800">{user.name}</h3>
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${colors.badge}`}>{user.role}</span>
                            {isCurrentUser && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">{t.currentAccount}</span>}
                          </div>
                          <p className="mt-0.5 truncate text-[12px] text-slate-500">{user.email}</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-400">{t.subscriptionCount}: {user._count?.subscriptions ?? 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-3">
                          <select aria-label={`${t.role} ${user.email}`} value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} disabled={isCurrentUser || isBusy} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <Toggle label={`${t.accountActive} ${user.email}`} checked={user.isActive} onChange={() => updateUser(user, { isActive: !user.isActive })} disabled={isCurrentUser || isBusy} />
                        </div>
                        <button aria-label={`${t.deleteUser} ${user.email}`} disabled={isCurrentUser || isBusy} onClick={() => deleteUser(user)} className="flex size-9 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                          <i className="ph-bold ph-trash text-sm" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {tab === "subscriptions" && (
          <section>
            <h2 className="mb-4 px-1 text-[18px] font-bold text-slate-800">{t.allSubscriptions}</h2>
            <div className="flex flex-col gap-3.5">
              {loading ? (
                <StatePanel title={t.loadingAdmin} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" />
              ) : subscriptions.length === 0 ? (
                <StatePanel title={t.emptyAdminSubscriptionsTitle} message={t.emptyAdminSubscriptionsMessage} tone="empty" icon="ph-receipt" />
              ) : subscriptions.map((sub) => {
                const status = getSubscriptionStatus(sub.status, t);
                const isBusy = busySubscriptionId === sub.id;
                return (
                  <div key={sub.id} className="flex flex-col justify-between gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-rose-50">
                        <i className="ph-fill ph-film-strip text-2xl text-rose-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-[15px] font-bold leading-tight text-slate-800">{sub.name}</h3>
                        <p className="mt-1 truncate text-[12px] text-slate-500">{sub.user?.name || sub.user?.email || t.user}</p>
                        {sub.user?.email && <p className="mt-0.5 truncate text-[11px] text-slate-400">{sub.user.email}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                      <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${status.className}`}>{status.label}</span>
                      <p className="text-[13px] font-bold text-slate-700">{formatMoney(sub.monthlyAmount)} <span className="text-slate-400">{t.perMonth}</span></p>
                      <button aria-label={`${t.deleteSubscription} ${sub.name}`} disabled={isBusy} onClick={() => deleteSubscription(sub)} className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                        <i className="ph-bold ph-trash text-sm" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
