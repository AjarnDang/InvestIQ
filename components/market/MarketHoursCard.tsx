import React from "react";
import { useTranslations } from "@/src/i18n/useTranslations";

export function MarketHoursCard() {
  const { locale } = useTranslations();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">
        {locale === "th" ? "เวลาเปิด–ปิดตลาด (ET)" : "Market Hours (ET)"}
      </h3>
      <p className="text-xs text-slate-500 mb-3">
        {locale === "th" ? "ตลาดหลักทรัพย์นิวยอร์ก" : "New York Stock Exchange"}
      </p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">
            {locale === "th" ? "ช่วงก่อนเปิดตลาด" : "Pre-Market"}
          </span>
          <span className="text-slate-700 font-medium">04:00 – 09:30</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">
            {locale === "th" ? "ช่วงปกติ" : "Regular"}
          </span>
          <span className="text-emerald-600 font-bold">09:30 – 16:00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">
            {locale === "th" ? "ช่วงหลังปิดตลาด" : "After Hours"}
          </span>
          <span className="text-slate-700 font-medium">16:00 – 20:00</span>
        </div>
        <p className="text-[10px] text-slate-400 pt-1">
          {locale === "th"
            ? "UTC+7: เร็วกว่าตลาดนิวยอร์ก 11 ชั่วโมง (ฤดูหนาว)"
            : "UTC+7: +11 hours ahead of New York (winter)"}
        </p>
      </div>
    </div>
  );
}

