import { useTranslation } from "react-i18next";
import type { ExpenseCategory } from "../types";
import { sortCategories } from "../utils/expenseCategories";

type CategorySelectFieldProps = {
  id: string;
  value: string;
  categories: ExpenseCategory[];
  onChange: (value: string) => void;
};

export function CategorySelectField({
  id,
  value,
  categories,
  onChange,
}: CategorySelectFieldProps) {
  const { t } = useTranslation();
  const listId = `${id}-suggestions`;
  const sorted = sortCategories(categories);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-xs font-medium text-zinc-400">
          {t("expenseCategory.label")}
        </label>
        <input
          id={id}
          type="text"
          list={listId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("expenseCategory.placeholder")}
          className="rounded-md border border-white/10 bg-base px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
        />
        <datalist id={listId}>
          {sorted.map((category) => (
            <option key={category.id} value={category.name} />
          ))}
        </datalist>
        <p className="text-[11px] text-zinc-500">{t("expenseCategory.hint")}</p>
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sorted.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(category.name)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                value.trim().toLowerCase() === category.name.toLowerCase()
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
