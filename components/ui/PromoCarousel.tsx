"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/utils/helpers";

interface PromoItem {
  id: string;
  gradient: string;
  badge: string;
  emoji: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
}

const PROMO_ITEMS: PromoItem[] = [
  {
    id: "1",
    gradient: "from-indigo-600 via-indigo-500 to-violet-600",
    badge: "InvestIQ Pro",
    emoji: "✨",
    title: "Upgrade ฟรี 30 วัน",
    subtitle: "รับการวิเคราะห์พอร์ตด้วย AI และ Smart Alerts แบบ Real-time ไม่มีข้อผูกมัด",
    cta: "ลองเลย",
    ctaHref: "#",
  },
  {
    id: "2",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge: "0% Commission",
    emoji: "💸",
    title: "ซื้อขายหุ้น US ไม่มีค่าธรรมเนียม",
    subtitle: "เปิดบัญชีวันนี้ รับเงินคืน $10 ทันที · ไม่มีขั้นต่ำในการเปิดบัญชี",
    cta: "เปิดบัญชี",
    ctaHref: "#",
  },
  {
    id: "3",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    badge: "Webinar ฟรี",
    emoji: "📈",
    title: "เรียนรู้กลยุทธ์หุ้น Growth",
    subtitle: "Masterclass โดยนักวิเคราะห์มืออาชีพ · วันเสาร์ที่ 15 มีนาคม 2026",
    cta: "ลงทะเบียน",
    ctaHref: "#",
  },
  {
    id: "4",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    badge: "Smart Alert",
    emoji: "🔔",
    title: "ตั้ง Price Alert อัจฉริยะ",
    subtitle: "รับการแจ้งเตือนทันทีเมื่อหุ้นถึงราคาเป้าหมาย · รองรับทุกอุปกรณ์",
    cta: "ตั้งค่าเลย",
    ctaHref: "#",
  },
];

const AUTO_ADVANCE_MS = 5_000;

export function PromoCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total    = PROMO_ITEMS.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTO_ADVANCE_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, next]);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Desktop / Laptop: Controlled carousel ─────────────────────── */}
      <div className="relative hidden md:block overflow-hidden rounded-2xl shadow-sm">
        {/* Slide track */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {PROMO_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                "w-full shrink-0 bg-linear-to-r px-8 py-7 flex items-center justify-between gap-6",
                item.gradient
              )}
            >
              <div className="flex-1 min-w-0">
                <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white mb-2.5">
                  {item.badge}
                </span>
                <h3 className="text-xl font-extrabold text-white mb-1 leading-tight">
                  {item.emoji} {item.title}
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">{item.subtitle}</p>
              </div>
              <Link
                href={item.ctaHref}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-sm font-bold text-slate-800 hover:bg-white/90 transition-colors shadow-lg whitespace-nowrap"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
          <ChevronRight size={16} />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
          <div
            key={current}
            className="h-full bg-white/70 animate-progress-bar"
            style={{ animationDuration: `${AUTO_ADVANCE_MS}ms`, animationPlayState: paused ? "paused" : "running" }}
          />
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {PROMO_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setPaused(true); }}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 bg-white",
                i === current ? "w-5 opacity-100" : "w-1.5 opacity-40"
              )}
            />
          ))}
        </div>
      </div>

      {/* ── Tablet / Mobile: Horizontal snap scroll ───────────────────── */}
      <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4">
        <div className="flex gap-3 px-4 pb-2 snap-x snap-mandatory">
          {PROMO_ITEMS.map((item) => (
            <div
              key={item.id}
              className={cn(
                "w-[calc(100vw-2.5rem)] shrink-0 rounded-2xl px-5 py-5 bg-linear-to-r snap-start shadow-sm",
                item.gradient
              )}
            >
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white mb-2">
                {item.badge}
              </span>
              <h3 className="text-base font-extrabold text-white mb-1 leading-tight">
                {item.emoji} {item.title}
              </h3>
              <p className="text-xs text-white/80 leading-relaxed line-clamp-2">{item.subtitle}</p>
              <Link
                href={item.ctaHref}
                className="mt-3 inline-block px-4 py-1.5 rounded-lg bg-white text-xs font-bold text-slate-800 hover:bg-white/90 transition-colors"
              >
                {item.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
