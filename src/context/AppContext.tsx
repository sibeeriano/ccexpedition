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
  Expense,
  ExpenseCategory,
  MonthlyPayment,
  PendingCarryover,
} from "../types";
import {
  findCategoryByName,
  normalizeCategoryName,
} from "../utils/expenseCategories";
import {
  EXPENSE_SELECT_LEGACY,
  EXPENSE_SELECT_WITH_CATEGORY,
  isExpenseCategorySchemaError,
} from "../utils/expenseSchema";
import { getMonthlyDueByCard, isCardMonthPaid } from "../utils/expenses";
import { addMonths, isBeforeCurrentMonth } from "../utils/months";
import { supabase } from "../lib/supabase";
import i18n, { type AppLanguage } from "../i18n";
import {
  applyTheme,
  isValidHexColor,
  normalizeWorkspaceTitle,
} from "../utils/theme";
import {
  type AppSettings,
  getDefaultSettings,
  loadSettingsFromLocalStorage,
  reconcileAppSettings,
  saveSettingsToLocalStorage,
  settingsSnapshot,
} from "../utils/settings";
import { useAuth } from "./AuthContext";
import { useDemoMode } from "./DemoModeContext";
import { createDemoSeed, getDemoWorkspaceTitle } from "../data/demoSeed";

export type { AppLanguage, AppSettings };

