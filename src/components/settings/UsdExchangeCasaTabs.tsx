import { useTranslation } from "react-i18next";
import {
  USER_USD_EXCHANGE_CASAS,
  type UserUsdExchangeCasa,
} from "../../utils/usdExchange";

type UsdExchangeCasaTabsProps = {
  value: UserUsdExchangeCasa;
  onChange: (casa: UserUsdExchangeCasa) => void;
  name?: string;
};

export function UsdExchangeCasaTabs({
  value,
  onChange,
  name = "usd-exchange-casa",
}: UsdExchangeCasaTabsProps) {
  const { t } = useTranslation();

  return (
    <fieldset>
      <legend className="sr-only">{t("profile.usdRateTitle")}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-md bg-base p-1">
        {USER_USD_EXCHANGE_CASAS.map((casa) => (
          <label
            key={casa}
            className={`cursor-pointer rounded px-2 py-1.5 text-center text-xs font-medium transition-colors sm:text-sm ${
              value === casa
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={casa}
              checked={value === casa}
              onChange={() => onChange(casa)}
              className="sr-only"
            />
            {t(`profile.usdExchange.${casa}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
