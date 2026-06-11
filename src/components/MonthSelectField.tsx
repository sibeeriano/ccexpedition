import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatMonthLabel } from "../utils/format";

type MonthSelectFieldProps = {
  id: string;
  value: string;
  options: string[];
  currentMonth: string;
  onChange: (month: string) => void;
};

export function MonthSelectField({
  id,
  value,
  options,
  currentMonth,
  onChange,
}: MonthSelectFieldProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;

    listRef.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectedLabel = formatMonthLabel(value);
  const isPast = value < currentMonth;

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-base px-3 py-2 text-left text-sm text-white transition-colors hover:border-white/20 focus:border-white/30 focus:outline-none"
      >
        <span>
          {selectedLabel}
          {isPast ? ` ${t("common.past")}` : ""}
        </span>
        <span
          aria-hidden
          className={`shrink-0 text-xs text-zinc-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-labelledby={id}
          className="mt-1 max-h-[min(14rem,40dvh)] overflow-y-auto overscroll-contain rounded-md border border-white/10 bg-surface shadow-lg"
        >
          {options.map((month) => {
            const isSelected = month === value;
            const monthIsPast = month < currentMonth;
            return (
              <li key={month} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(month);
                    setOpen(false);
                  }}
                  className={`flex w-full px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-white/10 font-medium text-white"
                      : monthIsPast
                        ? "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        : "text-zinc-100 hover:bg-white/5"
                  }`}
                >
                  {formatMonthLabel(month)}
                  {monthIsPast ? ` ${t("common.past")}` : ""}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
