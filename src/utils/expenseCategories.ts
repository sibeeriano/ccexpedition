import type { ExpenseCategory } from "../types";

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function findCategoryByName(
  categories: ExpenseCategory[],
  name: string,
): ExpenseCategory | undefined {
  const normalized = normalizeCategoryName(name).toLowerCase();
  if (!normalized) return undefined;
  return categories.find(
    (category) => category.name.toLowerCase() === normalized,
  );
}

export function getCategoryDisplayName(
  categoryId: string | null,
  categories: ExpenseCategory[],
): string {
  if (!categoryId) return "";
  return categories.find((category) => category.id === categoryId)?.name ?? "";
}

export function sortCategories(
  categories: ExpenseCategory[],
): ExpenseCategory[] {
  return [...categories].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
