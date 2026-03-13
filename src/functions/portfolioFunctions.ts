import type { Holding, PortfolioSummary, AllocationData } from "@/src/types";
import { getSectorColor } from "@/src/utils/helpers";

// ─── Portfolio Calculations ───────────────────────────────────────────────────

export function calculatePortfolioSummary(
  holdings: Holding[],
  cashBalance: number,
  previousDayValue?: number
): PortfolioSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const prevValue = previousDayValue ?? totalValue * 0.994;
  const dailyPnL = totalValue - prevValue;
  const dailyPnLPercent = prevValue > 0 ? (dailyPnL / prevValue) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercent,
    dailyPnL,
    dailyPnLPercent,
    cashBalance,
  };
}

export function calculateAllocation(holdings: Holding[]): AllocationData[] {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  if (totalValue === 0) return [];

  const sectorMap = new Map<string, number>();
  holdings.forEach((h) => {
    const current = sectorMap.get(h.sector) ?? 0;
    sectorMap.set(h.sector, current + h.marketValue);
  });

  return Array.from(sectorMap.entries()).map(([sector, value]) => ({
    name: sector,
    value,
    percent: (value / totalValue) * 100,
    color: getSectorColor(sector),
  }));
}

export function calculateWeights(holdings: Holding[]): Holding[] {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  if (totalValue === 0) return holdings;

  return holdings.map((h) => ({
    ...h,
    weight: (h.marketValue / totalValue) * 100,
  }));
}

export function getTopHoldings(holdings: Holding[], limit = 5): Holding[] {
  return [...holdings]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, limit);
}

export function getTopGainers(holdings: Holding[], limit = 3): Holding[] {
  return [...holdings]
    .sort((a, b) => b.unrealizedPnLPercent - a.unrealizedPnLPercent)
    .slice(0, limit);
}

export function getTopLosers(holdings: Holding[], limit = 3): Holding[] {
  return [...holdings]
    .sort((a, b) => a.unrealizedPnLPercent - b.unrealizedPnLPercent)
    .slice(0, limit);
}

export function buildHolding(
  symbol: string,
  name: string,
  sector: Holding["sector"],
  quantity: number,
  avgCost: number,
  currentPrice: number,
  totalWeight: number
): Holding {
  const marketValue = quantity * currentPrice;
  const costBasis = quantity * avgCost;
  const unrealizedPnL = marketValue - costBasis;
  const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

  return {
    symbol,
    name,
    sector,
    quantity,
    avgCost,
    currentPrice,
    marketValue,
    costBasis,
    unrealizedPnL,
    unrealizedPnLPercent,
    weight: totalWeight,
  };
}

// ─── Single-position cost metrics ─────────────────────────────────────────────

export interface PositionCostMetrics {
  hasPosition: boolean;
  quantity: number;
  avgCost: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  priceDiff: number;
  priceDiffPercent: number;
}

export function calculatePositionCostMetrics(
  holding: Holding | null | undefined,
  currentPrice: number | null | undefined,
): PositionCostMetrics | null {
  if (!holding || holding.quantity <= 0 || currentPrice == null || !Number.isFinite(currentPrice)) {
    return null;
  }

  const quantity = holding.quantity;
  const avgCost = holding.avgCost;
  const costBasis = quantity * avgCost;
  const currentValue = quantity * currentPrice;
  const unrealizedPnL = currentValue - costBasis;
  const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;
  const priceDiff = currentPrice - avgCost;
  const priceDiffPercent = avgCost > 0 ? (priceDiff / avgCost) * 100 : 0;

  return {
    hasPosition: true,
    quantity,
    avgCost,
    costBasis,
    currentPrice,
    currentValue,
    unrealizedPnL,
    unrealizedPnLPercent,
    priceDiff,
    priceDiffPercent,
  };
}
