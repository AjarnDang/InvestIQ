import {
  Bell,
  Shield,
  BarChart2,
  Zap,
  PieChart,
  LineChart,
  type LucideIcon,
} from "lucide-react";

// ─── Hero Preview ────────────────────────────────────────────────────────────

export interface PreviewStat {
  label: string;
  value: string;
  color: string;
}

export const HERO_PREVIEW_STATS: PreviewStat[] = [
  { label: "Portfolio Value", value: "฿646,550", color: "text-white"        },
  { label: "Total Return",    value: "฿55,300",  color: "text-emerald-400"  },
  { label: "Daily P&L",       value: "฿3,825",   color: "text-emerald-400"  },
  { label: "Cash Balance",    value: "฿45,320",  color: "text-white"        },
];

/** Bar heights (%) for the decorative chart in the hero preview */
export const HERO_CHART_BARS: number[] = [40, 55, 45, 60, 52, 68, 58, 72, 64, 78, 70, 85, 76, 90, 82];

export interface PreviewHolding {
  symbol: string;
  return: string;
}

export const HERO_PREVIEW_HOLDINGS: PreviewHolding[] = [
  { symbol: "PTT",   return: "+13.1%" },
  { symbol: "KBANK", return: "+10.5%" },
  { symbol: "AOT",   return: "+4.98%" },
];

// ─── Ticker ───────────────────────────────────────────────────────────────────

export interface TickerStock {
  symbol: string;
  price: number;
  change: number;
  up: boolean;
}

export const TICKER_STOCKS: TickerStock[] = [
  { symbol: "PTT",       price: 36.75,   change: 1.38,  up: true  },
  { symbol: "KBANK",     price: 152.5,   change: -1.3,  up: false },
  { symbol: "AOT",       price: 68.5,    change: 1.86,  up: true  },
  { symbol: "CPALL",     price: 60.25,   change: 1.26,  up: true  },
  { symbol: "SCB",       price: 98.5,    change: -1.5,  up: false },
  { symbol: "SCC",       price: 285.0,   change: 1.06,  up: true  },
  { symbol: "ADVANC",    price: 224.0,   change: -0.22, up: false },
  { symbol: "DELTA",     price: 78.5,    change: 3.29,  up: true  },
  { symbol: "BBL",       price: 148.0,   change: 0.68,  up: true  },
  { symbol: "TRUE",      price: 8.7,     change: 1.75,  up: true  },
  { symbol: "SET Index", price: 1452.35, change: 0.61,  up: true  },
];

// ─── Features Section ─────────────────────────────────────────────────────────

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

export const FEATURES: FeatureCard[] = [
  {
    icon: PieChart,
    title: "Smart Portfolio Tracking",
    description:
      "Monitor all your investments in one unified dashboard. Track real-time P&L, sector allocation, and performance at a glance.",
    iconColor: "text-indigo-400",
    iconBg:    "bg-indigo-500/10",
  },
  {
    icon: LineChart,
    title: "Real-time Market Data",
    description:
      "Stay ahead with live SET market data, indices, stock screener, and advanced filtering tools to find your next opportunity.",
    iconColor: "text-emerald-400",
    iconBg:    "bg-emerald-500/10",
  },
  {
    icon: Bell,
    title: "Intelligent Price Alerts",
    description:
      "Set custom price targets and receive instant notifications when stocks hit your defined levels. Never miss a move again.",
    iconColor: "text-amber-400",
    iconBg:    "bg-amber-500/10",
  },
  {
    icon: BarChart2,
    title: "Transaction Analytics",
    description:
      "Keep a complete history of all your trades, dividends, and transfers. Filter, search, and analyze your investment activity.",
    iconColor: "text-blue-400",
    iconBg:    "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Portfolio Risk Analysis",
    description:
      "Understand your risk exposure by sector and individual stock. Diversify intelligently with allocation insights.",
    iconColor: "text-purple-400",
    iconBg:    "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Instant Performance Reports",
    description:
      "Beautiful performance charts showing your portfolio growth over time. Export and share your investment journey.",
    iconColor: "text-pink-400",
    iconBg:    "bg-pink-500/10",
  },
];

// ─── Platform Stats ───────────────────────────────────────────────────────────

export interface PlatformStat {
  value: string;
  label: string;
}

export const PLATFORM_STATS: PlatformStat[] = [
  { value: "฿2.5B+",   label: "Assets Tracked"    },
  { value: "10,000+",  label: "Active Investors"   },
  { value: "500+",     label: "Stocks Listed"      },
  { value: "99.9%",    label: "Platform Uptime"    },
];

// ─── How it Works ─────────────────────────────────────────────────────────────

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up in seconds with our streamlined onboarding process.",
  },
  {
    step: "02",
    title: "Add Your Portfolio",
    description: "Import your holdings or manually enter your investment positions.",
  },
  {
    step: "03",
    title: "Track & Grow",
    description: "Monitor performance, get insights, and make smarter decisions.",
  },
];

// ─── Login Page ───────────────────────────────────────────────────────────────

export const LOGIN_FEATURE_LIST: string[] = [
  "Real-time SET market data & indices",
  "Portfolio P&L tracking & analytics",
  "Smart price alerts & notifications",
  "Full transaction history & reporting",
];

export const LOGIN_PREVIEW_STATS: PreviewStat[] = [
  { label: "Total Value", value: "฿646,550", color: "text-white"       },
  { label: "Return",      value: "+฿55,300", color: "text-emerald-400" },
  { label: "Daily P&L",   value: "+฿3,825",  color: "text-emerald-400" },
  { label: "Cash",        value: "฿45,320",  color: "text-white"       },
];

/** Bar heights (%) for the decorative mini-chart in the login panel */
export const LOGIN_CHART_BARS: number[] = [30, 45, 38, 55, 48, 62, 58, 70, 65, 78, 72, 85];
