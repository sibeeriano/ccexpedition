import {
  monthlyInstallmentFromTotal,
  totalFromMonthlyInstallment,
} from "./expenses";

export type InstallmentAmountSource = "total" | "installment";

export function parseInstallmentCount(value: string): number {
  return Math.floor(Number.parseInt(value, 10) || 0);
}

export function installmentAmountForTotal(
  total: string,
  count: number,
): string {
  const amount = Number.parseFloat(total) || 0;
  if (amount > 0 && count >= 1) {
    return String(monthlyInstallmentFromTotal(amount, count));
  }
  return "";
}

export function totalForInstallmentAmount(
  monthly: string,
  count: number,
): string {
  const amount = Number.parseFloat(monthly) || 0;
  if (amount > 0 && count >= 1) {
    return String(totalFromMonthlyInstallment(amount, count));
  }
  return "";
}
