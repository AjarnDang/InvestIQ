import { configureStore } from "@reduxjs/toolkit";
import portfolioReducer from "@/src/slices/portfolioSlice";
import marketReducer from "@/src/slices/marketSlice";
import transactionReducer from "@/src/slices/transactionSlice";
import watchlistReducer from "@/src/slices/watchlistSlice";
import uiReducer from "@/src/slices/uiSlice";
import authReducer from "@/src/slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
    market: marketReducer,
    transactions: transactionReducer,
    watchlist: watchlistReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
