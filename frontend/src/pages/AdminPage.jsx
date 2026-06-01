import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import { formatMoney } from "../utils/subscriptions.js";

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <div className="h-[18px] w-8 rounded-full bg-[#6B7280] after:absolute after:left-[2px] after:top-[2px] after:size-3.5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#10B981] peer-checked:after:translate-x-[14px]" />
    </label>
  );
}

function getUserColors(role) {
  if (role === "ADMIN") return { avatar: "bg-[#6C51FF]/10", text: "text-[#6C51FF]", badge: "bg-[#6C51FF]/15 text-[#6C51FF]" };
  return { avatar: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-100 text-blue-600" };
}

export function AdminPage({ t, notify }) {
  const [tab, setTab] = useState("users");
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

  const deleteUser = async (user) => {
    if (!window.confirm(t.confirmDeleteUser)) return;
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
    <div className="min-h-screen bg-[#F8F9FB] pb-28 text-slate-800 lg:min-h-0 lg:pb-8">
      <header className="sticky top-0 z-30 bg-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] lg:rounded-[24px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 pb-4 pt-12 lg:pt-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#6C51FF]/10 text-[#6C51FF]">
              <i className="ph-fill ph-shield-check text-lg" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Admin Panel</h1>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl gap-6 border-b border-slate-100 px-5">
          <button onClick={() => setTab("users")} className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === "users" ? "border-[#6C51FF] text-[#6C51FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Users</button>
          <button onClick={() => setTab("subscriptions")} className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${tab === "subscriptions" ? "border-[#6C51FF] text-[#6C51FF]" : "border-transparent text-slate-400 hover:text-slate-600"}`}>Subscriptions</button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 p-5 pb-24">
        {error && <p className="rounded-[16px] border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}

        {tab === "users" && (
          <>
            <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)]">
              <h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-slate-800">
                <i className="ph-fill ph-user-plus text-lg text-[#6C51FF]" />
                Create New User
              </h2>
              <form className="flex flex-col gap-4 md:flex-row" onSubmit={createUser}>
                <input value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} placeholder="Full Name" className="w-full rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-medium transition-all placeholder:font-normal focus:border-[#6C51FF] focus:outline-none focus:ring-1 focus:ring-[#6C51FF]" required />
                <input value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} placeholder="Email Address" type="email" className="w-full rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-medium transition-all placeholder:font-normal focus:border-[#6C51FF] focus:outline-none focus:ring-1 focus:ring-[#6C51FF]" required />
                <input value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} placeholder="Password" type="password" className="w-full rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-medium transition-all placeholder:font-normal focus:border-[#6C51FF] focus:outline-none focus:ring-1 focus:ring-[#6C51FF]" required minLength={8} />
                <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value })} className="rounded-xl border border-slate-200 bg-[#F8F9FB] px-4 py-3 text-sm font-semibold focus:border-[#6C51FF] focus:outline-none">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button className="rounded-xl bg-[#6C51FF] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)] transition-all hover:bg-[#5a46e0] active:scale-95">
                  Add User
                </button>
              </form>
            </section>

            <section>
              <h2 className="mb-4 px-1 text-[18px] font-bold text-slate-800">User Management</h2>
              <div className="grid gap-3.5">
                {users.map((user) => {
                  const colors = getUserColors(user.role);
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
                          </div>
                          <p className="mt-0.5 truncate text-[12px] text-slate-500">{user.email}</p>
                          <p className="mt-1 text-[11px] font-semibold text-slate-400">{t.subscriptionCount}: {user._count?.subscriptions ?? 0}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-3">
                          <select value={user.role} onChange={(event) => updateUser(user, { role: event.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          <Toggle checked={user.isActive} onChange={() => updateUser(user, { isActive: !user.isActive })} />
                        </div>
                        <button onClick={() => deleteUser(user)} className="flex size-9 items-center justify-center rounded-lg bg-[#EF4444]/10 text-[#EF4444] transition-colors hover:bg-[#EF4444] hover:text-white">
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
            <h2 className="mb-4 px-1 text-[18px] font-bold text-slate-800">All Subscriptions</h2>
            <div className="flex flex-col gap-3.5">
              {subscriptions.length === 0 ? <p className="rounded-[20px] bg-white p-5 text-sm font-semibold text-slate-400">{t.empty}</p> : subscriptions.map((sub) => (
                <div key={sub.id} className="flex flex-col justify-between gap-4 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-rose-50">
                      <i className="ph-fill ph-film-strip text-2xl text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold leading-tight text-slate-800">{sub.name}</h3>
                      <p className="mt-1 text-[12px] text-slate-500">{sub.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                    <span className="rounded bg-[#10B981]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#10B981]">{sub.status}</span>
                    <p className="text-[13px] font-bold text-slate-700">{formatMoney(sub.monthlyAmount)} <span className="text-slate-400">/mo</span></p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
