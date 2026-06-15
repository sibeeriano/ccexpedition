export type CardHolder = string;

export type CurrencySymbol = "$" | "€" | "ARS";

export type MonthlyIncomeEntry = {
  amount: number;
  confirmed: boolean;
};

export type Card = {
  id: string;
  name: string; // e.g. "Mastercard BBVA"
  holder: CardHolder;
  color: string; // hex accent for UI
  /** Optional chip background; null = default surface */
  backgroundColor: string | null;
};

export type MonthlyPayment = {
  id: string;
  cardId: string;
  month: string;
  paidInFull: boolean;
  amountPaid: number;
  amountPaidUsd: number;
};

/** Saldo pendiente generado automáticamente al pagar parcialmente un mes. */
export type PendingCarryover = {
  id: string;
  cardId: string;
  applyMonth: string;
  sourceMonth: string;
  amount: number;
  amountUsd: number;
  paymentId: string;
};

export type BalanceAdjustmentType = "payment_advance" | "credit_balance";

/** Adelanto de pago o saldo a favor que resta del total de un mes. */
export type BalanceAdjustment = {
  id: string;
  cardId: string;
  description: string;
  amount: number; // ARS (siempre positivo; se resta al calcular)
  amountUsd: number; // USD (siempre positivo; se resta al calcular)
  type: BalanceAdjustmentType;
  applyMonth: string; // "YYYY-MM"
};

export type ExpenseCategory = {
  id: string;
  name: string;
};

export type Expense = {
  id: string;
  cardId: string;
  description: string;
  totalAmount: number; // ARS / pesos (0 if USD-only)
  totalAmountUsd: number; // USD (0 if ARS-only)
  installments: number; // 1 = one-time payment
  startMonth: string; // format: "YYYY-MM" e.g. "2026-06"
  isMonthlyCharge: boolean; // subscription created via monthly-charge checkbox
  categoryId: string | null;
};

// Derived: spread each expense across N months starting from startMonth
export type MonthlyEntry = {
  expenseId: string;
  month: string; // "YYYY-MM"
  amount: number; // ARS monthly installment
  amountUsd: number; // USD monthly installment
};
