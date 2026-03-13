import type { LucideIcon } from "lucide-react";

/** Navigation item used in main nav, profile nav, bottom nav, etc. */
export interface NavItem {
  href: string;
  /** Fallback label (English) used when no translation is available */
  label: string;
  icon: LucideIcon;
  /** Dot-path into the Messages object, e.g. "nav.home" or "auth.portfolio" */
  translationKey: string;
}

