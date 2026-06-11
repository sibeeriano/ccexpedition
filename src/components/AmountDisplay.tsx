import { formatMoney } from "../utils/format";

type AmountDisplayProps = {
  ars: number;
  usd?: number;
  className?: string;
  inline?: boolean;
};

/** Shows ARS and/or USD amounts stacked (or inline). */
export function AmountDisplay({
  ars,
  usd = 0,
  className = "",
  inline = false,
}: AmountDisplayProps) {
  const hasArs = ars !== 0;
  const hasUsd = usd !== 0;

  if (!hasArs && !hasUsd) {
    return <span className={className}>{formatMoney(0, "ARS")}</span>;
  }

  if (inline && hasArs && hasUsd) {
    return (
      <span className={className}>
        {formatMoney(ars, "ARS")} · {formatMoney(usd, "$")}
      </span>
    );
  }

  return (
    <span className={`flex flex-col ${className}`}>
      {hasArs && (
        <span className="font-mono">{formatMoney(ars, "ARS")}</span>
      )}
      {hasUsd && (
        <span className={`font-mono ${hasArs ? "text-zinc-400" : ""}`}>
          {formatMoney(usd, "$")}
        </span>
      )}
    </span>
  );
}
