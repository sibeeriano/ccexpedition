export const CARD_SELECT_LEGACY =
  "id, name, holder, color, background_color";

export const CARD_SELECT_WITH_MONTHLY_FLAG = `${CARD_SELECT_LEGACY}, is_monthly_expense`;

export function isCardMonthlyExpenseSchemaError(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false;

  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  return (
    code === "42703" ||
    code === "PGRST204" ||
    message.includes("is_monthly_expense")
  );
}
