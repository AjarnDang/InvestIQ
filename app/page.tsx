"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/src/functions/authFunctions";
import { TrendingUp } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (session) {
      router.replace("/portfolio");
    } else {
      router.replace("/home");
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600">
          <TrendingUp size={24} className="text-white" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
