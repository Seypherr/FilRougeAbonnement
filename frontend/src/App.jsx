import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { AppShell } from "./components/AppShell.jsx";
import { OnboardingCarousel } from "./components/OnboardingCarousel.jsx";
import { SubscriptionModal } from "./components/SubscriptionModal.jsx";
import { apiRequest } from "./api/client.js";
import { useAuth } from "./context/AuthContext.jsx";
import { useSubscriptions } from "./hooks/useSubscriptions.js";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, getDictionary, normalizeLanguage } from "./i18n/dictionaries.js";
import { AdminPage } from "./pages/AdminPage.jsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { EmailVerificationRequiredPage } from "./pages/EmailVerificationRequiredPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { SubscriptionsPage } from "./pages/SubscriptionsPage.jsx";

function hasCompletedOnboarding(storageKey) {
  return Boolean(storageKey) && window.localStorage.getItem(storageKey) === "completed";
}

export function App() {
  const [language, setLanguageState] = useState(() => normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE));
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ open: false, subscription: null });
  const [onboardingState, setOnboardingState] = useState({ key: "", completed: false });
  const t = getDictionary(language);
  const { user, forgotPassword, loading, logout, resendVerification, updateProfile } = useAuth();
  const subscriptionState = useSubscriptions("", Boolean(user && user.emailVerified !== false));
  const onboardingStorageKey = user ? `subscription-manager:onboarding:v1:${user.id ?? user.email}` : "";

  const setLanguage = (nextLanguage) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);
    setLanguageState(normalizedLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
  };

  useEffect(() => {
    if (!onboardingStorageKey) {
      setOnboardingState({ key: "", completed: false });
      return;
    }

    setOnboardingState({ key: onboardingStorageKey, completed: hasCompletedOnboarding(onboardingStorageKey) });
  }, [onboardingStorageKey]);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const navigateTab = (nextTab) => {
    if (nextTab === tab) {
      return;
    }

    const changeTab = () => {
      setModalState({ open: false, subscription: null });
      setTab(nextTab);
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        flushSync(changeTab);
      });
      return;
    }

    changeTab();
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-[#F6F7FB] text-slate-950">{t.loading}</main>;
  }

  if (!user) {
    return <AuthPage t={t} language={language} setLanguage={setLanguage} />;
  }

  if (user.emailVerified === false) {
    return (
      <EmailVerificationRequiredPage
        t={t}
        user={user}
        resendVerification={resendVerification}
        logout={logout}
      />
    );
  }

  const completeOnboarding = (answers) => {
    window.localStorage.setItem(onboardingStorageKey, "completed");
    window.localStorage.setItem(`${onboardingStorageKey}:answers`, JSON.stringify(answers));
    setOnboardingState({ key: onboardingStorageKey, completed: true });
  };

  const onboardingCompleted = onboardingState.key === onboardingStorageKey
    ? onboardingState.completed
    : hasCompletedOnboarding(onboardingStorageKey);

  if (!onboardingCompleted) {
    return <OnboardingCarousel t={t} onComplete={completeOnboarding} />;
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
          error={subscriptionState.error}
          user={user}
          setTab={navigateTab}
          onAddSubscription={openAddSubscription}
        />
      )}
      {tab === "subscriptions" && (
        <SubscriptionsPage
          t={t}
          language={language}
          notify={notify}
          modalState={modalState}
          setModalState={setModalState}
          {...subscriptionState}
        />
      )}
      {tab === "statistics" && (
        <AnalyticsPage
          t={t}
          language={language}
          subscriptions={subscriptionState.subscriptions}
          totalMonthlyAmount={subscriptionState.totalMonthlyAmount}
          loading={subscriptionState.loading}
          error={subscriptionState.error}
          setTab={navigateTab}
        />
      )}
      {tab === "profile" && (
        <ProfilePage
          t={t}
          user={user}
          language={language}
          setLanguage={setLanguage}
          forgotPassword={forgotPassword}
          updateProfile={updateProfile}
        />
      )}
      {tab === "admin" && user.role === "ADMIN" && <AdminPage t={t} notify={notify} currentUser={user} />}
      {modalState.open && tab !== "subscriptions" && (
        <SubscriptionModal
          t={t}
          language={language}
          subscription={modalState.subscription}
          categories={subscriptionState.categories}
          onClose={() => setModalState({ open: false, subscription: null })}
          onSubmit={saveQuickSubscription}
        />
      )}
    </AppShell>
  );
}
