import { useState } from "react";
import { flushSync } from "react-dom";
import { AppShell } from "./components/AppShell.jsx";
import { SubscriptionModal } from "./components/SubscriptionModal.jsx";
import { apiRequest } from "./api/client.js";
import { useAuth } from "./context/AuthContext.jsx";
import { useSubscriptions } from "./hooks/useSubscriptions.js";
import { dictionaries } from "./i18n/dictionaries.js";
import { AdminPage } from "./pages/AdminPage.jsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { SubscriptionsPage } from "./pages/SubscriptionsPage.jsx";

export function App() {
  const [language, setLanguage] = useState("fr");
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ open: false, subscription: null });
  const t = dictionaries[language];
  const { user, loading, logout } = useAuth();
  const subscriptionState = useSubscriptions("", Boolean(user));

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const navigateTab = (nextTab) => {
    if (nextTab === tab) {
      return;
    }

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(() => setTab(nextTab));
      });
      return;
    }

    setTab(nextTab);
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#F6F7FB] text-slate-950">{t.loading}</main>;
  }

  if (!user) {
    return <AuthPage t={t} language={language} setLanguage={setLanguage} />;
  }

  const navItems = [
    ["dashboard", t.dashboard],
    ["subscriptions", t.subscriptions],
    ["statistics", t.statistics],
    ...(user.role === "ADMIN" ? [["admin", t.admin]] : [])
  ];

  const saveQuickSubscription = async (payload) => {
    await apiRequest("/subscriptions", { method: "POST", body: payload });
    notify(t.subscriptionCreated);
    setModalState({ open: false, subscription: null });
    subscriptionState.load();
  };

  const openAddSubscription = () => {
    setModalState({ open: true, subscription: null });
  };

  return (
    <AppShell
      t={t}
      language={language}
      setLanguage={setLanguage}
      user={user}
      logout={logout}
      tab={tab}
      setTab={navigateTab}
      navItems={navItems}
      toast={toast}
      onAddSubscription={openAddSubscription}
    >
      {tab === "dashboard" && (
        <DashboardPage
          t={t}
          subscriptions={subscriptionState.subscriptions}
          totalMonthlyAmount={subscriptionState.totalMonthlyAmount}
          loading={subscriptionState.loading}
          user={user}
          setTab={navigateTab}
          onAddSubscription={openAddSubscription}
        />
      )}
      {tab === "subscriptions" && (
        <SubscriptionsPage
          t={t}
          notify={notify}
          modalState={modalState}
          setModalState={setModalState}
          {...subscriptionState}
        />
      )}
      {tab === "statistics" && (
        <AnalyticsPage
          t={t}
          subscriptions={subscriptionState.subscriptions}
          totalMonthlyAmount={subscriptionState.totalMonthlyAmount}
          loading={subscriptionState.loading}
          setTab={navigateTab}
        />
      )}
      {tab === "profile" && (
        <ProfilePage
          t={t}
          user={user}
          language={language}
          setLanguage={setLanguage}
          logout={logout}
        />
      )}
      {tab === "admin" && user.role === "ADMIN" && <AdminPage t={t} notify={notify} />}
      {modalState.open && tab !== "subscriptions" && (
        <SubscriptionModal
          t={t}
          subscription={modalState.subscription}
          categories={subscriptionState.categories}
          onClose={() => setModalState({ open: false, subscription: null })}
          onSubmit={saveQuickSubscription}
        />
      )}
    </AppShell>
  );
}
