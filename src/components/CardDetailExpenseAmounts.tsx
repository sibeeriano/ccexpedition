import { formatMoney } from "../utils/format";
import { useMoneyDisplay } from "../hooks/useMoneyDisplay";
import { AmountDisplay } from "./AmountDisplay";

type CardDetailThisMonthCellProps = {
  ars: number;
  usd: number;
  className?: string;
};

/** Card detail: monthly USD without ARS parens (conversion goes to Total ARS column). */
export function CardDetailThisMonthCell({
  ars,
  usd,
  className = "",
}: CardDetailThisMonthCellProps) {
  const { convertUsdToArs, usdRate } = useMoneyDisplay();

  if (!convertUsdToArs || !usdRate) {
    return <AmountDisplay ars={ars} usd={usd} className={className} />;
  }

  const hasArs = ars !== 0;
  const hasUsd = usd !== 0;

  if (!hasArs && !hasUsd) {
    return (
      <span className={`font-mono text-money ${className}`.trim()}>
        {formatMoney(0, "ARS")}
      </span>
    );
  }

  return (
    <span className={`flex flex-col ${className}`}>
      {hasArs && (
        <span className="font-mono text-money">{formatMoney(ars, "ARS")}</span>
      )}
      {hasUsd && (
        <span
          className={`font-mono text-money ${hasArs ? "text-zinc-400" : ""}`}
        >
          {formatMoney(usd, "$")}
        </span>
      )}
    </span>
  );
}

type CardDetailTotalArsCellProps = {
  totalAmount: number;
  monthlyUsd: number;
};

/** Card detail: native total ARS, or monthly USD converted when the expense has no ARS total. */
export function CardDetailTotalArsCell({
  totalAmount,
  monthlyUsd,
}: CardDetailTotalArsCellProps) {
  const { convertUsdToArs, usdRate, resolve } = useMoneyDisplay();

  if (totalAmount > 0) {
    return (
      <span className="font-mono text-money text-zinc-100">
        {formatMoney(totalAmount, "ARS")}
      </span>
    );
  }

  if (convertUsdToArs && usdRate && monthlyUsd > 0) {
    const converted = resolve(0, monthlyUsd).convertedUsdToArs;
    return (
      <span className="font-mono text-money text-zinc-100">
        {formatMoney(converted, "ARS")}
      </span>
    );
  }

  return <span className="text-zinc-600">—</span>;
}

type CardDetailTotalUsdCellProps = {
  amount: number;
};

/** Card detail: total USD without ARS conversion in parentheses. */
export function CardDetailTotalUsdCell({ amount }: CardDetailTotalUsdCellProps) {
  if (amount <= 0) {
    return <span className="text-zinc-600">—</span>;
  }

  return (
    <span className="font-mono text-money text-zinc-100">
      {formatMoney(amount, "$")}
    </span>
  );
}
