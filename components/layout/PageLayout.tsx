import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      {/* pt-14 offsets the fixed 56px (h-14) navbar */}
      <main className="flex-1 pt-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
