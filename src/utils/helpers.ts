import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind Class Merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Color Helpers ────────────────────────────────────────────────────────────
export function getChangeColor(value: number): string {
  if (value > 0) return "text-emerald-500";
  if (value < 0) return "text-red-500";
  return "text-slate-500";
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return "bg-emerald-50 text-emerald-700";
  if (value < 0) return "bg-red-50 text-red-700";
  return "bg-slate-50 text-slate-600";
}

export function getArrow(value: number): string {
  if (value > 0) return "▲";
  if (value < 0) return "▼";
  return "—";
}

// ─── Sector Color Map ─────────────────────────────────────────────────────────
export const SECTOR_COLORS: Record<string, string> = {
  Energy: "#F59E0B",
  Banking: "#3B82F6",
  Technology: "#8B5CF6",
  Healthcare: "#10B981",
  "Real Estate": "#F97316",
  Consumer: "#06B6D4",
  Industrial: "#6366F1",
  Utilities: "#84CC16",
  Finance: "#EC4899",
};

export function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? "#94A3B8";
}

// ─── Array Helpers ────────────────────────────────────────────────────────────
export function sortBy<T>(arr: T[], key: keyof T, dir: "asc" | "desc" = "asc"): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {});
}

// ─── ID Generator ─────────────────────────────────────────────────────────────
export function generateId(prefix = "ID"): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}

// ─── Transaction Type Config ──────────────────────────────────────────────────
export const TRANSACTION_TYPE_CONFIG = {
  BUY: { label: "Buy", color: "bg-blue-100 text-blue-700", sign: -1 },
  SELL: { label: "Sell", color: "bg-emerald-100 text-emerald-700", sign: 1 },
  DIVIDEND: {
    label: "Dividend",
    color: "bg-amber-100 text-amber-700",
    sign: 1,
  },
  DEPOSIT: { label: "Deposit", color: "bg-purple-100 text-purple-700", sign: 1 },
  WITHDRAW: { label: "Withdraw", color: "bg-red-100 text-red-700", sign: -1 },
} as const;

export const STATUS_CONFIG = {
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
} as const;
