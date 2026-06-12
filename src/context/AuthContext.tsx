/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { setRememberMe, supabase } from "../lib/supabase";
import {
  markThankYouPendingFirstSignIn,
  markThankYouPendingSignUp,
} from "../utils/thankYou";

type AuthContextValue = {
  session: Session | null;
  /** True while the initial session is being restored. */
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  /** True when the user opened a password-recovery link from email. */
  passwordRecovery: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }
      },
    );
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string, remember = true) {
    setRememberMe(remember);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error && data.user) {
      markThankYouPendingFirstSignIn(data.user.id);
    }
    return error?.message ?? null;
  }

  async function signUp(email: string, password: string) {
    setRememberMe(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (!error) markThankYouPendingSignUp();
    return error?.message ?? null;
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    return error?.message ?? null;
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) setPasswordRecovery(false);
    return error?.message ?? null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        passwordRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
