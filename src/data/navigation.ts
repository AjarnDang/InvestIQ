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
  label: string;
  icon: LucideIcon;
}

// ── Main navigation — public, same for all users ──────────────────────────
export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/home",     label: "Home",       icon: Home       },
  { href: "/market",   label: "Market",     icon: BarChart2  },
  { href: "/news",     label: "News",       icon: Newspaper  },
  { href: "/learn",    label: "Learn",      icon: BookOpen   },
  { href: "/plans",    label: "แผนการลงทุน", icon: TrendingUp },
  { href: "/services", label: "บริการ",     icon: Briefcase  },
  { href: "/about",    label: "เกี่ยวกับเรา", icon: Info     },
];

// ── Profile nav — authenticated users only (shown in profile dropdown) ────
export const PROFILE_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Portfolio",    icon: PieChart      },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/watchlist",    label: "Watchlist",    icon: Star           },
  { href: "/settings",     label: "Settings",     icon: Settings       },
];

// ── Legacy aliases (kept for backward compatibility) ─────────────────────────
export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/home",         label: "Home",         icon: Home          },
  { href: "/market",       label: "Market",       icon: BarChart2     },
  { href: "/news",         label: "News",         icon: Newspaper     },
  { href: "/dashboard",    label: "Portfolio",    icon: PieChart      },
  { href: "/settings",     label: "Settings",     icon: Settings      },
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
