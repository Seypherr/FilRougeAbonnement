import { BarChart3, CreditCard, Grid2X2, Home, Languages, LogOut, Plus, Shield, UserRound } from "lucide-react";
import { Button } from "./Button.jsx";
import { Toast } from "./Toast.jsx";

const navIconMap = {
  dashboard: Home,
  subscriptions: Grid2X2,
  statistics: BarChart3,
  admin: Shield
};

export function AppShell({ t, language, setLanguage, user, logout, tab, setTab, navItems, toast, children, onAddSubscription }) {
  return (
    <main className="min-h-screen bg-[#F6F7FB] text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden min-h-screen border-r border-slate-100 bg-white p-8 lg:flex lg:flex-col">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-lg font-black">{t.appName}</p>
              <p className="text-xs font-bold text-slate-400">{user.role}</p>
            </div>
          </div>

          <nav className="grid gap-2">
            {navItems.map(([id, label]) => {
              const Icon = navIconMap[id];
              const active = tab === id;
              return (
                <button
                  key={id}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-extrabold transition ${active ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
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
          <div className="rounded-3xl bg-violet-600 p-5 text-white shadow-lg shadow-violet-100">
            <p className="text-sm font-black">Demo ready</p>
            <p className="mt-2 text-xs font-semibold text-violet-100">Payment Methods and Settings are future features.</p>
          </div>
          <Button onClick={onAddSubscription}><Plus size={18} />{t.addSubscription}</Button>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="grid size-10 place-items-center rounded-full bg-violet-100 text-sm font-black text-violet-700">{user.name?.[0] ?? "U"}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{user.name}</p>
              <p className="truncate text-xs font-semibold text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0 pb-24 lg:pb-0">
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black tracking-tight lg:text-2xl">{navItems.find(([id]) => id === tab)?.[1] ?? t.dashboard}</h1>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <UserRound size={16} />
                {user.name} - {user.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="px-3" onClick={() => setLanguage(language === "fr" ? "en" : "fr")}>
                <Languages size={16} />
                {language.toUpperCase()}
              </Button>
              <Button variant="secondary" className="px-3" onClick={logout}>
                <LogOut size={16} />
                <span className="hidden sm:inline">{t.logout}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </section>

      <nav className="fixed bottom-4 left-4 right-4 z-30 grid gap-2 rounded-3xl bg-white p-2 shadow-2xl shadow-slate-300/60 lg:hidden" style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}>
        {navItems.map(([id, label]) => {
          const Icon = navIconMap[id];
          const active = tab === id;
          return (
            <button
              key={id}
              className={`grid min-h-14 place-items-center rounded-2xl text-xs font-black transition ${active ? "bg-violet-600 text-white" : "text-slate-400"}`}
              onClick={() => setTab(id)}
            >
              <Icon size={20} />
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </nav>

      <Toast toast={toast} />
    </main>
  );
}
