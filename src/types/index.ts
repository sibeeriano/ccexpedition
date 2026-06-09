export type CardHolder = string;

export type CurrencySymbol = "$" | "€" | "ARS";

export type Card = {
  id: string;
  name: string; // e.g. "Mastercard BBVA"
  holder: CardHolder;
  color: string; // hex for UI
};

export type Expense = {
  id: string;
  cardId: string;
  description: string;
  totalAmount: number; // ARS / pesos (0 if USD-only)
  totalAmountUsd: number; // USD (0 if ARS-only)
  installments: number; // 1 = one-time payment
  startMonth: string; // format: "YYYY-MM" e.g. "2026-06"
};

// Derived: spread each expense across N months starting from startMonth
export type MonthlyEntry = {
  expenseId: string;
  month: string; // "YYYY-MM"
  amount: number; // ARS monthly installment
  amountUsd: number; // USD monthly installment
};
