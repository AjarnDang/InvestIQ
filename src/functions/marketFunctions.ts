import type { Stock, PriceHistory } from "@/src/types";

// ─── Stock Filters & Sorts ────────────────────────────────────────────────────

export function filterStocks(
  stocks: Stock[],
  query: string,
  sector?: string
): Stock[] {
  let result = stocks;

  if (query) {
    const q = query.toLowerCase();
    result = result.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }

  if (sector && sector !== "ALL") {
    result = result.filter((s) => s.sector === sector);
  }

  return result;
}

export function sortStocks(
  stocks: Stock[],
  field: keyof Stock,
  direction: "asc" | "desc"
): Stock[] {
  return [...stocks].sort((a, b) => {
    const av = a[field] as number | string;
    const bv = b[field] as number | string;
    if (av < bv) return direction === "asc" ? -1 : 1;
    if (av > bv) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

export function getGainersAndLosers(stocks: Stock[]): {
  gainers: Stock[];
  losers: Stock[];
} {
  const sorted = [...stocks].sort(
    (a, b) => b.changePercent - a.changePercent
  );
  return {
    gainers: sorted.filter((s) => s.changePercent > 0).slice(0, 5),
    losers: sorted.filter((s) => s.changePercent < 0).slice(0, 5),
  };
}

// ─── Mock Price History Generator ────────────────────────────────────────────

export function generatePriceHistory(
  currentPrice: number,
  days = 30,
  volatility = 0.02
): PriceHistory[] {
  const history: PriceHistory[] = [];
  let price = currentPrice * (1 - volatility * days * 0.5);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.48) * volatility * price;
    price = Math.max(price + change, 0.01);

    const dayVolatility = volatility * price;
    const open = price - (Math.random() - 0.5) * dayVolatility;
    const high = Math.max(open, price) + Math.random() * dayVolatility;
    const low = Math.min(open, price) - Math.random() * dayVolatility;

    history.push({
      date: date.toISOString().split("T")[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(Math.max(low, 0.01).toFixed(2)),
      close: parseFloat(price.toFixed(2)),
      volume: Math.floor(1_000_000 + Math.random() * 10_000_000),
    });
  }

  return history;
}

// ─── Market Summary Stats ─────────────────────────────────────────────────────

export function getMarketStats(stocks: Stock[]) {
  const total = stocks.length;
  const advancing = stocks.filter((s) => s.changePercent > 0).length;
  const declining = stocks.filter((s) => s.changePercent < 0).length;
  const unchanged = total - advancing - declining;
  const avgChange =
    stocks.reduce((sum, s) => sum + s.changePercent, 0) / total;

  return { total, advancing, declining, unchanged, avgChange };
}
