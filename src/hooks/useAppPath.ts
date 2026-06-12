import { useCallback, useEffect, useState } from "react";

export function isDemoPath(pathname: string): boolean {
  return pathname === "/demo" || pathname.startsWith("/demo/");
}

export function useAppPath() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, "", to);
    setPath(to);
  }, []);

  return {
    path,
    navigate,
    isDemo: isDemoPath(path),
  };
}

export type UseAppPathResult = ReturnType<typeof useAppPath>;
