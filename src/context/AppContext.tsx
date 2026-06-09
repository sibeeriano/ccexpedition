/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Card, CardHolder, CurrencySymbol, Expense } from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SETTINGS_KEY = "ccexpedition-settings";
const LEGACY_STATE_KEY = "ccexpedition-state";

export type AppSettings = {
  currency: CurrencySymbol;
  /** 0 = alert disabled */
  budgetAlert: number;
};

export type AppState = {
  cards: Card[];
  expenses: Expense[];
  settings: AppSettings;
  lastUpdated: string | null; // ISO timestamp of the last data change this session
  loading: boolean; // true while fetching data from Supabase
};

type AppContextValue = {
  state: AppState;
  /** Resolve to an error message, or null on success. */
  addCard: (input: Omit<Card, "id">) => Promise<string | null>;
  deleteCard: (id: string) => Promise<string | null>;
  addExpense: (input: Omit<Expense, "id">) => Promise<string | null>;
  addExpenses: (inputs: Omit<Expense, "id">[]) => Promise<string | null>;
  deleteExpense: (id: string) => Promise<string | null>;
  setCurrency: (currency: CurrencySymbol) => void;
  setBudgetAlert: (amount: number) => void;
};

const CURRENCIES: CurrencySymbol[] = ["$", "€", "ARS"];

function loadSettings(): AppSettings {
  const defaults: AppSettings = { currency: "$", budgetAlert: 0 };
  try {
    // Settings used to live inside the legacy localStorage state blob.
    const raw =
      localStorage.getItem(SETTINGS_KEY) ??
      JSON.stringify(
        JSON.parse(localStorage.getItem(LEGACY_STATE_KEY) ?? "{}").settings ??
          {},
      );
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      currency: CURRENCIES.includes(parsed.currency as CurrencySymbol)
        ? (parsed.currency as CurrencySymbol)
        : defaults.currency,
      budgetAlert:
        typeof parsed.budgetAlert === "number" && parsed.budgetAlert >= 0
          ? parsed.budgetAlert
          : defaults.budgetAlert,
    };
  } catch {
    return defaults;
  }
}

type CardRow = {
  id: string;
  name: string;
  holder: string;
  color: string;
};

type ExpenseRow = {
  id: string;
  card_id: string;
  description: string;
  total_amount: number | string;
  total_amount_usd?: number | string;
  installments: number;
  start_month: string;
};

function mapCard(row: CardRow): Card {
  return {
    id: row.id,
    name: row.name,
    holder: row.holder as CardHolder,
    color: row.color,
  };
}

function mapExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    cardId: row.card_id,
    description: row.description,
    totalAmount: Number(row.total_amount),
    totalAmountUsd: Number(row.total_amount_usd ?? 0),
    installments: row.installments,
    startMonth: row.start_month,
  };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [cards, setCards] = useState<Card[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // (Re)load all data whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) {
      setCards([]);
      setExpenses([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      supabase
        .from("cards")
        .select("id, name, holder, color")
        .order("created_at"),
      supabase
        .from("expenses")
        .select(
          "id, card_id, description, total_amount, total_amount_usd, installments, start_month",
        )
        .order("created_at"),
    ]).then(([cardsResult, expensesResult]) => {
      if (cancelled) return;
      if (cardsResult.error || expensesResult.error) {
        console.error(
          "Failed to load data:",
          cardsResult.error ?? expensesResult.error,
        );
      } else {
        setCards((cardsResult.data as CardRow[]).map(mapCard));
        setExpenses((expensesResult.data as ExpenseRow[]).map(mapExpense));
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function stamp() {
    setLastUpdated(new Date().toISOString());
  }

  async function addCard(input: Omit<Card, "id">) {
    const { data, error } = await supabase
      .from("cards")
      .insert({
        name: input.name,
        holder: input.holder,
        color: input.color,
        user_id: userId,
      })
      .select("id, name, holder, color")
      .single();

    if (error || !data) {
      console.error("Failed to add card:", error);
      return error?.message ?? "Failed to add card";
    }
    setCards((prev) => [...prev, mapCard(data as CardRow)]);
    stamp();
    return null;
  }

  async function deleteCard(id: string) {
    const { error } = await supabase.from("cards").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete card:", error);
      return error.message;
    }
    // The DB cascades the card's expenses; mirror that locally.
    setCards((prev) => prev.filter((card) => card.id !== id));
    setExpenses((prev) => prev.filter((expense) => expense.cardId !== id));
    stamp();
    return null;
  }

  async function addExpense(input: Omit<Expense, "id">) {
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        card_id: input.cardId,
        description: input.description,
        total_amount: input.totalAmount,
        total_amount_usd: input.totalAmountUsd,
        installments: input.installments,
        start_month: input.startMonth,
        user_id: userId,
      })
      .select(
        "id, card_id, description, total_amount, total_amount_usd, installments, start_month",
      )
      .single();

    if (error || !data) {
      console.error("Failed to add expense:", error);
      return error?.message ?? "Failed to add expense";
    }
    setExpenses((prev) => [...prev, mapExpense(data as ExpenseRow)]);
    stamp();
    return null;
  }

  async function addExpenses(inputs: Omit<Expense, "id">[]) {
    if (inputs.length === 0) return null;

    const { data, error } = await supabase
      .from("expenses")
      .insert(
        inputs.map((input) => ({
          card_id: input.cardId,
          description: input.description,
          total_amount: input.totalAmount,
          total_amount_usd: input.totalAmountUsd,
          installments: input.installments,
          start_month: input.startMonth,
          user_id: userId,
        })),
      )
      .select(
        "id, card_id, description, total_amount, total_amount_usd, installments, start_month",
      );

    if (error || !data) {
      console.error("Failed to import expenses:", error);
      return error?.message ?? "Failed to import expenses";
    }
    setExpenses((prev) => [
      ...prev,
      ...(data as ExpenseRow[]).map(mapExpense),
    ]);
    stamp();
    return null;
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete expense:", error);
      return error.message;
    }
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    stamp();
    return null;
  }

  function setCurrency(currency: CurrencySymbol) {
    setSettings((prev) => ({ ...prev, currency }));
  }

  function setBudgetAlert(amount: number) {
    setSettings((prev) => ({ ...prev, budgetAlert: Math.max(0, amount) }));
  }

  const state: AppState = { cards, expenses, settings, lastUpdated, loading };

  return (
    <AppContext.Provider
      value={{
        state,
        addCard,
        deleteCard,
        addExpense,
        addExpenses,
        deleteExpense,
        setCurrency,
        setBudgetAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
