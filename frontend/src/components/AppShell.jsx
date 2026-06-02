import { useState } from "react";
import { BarChart3, CreditCard, Grid2X2, Home, List, LogOut, PieChart, Plus, Shield, UserRound } from "lucide-react";
import { Toast } from "./Toast.jsx";

const navIconMap = {
  dashboard: Home,
  subscriptions: Grid2X2,
  statistics: BarChart3,
  admin: Shield,
  profile: UserRound
};

export function AppShell({ t, user, tab, setTab, navItems, toast, children, onAddSubscription, logout }) {
  const [logoutError, setLogoutError] = useState("");
  const mobileItems = [
    ["dashboard", Home],
    ["subscriptions", Grid2X2],
    ["add", Plus],
    ["statistics", PieChart],
    [user.role === "ADMIN" ? "admin" : "profile", user.role === "ADMIN" ? Shield : UserRound]
  ];

  const handleSidebarLogout = async () => {
    setLogoutError("");
    try {
      await logout();
    } catch (err) {
      setLogoutError(err.message || t.logoutFailed);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FB] text-slate-950 lg:grid lg:grid-cols-[280px_1fr] lg:p-6">
      <aside className="hidden min-h-[calc(100vh-48px)] rounded-l-[32px] border-r border-slate-100 bg-white p-8 lg:flex lg:flex-col">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#7B42FF] text-white shadow-[0_8px_24px_-8px_rgba(123,66,255,0.55)]">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-lg font-black">{t.appName}</p>
              <p className="text-xs font-bold text-slate-400">{user.role}</p>
            </div>
          </div>

          <nav className="grid gap-2">
            {navItems.map(([id, label]) => {
              const Icon = id === "subscriptions" ? List : navIconMap[id];
              const active = tab === id;
              return (
                <button
                  key={id}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-bold transition ${active ? "bg-[#F4F0FF] text-[#7B42FF]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                  onClick={() => setTab(id)}
                >
                  <Icon size={18} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto grid gap-5">
          <div className="overflow-hidden rounded-3xl bg-[#7B42FF] p-5 text-white shadow-lg shadow-violet-100">
            <p className="text-sm font-black">{t.demoReady}</p>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-violet-100">{t.demoSubtitle}</p>
          </div>
          <button
            onClick={onAddSubscription}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus size={18} />
            {t.addNew}
          </button>
          <button
            type="button"
            onClick={() => setTab("profile")}
            className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-[#F4F0FF] active:scale-[0.99]"
          >
            <div className="grid size-10 place-items-center rounded-full bg-[#F4F0FF] text-sm font-black text-[#7B42FF]">{user.name?.[0] ?? "U"}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{user.name}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{user.email}</p>
            </div>
          </button>
          {logoutError && <p className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700">{logoutError}</p>}
          <button
            type="button"
            aria-label={t.logoutFromSidebar}
            onClick={handleSidebarLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]"
          >
            <LogOut size={17} />
            {t.logout}
          </button>
        </div>
      </aside>

      <section className="min-w-0 pb-24 lg:min-h-[calc(100vh-48px)] lg:overflow-hidden lg:rounded-r-[32px] lg:bg-[#F7F8FA] lg:pb-0">
        <div className="mx-auto max-w-7xl lg:h-[calc(100vh-48px)] lg:overflow-y-auto lg:p-8">
          <div key={tab} className="page-transition">
            {children}
          </div>
        </div>
      </section>

      <nav className="fixed bottom-6 left-0 z-30 w-full px-6 pointer-events-none lg:hidden">
        <div className="flex items-center justify-between rounded-[32px] border border-slate-100/60 bg-white/95 p-2 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.08)] backdrop-blur-xl pointer-events-auto">
        {mobileItems.map(([id, Icon], index) => {
          const active = tab === id;
          const isAdd = id === "add";
          const label = isAdd ? t.addSubscription : navItems.find(([navId]) => navId === id)?.[1] ?? (id === "profile" ? t.profile : id);
          return (
            <button
              key={`${id}-${index}`}
              aria-label={label}
              className={`${isAdd ? "relative -top-6 flex-1" : "flex-1"} grid min-h-14 place-items-center text-xs font-black transition ${active ? "text-[#6C51FF]" : "text-slate-400 hover:text-[#6C51FF]"}`}
              onClick={() => (isAdd ? onAddSubscription() : setTab(id))}
            >
              {isAdd ? (
                <span className="grid size-14 place-items-center rounded-full border-4 border-white bg-[#6C51FF] text-white shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)]">
                  <Icon size={25} />
                </span>
              ) : (
                <span className="grid gap-1 place-items-center">
                  <Icon size={24} fill={active ? "currentColor" : "none"} />
                  <span className={`size-1.5 rounded-full ${active ? "bg-[#6C51FF]" : "bg-transparent"}`} />
                </span>
              )}
            </button>
          );
        })}
        </div>
      </nav>

      <Toast toast={toast} />
    </main>
  );
}
