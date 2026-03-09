"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { loginThunk, clearAuthError } from "@/src/slices/authSlice";
import { getAuthSession } from "@/src/functions/authFunctions";
import {
  LOGIN_FEATURE_LIST,
  LOGIN_PREVIEW_STATS,
  LOGIN_CHART_BARS,
} from "@/src/data/landingContent";
import { DEFAULT_DEMO_CREDENTIAL } from "@/src/data/accounts";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (getAuthSession()) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Clear auth error when inputs change
  useEffect(() => {
    if (error) dispatch(clearAuthError());
  }, [email, password]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email format";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    dispatch(loginThunk({ email, password }));
  };

  const fillDemo = () => {
    setEmail(DEFAULT_DEMO_CREDENTIAL.email);
    setPassword(DEFAULT_DEMO_CREDENTIAL.password);
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ─── Left Panel (branding) ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <Link href="/home" className="relative flex items-center gap-3 group w-fit">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">InvestIQ</span>
        </Link>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Your portfolio,
              <br />
              <span className="text-indigo-400">always in view.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Track your investments, monitor the SET market, and get intelligent alerts — all in one beautiful platform.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {LOGIN_FEATURE_LIST.map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          {/* Dashboard preview card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-5 max-w-sm">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Portfolio Summary</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {LOGIN_PREVIEW_STATS.map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-3">
                  <p className="text-[10px] text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            {/* Mini chart */}
            <div className="flex items-end gap-0.5 h-12">
              {LOGIN_CHART_BARS.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600/90 to-indigo-400/20"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <p className="relative text-xs text-slate-600">
          © 2026 InvestIQ · For educational and demonstration purposes only
        </p>
      </div>

      {/* ─── Right Panel (form) ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="text-base font-bold text-white">InvestIQ</span>
          </Link>
          <Link
            href="/home"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={15} />
            Back
          </Link>
        </div>

        {/* Back link — desktop */}
        <div className="hidden lg:flex p-8 pb-0">
          <Link
            href="/home"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={15} />
            Back to home
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                Welcome back
              </h1>
              <p className="text-slate-400 text-sm">
                Sign in to your InvestIQ account
              </p>
            </div>

            {/* Demo credentials hint */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/15 p-3.5 mb-6 text-left transition-colors group"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600/30">
                <TrendingUp size={14} className="text-indigo-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-indigo-300 mb-0.5">Try Demo Account</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {DEFAULT_DEMO_CREDENTIAL.email} · {DEFAULT_DEMO_CREDENTIAL.password}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="text-indigo-500 ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform"
              />
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Global error */}
              {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-slate-900 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      fieldErrors.email
                        ? "border-red-500/50 focus:ring-red-500"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-slate-900 pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      fieldErrors.password
                        ? "border-red-500/50 focus:ring-red-500"
                        : "border-white/10 hover:border-white/20"
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setRemember((v) => !v)}
                    className={`flex h-4 w-4 items-center justify-center rounded border transition-colors cursor-pointer ${
                      remember
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-slate-600 group-hover:border-slate-400"
                    }`}
                  >
                    {remember && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 12 12"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed px-6 py-3.5 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 mt-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-slate-600">
              For demo access, use the credentials above.{" "}
              <br className="sm:hidden" />
              <Link href="/home" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Learn more about InvestIQ →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
