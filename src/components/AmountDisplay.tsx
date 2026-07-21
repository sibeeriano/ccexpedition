import { formatMoney } from "../utils/format";
import { useMoneyDisplay } from "../hooks/useMoneyDisplay";

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
  const { convertUsdToArs, usdRate, resolve } = useMoneyDisplay();
  const { combinedArs, convertedUsdToArs } = resolve(ars, usd);

  const hasArs = ars !== 0;
  const hasUsd = usd !== 0;
  const showCombinedArs =
    convertUsdToArs && usdRate && usdRate > 0 && (hasArs || hasUsd);
  const displayArs = showCombinedArs ? combinedArs : ars;
  const showArsLine = showCombinedArs ? displayArs !== 0 || hasUsd : hasArs;
  const showUsdConversion =
    convertUsdToArs && usdRate && usdRate > 0 && hasUsd && convertedUsdToArs !== 0;

  if (!hasArs && !hasUsd) {
    return (
      <span className={`font-mono text-money ${className}`.trim()}>
        {formatMoney(0, "ARS")}
      </span>
    );
  }

  const usdText = (
    <>
      {formatMoney(usd, "$")}
      {showUsdConversion && (
        <span className="text-zinc-500">
          {" "}
          ({formatMoney(convertedUsdToArs, "ARS")})
        </span>
      )}
    </>
  );

  if (inline && showArsLine && hasUsd) {
    return (
      <span className={`font-mono text-money ${className}`.trim()}>
        {formatMoney(displayArs, "ARS")} · {usdText}
      </span>
    );
  }

  return (
    <span className={`flex flex-col ${className}`}>
      {showArsLine && (
        <span className="font-mono text-money">
          {formatMoney(displayArs, "ARS")}
        </span>
      )}
      {hasUsd && (
        <span
          className={`font-mono text-money ${showArsLine ? "text-zinc-400" : ""}`}
        >
          {usdText}
        </span>
      )}
    </span>
  );
}
