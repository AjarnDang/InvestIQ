"use client";

import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/src/utils/helpers";
import { useTranslations } from "@/src/i18n/useTranslations";
import { LEARN_TOPICS, LEARN_TOPICS_EN } from "@/src/data/landingContent";
import { LEARN_CONTENT } from "@/src/data/learnContent";
import type { LearnContent, LearnItem } from "@/src/types/learn";

function makeId(prefix: string, idx: number) {
  return `${prefix}-${idx + 1}`;
}

function safeExternalHref(href: string) {
  // Allow only https links for external resources.
  if (href.startsWith("https://")) return href;
  return "https://example.com";
}

export default function LearningPage() {
  const { locale } = useTranslations();
  const [activeId, setActiveId] = useState<string>("learn-1");

  const topics = useMemo<LearnItem[]>(() => {
    const base = (locale === "th" ? LEARN_TOPICS : LEARN_TOPICS_EN).slice(0, 5);
    return base.map((t, idx) => ({
      id: makeId("learn", idx),
      icon: t.icon,
      title: t.title,
      desc: t.desc,
      time: t.time,
    }));
  }, [locale]);

  const contentById = useMemo<Record<string, LearnContent>>(() => {
    // 5 items only, aligned with LEARN_TOPICS order.
    // Note: content is intentionally “evergreen” and citation-friendly.
    const c = LEARN_CONTENT;

    const ids = topics.map((t) => t.id);
    const out: Record<string, LearnContent> = {};
    ids.forEach((id, i) => {
      out[id] = c[i] ?? c[0];
    });
    return out;
  }, [topics]);

  useEffect(() => {
    // Keep active menu item in sync with scrolling section.
    const ids = topics.map((t) => t.id);
    if (ids.length === 0) return;

    // If user opens with a hash, respect it.
    const fromHash =
      typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    queueMicrotask(() => {
      if (fromHash && ids.includes(fromHash)) setActiveId(fromHash);
      else setActiveId(ids[0]);
    });

    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.id) setActiveId(top.id);
      },
      {
        // Account for fixed navbar + page padding.
        root: null,
        rootMargin: "-96px 0px -65% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [topics]);

  function scrollToId(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  return (
    <div className="w-full text-slate-900">
      <div className="mb-6">
        <p className="text-[11px] text-slate-500">
          {locale === "th" ? "Learning" : "Learning"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">
          {locale === "th" ? "ศูนย์การเรียนรู้" : "Learning Center"}
        </h1>
        <p className="mt-2 text-sm max-w-2xl text-slate-600">
          {locale === "th"
            ? "รวมบทเรียนสำหรับผู้เริ่มต้น จัดเป็นหมวดหมู่เหมือนหน้าเอกสาร เพื่ออ่านต่อเนื่องและกลับมาทบทวนได้ง่าย"
            : "Beginner-friendly lessons, structured like docs so you can learn step-by-step and revisit anytime."}
        </p>
      </div>

      {/* Docs-like layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left menu (sticky) */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <div className="liquid-glass p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 text-slate-500">
                {locale === "th" ? "หัวข้อ" : "Topics"}
              </p>
              <nav className="mt-2 max-h-[calc(100vh-7rem)] overflow-auto scrollbar-hide pr-1">
                <div className="space-y-1">
                  {topics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => scrollToId(t.id)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-2 interactive-scale",
                        "bg-white/0 hover:bg-black/5",
                        "text-slate-700 hover:text-slate-900",
                        t.id === activeId &&
                          "bg-black/10 text-slate-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="icon-container shrink-0 mt-0.5">
                          <span className="text-sm">{t.icon}</span>
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate text-slate-900">
                            {t.title}
                          </p>
                          <p className="text-[11px] line-clamp-2 text-slate-600">
                            {t.desc}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {locale === "th" ? "เวลาอ่าน" : "Read"}: {t.time}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </aside>

        {/* Right content */}
        <main className="lg:col-span-2 min-w-0">
          <div className="space-y-6">
            {topics.map((t, idx) => (
              <article
                key={t.id}
                className="liquid-glass p-5 sm:p-6"
                aria-labelledby={`${t.id}-title`}
              >
                {/* scroll margin so fixed navbar doesn't cover headings */}
                <div id={t.id} className="scroll-mt-24" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-500">
                      {locale === "th" ? `บทที่ ${idx + 1}` : `Lesson ${idx + 1}`}
                    </p>
                    <h2
                      id={`${t.id}-title`}
                      className="mt-1 text-xl sm:text-2xl font-medium tracking-tight text-slate-900"
                    >
                      <span className="mr-2">{t.icon}</span>
                      {t.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">{t.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-slate-500">
                      {locale === "th" ? "เวลาอ่าน" : "Read time"}
                    </p>
                    <p className="text-sm font-medium tabular-nums text-slate-700">
                      {t.time}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <section className="liquid-glass-strong p-4">
                    <h3 className="text-sm font-medium text-slate-900">
                      {locale === "th" ? "สรุปสั้น" : "Quick summary"}
                    </h3>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 list-disc pl-5">
                      {(contentById[t.id]?.sections?.[0]
                        ? locale === "th"
                          ? contentById[t.id].sections[0].paragraphsTh.slice(0, 3)
                          : contentById[t.id].sections[0].paragraphsEn.slice(0, 3)
                        : []
                      ).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="liquid-glass-strong p-4">
                    <h3 className="text-sm font-medium text-slate-900">
                      {locale === "th" ? "เช็กลิสต์" : "Checklist"}
                    </h3>
                    <div className="mt-2 space-y-2 text-sm text-slate-600">
                      {[
                        ...(locale === "th"
                          ? (contentById[t.id]?.keyTermsTh ?? []).slice(0, 5).map((k) => `รู้จักคำศัพท์: ${k}`)
                          : (contentById[t.id]?.keyTermsEn ?? []).slice(0, 5).map((k) => `Know the term: ${k}`)),
                        ...(locale === "th"
                          ? ["เขียนสรุป 1 ประโยคว่าบทนี้ช่วยตัดสินใจเรื่องอะไร", "ลองนำไปใช้กับสินทรัพย์ 1 ตัว (เขียนก่อน-หลัง)"]
                          : ["Write a 1-sentence takeaway", "Apply to one real asset (before/after notes)"]),
                      ].map((x) => (
                        <label
                          key={x}
                          className="flex items-start gap-2 rounded-lg bg-black/5 px-3 py-2"
                        >
                          <input type="checkbox" className="mt-0.5" />
                          <span className="text-slate-600">{x}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Deep content */}
                <div className="mt-6 space-y-5">
                  <div className="liquid-glass-strong p-4">
                    <h3 className="text-sm font-medium text-slate-900">
                      {locale === "th" ? "คำศัพท์สำคัญ" : "Key terms"}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(locale === "th"
                        ? contentById[t.id]?.keyTermsTh
                        : contentById[t.id]?.keyTermsEn
                      )?.map((k) => (
                        <span
                          key={k}
                          className="text-xs rounded-full bg-black/5 px-3 py-1 text-slate-700"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {(contentById[t.id]?.sections ?? []).map((s) => (
                    <section key={s.titleEn} className="space-y-2">
                      <h3 className="text-base font-medium text-slate-900">
                        {locale === "th" ? s.titleTh : s.titleEn}
                      </h3>
                      <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                        {(locale === "th" ? s.paragraphsTh : s.paragraphsEn).map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                      {((locale === "th" ? s.bulletsTh : s.bulletsEn) ?? []).length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                          {(locale === "th" ? s.bulletsTh : s.bulletsEn)!.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </section>
                  ))}

                  <div className="liquid-glass-strong p-4">
                    <h3 className="text-sm font-medium text-slate-900">
                      {locale === "th" ? "อ้างอิง & ดูเพิ่มเติม" : "References & watch"}
                    </h3>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(contentById[t.id]?.resources ?? []).map((r) => (
                        <a
                          key={r.href}
                          href={safeExternalHref(r.href)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "rounded-xl px-3 py-2 bg-black/5 hover:bg-black/10 interactive-scale",
                            "text-sm text-slate-800",
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0 truncate">{r.label}</span>
                            <span className="text-[10px] text-slate-500 shrink-0">
                              {r.kind === "youtube" ? "YouTube" : "Read"}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {locale === "th"
                        ? "หมายเหตุ: ลิงก์ภายนอกอาจมีการเปลี่ยนแปลงตามเวลา"
                        : "Note: external links may change over time."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-[11px] text-slate-500">
                  {locale === "th"
                    ? "อ้างอิงรูปแบบการจัดหน้าเอกสารจาก Next.js Docs"
                    : "Layout inspired by Next.js Docs."}
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

