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

const DOLAR_API_BASE = "https://dolarapi.com/v1/dolares";
const ARGENTINA_DATOS_BASE =
  "https://api.argentinadatos.com/v1/cotizaciones/dolares";

type DolarApiQuote = {
  moneda?: string;
  casa: string;
  nombre?: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
};

export function isUserUsdExchangeCasa(
  value: unknown,
): value is UserUsdExchangeCasa {
  return (
    typeof value === "string" &&
    USER_USD_EXCHANGE_CASAS.includes(value as UserUsdExchangeCasa)
  );
}

function argentinaIsoDate(from: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(from);
}

function isoDateFromTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return argentinaIsoDate();
  }
  return argentinaIsoDate(parsed);
}

function parseQuoteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : null;
}

async function fetchFromDolarApi(
  casa: UserUsdExchangeCasa,
): Promise<LatestUsdQuote> {
  const response = await fetch(`${DOLAR_API_BASE}/${casa}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`USD rate fetch failed (${response.status})`);
  }

  const quote = (await response.json()) as DolarApiQuote;
  const venta = parseQuoteNumber(quote.venta);
  if (venta === null) {
    throw new Error("USD rate invalid");
  }

  return {
    venta,
    compra: parseQuoteNumber(quote.compra),
    fecha: isoDateFromTimestamp(quote.fechaActualizacion),
    casa,
  };
}

async function fetchFromArgentinaDatos(
  casa: UserUsdExchangeCasa,
): Promise<LatestUsdQuote> {
  const response = await fetch(`${ARGENTINA_DATOS_BASE}/${casa}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`USD rate fetch failed (${response.status})`);
  }

  const quotes = (await response.json()) as UsdExchangeQuote[];
  if (!Array.isArray(quotes) || quotes.length === 0) {
    throw new Error("USD rate response empty");
  }

  const today = argentinaIsoDate();
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

/** Latest venta rate for the given casa (DolarAPI first, ArgentinaDatos fallback). */
export async function fetchLatestUsdVenta(
  casa: UserUsdExchangeCasa = DEFAULT_USER_USD_EXCHANGE_CASA,
): Promise<LatestUsdQuote> {
  try {
    return await fetchFromDolarApi(casa);
  } catch {
    return fetchFromArgentinaDatos(casa);
  }
}
