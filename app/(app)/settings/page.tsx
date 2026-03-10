"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { ProfileTabsBar } from "@/components/layout/ProfileTabsBar";
import { cn } from "@/src/utils/helpers";

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <Icon size={15} className="text-indigo-500" />
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="divide-y divide-slate-50">{children}</div>
    </div>
  );
}

// ── Toggle row ─────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-label={label}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          value ? "bg-indigo-600" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            value ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

// ── Link row ───────────────────────────────────────────────────────────────
function LinkRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 group cursor-pointer hover:bg-slate-50 transition-colors">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-slate-400">{value}</span>}
        <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAppSelector((s) => s.auth);

  const [notifications, setNotifications] = useState({
    priceAlert:    true,
    newsDigest:    true,
    portfolioSummary: false,
    marketOpen:    false,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    sharePortfolio: false,
  });

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currency, setCurrency] = useState<"THB" | "USD">("THB");
  const [language, setLanguage] = useState<"th" | "en">("th");

  return (
    <div className="space-y-4 md:space-y-6">
      <ProfileTabsBar />

      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          จัดการบัญชีและการตั้งค่าของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Left col */}
        <div className="xl:col-span-2 space-y-5">

          {/* Profile */}
          <Section title="ข้อมูลส่วนตัว" icon={User}>
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.name ?? "ชื่อผู้ใช้"}</p>
                <p className="text-xs text-slate-400">{user?.email ?? "email@example.com"}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Check size={9} /> บัญชีได้รับการยืนยัน
                </span>
              </div>
            </div>
            <LinkRow label="แก้ไขชื่อ / โปรไฟล์" />
            <LinkRow label="เปลี่ยนรหัสผ่าน" />
            <LinkRow label="เชื่อมต่อบัญชี Google" value="ยังไม่ได้เชื่อมต่อ" />
          </Section>

          {/* Notifications */}
          <Section title="การแจ้งเตือน" icon={Bell}>
            <ToggleRow
              label="Price Alert"
              description="แจ้งเตือนเมื่อหุ้นถึงราคาที่ตั้งไว้"
              value={notifications.priceAlert}
              onChange={(v) => setNotifications((p) => ({ ...p, priceAlert: v }))}
            />
            <ToggleRow
              label="News Digest"
              description="สรุปข่าวการเงินรายวัน"
              value={notifications.newsDigest}
              onChange={(v) => setNotifications((p) => ({ ...p, newsDigest: v }))}
            />
            <ToggleRow
              label="Portfolio Summary"
              description="รายงานสรุป Portfolio รายสัปดาห์"
              value={notifications.portfolioSummary}
              onChange={(v) => setNotifications((p) => ({ ...p, portfolioSummary: v }))}
            />
            <ToggleRow
              label="Market Open/Close"
              description="แจ้งเตือนตอนตลาดเปิด-ปิด"
              value={notifications.marketOpen}
              onChange={(v) => setNotifications((p) => ({ ...p, marketOpen: v }))}
            />
          </Section>

          {/* Privacy */}
          <Section title="ความเป็นส่วนตัว" icon={Shield}>
            <ToggleRow
              label="สาธารณะโปรไฟล์"
              description="อนุญาตให้ผู้อื่นมองเห็นโปรไฟล์ของคุณ"
              value={privacy.publicProfile}
              onChange={(v) => setPrivacy((p) => ({ ...p, publicProfile: v }))}
            />
            <ToggleRow
              label="แชร์ Portfolio"
              description="แสดง Portfolio สาธารณะ"
              value={privacy.sharePortfolio}
              onChange={(v) => setPrivacy((p) => ({ ...p, sharePortfolio: v }))}
            />
            <LinkRow label="ดาวน์โหลดข้อมูลของฉัน" />
            <LinkRow label="ลบบัญชี" />
          </Section>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Appearance */}
          <Section title="รูปลักษณ์" icon={Palette}>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ธีม
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["light", "dark"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      theme === t
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {t === "light" ? <Sun size={14} /> : <Moon size={14} />}
                    {t === "light" ? "สว่าง" : "มืด"}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Display */}
          <Section title="การแสดงผล" icon={Globe}>
            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  สกุลเงิน
                </p>
                <div className="flex gap-2">
                  {(["THB", "USD"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                        currency === c
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {c === "THB" ? "🇹🇭 THB" : "🇺🇸 USD"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  ภาษา
                </p>
                <div className="flex gap-2">
                  {(["th", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                        language === l
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {l === "th" ? "🇹🇭 ไทย" : "🇺🇸 English"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* App info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-xs text-slate-400">InvestIQ v1.0.0</p>
            <p className="text-[10px] text-slate-300 mt-0.5">
              Data powered by Yahoo Finance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
