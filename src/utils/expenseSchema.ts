export const EXPENSE_SELECT_LEGACY =
  "id, card_id, description, total_amount, total_amount_usd, installments, start_month, is_monthly_charge";

export const EXPENSE_SELECT_WITH_CATEGORY = `${EXPENSE_SELECT_LEGACY}, category_id`;

export function isExpenseCategorySchemaError(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false;

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42703" ||
    code === "42P01" ||
    code === "PGRST204" ||
    message.includes("category_id") ||
    message.includes("expense_categories")
  );
}
