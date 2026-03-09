import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, AuthUser } from "@/src/types";
import { initialAuthState } from "@/src/state/initialState";
import {
  validateCredentials,
  saveAuthSession,
  clearAuthSession,
} from "@/src/functions/authFunctions";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    const user = validateCredentials(email, password);
    if (!user) {
      return rejectWithValue("Invalid email or password. Please try again.");
    }

    saveAuthSession(user);
    return user;
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    rehydrateAuth(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.initializing = false;
    },
    setInitialized(state) {
      state.initializing = false;
    },
    logout(state) {
      clearAuthSession();
      state.user = null;
      state.isAuthenticated = false;
      state.initializing = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { rehydrateAuth, setInitialized, logout, clearAuthError } =
  authSlice.actions;

export default authSlice.reducer;
