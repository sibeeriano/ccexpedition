import { formatMoney } from "../utils/format";
import { useMoneyDisplay } from "../hooks/useMoneyDisplay";

type UsdAmountProps = {
  amount: number;
  className?: string;
  muted?: boolean;
};

/** USD amount with optional ARS equivalent in parentheses. */
export function UsdAmount({
  amount,
  className = "",
  muted = false,
}: UsdAmountProps) {
  const { convertUsdToArs, usdRate, resolve } = useMoneyDisplay();

  if (amount === 0) return null;

  const { convertedUsdToArs } = resolve(0, amount);
  const showConversion =
    convertUsdToArs && usdRate && usdRate > 0 && convertedUsdToArs !== 0;

  return (
    <span className={`font-mono ${muted ? "text-zinc-400" : ""} ${className}`}>
      {formatMoney(amount, "$")}
      {showConversion && (
        <span className="text-zinc-500">
          {" "}
          ({formatMoney(convertedUsdToArs, "ARS")})
        </span>
      )}
    </span>
  );
}
