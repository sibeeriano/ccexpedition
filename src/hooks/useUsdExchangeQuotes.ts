import { useEffect, useState } from "react";
import {
  fetchLatestUsdVenta,
  USER_USD_EXCHANGE_CASAS,
  type LatestUsdQuote,
  type UserUsdExchangeCasa,
} from "../utils/usdExchange";

export function useUsdExchangeQuotes(activeCasa: UserUsdExchangeCasa) {
  const [quotes, setQuotes] = useState<
    Partial<Record<UserUsdExchangeCasa, LatestUsdQuote>>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadQuotes = () => {
      setLoading(true);
      setError(false);

      void Promise.all(
        USER_USD_EXCHANGE_CASAS.map(async (casa) => {
          try {
            const quote = await fetchLatestUsdVenta(casa);
            return { casa, quote };
          } catch {
            return { casa, quote: null };
          }
        }),
      ).then((results) => {
        if (cancelled) return;
        const next: Partial<Record<UserUsdExchangeCasa, LatestUsdQuote>> = {};
        let anyOk = false;
        for (const { casa, quote } of results) {
          if (quote) {
            next[casa] = quote;
            anyOk = true;
          }
        }
        setQuotes(next);
        setError(!anyOk);
        setLoading(false);
      });
    };

    loadQuotes();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadQuotes();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return {
    quotes,
    activeQuote: quotes[activeCasa] ?? null,
    loading,
    error,
  };
}
