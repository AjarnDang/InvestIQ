import React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",         href: "/home"     },
  { label: "Market",       href: "/market"   },
  { label: "News",         href: "/news"     },
  { label: "Learn",        href: "/learn"    },
  { label: "แผนการลงทุน", href: "/plans"    },
  { label: "เกี่ยวกับเรา", href: "/about"  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Use",   href: "#" },
  { label: "Contact Us",     href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white mt-8">
      {/* ── Main footer content ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {/* Brand */}
          <div className="space-y-3">
            <Link href="/home" className="flex items-center gap-2 group w-fit">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
                <TrendingUp size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">InvestIQ</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px]">
              แพลตฟอร์มติดตามการลงทุน Real-time สำหรับตลาดหุ้นไทยและสหรัฐอเมริกา
            </p>
            <p className="text-[11px] text-slate-400">
              ข้อมูลตลาดจาก Yahoo Finance
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Navigation</p>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Legal</p>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              ข้อมูลบนเว็บไซต์นี้มีไว้เพื่อข้อมูลเท่านั้น ไม่ถือเป็นคำแนะนำการลงทุน
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div className="border-t border-slate-100 bg-slate-50 px-4 md:px-6 py-3">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">
            © {year} InvestIQ. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            Data powered by Yahoo Finance &amp; RSS Feeds
          </div>
        </div>
      </div>
    </footer>
  );
}
