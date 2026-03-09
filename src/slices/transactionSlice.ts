import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TransactionState,
  Transaction,
  TransactionFilter,
} from "@/src/types";
import { initialTransactionState } from "@/src/state/initialState";

const transactionSlice = createSlice({
  name: "transactions",
  initialState: initialTransactionState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.transactions = action.payload;
    },
    addTransaction(state, action: PayloadAction<Transaction>) {
      state.transactions.unshift(action.payload);
    },
    updateFilter(state, action: PayloadAction<Partial<TransactionFilter>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    resetFilter(state) {
      state.filter = initialTransactionState.filter;
    },
  },
});

export const {
  setLoading,
  setError,
  setTransactions,
  addTransaction,
  updateFilter,
  resetFilter,
} = transactionSlice.actions;

export default transactionSlice.reducer;
