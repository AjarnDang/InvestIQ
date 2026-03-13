// ─── Generic component props ──────────────────────────────────────────────────

import type React from "react";

export interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  align?: "left" | "right" | "center";
  render?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

