import type { AuthUser } from "@/src/types";
import { DEMO_ACCOUNTS } from "@/src/data/accounts";

const STORAGE_KEY = "investiq_auth";

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateCredentials(
  email: string,
  password: string
): AuthUser | null {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email.toLowerCase().trim() && a.password === password
  );
  return account?.user ?? null;
}

// ─── Session Storage ──────────────────────────────────────────────────────────

export function saveAuthSession(user: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export function getAuthSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
