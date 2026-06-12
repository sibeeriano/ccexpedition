/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";

type DemoModeContextValue = {
  isDemo: boolean;
  exitDemo: () => void;
  goToSignUp: () => void;
};

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemo: false,
  exitDemo: () => {},
  goToSignUp: () => {},
});

export function DemoModeProvider({
  value,
  children,
}: {
  value: DemoModeContextValue;
  children: ReactNode;
}) {
  return (
    <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeContextValue {
  return useContext(DemoModeContext);
}
