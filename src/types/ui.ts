// ─── Notification & UI ───────────────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface UIState {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  activeModal: string | null;
  theme: "light" | "dark";
  notifications: Notification[];
}

