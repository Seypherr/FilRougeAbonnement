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
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const mobileItems = [
    ["dashboard", Home],
    ["subscriptions", Grid2X2],
    ["add", Plus],
    ["statistics", PieChart],
    ["profile", UserRound]
  ];

  const handleSidebarLogout = async () => {
    setLogoutConfirmationOpen(false);
    setLogoutError("");
    try {
      await logout();
    } catch (err) {
      setLogoutError(err.message || t.logoutFailed);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8F9FB] text-slate-950 lg:grid lg:grid-cols-[clamp(240px,20vw,280px)_minmax(0,1fr)] lg:p-4 xl:p-6">
      <aside className="hidden min-h-[calc(100vh-32px)] rounded-l-[32px] border-r border-slate-100 bg-white p-5 xl:min-h-[calc(100vh-48px)] xl:p-8 lg:flex lg:flex-col">
        <div>
          <div className="mb-8 flex min-w-0 items-center gap-3 xl:mb-10">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#7B42FF] text-white shadow-[0_8px_24px_-8px_rgba(123,66,255,0.55)]">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="truncate text-lg font-black">{t.appName}</p>
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

        <div className="mt-auto grid gap-4">
          <button
            type="button"
            onClick={onAddSubscription}
            aria-label={t.newSubscription}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Plus size={18} />
            {t.newSubscription}
          </button>
          <button
            type="button"
            aria-label={t.openProfile}
            onClick={() => setTab("profile")}
            className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition hover:bg-[#F4F0FF] active:scale-[0.99]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-100">
              <UserRound size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{user.name}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{user.email}</p>
            </div>
          </button>
          {logoutError && <p className="rounded-2xl bg-rose-50 p-3 text-xs font-bold text-rose-700">{logoutError}</p>}
          <button
            type="button"
            aria-label={t.logoutFromSidebar}
            onClick={() => setLogoutConfirmationOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]"
          >
            <LogOut size={17} />
            {t.logout}
          </button>
        </div>
      </aside>

      <section className="min-w-0 pb-24 lg:min-h-[calc(100vh-32px)] lg:overflow-hidden lg:rounded-r-[32px] lg:bg-[#F7F8FA] lg:pb-0 xl:min-h-[calc(100vh-48px)]">
        <div className={`mx-auto ${tab === "profile" ? "max-w-none" : "max-w-7xl"} lg:h-[calc(100vh-32px)] lg:overflow-y-auto lg:p-5 xl:h-[calc(100vh-48px)] xl:p-8`}>
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
              className={`${isAdd ? "relative -top-6 flex-1" : "flex-1"} grid min-h-14 place-items-center text-xs font-black transition ${active ? "text-slate-500" : "text-slate-400 hover:text-slate-500"}`}
              onClick={() => (isAdd ? onAddSubscription() : setTab(id))}
            >
              {isAdd ? (
                <span className="grid size-14 place-items-center rounded-full border-4 border-white bg-[#6C51FF] text-white shadow-[0_8px_20px_-6px_rgba(108,81,255,0.4)]">
                  <Icon size={25} strokeWidth={2.5} />
                </span>
              ) : (
                <span className="grid gap-1 place-items-center">
                  <Icon size={24} fill="none" strokeWidth={active ? 2.6 : 2.2} />
                  <span className={`size-1.5 rounded-full ${active ? "bg-[#6C51FF]" : "bg-transparent"}`} />
                </span>
              )}
            </button>
          );
        })}
        </div>
      </nav>

      {logoutConfirmationOpen && (
        <div
          className="modal-backdrop-enter fixed inset-0 z-[90] grid place-items-end bg-slate-900/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-6"
          onMouseDown={() => setLogoutConfirmationOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidebar-logout-confirmation-title"
            className="modal-panel-enter w-full rounded-t-[26px] bg-white p-5 shadow-[0_-14px_42px_-22px_rgba(15,23,42,0.55)] sm:max-w-sm sm:rounded-[26px]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#F4F0FF] text-[#7047EB]">
                <LogOut size={18} />
              </span>
              <div className="min-w-0">
                <h2 id="sidebar-logout-confirmation-title" className="text-base font-black text-slate-950">{t.logoutConfirmTitle}</h2>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">{t.logoutConfirmMessage}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoutConfirmationOpen(false)}
                className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleSidebarLogout}
                className="rounded-[16px] bg-[#7047EB] px-4 py-3 text-sm font-black text-white transition hover:bg-[#6338DF] active:scale-[0.98]"
              >
                {t.logoutConfirmAction}
              </button>
            </div>
          </section>
        </div>
      )}

      <Toast toast={toast} />
    </main>
  );
}
