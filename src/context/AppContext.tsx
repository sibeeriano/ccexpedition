/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  BalanceAdjustment,
  BalanceAdjustmentType,
  Card,
  CardHolder,
  CurrencySymbol,
  Expense,
  MonthlyPayment,
  PendingCarryover,
} from "../types";
import { getMonthlyDueByCard } from "../utils/expenses";
import { addMonths, isBeforeCurrentMonth } from "../utils/months";
import { supabase } from "../lib/supabase";
import i18n, { type AppLanguage } from "../i18n";
import {
  applyTheme,
  DEFAULT_BACKGROUND,
  DEFAULT_BUDGET_ALERT_COLOR,
  DEFAULT_TITLE_COLOR,
  DEFAULT_WORKSPACE_TITLE,
  isValidHexColor,
  normalizeWorkspaceTitle,
} from "../utils/theme";
import { useAuth } from "./AuthContext";

export type { AppLanguage };

const SETTINGS_KEY_PREFIX = "ccexpedition-settings";
const LEGACY_SETTINGS_KEY = "ccexpedition-settings";
const LEGACY_STATE_KEY = "ccexpedition-state";

function settingsStorageKey(userId: string | null): string {
  return userId
    ? `${SETTINGS_KEY_PREFIX}-${userId}`
    : `${SETTINGS_KEY_PREFIX}-guest`;
}

export type AppSettings = {
  currency: CurrencySymbol;
  /** 0 = alert disabled */
  budgetAlert: number;
  budgetAlertColor: string;
  showPreviousMonths: boolean;
  showPaidRow: boolean;
  backgroundColor: string;
  titleColor: string;
  titleText: string;
  language: AppLanguage;
};

export type AppState = {
  cards: Card[];
  expenses: Expense[];
  balanceAdjustments: BalanceAdjustment[];
  monthlyPayments: MonthlyPayment[];
  pendingCarryovers: PendingCarryover[];
  settings: AppSettings;
  lastUpdated: string | null; // ISO timestamp of the last data change this session
  loading: boolean; // true while fetching data from Supabase
};

type AppContextValue = {
  state: AppState;
  /** Resolve to an error message, or null on success. */
  addCard: (input: Omit<Card, "id">) => Promise<string | null>;
  updateCard: (
    id: string,
    input: Partial<Pick<Card, "name" | "holder" | "color">>,
  ) => Promise<string | null>;
  deleteCard: (id: string) => Promise<string | null>;
  addExpense: (input: Omit<Expense, "id">) => Promise<string | null>;
  addExpenses: (inputs: Omit<Expense, "id">[]) => Promise<string | null>;
  updateExpense: (
    id: string,
    input: Partial<
      Pick<
        Expense,
        | "description"
        | "totalAmount"
        | "totalAmountUsd"
        | "installments"
        | "startMonth"
        | "isMonthlyCharge"
      >
    >,
  ) => Promise<string | null>;
  deleteExpense: (id: string) => Promise<string | null>;
  addBalanceAdjustment: (
    input: Omit<BalanceAdjustment, "id">,
  ) => Promise<string | null>;
  updateBalanceAdjustment: (
    id: string,
    input: Partial<
      Pick<
        BalanceAdjustment,
        "description" | "amount" | "amountUsd" | "type" | "applyMonth"
      >
    >,
  ) => Promise<string | null>;
  deleteBalanceAdjustment: (id: string) => Promise<string | null>;
  settleMonthlyPayment: (input: {
    cardId: string;
    month: string;
    paidInFull: boolean;
    amountPaid?: number;
    amountPaidUsd?: number;
  }) => Promise<string | null>;
  clearMonthlyPayment: (cardId: string, month: string) => Promise<string | null>;
  isMonthPaid: (cardId: string, month: string) => boolean;
  setCurrency: (currency: CurrencySymbol) => void;
  setBudgetAlert: (amount: number) => void;
  setBudgetAlertColor: (color: string) => void;
  setShowPreviousMonths: (show: boolean) => void;
  setShowPaidRow: (show: boolean) => void;
  setBackgroundColor: (color: string) => void;
  setTitleColor: (color: string) => void;
  setTitleText: (text: string) => void;
  setLanguage: (language: AppLanguage) => void;
};

const CURRENCIES: CurrencySymbol[] = ["$", "€", "ARS"];

