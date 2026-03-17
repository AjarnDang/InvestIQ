import type { Metadata } from "next";
import { Poppins, Source_Serif_4, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { MarketProvider } from "@/components/providers/MarketProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-thai",
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
      <body
        className={`${poppins.variable} ${serif.variable} ${notoThai.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <LocaleProvider>
            <MarketProvider>{children}</MarketProvider>
          </LocaleProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
