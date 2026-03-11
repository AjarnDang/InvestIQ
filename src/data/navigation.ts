import {
  BarChart2,
  ArrowLeftRight,
  Star,
  Newspaper,
  Settings,
  Home,
  BookOpen,
  TrendingUp,
  Briefcase,
  Info,
  PieChart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Fallback label (English) used when no translation is available */
  label: string;
  icon: LucideIcon;
  /** Dot-path into the Messages object, e.g. "nav.home" or "auth.portfolio" */
  translationKey: string;
}

// ── Main navigation — public, same for all users ──────────────────────────
export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/home",     label: "Home",            icon: Home,       translationKey: "nav.home"     },
  { href: "/market",   label: "Market",          icon: BarChart2,  translationKey: "nav.market"   },
  { href: "/news",     label: "News",            icon: Newspaper,  translationKey: "nav.news"     },
  { href: "/learn",    label: "Learn",           icon: BookOpen,   translationKey: "nav.learn"    },
  { href: "/plans",    label: "Investment Plans", icon: TrendingUp, translationKey: "nav.planning" },
  { href: "/services", label: "Services",        icon: Briefcase,  translationKey: "nav.services" },
  { href: "/about",    label: "About Us",        icon: Info,       translationKey: "nav.about"    },
];

// ── Profile nav — authenticated users only (shown in profile dropdown) ────
export const PROFILE_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Portfolio",    icon: PieChart,       translationKey: "auth.portfolio"    },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, translationKey: "auth.transactions" },
  { href: "/watchlist",    label: "Watchlist",    icon: Star,           translationKey: "auth.watchlist"    },
  { href: "/settings",     label: "Settings",     icon: Settings,       translationKey: "auth.settings"     },
];

// ── Legacy aliases (kept for backward compatibility) ─────────────────────────
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/home",      label: "Home",      icon: Home,     translationKey: "nav.home"          },
  { href: "/market",    label: "Market",    icon: BarChart2, translationKey: "nav.market"        },
  { href: "/news",      label: "News",      icon: Newspaper, translationKey: "nav.news"          },
  { href: "/dashboard", label: "Portfolio", icon: PieChart,  translationKey: "auth.portfolio"    },
  { href: "/settings",  label: "Settings",  icon: Settings,  translationKey: "auth.settings"     },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = PROFILE_NAV_ITEMS;

export const PAGE_TITLE_MAP: Record<string, string> = {
  "/home":         "Home",
  "/market":       "Market",
  "/news":         "News",
  "/learn":        "Learn",
  "/plans":        "แผนการลงทุน",
  "/services":     "บริการ",
  "/about":        "เกี่ยวกับเรา",
  "/dashboard":    "Portfolio",
  "/transactions": "Transactions",
  "/watchlist":    "Watchlist",
  "/settings":     "Settings",
};
