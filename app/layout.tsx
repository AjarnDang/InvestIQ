import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { MarketProvider } from "@/components/providers/MarketProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "InvestIQ — Smart Investment Platform",
  description:
    "Your intelligent partner for stock portfolio management, market analysis, and investment tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ReduxProvider>
          <LocaleProvider>
            <MarketProvider>{children}</MarketProvider>
          </LocaleProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
