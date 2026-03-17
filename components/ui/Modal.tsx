"use client";

import React, { useEffect } from "react";
import { cn } from "@/src/utils/helpers";
import { X, CheckCircle2, AlertTriangle } from "lucide-react";

type ModalVariant = "success" | "error" | "info";

export function Modal({
  open,
  title,
  description,
  variant = "info",
  primaryLabel = "OK",
  secondaryLabel,
  onPrimary,
  onSecondary,
  onClose,
  disableClose,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  variant?: ModalVariant;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose: () => void;
  disableClose?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !disableClose) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, disableClose]);

  if (!open) return null;

  const icon =
    variant === "success" ? (
      <CheckCircle2 size={18} className="text-emerald-600" />
    ) : variant === "error" ? (
      <AlertTriangle size={18} className="text-red-600" />
    ) : (
      <AlertTriangle size={18} className="text-slate-500" />
    );

  const ring =
    variant === "success"
      ? "ring-emerald-100"
      : variant === "error"
        ? "ring-red-100"
        : "ring-slate-100";

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Close modal overlay"
        onClick={() => {
          if (!disableClose) onClose();
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl ring-8",
            ring,
          )}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{icon}</div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{title}</p>
                {description && (
                  <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {description}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (!disableClose) onClose();
              }}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors",
                disableClose && "opacity-50 cursor-not-allowed",
              )}
              aria-label="Close modal"
              disabled={disableClose}
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 pb-5 pt-4">
            {secondaryLabel && (
              <button
                onClick={onSecondary ?? onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {secondaryLabel}
              </button>
            )}
            <button
              onClick={onPrimary ?? onClose}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors",
                variant === "error"
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-indigo-600 hover:bg-indigo-500",
              )}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