function loadSettings(userId: string | null): AppSettings {
  const defaults: AppSettings = {
    currency: "$",
    budgetAlert: 0,
    budgetAlertColor: DEFAULT_BUDGET_ALERT_COLOR,
    showPreviousMonths: true,
    showPaidRow: true,
    backgroundColor: DEFAULT_BACKGROUND,
    titleColor: DEFAULT_TITLE_COLOR,
    titleText: DEFAULT_WORKSPACE_TITLE,
    language: i18n.language === "es" ? "es" : "en",
  };
  try {
    const key = settingsStorageKey(userId);
    let raw = localStorage.getItem(key);

    if (!raw && userId) {
      raw =
        localStorage.getItem(LEGACY_SETTINGS_KEY) ??
        JSON.stringify(
          JSON.parse(localStorage.getItem(LEGACY_STATE_KEY) ?? "{}").settings ??
            {},
        );
    }

    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      currency: CURRENCIES.includes(parsed.currency as CurrencySymbol)
        ? (parsed.currency as CurrencySymbol)
        : defaults.currency,
      budgetAlert:
        typeof parsed.budgetAlert === "number" && parsed.budgetAlert >= 0
          ? parsed.budgetAlert
          : defaults.budgetAlert,
      budgetAlertColor: isValidHexColor(parsed.budgetAlertColor ?? "")
        ? parsed.budgetAlertColor!
        : defaults.budgetAlertColor,
      showPreviousMonths: parsed.showPreviousMonths !== false,
      showPaidRow: parsed.showPaidRow !== false,
      backgroundColor: isValidHexColor(parsed.backgroundColor ?? "")
        ? parsed.backgroundColor!
        : defaults.backgroundColor,
      titleColor: isValidHexColor(parsed.titleColor ?? "")
        ? parsed.titleColor!
        : defaults.titleColor,
      titleText:
        typeof parsed.titleText === "string"
          ? normalizeWorkspaceTitle(parsed.titleText)
          : defaults.titleText,
      language:
        parsed.language === "en" || parsed.language === "es"
          ? parsed.language
          : defaults.language,
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
  is_monthly_charge?: boolean;
};

type BalanceAdjustmentRow = {
  id: string;
  card_id: string;
  description: string;
  amount: number | string;
  amount_usd?: number | string;
  type: BalanceAdjustmentType;
  apply_month: string;
};

type MonthlyPaymentRow = {
  id: string;
  card_id: string;
  month: string;
  paid_in_full: boolean;
  amount_paid: number | string;
  amount_paid_usd?: number | string;
};

type PendingCarryoverRow = {
  id: string;
  card_id: string;
  apply_month: string;
  source_month: string;
  amount: number | string;
  amount_usd?: number | string;
  payment_id: string;
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
    isMonthlyCharge: Boolean(row.is_monthly_charge),
  };
}

function mapBalanceAdjustment(row: BalanceAdjustmentRow): BalanceAdjustment {
  return {
    id: row.id,
    cardId: row.card_id,
    description: row.description,
    amount: Number(row.amount),
    amountUsd: Number(row.amount_usd ?? 0),
    type: row.type,
    applyMonth: row.apply_month,
  };
}

function mapMonthlyPayment(row: MonthlyPaymentRow): MonthlyPayment {
  return {
    id: row.id,
    cardId: row.card_id,
    month: row.month,
    paidInFull: Boolean(row.paid_in_full),
    amountPaid: Number(row.amount_paid),
    amountPaidUsd: Number(row.amount_paid_usd ?? 0),
  };
}

