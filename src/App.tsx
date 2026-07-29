import { useTranslation } from "react-i18next";
import { DemoModeProvider } from "./context/DemoModeContext";
import { AppPathProvider } from "./context/AppPathContext";
import { AppProvider } from "./context/AppContext";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { ResetPassword } from "./components/ResetPassword";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { DevSignature } from "./components/DevSignature";
import { useAppPath } from "./hooks/useAppPath";
import { useAuth } from "./context/AuthContext";
import { useApp } from "./context/AppContext";
import { useEffect, useState } from "react";
import { DEMO_PUBLIC_ENABLED } from "./utils/featureFlags";

const AUTH_INTENT_KEY = "ccexpedition-auth-intent";

function AppRoutes() {
  const { t } = useTranslation();
  const { session, loading: authLoading, passwordRecovery } = useAuth();
  const { state } = useApp();
  const { isDemo, navigate } = useAppPath();
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<"sign-in" | "sign-up">("sign-in");

  useEffect(() => {
    if (isDemo) return;
    const intent = sessionStorage.getItem(AUTH_INTENT_KEY);
    if (intent === "sign-up" || intent === "sign-in") {
      sessionStorage.removeItem(AUTH_INTENT_KEY);
      setLoginMode(intent);
      setShowLogin(true);
    }
  }, [isDemo]);

  useEffect(() => {
    if (isDemo && !DEMO_PUBLIC_ENABLED) {
      navigate("/");
    }
  }, [isDemo, navigate]);

  if (isDemo && DEMO_PUBLIC_ENABLED) {
    return <WorkspaceShell demoMode />;
  }

  if (authLoading || state.loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <p className="text-sm text-zinc-500">{t("common.loading")}</p>
        <DevSignature />
      </div>
    );
  }

  if (passwordRecovery) {
    return <ResetPassword />;
  }

  if (!session) {
    if (!showLogin) {
      return (
        <LandingPage
          onSignIn={() => {
            setLoginMode("sign-in");
            setShowLogin(true);
          }}
          onSignUp={() => {
            setLoginMode("sign-up");
            setShowLogin(true);
          }}
        />
      );
    }
    return (
      <Login
        initialMode={loginMode}
        onBackToHome={() => setShowLogin(false)}
      />
    );
  }

  return <WorkspaceShell />;
}

function AppContent() {
  const { isDemo, navigate } = useAppPath();

  const demoContextValue = {
    isDemo,
    exitDemo: () => navigate("/"),
    goToSignUp: () => {
      sessionStorage.setItem(AUTH_INTENT_KEY, "sign-up");
      navigate("/");
    },
  };

  return (
    <DemoModeProvider value={demoContextValue}>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </DemoModeProvider>
  );
}

function App() {
  return (
    <AppPathProvider>
      <AppContent />
    </AppPathProvider>
  );
}

export default App;
