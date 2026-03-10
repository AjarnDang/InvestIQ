"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, ArrowRight, CheckCircle, ChevronRight, ArrowUpRight, ArrowDownRight, Star } from "lucide-react";
import { getAuthSession } from "@/src/functions/authFunctions";
import {
  TICKER_STOCKS,
  FEATURES,
  PLATFORM_STATS,
  HOW_IT_WORKS,
  HERO_PREVIEW_STATS,
  HERO_CHART_BARS,
  HERO_PREVIEW_HOLDINGS,
} from "@/src/data/landingContent";

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (getAuthSession()) {
      router.replace("/dashboard");
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [router]);

  const doubled = [...TICKER_STOCKS, ...TICKER_STOCKS];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">InvestIQ</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Pricing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors"
            >
              Get Started
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950" />
        <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center pt-20">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
            <Star size={12} className="fill-indigo-400 text-indigo-400" />
            Thailand&apos;s #1 Investment Platform
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up animate-fade-up-delay-1 text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
            Invest Smarter,
            <br />
            <span className="animate-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Not Harder.
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-up animate-fade-up-delay-2 mx-auto max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
            InvestIQ gives you real-time SET market data, intelligent portfolio analytics,
            and automated price alerts — everything you need to grow your wealth with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3.5 text-base font-semibold text-white transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
            >
              Start Investing Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition-all"
            >
              Explore Features
            </a>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            {["No credit card required", "Free forever plan", "SEC compliant"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-emerald-500" />
                {t}
              </span>
            ))}
          </div>

          {/* Dashboard Preview */}
          <div className="animate-float my-16 mx-auto max-w-3xl rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm shadow-2xl shadow-indigo-900/20 overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-900">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <div className="ml-3 flex-1 rounded-md bg-slate-800 h-5 max-w-48 mx-auto" />
            </div>
            {/* Fake dashboard content */}
            <div className="p-4 md:p-6 space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {HERO_PREVIEW_STATS.map((s) => (
                  <div key={s.label} className="rounded-lg bg-slate-800/60 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div className="rounded-lg bg-slate-800/60 p-4 h-28 flex items-end gap-1">
                {HERO_CHART_BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600/80 to-indigo-400/30"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              {/* Holdings row */}
              <div className="grid grid-cols-3 gap-2">
                {HERO_PREVIEW_HOLDINGS.map((h) => (
                  <div key={h.symbol} className="rounded-lg bg-slate-800/60 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{h.symbol}</span>
                    <span className="text-[10px] text-emerald-400">{h.return}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Ticker ──────────────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-slate-900/50 py-3 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {doubled.map((stock, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-2 px-6 border-r border-white/5 last:border-0"
            >
              <span className="text-xs font-semibold text-white">{stock.symbol}</span>
              <span className="text-xs text-slate-300">฿{stock.price.toFixed(2)}</span>
              <span
                className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                  stock.up ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stock.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(stock.change).toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Everything you need to invest{" "}
              <span className="text-indigo-400">confidently</span>
            </h2>
            <p className="mx-auto max-w-xl text-slate-400 text-lg">
              Professional-grade tools designed for Thai retail investors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, iconColor, iconBg }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/5 bg-slate-900/60 p-6 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all duration-300"
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} mb-4`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 border-y border-white/5">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {PLATFORM_STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
              <p className="text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">How it Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Up and running in{" "}
              <span className="text-indigo-400">3 minutes</span>
            </h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-indigo-600/0 via-indigo-600/50 to-indigo-600/0 -z-10" />
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-2xl font-black text-indigo-400 mb-5">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-slate-900 p-12 md:p-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Ready to invest smarter?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of investors already growing their wealth with InvestIQ.
              Start free, upgrade anytime.
            </p>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-10 py-4 text-base font-bold text-white transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              Use demo@investiq.com / demo1234 to explore
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <TrendingUp size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold">InvestIQ</span>
          </div>
          <p className="text-xs text-slate-500 text-center">
            © 2026 InvestIQ. Built for educational &amp; demonstration purposes. Not financial advice.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            {["Privacy", "Terms", "Contact"].map((link) => (
              <a key={link} href="#" className="hover:text-slate-300 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
