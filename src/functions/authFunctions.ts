import type { AuthUser } from "@/src/types";
import { DEMO_ACCOUNTS } from "@/src/data/accounts";

const STORAGE_KEY = "investiq_auth";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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
    const payload = {
      user,
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export function getAuthSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;

    // New format: { user, createdAt }
    if (
      parsed &&
      typeof parsed === "object" &&
      "user" in parsed &&
      "createdAt" in parsed
    ) {
      const createdAt = (parsed as { createdAt: unknown }).createdAt;
      const user = (parsed as { user: unknown }).user as AuthUser;
      const createdAtMs =
        typeof createdAt === "number" ? createdAt : Number(createdAt);

      if (!createdAtMs || Number.isNaN(createdAtMs)) {
        // Corrupted session — clear it
        clearAuthSession();
        return null;
      }

      if (Date.now() - createdAtMs > SESSION_TTL_MS) {
        clearAuthSession();
        return null;
      }

      return user;
    }

    // Backward compatibility: older sessions stored raw AuthUser
    // Treat as a fresh session starting now.
    const legacyUser = parsed as AuthUser;
    if (legacyUser?.email && legacyUser?.id) {
      saveAuthSession(legacyUser);
      return legacyUser;
    }

    return null;
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

export function getSessionRemainingMs(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "createdAt" in parsed
    ) {
      const createdAt = (parsed as { createdAt: unknown }).createdAt;
      const createdAtMs =
        typeof createdAt === "number" ? createdAt : Number(createdAt);
      if (!createdAtMs || Number.isNaN(createdAtMs)) return null;
      return Math.max(0, SESSION_TTL_MS - (Date.now() - createdAtMs));
    }
    return null;
  } catch {
    return null;
  }
}
