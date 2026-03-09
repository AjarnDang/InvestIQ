import {
  LayoutDashboard,
  PieChart,
  BarChart2,
  ArrowLeftRight,
  Star,
  Settings,
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
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/portfolio",    label: "Portfolio",    icon: PieChart        },
  { href: "/market",       label: "Market",       icon: BarChart2       },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight  },
  { href: "/watchlist",    label: "Watchlist",    icon: Star            },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio",    label: "Portfolio", icon: PieChart        },
  { href: "/market",       label: "Market",    icon: BarChart2       },
  { href: "/transactions", label: "Txns",      icon: ArrowLeftRight  },
  { href: "/watchlist",    label: "Watchlist", icon: Star            },
];

export const SETTINGS_NAV_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export const PAGE_TITLE_MAP: Record<string, string> = {
  "/dashboard":    "Dashboard",
  "/portfolio":    "Portfolio",
  "/market":       "Market",
  "/transactions": "Transactions",
  "/watchlist":    "Watchlist",
  "/settings":     "Settings",
};
