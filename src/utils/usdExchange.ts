export type UsdExchangeCasa =
  | "oficial"
  | "blue"
  | "tarjeta"
  | "bolsa"
  | "contadoconliqui"
  | "cripto"
  | "mayorista"
  | "solidario"
  | "turista";

/** Options the user can pick in Profile → Datos. */
export const USER_USD_EXCHANGE_CASAS = ["oficial", "tarjeta", "blue"] as const;
export type UserUsdExchangeCasa = (typeof USER_USD_EXCHANGE_CASAS)[number];

export const DEFAULT_USER_USD_EXCHANGE_CASA: UserUsdExchangeCasa = "blue";

export type UsdExchangeQuote = {
  moneda?: string;
  casa: string;
  fecha: string;
  compra: number | null;
  venta: number | null;
};

export type LatestUsdQuote = {
  venta: number;
  compra: number | null;
  fecha: string;
  casa: UserUsdExchangeCasa;
};

const API_BASE = "https://api.argentinadatos.com/v1/cotizaciones/dolares";

export function isUserUsdExchangeCasa(
  value: unknown,
): value is UserUsdExchangeCasa {
  return (
    typeof value === "string" &&
    USER_USD_EXCHANGE_CASAS.includes(value as UserUsdExchangeCasa)
  );
}

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function parseQuoteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

/** Latest venta rate for the given casa (uses today's quote when available). */
export async function fetchLatestUsdVenta(
  casa: UserUsdExchangeCasa = DEFAULT_USER_USD_EXCHANGE_CASA,
): Promise<LatestUsdQuote> {
  const response = await fetch(`${API_BASE}/${casa}`);
  if (!response.ok) {
    throw new Error(`USD rate fetch failed (${response.status})`);
  }

  const quotes = (await response.json()) as UsdExchangeQuote[];
  if (!Array.isArray(quotes) || quotes.length === 0) {
    throw new Error("USD rate response empty");
  }

  const today = todayIsoDate();
  const todayQuotes = quotes.filter((quote) => quote.fecha === today);
  const latest = (todayQuotes.length > 0 ? todayQuotes : quotes).at(-1);

  const venta = parseQuoteNumber(latest?.venta);
  if (!latest || venta === null) {
    throw new Error("USD rate invalid");
  }

  return {
    venta,
    compra: parseQuoteNumber(latest.compra),
    fecha: latest.fecha,
    casa,
  };
}
