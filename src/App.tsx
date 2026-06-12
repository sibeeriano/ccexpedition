import { useTranslation } from "react-i18next";
import { DemoModeProvider } from "./context/DemoModeContext";
import { AppProvider } from "./context/AppContext";
import { LandingPage } from "./components/LandingPage";
import { Login } from "./components/Login";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { DevSignature } from "./components/DevSignature";
import { useAppPath, type UseAppPathResult } from "./hooks/useAppPath";
import { useAuth } from "./context/AuthContext";
import { useApp } from "./context/AppContext";
import { useEffect, useState } from "react";
import { ensureFirstExperienceReset } from "./utils/thankYou";

ensureFirstExperienceReset();

const AUTH_INTENT_KEY = "ccexpedition-auth-intent";

function AppRoutes({ appPath }: { appPath: UseAppPathResult }) {
  const { t } = useTranslation();
  const { session, loading: authLoading } = useAuth();
  const { state } = useApp();
  const { isDemo, navigate } = appPath;
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

  if (isDemo) {
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
          onTryDemo={() => navigate("/demo")}
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

function App() {
  const appPath = useAppPath();
  const { isDemo, navigate } = appPath;

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
        <AppRoutes appPath={appPath} />
      </AppProvider>
    </DemoModeProvider>
  );
}

export default App;
