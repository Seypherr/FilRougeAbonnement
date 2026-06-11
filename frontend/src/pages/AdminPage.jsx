import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import { StatePanel } from "../components/StatePanel.jsx";
import { SubscriptionLogo } from "../components/SubscriptionLogo.jsx";
import { formatMoney } from "../utils/subscriptions.js";

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <input type="checkbox" aria-label={label} className="peer sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <div className="h-7 w-12 rounded-full bg-slate-300 shadow-inner after:absolute after:left-[2px] after:top-[2px] after:size-6 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-5" />
    </label>
  );
}

function getUserColors(role) {
  if (role === "ADMIN") return { avatar: "bg-[#6C51FF]/10", text: "text-[#6C51FF]", badge: "bg-[#6C51FF]/15 text-[#6C51FF]" };
  return { avatar: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-600" };
}

function getSubscriptionStatus(status, t) {
  if (status === "ACTIVE") {
    return { label: t.active, className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" };
  }

  if (status === "INACTIVE") {
    return { label: t.paused, className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100" };
  }

  return { label: t.archived, className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200" };
}

function RoleBadge({ role }) {
  const colors = getUserColors(role);
  return <span className={`inline-flex rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider ${colors.badge}`}>{role}</span>;
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
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] lg:rounded-[24px] lg:border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 pb-4 pt-12 lg:px-6 lg:pt-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#6C51FF]/10 text-[#6C51FF]">
              <i className="ph-fill ph-shield-check text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">{t.adminPanel}</h1>
              <p className="mt-0.5 hidden text-xs font-semibold text-slate-400 sm:block">{t.manageUsers}</p>
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-6 px-5 lg:px-6">
          <button aria-label={`${t.admin} ${t.users}`} onClick={() => setTab("users")} className={`border-b-2 pb-3 text-sm font-bold transition-colors ${tab === "users" ? "border-[#6C51FF] text-[#6C51FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{t.users}</button>
          <button aria-label={`${t.admin} ${t.subscriptions}`} onClick={() => setTab("subscriptions")} className={`border-b-2 pb-3 text-sm font-bold transition-colors ${tab === "subscriptions" ? "border-[#6C51FF] text-[#6C51FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>{t.subscriptions}</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-5 pb-24 lg:px-0">
        {error && <StatePanel title={t.apiErrorTitle} message={error || t.apiErrorMessage} tone="error" icon="ph-warning-circle" />}

        {tab === "users" && (
          <>
            <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] lg:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-[16px] font-black text-slate-900">
                  <i className="ph-fill ph-user-plus text-lg text-[#6C51FF]" />
                  {t.createNewUser}
                </h2>
              </div>
              <form className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr_1fr_150px_130px]" onSubmit={createUser}>
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

            <section className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.06)] lg:p-0">
              <div className="flex items-center justify-between px-1 pb-4 lg:px-6 lg:pb-0 lg:pt-5">
                <h2 className="text-[18px] font-black text-slate-900">{t.userManagement}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">{users.length} {t.users}</span>
              </div>

              {loading ? (
                <div className="lg:p-6"><StatePanel title={t.loadingAdmin} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" /></div>
              ) : users.length === 0 ? (
                <div className="lg:p-6"><StatePanel title={t.emptyUsersTitle} message={t.emptyUsersMessage} tone="empty" icon="ph-users" /></div>
              ) : (
                <div className="grid gap-3 lg:gap-0">
                  <div className="hidden border-b border-slate-100 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 lg:grid lg:grid-cols-[minmax(280px,1.35fr)_minmax(210px,0.75fr)_minmax(210px,0.75fr)_150px_72px] lg:items-center">
                    <span>{t.user}</span>
                    <span>{t.role}</span>
                    <span>{t.status}</span>
                    <span>{t.subscriptionCount}</span>
                    <span className="text-right">{t.actions}</span>
                  </div>

                  {users.map((user) => {
                    const colors = getUserColors(user.role);
                    const isCurrentUser = user.id === currentUser?.id;
                    const isBusy = busyUserId === user.id;
                    return (
                      <div key={user.id} className={`grid gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] lg:grid-cols-[minmax(280px,1.35fr)_minmax(210px,0.75fr)_minmax(210px,0.75fr)_150px_72px] lg:items-center lg:rounded-none lg:border-0 lg:border-b lg:p-6 lg:shadow-none ${!user.isActive ? "opacity-75" : ""}`}>
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${colors.avatar}`}>
                            <span className={`text-[16px] font-bold ${colors.text}`}>{user.name?.[0] ?? "U"}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">{user.name}</h3>
                              {isCurrentUser && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500">{t.currentAccount}</span>}
                            </div>
                            <p className="mt-0.5 truncate text-[12px] font-medium text-slate-500">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/70 p-3 lg:justify-start lg:bg-transparent lg:p-0">
                          <span className="text-xs font-bold text-slate-400 lg:hidden">{t.role}</span>
                          <div className="flex min-w-0 flex-wrap items-center gap-3">
                            <RoleBadge role={user.role} />
                            <select aria-label={`${t.role} ${user.email}`} value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} disabled={isCurrentUser || isBusy} className="min-h-11 min-w-[128px] rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 shadow-sm transition focus:border-[#6C51FF] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50/70 p-3 lg:justify-start lg:bg-transparent lg:p-0">
                          <span className="text-xs font-bold text-slate-400 lg:hidden">{t.status}</span>
                          <div className="flex min-w-[150px] items-center justify-between gap-4">
                            <span className={`min-w-[74px] text-sm font-black ${user.isActive ? "text-emerald-600" : "text-slate-400"}`}>{user.isActive ? t.enabled : t.disabled}</span>
                            <Toggle label={`${t.accountActive} ${user.email}`} checked={user.isActive} onChange={() => updateUser(user, { isActive: !user.isActive })} disabled={isCurrentUser || isBusy} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-slate-400 lg:hidden">{t.subscriptionCount}</span>
                          <span className="text-sm font-black text-slate-700">{user._count?.subscriptions ?? 0}</span>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                          <button aria-label={`${t.deleteUser} ${user.email}`} disabled={isCurrentUser || isBusy} onClick={() => deleteUser(user)} className="flex size-10 items-center justify-center rounded-xl bg-[#EF4444]/10 text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                            <i className="ph-bold ph-trash text-sm" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {tab === "subscriptions" && (
          <section className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.06)] lg:p-0">
            <div className="flex items-center justify-between px-1 pb-4 lg:px-6 lg:pb-0 lg:pt-5">
              <h2 className="text-[18px] font-black text-slate-900">{t.allSubscriptions}</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-500">{subscriptions.length} {t.subscriptions}</span>
            </div>

            {loading ? (
              <div className="lg:p-6"><StatePanel title={t.loadingAdmin} message={t.loadingPleaseWait} tone="loading" icon="ph-spinner-gap" /></div>
            ) : subscriptions.length === 0 ? (
              <div className="lg:p-6"><StatePanel title={t.emptyAdminSubscriptionsTitle} message={t.emptyAdminSubscriptionsMessage} tone="empty" icon="ph-receipt" /></div>
            ) : (
              <div className="grid gap-3 lg:gap-0">
                <div className="hidden border-b border-slate-100 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 lg:grid lg:grid-cols-[minmax(260px,1.4fr)_minmax(180px,0.9fr)_120px_150px_72px] lg:items-center">
                  <span>{t.subscriptions}</span>
                  <span>{t.user}</span>
                  <span>{t.status}</span>
                  <span>{t.totalMonthly}</span>
                  <span className="text-right">{t.actions}</span>
                </div>

                {subscriptions.map((sub) => {
                  const status = getSubscriptionStatus(sub.status, t);
                  const isBusy = busySubscriptionId === sub.id;
                  const owner = sub.user?.name || sub.user?.email || t.user;
                  return (
                    <div key={sub.id} className="grid gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] lg:grid-cols-[minmax(260px,1.4fr)_minmax(180px,0.9fr)_120px_150px_72px] lg:items-center lg:rounded-none lg:border-0 lg:border-b lg:p-6 lg:shadow-none">
                      <div className="flex min-w-0 items-center gap-4">
                        <SubscriptionLogo name={sub.name} className="size-10 rounded-[12px]" muted={sub.status !== "ACTIVE"} />
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-bold leading-tight text-slate-900">{sub.name}</h3>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-400 lg:hidden">{t.user}</p>
                        <p className="truncate text-sm font-bold text-slate-800">{owner}</p>
                        {sub.user?.email && <p className="mt-0.5 truncate text-[12px] text-slate-400">{sub.user.email}</p>}
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-400 lg:hidden">{t.status}</span>
                        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${status.className}`}>{status.label}</span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-400 lg:hidden">{t.totalMonthly}</span>
                        <p className="text-[13px] font-black text-slate-800">{formatMoney(sub.monthlyAmount)} <span className="font-bold text-slate-400">{t.perMonth}</span></p>
                      </div>

                      <div className="flex justify-end border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                        <button aria-label={`${t.deleteSubscription} ${sub.name}`} disabled={isBusy} onClick={() => deleteSubscription(sub)} className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EF4444]/10 text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
                          <i className="ph-bold ph-trash text-sm" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
