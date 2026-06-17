import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export function isDemoPath(pathname: string): boolean {
  return pathname === "/demo" || pathname.startsWith("/demo/");
}

type AppPathContextValue = {
  path: string;
  navigate: (to: string) => void;
  isDemo: boolean;
};

const AppPathContext = createContext<AppPathContextValue | null>(null);

export function AppPathProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, "", to);
    }
    setPath(to);
  }, []);

  const value = useMemo(
    () => ({
      path,
      navigate,
      isDemo: isDemoPath(path),
    }),
    [path, navigate],
  );

  return (
    <AppPathContext.Provider value={value}>{children}</AppPathContext.Provider>
  );
}

export function useAppPathContext() {
  const ctx = useContext(AppPathContext);
  if (!ctx) {
    throw new Error("useAppPathContext must be used within AppPathProvider");
  }
  return ctx;
}
