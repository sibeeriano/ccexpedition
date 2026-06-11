import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Card } from "../types";
import { useApp } from "../context/AppContext";
import { MonthPaidCheckbox } from "./MonthPaidCheckbox";

/** Wait for payment modal close animation before celebrating. */
const CELEBRATION_DELAY_MS = 450;
const CELEBRATION_DURATION_MS = 1600;

const PARTICLE_COLORS = [
  "#fbbf24",
  "#34d399",
  "#38bdf8",
  "#fb7185",
  "#a78bfa",
  "#f472b6",
];

type PaidMonthCellProps = {
  month: string;
  cards: Card[];
};

export function PaidMonthCell({ month, cards }: PaidMonthCellProps) {
  const { t } = useTranslation();
  const { isMonthPaid } = useApp();
  const allPaid =
    cards.length > 0 && cards.every((card) => isMonthPaid(card.id, month));
  const [celebrate, setCelebrate] = useState(false);
  const wasAllPaid = useRef(allPaid);

  useEffect(() => {
    if (allPaid && !wasAllPaid.current) {
      const startTimer = window.setTimeout(() => {
        setCelebrate(true);
      }, CELEBRATION_DELAY_MS);
      const endTimer = window.setTimeout(() => {
        setCelebrate(false);
      }, CELEBRATION_DELAY_MS + CELEBRATION_DURATION_MS);
      wasAllPaid.current = allPaid;
      return () => {
        window.clearTimeout(startTimer);
        window.clearTimeout(endTimer);
        setCelebrate(false);
      };
    }

    if (!allPaid) {
      setCelebrate(false);
    }
    wasAllPaid.current = allPaid;
  }, [allPaid]);

  return (
    <td
      className={`relative overflow-hidden px-2 py-2 align-top transition-colors ${
        allPaid ? "bg-emerald-500/5" : ""
      }`}
    >
      {allPaid && (
        <div
          className="pointer-events-none absolute inset-0 rounded-sm border border-emerald-400/25"
          aria-hidden
        />
      )}

      {celebrate && (
        <div
          className="paid-celebration pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          aria-hidden
        >
          <span className="paid-celebration-badge text-base">✓</span>
          {PARTICLE_COLORS.map((color, index) => (
            <span
              key={color}
              className="paid-celebration-particle"
              style={
                {
                  "--particle-color": color,
                  "--particle-angle": `${index * 60}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <div className="relative z-[1] flex w-full min-w-28 flex-col items-start gap-1.5">
        {cards.map((card) => (
          <MonthPaidCheckbox key={card.id} card={card} month={month} />
        ))}
      </div>

      {allPaid && (
        <p className="relative z-[1] mt-1.5 text-left text-[10px] font-medium text-emerald-400/90">
          {t("payment.allPaid")}
        </p>
      )}
    </td>
  );
}
