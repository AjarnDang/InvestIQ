// ─── Transaction ──────────────────────────────────────────────────────────────

export type TransactionType = "BUY" | "SELL" | "DIVIDEND" | "DEPOSIT" | "WITHDRAW";
export type TransactionStatus = "COMPLETED" | "PENDING" | "CANCELLED";

export interface Transaction {
  id: string;
  type: TransactionType;
  symbol?: string;
  name?: string;
  quantity?: number;
  price?: number;
  amount: number;
  fee: number;
  status: TransactionStatus;
  date: string;
  note?: string;
}

export interface TransactionFilter {
  type: TransactionType | "ALL";
  status: TransactionStatus | "ALL";
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
}

export interface TransactionState {
  transactions: Transaction[];
  filter: TransactionFilter;
  loading: boolean;
  error: string | null;
}

