import {
  LayoutDashboard,
  BarChart2,
  ArrowLeftRight,
  Star,
  Newspaper,
  Settings,
  Home,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { href: "/home",         label: "Home",         icon: Home          },
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/market",       label: "Market",       icon: BarChart2       },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight  },
  { href: "/watchlist",    label: "Watchlist",    icon: Star            },
  { href: "/news",         label: "News",         icon: Newspaper       },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/home",         label: "Home",      icon: Home          },
  { href: "/dashboard",    label: "Dashboard", icon: LayoutDashboard },
  { href: "/market",       label: "Market",    icon: BarChart2       },
  { href: "/transactions", label: "Txns",      icon: ArrowLeftRight  },
  { href: "/watchlist",    label: "Watchlist", icon: Star            },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export const PAGE_TITLE_MAP: Record<string, string> = {
  "/home":         "Home",
  "/dashboard":    "Dashboard",
  "/market":       "Market",
  "/transactions": "Transactions",
  "/watchlist":    "Watchlist",
  "/news":         "News",
  "/settings":     "Settings",
};
