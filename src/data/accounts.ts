import type { AuthUser } from "@/src/types";

export interface DemoAccount {
  email: string;
  password: string;
  user: AuthUser;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "demo@investiq.com",
    password: "demo1234",
    user: {
      id: "user_001",
      name: "Alex Chen",
      email: "demo@investiq.com",
      accountNumber: "IQ-2026-001",
      joinDate: "2024-01-15",
    },
  },
  {
    email: "admin@investiq.com",
    password: "admin1234",
    user: {
      id: "user_002",
      name: "Sarah Kim",
      email: "admin@investiq.com",
      accountNumber: "IQ-2026-002",
      joinDate: "2023-06-20",
    },
  },
];

/** Convenience: first demo account credentials shown in login UI */
export const DEFAULT_DEMO_CREDENTIAL = {
  email: DEMO_ACCOUNTS[0].email,
  password: DEMO_ACCOUNTS[0].password,
};
