import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type {
  PortfolioState,
  Holding,
  PortfolioSummary,
  Stock,
  CashCurrency,
} from "@/src/types";
import { initialPortfolioState } from "@/src/state/initialState";
import {
  calculatePortfolioSummary,
  calculateAllocation,
  calculateWeights,
  buildHolding,
} from "@/src/functions/portfolioFunctions";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const fetchFxUsdThb = createAsyncThunk(
  "portfolio/fetchFxUsdThb",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/market/fx");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { fxUsdThb?: number };
      if (typeof data.fxUsdThb !== "number") throw new Error("Invalid fxUsdThb");
      return data.fxUsdThb;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  },
);

function convertAmount(
  amount: number,
  from: CashCurrency,
  to: CashCurrency,
  fxUsdThb: number,
) {
  if (from === to) return amount;
  if (from === "USD" && to === "THB") return amount * fxUsdThb;
  // from THB to USD
  return fxUsdThb > 0 ? amount / fxUsdThb : amount;
}

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState: initialPortfolioState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setHoldings(state, action: PayloadAction<Holding[]>) {
      state.holdings = action.payload;
    },
    updateHoldingPrice(
      state,
      action: PayloadAction<{ symbol: string; price: number }>
    ) {
      const holding = state.holdings.find(
        (h) => h.symbol === action.payload.symbol
      );
      if (holding) {
        holding.currentPrice = action.payload.price;
        holding.marketValue = holding.quantity * action.payload.price;
        holding.unrealizedPnL = holding.marketValue - holding.costBasis;
        holding.unrealizedPnLPercent =
          (holding.unrealizedPnL / holding.costBasis) * 100;
      }
    },
    setSummary(state, action: PayloadAction<PortfolioSummary>) {
      state.summary = action.payload;
    },
    setAllocation(state, action: PayloadAction<PortfolioState["allocation"]>) {
      state.allocation = action.payload;
    },
    setPerformance(
      state,
      action: PayloadAction<PortfolioState["performance"]>
    ) {
      state.performance = action.payload;
    },

    setFxUsdThb(state, action: PayloadAction<number>) {
      const next = action.payload;
      if (!Number.isFinite(next) || next <= 0) return;
      state.summary.fxUsdThb = round2(next);
      state.summary = calculatePortfolioSummary(
        state.holdings,
        state.summary.cashBalances,
        state.summary.fxUsdThb,
      );
    },

    buyStock(
      state,
      action: PayloadAction<{
        symbol: string;
        name: string;
        sector: Holding["sector"];
        quantity: number;
        price: number;
        fee?: number;
        /** Currency of the price/fee (instrument quote currency) */
        quoteCurrency: CashCurrency;
        /** Which user cash account to use for payment */
        payCurrency: CashCurrency;
      }>
    ) {
      const { symbol, name, sector, quantity, price, quoteCurrency, payCurrency } =
        action.payload;
      const fee = action.payload.fee ?? 0;

      const fx = state.summary.fxUsdThb || 35;
      const totalCostInQuote = quantity * price + fee;
      const debit = round2(convertAmount(totalCostInQuote, quoteCurrency, payCurrency, fx));
      state.summary.cashBalances[payCurrency] = Math.max(
        0,
        round2(state.summary.cashBalances[payCurrency] - debit),
      );

      const existing = state.holdings.find((h) => h.symbol === symbol);
      if (existing) {
        const prevQty = existing.quantity;
        const prevCostBasis = existing.costBasis;
        const addCost = quantity * price;

        const nextQty = prevQty + quantity;
        const nextCostBasis = prevCostBasis + addCost;
        const nextAvgCost = nextQty > 0 ? nextCostBasis / nextQty : existing.avgCost;

        existing.quantity = nextQty;
        existing.avgCost = nextAvgCost;
        existing.currentPrice = price;
        existing.marketValue = nextQty * price;
        existing.costBasis = nextQty * nextAvgCost;
        existing.unrealizedPnL = existing.marketValue - existing.costBasis;
        existing.unrealizedPnLPercent =
          existing.costBasis > 0 ? (existing.unrealizedPnL / existing.costBasis) * 100 : 0;
      } else {
        state.holdings.push(
          buildHolding(symbol, name, sector, quantity, price, price, 0)
        );
      }

      state.holdings = calculateWeights(state.holdings);
      state.summary = calculatePortfolioSummary(
        state.holdings,
        state.summary.cashBalances,
        state.summary.fxUsdThb,
      );
      state.allocation = calculateAllocation(state.holdings);
    },

    sellStock(
      state,
      action: PayloadAction<{
        symbol: string;
        quantity: number;
        price: number;
        fee?: number;
        /** Currency the sale settles into */
        settlementCurrency: CashCurrency;
        /** Currency of the price/fee (instrument quote currency) */
        quoteCurrency: CashCurrency;
      }>
    ) {
      const { symbol, quantity, price, settlementCurrency, quoteCurrency } =
        action.payload;
      const fee = action.payload.fee ?? 0;

      const holding = state.holdings.find((h) => h.symbol === symbol);
      if (!holding) return;

      const sellQty = Math.min(quantity, holding.quantity);
      const fx = state.summary.fxUsdThb || 35;
      const proceedsInQuote = sellQty * price - fee;
      const credit = round2(
        convertAmount(proceedsInQuote, quoteCurrency, settlementCurrency, fx),
      );
      state.summary.cashBalances[settlementCurrency] = round2(
        state.summary.cashBalances[settlementCurrency] + Math.max(0, credit),
      );

      const nextQty = holding.quantity - sellQty;
      if (nextQty <= 0) {
        state.holdings = state.holdings.filter((h) => h.symbol !== symbol);
      } else {
        holding.quantity = nextQty;
        // Keep avgCost for remaining shares; recompute derived values with current price.
        holding.currentPrice = price;
        holding.marketValue = nextQty * price;
        holding.costBasis = nextQty * holding.avgCost;
        holding.unrealizedPnL = holding.marketValue - holding.costBasis;
        holding.unrealizedPnLPercent =
          holding.costBasis > 0 ? (holding.unrealizedPnL / holding.costBasis) * 100 : 0;
      }

      state.holdings = calculateWeights(state.holdings);
      state.summary = calculatePortfolioSummary(
        state.holdings,
        state.summary.cashBalances,
        state.summary.fxUsdThb,
      );
      state.allocation = calculateAllocation(state.holdings);
    },

    /**
     * Called after market data is fetched. Updates every holding's currentPrice
     * from real market data, then recalculates weights, summary, and allocation.
     */
    syncPricesFromMarket(state, action: PayloadAction<Stock[]>) {
      const stockMap = new Map(action.payload.map((s) => [s.symbol, s]));

      // 1. Update prices for each holding that has a matching market quote
      state.holdings = state.holdings.map((holding) => {
        const stock = stockMap.get(holding.symbol);
        if (!stock) return holding;

        const marketValue    = holding.quantity * stock.price;
        const unrealizedPnL  = marketValue - holding.costBasis;
        const unrealizedPnLPercent =
          holding.costBasis > 0 ? (unrealizedPnL / holding.costBasis) * 100 : 0;

        return {
          ...holding,
          currentPrice:        stock.price,
          marketValue,
          unrealizedPnL,
          unrealizedPnLPercent,
        };
      });

      // 2. Recalculate portfolio weights
      state.holdings = calculateWeights(state.holdings);

      // 3. Recalculate summary using current cash balance
      state.summary = calculatePortfolioSummary(
        state.holdings,
        state.summary.cashBalances,
        state.summary.fxUsdThb
      );

      // 4. Recalculate sector allocation
      state.allocation = calculateAllocation(state.holdings);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFxUsdThb.fulfilled, (state, action) => {
        const next = action.payload;
        if (!Number.isFinite(next) || next <= 0) return;
        state.summary.fxUsdThb = round2(next);
        state.summary = calculatePortfolioSummary(
          state.holdings,
          state.summary.cashBalances,
          state.summary.fxUsdThb,
        );
      })
      .addCase(fetchFxUsdThb.rejected, (state, action) => {
        // non-fatal; keep last known FX
        state.error = (action.payload as string) ?? state.error;
      });
  },
});

export const {
  setLoading,
  setError,
  setHoldings,
  updateHoldingPrice,
  setSummary,
  setAllocation,
  setPerformance,
  setFxUsdThb,
  buyStock,
  sellStock,
  syncPricesFromMarket,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