function mapPendingCarryover(row: PendingCarryoverRow): PendingCarryover {
  return {
    id: row.id,
    cardId: row.card_id,
    applyMonth: row.apply_month,
    sourceMonth: row.source_month,
    amount: Number(row.amount),
    amountUsd: Number(row.amount_usd ?? 0),
    paymentId: row.payment_id,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;

  const [cards, setCards] = useState<Card[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balanceAdjustments, setBalanceAdjustments] = useState<
    BalanceAdjustment[]
  >([]);
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>([]);
  const [pendingCarryovers, setPendingCarryovers] = useState<PendingCarryover[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const skipNextSettingsSave = useRef(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loaded = loadSettings(null);
    applyTheme({
      backgroundColor: loaded.backgroundColor,
      titleColor: loaded.titleColor,
      titleText: loaded.titleText,
      budgetAlertColor: loaded.budgetAlertColor,
    });
    return loaded;
  });

  useEffect(() => {
    const loaded = loadSettings(userId);
    skipNextSettingsSave.current = true;
    setSettings(loaded);
    applyTheme({
      backgroundColor: loaded.backgroundColor,
      titleColor: loaded.titleColor,
      titleText: loaded.titleText,
      budgetAlertColor: loaded.budgetAlertColor,
    });
  }, [userId]);

  useEffect(() => {
    if (skipNextSettingsSave.current) {
      skipNextSettingsSave.current = false;
      return;
    }
    localStorage.setItem(settingsStorageKey(userId), JSON.stringify(settings));
  }, [settings, userId]);

  useEffect(() => {
    applyTheme({
      backgroundColor: settings.backgroundColor,
      titleColor: settings.titleColor,
      titleText: settings.titleText,
      budgetAlertColor: settings.budgetAlertColor,
    });
  }, [
    settings.backgroundColor,
    settings.titleColor,
    settings.titleText,
    settings.budgetAlertColor,
  ]);

  useEffect(() => {
    if (i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language);
    }
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  // (Re)load all data whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) {
      setCards([]);
      setExpenses([]);
      setBalanceAdjustments([]);
      setMonthlyPayments([]);
      setPendingCarryovers([]);
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
          "id, card_id, description, total_amount, total_amount_usd, installments, start_month, is_monthly_charge",
        )
        .order("created_at"),
      supabase
        .from("balance_adjustments")
        .select(
          "id, card_id, description, amount, amount_usd, type, apply_month",
        )
        .order("created_at"),
      supabase
        .from("monthly_payments")
        .select("id, card_id, month, paid_in_full, amount_paid, amount_paid_usd")
        .order("created_at"),
      supabase
        .from("pending_carryovers")
        .select(
          "id, card_id, apply_month, source_month, amount, amount_usd, payment_id",
        )
        .order("created_at"),
    ]).then(([cardsResult, expensesResult, adjustmentsResult, paymentsResult, carryoversResult]) => {
      if (cancelled) return;
      if (cardsResult.error) {
        console.error("Failed to load cards:", cardsResult.error);
      } else {
        setCards((cardsResult.data as CardRow[]).map(mapCard));
      }
      if (expensesResult.error) {
        console.error("Failed to load expenses:", expensesResult.error);
      } else {
        setExpenses((expensesResult.data as ExpenseRow[]).map(mapExpense));
      }
      if (adjustmentsResult.error) {
        console.error("Failed to load balance adjustments:", adjustmentsResult.error);
        setBalanceAdjustments([]);
      } else {
        setBalanceAdjustments(
          (adjustmentsResult.data as BalanceAdjustmentRow[]).map(
            mapBalanceAdjustment,
          ),
        );
      }
      if (paymentsResult.error) {
        console.error("Failed to load monthly payments:", paymentsResult.error);
        setMonthlyPayments([]);
      } else {
        setMonthlyPayments(
          (paymentsResult.data as MonthlyPaymentRow[]).map(mapMonthlyPayment),
        );
      }
      if (carryoversResult.error) {
        console.error("Failed to load pending carryovers:", carryoversResult.error);
        setPendingCarryovers([]);
      } else {
        setPendingCarryovers(
          (carryoversResult.data as PendingCarryoverRow[]).map(
            mapPendingCarryover,
          ),
        );
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
      return error?.message ?? i18n.t("errors.failedAddCard");
    }
    setCards((prev) => [...prev, mapCard(data as CardRow)]);
    stamp();
    return null;
  }

  async function updateCard(
    id: string,
    input: Partial<Pick<Card, "name" | "holder" | "color">>,
  ) {
    const current = cards.find((card) => card.id === id);
    if (!current) return i18n.t("errors.cardNotFound");

    const name = input.name !== undefined ? input.name.trim() : current.name;
    const holder =
      input.holder !== undefined ? input.holder.trim() : current.holder;
    const color = input.color ?? current.color;

    if (!name) return i18n.t("errors.cardNameRequired");
    if (!holder) return i18n.t("errors.holderRequired");

    const { data, error } = await supabase
      .from("cards")
      .update({ name, holder, color })
      .eq("id", id)
      .select("id, name, holder, color")
      .single();

    if (error || !data) {
      console.error("Failed to update card:", error);
      return error?.message ?? i18n.t("errors.failedUpdateCard");
    }

    setCards((prev) =>
      prev.map((card) => (card.id === id ? mapCard(data as CardRow) : card)),
    );
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
    setBalanceAdjustments((prev) =>
      prev.filter((adjustment) => adjustment.cardId !== id),
    );
    setMonthlyPayments((prev) =>
      prev.filter((payment) => payment.cardId !== id),
    );
    setPendingCarryovers((prev) =>
      prev.filter((carryover) => carryover.cardId !== id),
    );
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
        is_monthly_charge: input.isMonthlyCharge,
        user_id: userId,
      })
      .select(
        "id, card_id, description, total_amount, total_amount_usd, installments, start_month, is_monthly_charge",
      )
      .single();

    if (error || !data) {
      console.error("Failed to add expense:", error);
      return error?.message ?? i18n.t("errors.failedAddExpense");
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
          is_monthly_charge: input.isMonthlyCharge,
          user_id: userId,
        })),
      )
      .select(
        "id, card_id, description, total_amount, total_amount_usd, installments, start_month, is_monthly_charge",
      );

    if (error || !data) {
      console.error("Failed to import expenses:", error);
      return error?.message ?? i18n.t("errors.failedImportExpenses");
    }
    setExpenses((prev) => [
      ...prev,
      ...(data as ExpenseRow[]).map(mapExpense),
    ]);
    stamp();
    return null;
  }

  async function updateExpense(
    id: string,
    input: Partial<
      Pick<
        Expense,
        | "description"
        | "totalAmount"
        | "totalAmountUsd"
        | "installments"
        | "startMonth"
        | "isMonthlyCharge"
      >
    >,
  ) {
    const current = expenses.find((expense) => expense.id === id);
    if (!current) return i18n.t("errors.expenseNotFound");

    const description =
      input.description !== undefined
        ? input.description.trim()
        : current.description;
    const totalAmount = input.totalAmount ?? current.totalAmount;
    const totalAmountUsd = input.totalAmountUsd ?? current.totalAmountUsd;
    const installments = input.installments ?? current.installments;
    const startMonth = input.startMonth ?? current.startMonth;
    const isMonthlyCharge =
      input.isMonthlyCharge ?? current.isMonthlyCharge;

    if (!description) return i18n.t("errors.descriptionRequired");
    if (totalAmount <= 0 && totalAmountUsd <= 0) {
      return i18n.t("errors.amountRequired");
    }
    if (installments < 1 || installments > 48) {
      return i18n.t("errors.invalidInstallments");
    }

    const { data, error } = await supabase
      .from("expenses")
      .update({
        description,
        total_amount: totalAmount,
        total_amount_usd: totalAmountUsd,
        installments,
        start_month: startMonth,
        is_monthly_charge: isMonthlyCharge,
      })
      .eq("id", id)
      .select(
        "id, card_id, description, total_amount, total_amount_usd, installments, start_month, is_monthly_charge",
      )
      .single();

    if (error || !data) {
      console.error("Failed to update expense:", error);
      return error?.message ?? i18n.t("errors.failedUpdateExpense");
    }

    setExpenses((prev) =>
      prev.map((expense) =>
        expense.id === id ? mapExpense(data as ExpenseRow) : expense,
      ),
    );
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

  async function addBalanceAdjustment(input: Omit<BalanceAdjustment, "id">) {
    const description = input.description.trim();
    if (!description) return i18n.t("errors.descriptionRequired");
    if (input.amount <= 0 && input.amountUsd <= 0) {
      return i18n.t("errors.amountRequired");
    }

    const { data, error } = await supabase
      .from("balance_adjustments")
      .insert({
        card_id: input.cardId,
        description,
        amount: input.amount,
        amount_usd: input.amountUsd,
        type: input.type,
        apply_month: input.applyMonth,
        user_id: userId,
      })
      .select(
        "id, card_id, description, amount, amount_usd, type, apply_month",
      )
      .single();

    if (error || !data) {
      console.error("Failed to add balance adjustment:", error);
      return error?.message ?? i18n.t("errors.failedAddBalanceAdjustment");
    }

    setBalanceAdjustments((prev) => [
      ...prev,
      mapBalanceAdjustment(data as BalanceAdjustmentRow),
    ]);
    stamp();
    return null;
  }

  async function updateBalanceAdjustment(
    id: string,
    input: Partial<
      Pick<
        BalanceAdjustment,
        "description" | "amount" | "amountUsd" | "type" | "applyMonth"
      >
    >,
  ) {
    const current = balanceAdjustments.find((adjustment) => adjustment.id === id);
    if (!current) return i18n.t("errors.balanceAdjustmentNotFound");

    const description =
      input.description !== undefined
        ? input.description.trim()
        : current.description;
    const amount = input.amount ?? current.amount;
    const amountUsd = input.amountUsd ?? current.amountUsd;
    const type = input.type ?? current.type;
    const applyMonth = input.applyMonth ?? current.applyMonth;

    if (!description) return i18n.t("errors.descriptionRequired");
    if (amount <= 0 && amountUsd <= 0) return i18n.t("errors.amountRequired");

    const { data, error } = await supabase
      .from("balance_adjustments")
      .update({
        description,
        amount,
        amount_usd: amountUsd,
        type,
        apply_month: applyMonth,
      })
      .eq("id", id)
      .select(
        "id, card_id, description, amount, amount_usd, type, apply_month",
      )
      .single();

    if (error || !data) {
      console.error("Failed to update balance adjustment:", error);
      return error?.message ?? i18n.t("errors.failedUpdateBalanceAdjustment");
    }

    setBalanceAdjustments((prev) =>
      prev.map((adjustment) =>
        adjustment.id === id
          ? mapBalanceAdjustment(data as BalanceAdjustmentRow)
          : adjustment,
      ),
    );
    stamp();
    return null;
  }

  async function deleteBalanceAdjustment(id: string) {
    const { error } = await supabase
      .from("balance_adjustments")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("Failed to delete balance adjustment:", error);
      return error.message;
    }
    setBalanceAdjustments((prev) =>
      prev.filter((adjustment) => adjustment.id !== id),
    );
    stamp();
    return null;
  }

  function isMonthPaid(cardId: string, month: string): boolean {
    if (isBeforeCurrentMonth(month)) return true;
    return monthlyPayments.some(
      (payment) => payment.cardId === cardId && payment.month === month,
    );
  }

  async function settleMonthlyPayment(input: {
    cardId: string;
    month: string;
    paidInFull: boolean;
    amountPaid?: number;
    amountPaidUsd?: number;
  }) {
    if (isBeforeCurrentMonth(input.month)) return null;

    const due = getMonthlyDueByCard(
      input.cardId,
      input.month,
      expenses,
      balanceAdjustments,
      pendingCarryovers,
    );

    if (due.ars <= 0 && due.usd <= 0) {
      return i18n.t("errors.nothingToPay");
    }

    const amountPaid = input.paidInFull
      ? due.ars
      : round2(input.amountPaid ?? 0);
    const amountPaidUsd = input.paidInFull
      ? due.usd
      : round2(input.amountPaidUsd ?? 0);

    if (!input.paidInFull) {
      if (amountPaid <= 0 && amountPaidUsd <= 0) {
        return i18n.t("errors.amountRequired");
      }
      if (amountPaid > due.ars + 0.009 || amountPaidUsd > due.usd + 0.009) {
        return i18n.t("errors.paidExceedsDue");
      }
    }

    const remainderArs = round2(Math.max(0, due.ars - amountPaid));
    const remainderUsd = round2(Math.max(0, due.usd - amountPaidUsd));
    const nextMonth = addMonths(input.month, 1);

    const existing = monthlyPayments.find(
      (payment) =>
        payment.cardId === input.cardId && payment.month === input.month,
    );
    if (existing) {
      const { error: deleteError } = await supabase
        .from("monthly_payments")
        .delete()
        .eq("id", existing.id);
      if (deleteError) {
        console.error("Failed to replace monthly payment:", deleteError);
        return deleteError.message;
      }
    }

    const { data: paymentData, error: paymentError } = await supabase
      .from("monthly_payments")
      .insert({
        card_id: input.cardId,
        month: input.month,
        paid_in_full: input.paidInFull,
        amount_paid: amountPaid,
        amount_paid_usd: amountPaidUsd,
        user_id: userId,
      })
      .select("id, card_id, month, paid_in_full, amount_paid, amount_paid_usd")
      .single();

    if (paymentError || !paymentData) {
      console.error("Failed to save monthly payment:", paymentError);
      return paymentError?.message ?? i18n.t("errors.failedSavePayment");
    }

    const payment = mapMonthlyPayment(paymentData as MonthlyPaymentRow);

    let newCarryover: PendingCarryover | null = null;
    if (remainderArs > 0 || remainderUsd > 0) {
      const { data: carryoverData, error: carryoverError } = await supabase
        .from("pending_carryovers")
        .upsert(
          {
            card_id: input.cardId,
            apply_month: nextMonth,
            source_month: input.month,
            amount: remainderArs,
            amount_usd: remainderUsd,
            payment_id: payment.id,
            user_id: userId,
          },
          { onConflict: "card_id,apply_month" },
        )
        .select(
          "id, card_id, apply_month, source_month, amount, amount_usd, payment_id",
        )
        .single();

      if (carryoverError || !carryoverData) {
        console.error("Failed to save pending carryover:", carryoverError);
        await supabase.from("monthly_payments").delete().eq("id", payment.id);
        return carryoverError?.message ?? i18n.t("errors.failedSaveCarryover");
      }
      newCarryover = mapPendingCarryover(carryoverData as PendingCarryoverRow);
    } else {
      await supabase
        .from("pending_carryovers")
        .delete()
        .eq("card_id", input.cardId)
        .eq("apply_month", nextMonth);
    }

    setMonthlyPayments((prev) => [
      ...prev.filter(
        (item) =>
          !(item.cardId === input.cardId && item.month === input.month),
      ),
      payment,
    ]);
    setPendingCarryovers((prev) => [
      ...prev.filter(
        (item) =>
          !(
            item.cardId === input.cardId && item.applyMonth === nextMonth
          ),
      ),
      ...(newCarryover ? [newCarryover] : []),
    ]);
    stamp();
    return null;
  }

  async function clearMonthlyPayment(cardId: string, month: string) {
    if (isBeforeCurrentMonth(month)) return null;

    const existing = monthlyPayments.find(
      (payment) => payment.cardId === cardId && payment.month === month,
    );
    if (!existing) return null;

    const nextMonth = addMonths(month, 1);
    const { error } = await supabase
      .from("monthly_payments")
      .delete()
      .eq("id", existing.id);

    if (error) {
      console.error("Failed to clear monthly payment:", error);
      return error.message;
    }

    setMonthlyPayments((prev) =>
      prev.filter((payment) => payment.id !== existing.id),
    );
    setPendingCarryovers((prev) =>
      prev.filter(
        (carryover) =>
          !(
            carryover.cardId === cardId &&
            carryover.applyMonth === nextMonth &&
            carryover.paymentId === existing.id
          ),
      ),
    );
    stamp();
    return null;
  }

  function setCurrency(currency: CurrencySymbol) {
    setSettings((prev) => ({ ...prev, currency }));
  }

  function setBudgetAlert(amount: number) {
    setSettings((prev) => ({ ...prev, budgetAlert: Math.max(0, amount) }));
  }

  function setBudgetAlertColor(color: string) {
    if (!isValidHexColor(color)) return;
    setSettings((prev) => ({ ...prev, budgetAlertColor: color }));
  }

  function setShowPreviousMonths(show: boolean) {
    setSettings((prev) => ({ ...prev, showPreviousMonths: show }));
  }

  function setShowPaidRow(show: boolean) {
    setSettings((prev) => ({ ...prev, showPaidRow: show }));
  }

  function setBackgroundColor(color: string) {
    if (!isValidHexColor(color)) return;
    setSettings((prev) => ({ ...prev, backgroundColor: color }));
  }

  function setTitleColor(color: string) {
    if (!isValidHexColor(color)) return;
    setSettings((prev) => ({ ...prev, titleColor: color }));
  }

  function setTitleText(text: string) {
    setSettings((prev) => ({
      ...prev,
      titleText: normalizeWorkspaceTitle(text),
    }));
  }

  function setLanguage(language: AppLanguage) {
    setSettings((prev) => ({ ...prev, language }));
  }

  const state: AppState = {
    cards,
    expenses,
    balanceAdjustments,
    monthlyPayments,
    pendingCarryovers,
    settings,
    lastUpdated,
    loading,
  };

  return (
    <AppContext.Provider
      value={{
        state,
        addCard,
        updateCard,
        deleteCard,
        addExpense,
        addExpenses,
        updateExpense,
        deleteExpense,
        addBalanceAdjustment,
        updateBalanceAdjustment,
        deleteBalanceAdjustment,
        settleMonthlyPayment,
        clearMonthlyPayment,
        isMonthPaid,
        setCurrency,
        setBudgetAlert,
        setBudgetAlertColor,
        setShowPreviousMonths,
        setShowPaidRow,
        setBackgroundColor,
        setTitleColor,
        setTitleText,
        setLanguage,
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
