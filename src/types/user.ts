// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  accountNumber: string;
  joinDate: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  joinDate: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initializing: boolean;
  loading: boolean;
  error: string | null;
}

