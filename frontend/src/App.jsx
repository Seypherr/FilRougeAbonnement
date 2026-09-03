import { Suspense, lazy, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { AppShell } from "./components/AppShell.jsx";
import { OnboardingCarousel } from "./components/OnboardingCarousel.jsx";
import { apiRequest } from "./api/client.js";
import { useAuth } from "./context/AuthContext.jsx";
import { useSubscriptions } from "./hooks/useSubscriptions.js";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, getDictionary, normalizeLanguage } from "./i18n/dictionaries.js";
import { AuthPage } from "./pages/AuthPage.jsx";
import { EmailVerificationRequiredPage } from "./pages/EmailVerificationRequiredPage.jsx";
import { LegalPage } from "./pages/LegalPage.jsx";

const AdminPage = lazy(() => import("./pages/AdminPage.jsx").then((module) => ({ default: module.AdminPage })));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx").then((module) => ({ default: module.AnalyticsPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage.jsx").then((module) => ({ default: module.DashboardPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx").then((module) => ({ default: module.ProfilePage })));
const SubscriptionModal = lazy(() => import("./components/SubscriptionModal.jsx").then((module) => ({ default: module.SubscriptionModal })));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage.jsx").then((module) => ({ default: module.SubscriptionsPage })));

function hasCompletedOnboarding(storageKey) {
  if (!storageKey) return false;
  const legacyStorageKey = storageKey.replace(":v2:", ":v1:");
  return window.localStorage.getItem(storageKey) === "completed" || window.localStorage.getItem(legacyStorageKey) === "completed";
}

function LazyLoader({ label }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-[28px] bg-white text-sm font-black text-slate-400 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)]">
      <span className="inline-flex items-center gap-2">
        <i className="ph ph-spinner-gap animate-spin text-lg text-[#7047EB]" />
        {label}
      </span>
    </div>
  );
}

export function App() {
  const [language, setLanguageState] = useState(() => normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE));
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ open: false, subscription: null });
  const [onboardingState, setOnboardingState] = useState({ key: "", completed: false });
  const t = getDictionary(language);
  const { user, completeOnboarding, exportData, forgotPassword, loading, logout, resendVerification, updateProfile, uploadAvatar, verificationDelivery } = useAuth();
  const subscriptionState = useSubscriptions("", Boolean(user && user.emailVerified !== false));
  const onboardingStorageKey = user ? `frovely:onboarding:v2:${user.id ?? user.email}` : "";

  const legalPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
  const standaloneAuthPath = ["reset-password", "verify-email"].includes(legalPath);
  if (["privacy", "terms", "legal"].includes(legalPath)) {
    return <LegalPage kind={legalPath} language={language} />;
  }

  const setLanguage = (nextLanguage) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);
    setLanguageState(normalizedLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
    if (user && user.preferredLanguage !== normalizedLanguage && typeof updateProfile === "function") {
      updateProfile({ preferredLanguage: normalizedLanguage }).catch(() => {
        notify(t.apiErrorMessage, "error");
      });
    }
  };

  useEffect(() => {
    if (!user?.preferredLanguage) return;
    const normalizedLanguage = normalizeLanguage(user.preferredLanguage);
    setLanguageState(normalizedLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedLanguage);
  }, [user?.id, user?.preferredLanguage]);

  useEffect(() => {
    const background = user && ["dashboard", "statistics"].includes(tab) ? "#6C51FF" : "#F8F9FB";
    document.documentElement.style.backgroundColor = background;
    document.body.style.backgroundColor = background;
  }, [tab, user]);

  useEffect(() => {
    if (!onboardingStorageKey) {
      setOnboardingState({ key: "", completed: false });
      return;
    }

    setOnboardingState({ key: onboardingStorageKey, completed: Boolean(user?.onboardingCompletedAt) || hasCompletedOnboarding(onboardingStorageKey) });
  }, [onboardingStorageKey, user?.onboardingCompletedAt]);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2800);
  };

  const resetPageScroll = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const appScrollContainer = document.querySelector("[data-app-scroll-container]");
    if (appScrollContainer) appScrollContainer.scrollTop = 0;
  };

  const navigateTab = (nextTab) => {
    if (nextTab === tab) {
      return;
    }

    const changeTab = () => {
      resetPageScroll();
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

  if (standaloneAuthPath) {
    return <AuthPage t={t} language={language} setLanguage={setLanguage} />;
  }

  if (user.emailVerified === false) {
    return (
      <EmailVerificationRequiredPage
        t={t}
        user={user}
        resendVerification={resendVerification}
        logout={logout}
        initialDelivery={verificationDelivery}
      />
    );
  }

  const finishOnboarding = async (answers) => {
    if (typeof completeOnboarding === "function") {
      await completeOnboarding({
        preferredCurrency: answers.preferredCurrency,
        preferredLanguage: answers.preferredLanguage,
        timeZone: answers.timeZone,
        reminderEmailEnabled: answers.reminderEmailEnabled,
        reminderDaysBefore: answers.reminderDaysBefore
      });
    }
    window.localStorage.setItem(onboardingStorageKey, "completed");
    window.localStorage.setItem(onboardingStorageKey.replace(":v2:", ":v1:"), "completed");
    window.localStorage.setItem(`${onboardingStorageKey}:answers`, JSON.stringify(answers));
    setOnboardingState({ key: onboardingStorageKey, completed: true });
  };

  const onboardingCompleted = onboardingState.key === onboardingStorageKey
    ? onboardingState.completed
    : Boolean(user?.onboardingCompletedAt) || hasCompletedOnboarding(onboardingStorageKey);

  if (!onboardingCompleted) {
    return <OnboardingCarousel t={t} language={language} onComplete={finishOnboarding} />;
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
      <Suspense fallback={<LazyLoader label={t.loading} />}>
        {tab === "dashboard" && (
          <DashboardPage
            t={t}
            subscriptions={subscriptionState.subscriptions}
            totalMonthlyAmount={subscriptionState.totalMonthlyAmount}
            currency={user.preferredCurrency}
            language={language}
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
            currency={user.preferredCurrency}
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
            currency={user.preferredCurrency}
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
            uploadAvatar={uploadAvatar}
            currency={user.preferredCurrency}
            exportData={exportData}
            logout={logout}
            globalModalOpen={modalState.open}
            onBack={() => navigateTab("dashboard")}
            onOpenAdmin={user.role === "ADMIN" ? () => navigateTab("admin") : undefined}
          />
        )}
        {tab === "admin" && user.role === "ADMIN" && <AdminPage t={t} notify={notify} currentUser={user} />}
        {modalState.open && tab !== "subscriptions" && (
          <SubscriptionModal
            t={t}
            language={language}
            currency={user.preferredCurrency}
            subscription={modalState.subscription}
            categories={subscriptionState.categories}
            onClose={() => setModalState({ open: false, subscription: null })}
            onSubmit={saveQuickSubscription}
          />
        )}
      </Suspense>
    </AppShell>
  );
}