export type AppState = {
  cards: Card[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  balanceAdjustments: BalanceAdjustment[];
  monthlyPayments: MonthlyPayment[];
  pendingCarryovers: PendingCarryover[];
  settings: AppSettings;
  lastUpdated: string | null; // ISO timestamp of the last data change this session
  loading: boolean; // true while fetching data from Supabase
};

export type ExpenseMutationInput = {
  categoryName?: string;
};

type ExpenseCreateInput = Omit<Expense, "id" | "categoryId"> & {
  categoryId?: string | null;
} & ExpenseMutationInput;

type ExpenseUpdateInput = Partial<
  Pick<
    Expense,
    | "description"
    | "totalAmount"
    | "totalAmountUsd"
    | "installments"
    | "startMonth"
    | "isMonthlyCharge"
    | "categoryId"
  >
> &
  ExpenseMutationInput;

type AppContextValue = {
  state: AppState;
  /** Resolve to an error message, or null on success. */
  addCard: (input: Omit<Card, "id">) => Promise<string | null>;
  updateCard: (
    id: string,
    input: Partial<Pick<Card, "name" | "holder" | "color" | "backgroundColor">>,
  ) => Promise<string | null>;
  deleteCard: (id: string) => Promise<string | null>;
  addExpense: (input: ExpenseCreateInput) => Promise<string | null>;
  addExpenses: (inputs: ExpenseCreateInput[]) => Promise<string | null>;
  updateExpense: (
    id: string,
    input: ExpenseUpdateInput,
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
  setBudgetAlert: (amount: number) => void;
  /** Flush any pending auto-saved settings (e.g. budget alert on blur). */
  flushSettingsPersist: () => void;
  setLanguage: (language: AppLanguage) => void;
  updateMonthlyIncome: (
    month: string,
    update: { amount: number; confirmed: boolean },
  ) => void;
  /** Apply workspace settings and persist (used by the settings modal Save button). */
  applySettings: (settings: AppSettings) => Promise<string | null>;
};

type UserSettingsRow = {
  settings: Partial<AppSettings>;
};

function applySettingsTheme(settings: AppSettings) {
  applyTheme({
    backgroundColor: settings.backgroundColor,
    titleColor: settings.titleColor,
    titleText: settings.titleText,
    budgetAlertColor: settings.budgetAlertColor,
    cardColumnColor: settings.cardColumnColor,
  });
}

type CardRow = {
  id: string;
  name: string;
  holder: string;
  color: string;
  background_color: string | null;
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
  category_id?: string | null;
};

type ExpenseCategoryRow = {
  id: string;
  name: string;
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
  const backgroundColor =
    row.background_color && isValidHexColor(row.background_color)
      ? row.background_color
      : null;
  return {
    id: row.id,
    name: row.name,
    holder: row.holder as CardHolder,
    color: row.color,
    backgroundColor,
  };
}

function mapExpenseCategory(row: ExpenseCategoryRow): ExpenseCategory {
  return {
    id: row.id,
    name: row.name,
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
    categoryId: row.category_id ?? null,
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

function newDemoId(): string {
  return crypto.randomUUID();
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const { isDemo } = useDemoMode();
  const userId = session?.user.id ?? null;

  const [cards, setCards] = useState<Card[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    [],
  );
  const [balanceAdjustments, setBalanceAdjustments] = useState<
    BalanceAdjustment[]
  >([]);
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>([]);
  const [pendingCarryovers, setPendingCarryovers] = useState<PendingCarryover[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => getDefaultSettings());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const expenseCategoriesRef = useRef(expenseCategories);
  expenseCategoriesRef.current = expenseCategories;
  const expenseCategorySchemaRef = useRef(true);
  const settingsHydratedForUserRef = useRef<string | null>(null);
  const persistedSettingsRef = useRef(settingsSnapshot(getDefaultSettings()));
  const settingsAutoPersistTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  function markSettingsPersisted(value: AppSettings) {
    persistedSettingsRef.current = settingsSnapshot(value);
  }

  async function persistSettingsToStorage(
    value: AppSettings,
    activeUserId: string | null,
    options?: { force?: boolean },
  ): Promise<string | null> {
    if (isDemo) {
      markSettingsPersisted(value);
      return null;
    }

    saveSettingsToLocalStorage(activeUserId, value);
    if (!activeUserId) {
      markSettingsPersisted(value);
      return null;
    }

    if (
      !options?.force &&
      settingsHydratedForUserRef.current !== activeUserId
    ) {
      return null;
    }

    const { error } = await supabase.from("user_settings").upsert(
      {
        user_id: activeUserId,
        settings: value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Failed to save user settings:", error);
      return error.message;
    }

    markSettingsPersisted(value);
    return null;
  }

  function scheduleAutoPersistSettings(value: AppSettings) {
    if (isDemo) {
      markSettingsPersisted(value);
      return;
    }

    saveSettingsToLocalStorage(userId, value);
    if (!userId || settingsHydratedForUserRef.current !== userId) {
      markSettingsPersisted(value);
      return;
    }

    if (settingsAutoPersistTimer.current) {
      clearTimeout(settingsAutoPersistTimer.current);
    }
    settingsAutoPersistTimer.current = setTimeout(() => {
      void persistSettingsToStorage(value, userId);
    }, 500);
  }

  function flushSettingsPersist() {
    if (settingsAutoPersistTimer.current) {
      clearTimeout(settingsAutoPersistTimer.current);
      settingsAutoPersistTimer.current = null;
    }
    void persistSettingsToStorage(settingsRef.current, userId);
  }

  async function applySettings(next: AppSettings): Promise<string | null> {
    if (settingsAutoPersistTimer.current) {
      clearTimeout(settingsAutoPersistTimer.current);
      settingsAutoPersistTimer.current = null;
    }
    const normalized: AppSettings = {
      ...next,
      titleText: normalizeWorkspaceTitle(next.titleText),
    };
    setSettings(normalized);
    applySettingsTheme(normalized);
    if (i18n.language !== normalized.language) {
      await i18n.changeLanguage(normalized.language);
    }
    document.documentElement.lang = normalized.language;
    if (userId) {
      settingsHydratedForUserRef.current = userId;
    }
    return persistSettingsToStorage(normalized, userId, { force: true });
  }

  useEffect(() => {
    if (!isDemo) return;

    const language: AppLanguage = i18n.language === "es" ? "es" : "en";
    const seed = createDemoSeed(language);
    setCards(seed.cards);
    setExpenses(seed.expenses);
    setExpenseCategories(seed.expenseCategories);
    setBalanceAdjustments(seed.balanceAdjustments);
    setMonthlyPayments(seed.monthlyPayments);
    setPendingCarryovers(seed.pendingCarryovers);
    setSettings(seed.settings);
    markSettingsPersisted(seed.settings);
    applySettingsTheme(seed.settings);
    void i18n.changeLanguage(language);
    setLoading(false);
    setLastUpdated(null);
  }, [isDemo]);

  useEffect(() => {
    if (!isDemo) return;

    setSettings((prev) => ({
      ...prev,
      titleText: getDemoWorkspaceTitle(prev.language),
    }));
  }, [isDemo, settings.language]);

  useEffect(() => {
    if (isDemo || authLoading) return;

    if (!userId) {
      settingsHydratedForUserRef.current = null;
      const guest = loadSettingsFromLocalStorage(null);
      setSettings(guest);
      markSettingsPersisted(guest);
      applySettingsTheme(guest);
      return;
    }

    let cancelled = false;
    settingsHydratedForUserRef.current = null;

    void (async () => {
      const fromLocal = loadSettingsFromLocalStorage(userId);
      const { data, error } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      let loaded: AppSettings;
      let shouldSyncToRemote = false;

      if (error) {
        console.error("Failed to load user settings:", error);
        loaded = fromLocal;
      } else if (data?.settings && typeof data.settings === "object") {
        const reconciled = reconcileAppSettings(
          (data as UserSettingsRow).settings,
          fromLocal,
        );
        loaded = reconciled.settings;
        shouldSyncToRemote = reconciled.shouldSyncToRemote;
      } else {
        loaded = fromLocal;
        shouldSyncToRemote = true;
      }

      saveSettingsToLocalStorage(userId, loaded);

      if (shouldSyncToRemote) {
        const { error: syncError } = await supabase.from("user_settings").upsert(
          {
            user_id: userId,
            settings: loaded,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        if (syncError) {
          console.error("Failed to sync user settings:", syncError);
        }
      }

      if (cancelled) return;

      setSettings(loaded);
      markSettingsPersisted(loaded);
      applySettingsTheme(loaded);
      settingsHydratedForUserRef.current = userId;
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isDemo, authLoading]);

  useEffect(() => {
    if (isDemo || !userId) return;

    function handleBeforeUnload() {
      flushSettingsPersist();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [userId, isDemo]);

  useEffect(() => {
    applySettingsTheme(settings);
  }, [
    settings.backgroundColor,
    settings.titleColor,
    settings.titleText,
    settings.budgetAlertColor,
    settings.cardColumnColor,
  ]);

  useEffect(() => {
    if (i18n.language !== settings.language) {
      void i18n.changeLanguage(settings.language);
    }
    document.documentElement.lang = settings.language;
  }, [settings.language]);

  // (Re)load all data whenever the signed-in user changes.
  useEffect(() => {
    if (isDemo) return;

    if (!userId) {
      setCards([]);
      setExpenses([]);
      setExpenseCategories([]);
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
        .select("id, name, holder, color, background_color")
        .order("created_at"),
      supabase.from("expenses").select(EXPENSE_SELECT_WITH_CATEGORY).order("created_at"),
      supabase
        .from("expense_categories")
        .select("id, name")
        .order("name"),
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
    ]).then(
      ([
        cardsResult,
        expensesResult,
        categoriesResult,
        adjustmentsResult,
        paymentsResult,
        carryoversResult,
      ]) => {
      if (cancelled) return;
      if (cardsResult.error) {
        console.error("Failed to load cards:", cardsResult.error);
      } else {
        setCards((cardsResult.data as CardRow[]).map(mapCard));
      }
      if (expensesResult.error) {
        console.error("Failed to load expenses:", expensesResult.error);
        if (isExpenseCategorySchemaError(expensesResult.error)) {
          expenseCategorySchemaRef.current = false;
          void supabase
            .from("expenses")
            .select(EXPENSE_SELECT_LEGACY)
            .order("created_at")
            .then(({ data, error }) => {
              if (cancelled || error) {
                if (error) {
                  console.error("Failed to load legacy expenses:", error);
                }
                return;
              }
              setExpenses((data as ExpenseRow[]).map(mapExpense));
            });
        }
      } else {
        setExpenses((expensesResult.data as ExpenseRow[]).map(mapExpense));
      }
      if (categoriesResult.error) {
        console.error("Failed to load expense categories:", categoriesResult.error);
        if (isExpenseCategorySchemaError(categoriesResult.error)) {
          expenseCategorySchemaRef.current = false;
        }
        setExpenseCategories([]);
      } else {
        setExpenseCategories(
          (categoriesResult.data as ExpenseCategoryRow[]).map(
            mapExpenseCategory,
          ),
        );
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
    },
    );

    return () => {
      cancelled = true;
    };
  }, [userId, isDemo]);

  function stamp() {
    setLastUpdated(new Date().toISOString());
  }

  function buildExpenseInsertRow(
    payload: Omit<Expense, "id">,
    ownerId: string,
  ): Record<string, unknown> {
    const row: Record<string, unknown> = {
      card_id: payload.cardId,
      description: payload.description,
      total_amount: payload.totalAmount,
      total_amount_usd: payload.totalAmountUsd,
      installments: payload.installments,
      start_month: payload.startMonth,
      is_monthly_charge: payload.isMonthlyCharge,
      user_id: ownerId,
    };
    if (expenseCategorySchemaRef.current) {
      row.category_id = payload.categoryId;
    }
    return row;
  }

  function buildExpenseUpdateRow(updates: {
    description: string;
    totalAmount: number;
    totalAmountUsd: number;
    installments: number;
    startMonth: string;
    isMonthlyCharge: boolean;
    categoryId: string | null;
  }): Record<string, unknown> {
    const row: Record<string, unknown> = {
      description: updates.description,
      total_amount: updates.totalAmount,
      total_amount_usd: updates.totalAmountUsd,
      installments: updates.installments,
      start_month: updates.startMonth,
      is_monthly_charge: updates.isMonthlyCharge,
    };
    if (expenseCategorySchemaRef.current) {
      row.category_id = updates.categoryId;
    }
    return row;
  }

  async function resolveCategoryIdFromName(
    categoryName: string | undefined,
  ): Promise<{ categoryId: string | null | undefined; error: string | null }> {
    if (categoryName === undefined) {
      return { categoryId: undefined, error: null };
    }

    if (!isDemo && !expenseCategorySchemaRef.current) {
      return { categoryId: null, error: null };
    }

    const normalized = normalizeCategoryName(categoryName);
    if (!normalized) {
      return { categoryId: null, error: null };
    }

    const existing = findCategoryByName(
      expenseCategoriesRef.current,
      normalized,
    );
    if (existing) {
      return { categoryId: existing.id, error: null };
    }

    if (isDemo) {
      const category = { id: newDemoId(), name: normalized };
      setExpenseCategories((prev) => [...prev, category]);
      return { categoryId: category.id, error: null };
    }

    const { data, error } = await supabase
      .from("expense_categories")
      .insert({ user_id: userId, name: normalized })
      .select("id, name")
      .single();

    if (error) {
      if (error.code === "23505") {
        const { data: existingRow, error: fetchError } = await supabase
          .from("expense_categories")
          .select("id, name")
          .eq("user_id", userId)
          .eq("name", normalized)
          .maybeSingle();

        if (fetchError || !existingRow) {
          console.error("Failed to load existing expense category:", fetchError);
          return {
            categoryId: null,
            error: fetchError?.message ?? i18n.t("errors.failedSaveCategory"),
          };
        }

        const mapped = mapExpenseCategory(existingRow as ExpenseCategoryRow);
        setExpenseCategories((prev) =>
          prev.some((category) => category.id === mapped.id)
            ? prev
            : [...prev, mapped],
        );
        return { categoryId: mapped.id, error: null };
      }

      console.error("Failed to create expense category:", error);
      return {
        categoryId: null,
        error: error.message ?? i18n.t("errors.failedSaveCategory"),
      };
    }

    const mapped = mapExpenseCategory(data as ExpenseCategoryRow);
    setExpenseCategories((prev) => [...prev, mapped]);
    return { categoryId: mapped.id, error: null };
  }

  async function addCard(input: Omit<Card, "id">) {
    if (isDemo) {
      const name = input.name.trim();
      const holder = input.holder.trim();
      if (!name) return i18n.t("errors.cardNameRequired");
      if (!holder) return i18n.t("errors.holderRequired");
      if (!isValidHexColor(input.color)) return i18n.t("errors.invalidCardColor");
      if (
        input.backgroundColor !== null &&
        !isValidHexColor(input.backgroundColor)
      ) {
        return i18n.t("errors.invalidCardColor");
      }
      setCards((prev) => [
        ...prev,
        {
          ...input,
          name,
          holder,
          id: newDemoId(),
        },
      ]);
      stamp();
      return null;
    }

    const { data, error } = await supabase
      .from("cards")
      .insert({
        name: input.name,
        holder: input.holder,
        color: input.color,
        background_color: input.backgroundColor,
        user_id: userId,
      })
      .select("id, name, holder, color, background_color")
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
    input: Partial<Pick<Card, "name" | "holder" | "color" | "backgroundColor">>,
  ) {
    const current = cards.find((card) => card.id === id);
    if (!current) return i18n.t("errors.cardNotFound");

    const name = input.name !== undefined ? input.name.trim() : current.name;
    const holder =
      input.holder !== undefined ? input.holder.trim() : current.holder;
    const color = input.color ?? current.color;
    const backgroundColor =
      input.backgroundColor !== undefined
        ? input.backgroundColor
        : current.backgroundColor;

    if (!name) return i18n.t("errors.cardNameRequired");
    if (!holder) return i18n.t("errors.holderRequired");
    if (!isValidHexColor(color)) return i18n.t("errors.invalidCardColor");
    if (backgroundColor !== null && !isValidHexColor(backgroundColor)) {
      return i18n.t("errors.invalidCardColor");
    }

    if (isDemo) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, name, holder, color, backgroundColor } : card,
        ),
      );
      stamp();
      return null;
    }

    const { data, error } = await supabase
      .from("cards")
      .update({
        name,
        holder,
        color,
        background_color: backgroundColor,
      })
      .eq("id", id)
      .select("id, name, holder, color, background_color")
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
    if (!isDemo) {
      const { error } = await supabase.from("cards").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete card:", error);
        return error.message;
      }
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

  async function addExpense(input: ExpenseCreateInput) {
    const { categoryName, ...expenseInput } = input;
    const resolved = await resolveCategoryIdFromName(categoryName ?? "");
    if (resolved.error) return resolved.error;

    const payload: Omit<Expense, "id"> = {
      ...expenseInput,
      categoryId: resolved.categoryId ?? null,
    };

    if (isDemo) {
      setExpenses((prev) => [...prev, { ...payload, id: newDemoId() }]);
      stamp();
      return null;
    }

    if (!userId) {
      return i18n.t("errors.failedAddExpense");
    }

    const insertPayload = buildExpenseInsertRow(payload, userId);
    const { data, error } = expenseCategorySchemaRef.current
      ? await supabase
          .from("expenses")
          .insert(insertPayload)
          .select(EXPENSE_SELECT_WITH_CATEGORY)
          .single()
      : await supabase
          .from("expenses")
          .insert(insertPayload)
          .select(EXPENSE_SELECT_LEGACY)
          .single();

    if (error && isExpenseCategorySchemaError(error)) {
      expenseCategorySchemaRef.current = false;
      const retry = await supabase
        .from("expenses")
        .insert(buildExpenseInsertRow(payload, userId))
        .select(EXPENSE_SELECT_LEGACY)
        .single();
      if (retry.error || !retry.data) {
        console.error("Failed to add expense:", retry.error);
        return retry.error?.message ?? i18n.t("errors.failedAddExpense");
      }
      setExpenses((prev) => [...prev, mapExpense(retry.data as ExpenseRow)]);
      stamp();
      return null;
    }

    if (error || !data) {
      console.error("Failed to add expense:", error);
      return error?.message ?? i18n.t("errors.failedAddExpense");
    }
    setExpenses((prev) => [...prev, mapExpense(data as ExpenseRow)]);
    stamp();
    return null;
  }

  async function addExpenses(inputs: ExpenseCreateInput[]) {
    if (inputs.length === 0) return null;

    const resolvedInputs: Omit<Expense, "id">[] = [];
    for (const input of inputs) {
      const { categoryName, ...expenseInput } = input;
      const resolved = await resolveCategoryIdFromName(categoryName ?? "");
      if (resolved.error) return resolved.error;
      resolvedInputs.push({
        ...expenseInput,
        categoryId: resolved.categoryId ?? null,
      });
    }

    if (isDemo) {
      setExpenses((prev) => [
        ...prev,
        ...resolvedInputs.map((input) => ({ ...input, id: newDemoId() })),
      ]);
      stamp();
      return null;
    }

    if (!userId) {
      return i18n.t("errors.failedImportExpenses");
    }

    const insertRows = resolvedInputs.map((input) =>
      buildExpenseInsertRow(input, userId),
    );
    const { data, error } = expenseCategorySchemaRef.current
      ? await supabase
          .from("expenses")
          .insert(insertRows)
          .select(EXPENSE_SELECT_WITH_CATEGORY)
      : await supabase
          .from("expenses")
          .insert(insertRows)
          .select(EXPENSE_SELECT_LEGACY);

    if (error && isExpenseCategorySchemaError(error)) {
      expenseCategorySchemaRef.current = false;
      const retry = await supabase
        .from("expenses")
        .insert(
          resolvedInputs.map((input) => buildExpenseInsertRow(input, userId)),
        )
        .select(EXPENSE_SELECT_LEGACY);
      if (retry.error || !retry.data) {
        console.error("Failed to import expenses:", retry.error);
        return retry.error?.message ?? i18n.t("errors.failedImportExpenses");
      }
      setExpenses((prev) => [
        ...prev,
        ...(retry.data as ExpenseRow[]).map(mapExpense),
      ]);
      stamp();
      return null;
    }

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

  async function updateExpense(id: string, input: ExpenseUpdateInput) {
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

    let categoryId = input.categoryId ?? current.categoryId;
    if (input.categoryName !== undefined) {
      const resolved = await resolveCategoryIdFromName(input.categoryName);
      if (resolved.error) return resolved.error;
      categoryId = resolved.categoryId ?? null;
    }

    if (!description) return i18n.t("errors.descriptionRequired");
    if (totalAmount <= 0 && totalAmountUsd <= 0) {
      return i18n.t("errors.amountRequired");
    }
    if (installments < 1 || installments > 48) {
      return i18n.t("errors.invalidInstallments");
    }

    if (isDemo) {
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                description,
                totalAmount,
                totalAmountUsd,
                installments,
                startMonth,
                isMonthlyCharge,
                categoryId,
              }
            : expense,
        ),
      );
      stamp();
      return null;
    }

    const updatePayload = buildExpenseUpdateRow({
      description,
      totalAmount,
      totalAmountUsd,
      installments,
      startMonth,
      isMonthlyCharge,
      categoryId,
    });
    const { data, error } = expenseCategorySchemaRef.current
      ? await supabase
          .from("expenses")
          .update(updatePayload)
          .eq("id", id)
          .select(EXPENSE_SELECT_WITH_CATEGORY)
          .single()
      : await supabase
          .from("expenses")
          .update(updatePayload)
          .eq("id", id)
          .select(EXPENSE_SELECT_LEGACY)
          .single();

    if (error && isExpenseCategorySchemaError(error)) {
      expenseCategorySchemaRef.current = false;
      const retry = await supabase
        .from("expenses")
        .update(
          buildExpenseUpdateRow({
            description,
            totalAmount,
            totalAmountUsd,
            installments,
            startMonth,
            isMonthlyCharge,
            categoryId,
          }),
        )
        .eq("id", id)
        .select(EXPENSE_SELECT_LEGACY)
        .single();
      if (retry.error || !retry.data) {
        console.error("Failed to update expense:", retry.error);
        return retry.error?.message ?? i18n.t("errors.failedUpdateExpense");
      }
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === id ? mapExpense(retry.data as ExpenseRow) : expense,
        ),
      );
      stamp();
      return null;
    }

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
    if (!isDemo) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete expense:", error);
        return error.message;
      }
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

    if (isDemo) {
      setBalanceAdjustments((prev) => [
        ...prev,
        { ...input, description, id: newDemoId() },
      ]);
      stamp();
      return null;
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

    if (isDemo) {
      setBalanceAdjustments((prev) =>
        prev.map((adjustment) =>
          adjustment.id === id
            ? { ...adjustment, description, amount, amountUsd, type, applyMonth }
            : adjustment,
        ),
      );
      stamp();
      return null;
    }

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
    if (!isDemo) {
      const { error } = await supabase
        .from("balance_adjustments")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Failed to delete balance adjustment:", error);
        return error.message;
      }
    }
    setBalanceAdjustments((prev) =>
      prev.filter((adjustment) => adjustment.id !== id),
    );
    stamp();
    return null;
  }

  function isMonthPaid(cardId: string, month: string): boolean {
    return isCardMonthPaid(cardId, month, monthlyPayments);
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

    const amountPaid = input.paidInFull
      ? due.ars
      : round2(input.amountPaid ?? 0);
    const amountPaidUsd = input.paidInFull
      ? due.usd
      : round2(input.amountPaidUsd ?? 0);

    if (!input.paidInFull) {
      if (amountPaid > due.ars + 0.009 || amountPaidUsd > due.usd + 0.009) {
        return i18n.t("errors.paidExceedsDue");
      }
    }

    const remainderArs = round2(Math.max(0, due.ars - amountPaid));
    const remainderUsd = round2(Math.max(0, due.usd - amountPaidUsd));
    const nextMonth = addMonths(input.month, 1);

    if (isDemo) {
      const payment: MonthlyPayment = {
        id: newDemoId(),
        cardId: input.cardId,
        month: input.month,
        paidInFull: input.paidInFull,
        amountPaid,
        amountPaidUsd,
      };
      let newCarryover: PendingCarryover | null = null;
      if (remainderArs > 0 || remainderUsd > 0) {
        newCarryover = {
          id: newDemoId(),
          cardId: input.cardId,
          applyMonth: nextMonth,
          sourceMonth: input.month,
          amount: remainderArs,
          amountUsd: remainderUsd,
          paymentId: payment.id,
        };
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
            !(item.cardId === input.cardId && item.applyMonth === nextMonth),
        ),
        ...(newCarryover ? [newCarryover] : []),
      ]);
      stamp();
      return null;
    }

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

    if (!isDemo) {
      const { error } = await supabase
        .from("monthly_payments")
        .delete()
        .eq("id", existing.id);

      if (error) {
        console.error("Failed to clear monthly payment:", error);
        return error.message;
      }
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

  function setBudgetAlert(amount: number) {
    setSettings((prev) => {
      const next = { ...prev, budgetAlert: Math.max(0, amount) };
      scheduleAutoPersistSettings(next);
      return next;
    });
  }

  function setLanguage(language: AppLanguage) {
    setSettings((prev) => {
      const next = { ...prev, language };
      scheduleAutoPersistSettings(next);
      return next;
    });
  }

  function updateMonthlyIncome(
    month: string,
    update: { amount: number; confirmed: boolean },
  ) {
    setSettings((prev) => {
      const next = {
        ...prev,
        monthlyIncomeByMonth: {
          ...prev.monthlyIncomeByMonth,
          [month]: {
            amount: Math.max(0, update.amount),
            confirmed: update.confirmed,
          },
        },
      };
      scheduleAutoPersistSettings(next);
      return next;
    });
  }

  const state: AppState = {
    cards,
    expenses,
    expenseCategories,
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
        setBudgetAlert,
        flushSettingsPersist,
        setLanguage,
        updateMonthlyIncome,
        applySettings,
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
