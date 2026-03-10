import type { MarketIndex } from "@/src/types";

/** Flag emoji + Thai region label for each SET index display name. */
export const SET_REGION: Record<string, { flag: string; region: string }> = {
  "SET Index": { flag: "🇹🇭", region: "ไทย" },
  "SET50":     { flag: "🇹🇭", region: "ไทย" },
  "SET100":    { flag: "🇹🇭", region: "ไทย" },
  "MAI":       { flag: "🇹🇭", region: "ไทย" },
};

export const MOCK_INDICES: MarketIndex[] = [
  { name: "SET Index", value: 1452.35, change: 8.75,  changePercent: 0.61  },
  { name: "SET50",     value: 1023.18, change: 5.42,  changePercent: 0.53  },
  { name: "SET100",    value: 2198.64, change: 12.31, changePercent: 0.56  },
  { name: "MAI",       value: 426.52,  change: -2.18, changePercent: -0.51 },
];
