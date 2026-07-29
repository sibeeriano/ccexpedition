import type {
  BalanceAdjustment,
  Card,
  Expense,
  ExpenseCategory,
  MonthlyPayment,
  PendingCarryover,
} from "../types";
import i18n, { type AppLanguage } from "../i18n";
import { getCurrentMonth } from "../utils/format";
import { addMonths } from "../utils/months";
import { getDefaultSettings, type AppSettings } from "../utils/settings";

export function getDemoWorkspaceTitle(language: AppLanguage): string {
  return i18n.getFixedT(language)("demo.workspaceTitle");
}

export const DEMO_CARD_IDS = {
  visa: "demo-visa",
  master: "demo-master",
  mp: "demo-mp",
  super: "demo-super",
  cine: "demo-cine",
} as const;

export type DemoSeed = {
  cards: Card[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  balanceAdjustments: BalanceAdjustment[];
  monthlyPayments: MonthlyPayment[];
  pendingCarryovers: PendingCarryover[];
  settings: AppSettings;
};

export function createDemoSeed(language: AppLanguage): DemoSeed {
  const current = getCurrentMonth();
  const twoMonthsAgo = addMonths(current, -2);
  const lastMonth = addMonths(current, -1);

  return {
    cards: [
      {
        id: DEMO_CARD_IDS.visa,
        name: "Visa BBVA",
        holder: "Expedición",
        color: "#2563eb",
        backgroundColor: null,
        isMonthlyExpense: false,
      },
      {
        id: DEMO_CARD_IDS.master,
        name: "Master BBVA",
        holder: "Expedición",
        color: "#dc2626",
        backgroundColor: null,
        isMonthlyExpense: false,
      },
      {
        id: DEMO_CARD_IDS.mp,
        name: "MercadoPago",
        holder: "Expedición",
        color: "#009ee3",
        backgroundColor: null,
        isMonthlyExpense: false,
      },
      {
        id: DEMO_CARD_IDS.super,
        name: "Super",
        holder: "Efectivo",
        color: "#059669",
        backgroundColor: null,
        isMonthlyExpense: true,
      },
      {
        id: DEMO_CARD_IDS.cine,
        name: "Cine",
        holder: "Ocio",
        color: "#7c3aed",
        backgroundColor: null,
        isMonthlyExpense: true,
      },
    ],
    expenseCategories: [
      { id: "demo-cat-super", name: "Supermercado" },
      { id: "demo-cat-subs", name: "Suscripciones" },
    ],
    expenses: [
      {
        id: "demo-e1",
        cardId: DEMO_CARD_IDS.visa,
        description: "Supermercado Coto",
        totalAmount: 180_000,
        totalAmountUsd: 0,
        installments: 3,
        startMonth: lastMonth,
        isMonthlyCharge: false,
        categoryId: "demo-cat-super",
      },
      {
        id: "demo-e2",
        cardId: DEMO_CARD_IDS.visa,
        description: "Netflix",
        totalAmount: 18_000,
        totalAmountUsd: 0,
        installments: 1,
        startMonth: current,
        isMonthlyCharge: true,
        categoryId: "demo-cat-subs",
      },
      {
        id: "demo-e3",
        cardId: DEMO_CARD_IDS.master,
        description: "Zapatillas Nike",
        totalAmount: 420_000,
        totalAmountUsd: 0,
        installments: 6,
        startMonth: twoMonthsAgo,
        isMonthlyCharge: false,
        categoryId: null,
      },
      {
        id: "demo-e4",
        cardId: DEMO_CARD_IDS.master,
        description: "Cena restaurante",
        totalAmount: 85_000,
        totalAmountUsd: 0,
        installments: 1,
        startMonth: current,
        isMonthlyCharge: false,
        categoryId: null,
      },
      {
        id: "demo-e5",
        cardId: DEMO_CARD_IDS.mp,
        description: "Spotify",
        totalAmount: 4_500,
        totalAmountUsd: 0,
        installments: 1,
        startMonth: lastMonth,
        isMonthlyCharge: true,
        categoryId: "demo-cat-subs",
      },
      {
        id: "demo-e6",
        cardId: DEMO_CARD_IDS.visa,
        description: "AirPods",
        totalAmount: 0,
        totalAmountUsd: 249,
        installments: 12,
        startMonth: lastMonth,
        isMonthlyCharge: false,
        categoryId: null,
      },
      {
        id: "demo-e7",
        cardId: DEMO_CARD_IDS.super,
        description: "Compra Coto",
        totalAmount: 52_000,
        totalAmountUsd: 0,
        installments: 1,
        startMonth: current,
        isMonthlyCharge: false,
        categoryId: "demo-cat-super",
      },
      {
        id: "demo-e8",
        cardId: DEMO_CARD_IDS.cine,
        description: "Entradas + pochoclos",
        totalAmount: 24_000,
        totalAmountUsd: 0,
        installments: 1,
        startMonth: current,
        isMonthlyCharge: false,
        categoryId: null,
      },
    ],
    balanceAdjustments: [
      {
        id: "demo-adj1",
        cardId: DEMO_CARD_IDS.visa,
        description: "Adelanto resumen",
        amount: 50_000,
        amountUsd: 0,
        type: "payment_advance",
        applyMonth: current,
      },
    ],
    monthlyPayments: [
      {
        id: "demo-pay1",
        cardId: DEMO_CARD_IDS.master,
        month: lastMonth,
        paidInFull: true,
        amountPaid: 120_000,
        amountPaidUsd: 0,
      },
    ],
    pendingCarryovers: [],
    settings: {
      ...getDefaultSettings(),
      language,
      budgetAlert: 80_000,
      budgetAlertConfirmed: true,
      titleText: getDemoWorkspaceTitle(language),
      showPaidRow: true,
      showPreviousMonths: true,
      monthlyIncomeByMonth: {
        [current]: { amount: 1_500_000, confirmed: true },
      },
    },
  };
}
