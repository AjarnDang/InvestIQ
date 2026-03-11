import {
  Bell,
  Shield,
  BarChart2,
  Zap,
  PieChart,
  LineChart,
  type LucideIcon,
} from "lucide-react";
import type { LearnTopic, Article, PromoItem } from "@/src/types";

// ─── Hero Preview ────────────────────────────────────────────────────────────

export interface PreviewStat {
  label: string;
  value: string;
  color: string;
}

export const HERO_PREVIEW_STATS: PreviewStat[] = [
  { label: "Portfolio Value", value: "฿646,550", color: "text-white"        },
  { label: "Total Return",    value: "฿55,300",  color: "text-emerald-400"  },
  { label: "Daily P&L",       value: "฿3,825",   color: "text-emerald-400"  },
  { label: "Cash Balance",    value: "฿45,320",  color: "text-white"        },
];

/** Bar heights (%) for the decorative chart in the hero preview */
export const HERO_CHART_BARS: number[] = [40, 55, 45, 60, 52, 68, 58, 72, 64, 78, 70, 85, 76, 90, 82];

export interface PreviewHolding {
  symbol: string;
  return: string;
}

export const HERO_PREVIEW_HOLDINGS: PreviewHolding[] = [
  { symbol: "PTT",   return: "+13.1%" },
  { symbol: "KBANK", return: "+10.5%" },
  { symbol: "AOT",   return: "+4.98%" },
];

// ─── Ticker ───────────────────────────────────────────────────────────────────

export interface TickerStock {
  symbol: string;
  price: number;
  change: number;
  up: boolean;
}

export const TICKER_STOCKS: TickerStock[] = [
  { symbol: "PTT",       price: 36.75,   change: 1.38,  up: true  },
  { symbol: "KBANK",     price: 152.5,   change: -1.3,  up: false },
  { symbol: "AOT",       price: 68.5,    change: 1.86,  up: true  },
  { symbol: "CPALL",     price: 60.25,   change: 1.26,  up: true  },
  { symbol: "SCB",       price: 98.5,    change: -1.5,  up: false },
  { symbol: "SCC",       price: 285.0,   change: 1.06,  up: true  },
  { symbol: "ADVANC",    price: 224.0,   change: -0.22, up: false },
  { symbol: "DELTA",     price: 78.5,    change: 3.29,  up: true  },
  { symbol: "BBL",       price: 148.0,   change: 0.68,  up: true  },
  { symbol: "TRUE",      price: 8.7,     change: 1.75,  up: true  },
  { symbol: "SET Index", price: 1452.35, change: 0.61,  up: true  },
];

// ─── Features Section ─────────────────────────────────────────────────────────

export interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
}

export const FEATURES: FeatureCard[] = [
  {
    icon: PieChart,
    title: "Smart Portfolio Tracking",
    description:
      "Monitor all your investments in one unified dashboard. Track real-time P&L, sector allocation, and performance at a glance.",
    iconColor: "text-indigo-400",
    iconBg:    "bg-indigo-500/10",
  },
  {
    icon: LineChart,
    title: "Real-time Market Data",
    description:
      "Stay ahead with live SET market data, indices, stock screener, and advanced filtering tools to find your next opportunity.",
    iconColor: "text-emerald-400",
    iconBg:    "bg-emerald-500/10",
  },
  {
    icon: Bell,
    title: "Intelligent Price Alerts",
    description:
      "Set custom price targets and receive instant notifications when stocks hit your defined levels. Never miss a move again.",
    iconColor: "text-amber-400",
    iconBg:    "bg-amber-500/10",
  },
  {
    icon: BarChart2,
    title: "Transaction Analytics",
    description:
      "Keep a complete history of all your trades, dividends, and transfers. Filter, search, and analyze your investment activity.",
    iconColor: "text-blue-400",
    iconBg:    "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Portfolio Risk Analysis",
    description:
      "Understand your risk exposure by sector and individual stock. Diversify intelligently with allocation insights.",
    iconColor: "text-purple-400",
    iconBg:    "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Instant Performance Reports",
    description:
      "Beautiful performance charts showing your portfolio growth over time. Export and share your investment journey.",
    iconColor: "text-pink-400",
    iconBg:    "bg-pink-500/10",
  },
];

// ─── Platform Stats ───────────────────────────────────────────────────────────

export interface PlatformStat {
  value: string;
  label: string;
}

export const PLATFORM_STATS: PlatformStat[] = [
  { value: "฿2.5B+",   label: "Assets Tracked"    },
  { value: "10,000+",  label: "Active Investors"   },
  { value: "500+",     label: "Stocks Listed"      },
  { value: "99.9%",    label: "Platform Uptime"    },
];

// ─── How it Works ─────────────────────────────────────────────────────────────

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up in seconds with our streamlined onboarding process.",
  },
  {
    step: "02",
    title: "Add Your Portfolio",
    description: "Import your holdings or manually enter your investment positions.",
  },
  {
    step: "03",
    title: "Track & Grow",
    description: "Monitor performance, get insights, and make smarter decisions.",
  },
];

// ─── Login Page ───────────────────────────────────────────────────────────────

export const LOGIN_FEATURE_LIST_EN: string[] = [
  "Real-time SET market data & indices",
  "Portfolio P&L tracking & analytics",
  "Smart price alerts & notifications",
  "Full transaction history & reporting",
];

export const LOGIN_FEATURE_LIST_TH: string[] = [
  "ข้อมูลตลาดและดัชนี SET แบบเรียลไทม์",
  "ติดตามกำไรขาดทุนและวิเคราะห์พอร์ต",
  "ตั้งค่า Price Alert และรับการแจ้งเตือนอัตโนมัติ",
  "เก็บประวัติการซื้อขายและธุรกรรมครบถ้วน",
];

// Legacy alias for compatibility (defaults to EN)
export const LOGIN_FEATURE_LIST: string[] = LOGIN_FEATURE_LIST_EN;

export const LOGIN_PREVIEW_STATS_EN: PreviewStat[] = [
  { label: "Total Value", value: "฿646,550", color: "text-white"       },
  { label: "Return",      value: "+฿55,300", color: "text-emerald-400" },
  { label: "Daily P&L",   value: "+฿3,825",  color: "text-emerald-400" },
  { label: "Cash",        value: "฿45,320",  color: "text-white"       },
];

export const LOGIN_PREVIEW_STATS_TH: PreviewStat[] = [
  { label: "มูลค่ารวม",       value: "฿646,550", color: "text-white"       },
  { label: "ผลตอบแทนรวม",     value: "+฿55,300", color: "text-emerald-400" },
  { label: "กำไรขาดทุนวันนี้", value: "+฿3,825",  color: "text-emerald-400" },
  { label: "เงินสด",          value: "฿45,320",  color: "text-white"       },
];

// Legacy alias (defaults to EN)
export const LOGIN_PREVIEW_STATS: PreviewStat[] = LOGIN_PREVIEW_STATS_EN;

/** Bar heights (%) for the decorative mini-chart in the login panel */
export const LOGIN_CHART_BARS: number[] = [30, 45, 38, 55, 48, 62, 58, 70, 65, 78, 72, 85];

// ─── Home page — Learn section ────────────────────────────────────────────────
export const LEARN_TOPICS: LearnTopic[] = [
  {
    icon:  "📖",
    title: "หุ้นคืออะไร?",
    desc:  "เรียนรู้พื้นฐานการลงทุนในตลาดหุ้น ตั้งแต่การซื้อขายไปจนถึงการเลือกหุ้นที่ดี",
    time:  "5 นาที",
  },
  {
    icon:  "📊",
    title: "อ่านงบการเงินอย่างง่าย",
    desc:  "เข้าใจงบกำไรขาดทุน งบดุล และกระแสเงินสด ในแบบที่ทุกคนเข้าใจได้",
    time:  "10 นาที",
  },
  {
    icon:  "🔍",
    title: "Technical Analysis",
    desc:  "เรียนรู้การวิเคราะห์กราฟ แนวรับ-แนวต้าน และ Indicators ยอดนิยม",
    time:  "15 นาที",
  },
  {
    icon:  "🏦",
    title: "กองทุนรวมคืออะไร?",
    desc:  "เปรียบเทียบประเภทกองทุน LTF, RMF, SSF พร้อมแนวทางการเลือกลงทุน",
    time:  "7 นาที",
  },
  {
    icon:  "⚖️",
    title: "บริหารความเสี่ยง",
    desc:  "Portfolio Diversification, Stop Loss และ Position Sizing เพื่อจำกัดความเสียหาย",
    time:  "8 นาที",
  },
  {
    icon:  "🌍",
    title: "ลงทุนต่างประเทศ",
    desc:  "วิธีเข้าถึงหุ้นสหรัฐ ETF Global และ DR ผ่านโบรกเกอร์ไทยอย่างง่ายดาย",
    time:  "12 นาที",
  },
];

// English version for i18n-aware views
export const LEARN_TOPICS_EN: LearnTopic[] = [
  {
    icon:  "📖",
    title: "What are stocks?",
    desc:  "Learn the basics of investing in the stock market, from trading to picking quality companies.",
    time:  "5 min",
  },
  {
    icon:  "📊",
    title: "Reading financial statements",
    desc:  "Understand income statements, balance sheets, and cash flow in a simple, practical way.",
    time:  "10 min",
  },
  {
    icon:  "🔍",
    title: "Technical Analysis",
    desc:  "Learn chart patterns, support–resistance, and popular indicators used by traders.",
    time:  "15 min",
  },
  {
    icon:  "🏦",
    title: "What are mutual funds?",
    desc:  "Compare SSF, RMF and other fund types, and how to choose funds that fit your goals.",
    time:  "7 min",
  },
  {
    icon:  "⚖️",
    title: "Risk management",
    desc:  "Portfolio diversification, stop loss, and position sizing to control downside risk.",
    time:  "8 min",
  },
  {
    icon:  "🌍",
    title: "Investing abroad",
    desc:  "Access US stocks, global ETFs, and DRs easily through Thai brokers.",
    time:  "12 min",
  },
];

// ─── Home page — Latest Articles section ─────────────────────────────────────
export const MOCK_ARTICLES: Article[] = [
  {
    id:       "a1",
    tag:      "วิเคราะห์หุ้น",
    tagColor: "bg-indigo-100 text-indigo-700",
    title:    "10 หุ้น SET ที่น่าจับตาในไตรมาส 2 ปี 2026",
    excerpt:  "สรุปหุ้นที่มีปัจจัยพื้นฐานแข็งแกร่ง กำไรเติบโต และ Valuation น่าสนใจ",
    readTime: "8 นาที",
    date:     "9 มี.ค. 2026",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id:       "a2",
    tag:      "กองทุน",
    tagColor: "bg-emerald-100 text-emerald-700",
    title:    "เปรียบเทียบกองทุน SSF vs RMF ปี 2026 เลือกแบบไหนดี?",
    excerpt:  "ลดหย่อนภาษีได้สูงสุด พร้อม Flow การลงทุนที่เหมาะสมกับแต่ละช่วงวัย",
    readTime: "6 นาที",
    date:     "7 มี.ค. 2026",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id:       "a3",
    tag:      "US Market",
    tagColor: "bg-red-100 text-red-700",
    title:    "Fed Rate Decision: ผลกระทบต่อตลาดหุ้นไทยและสหรัฐ",
    excerpt:  "วิเคราะห์ทิศทางดอกเบี้ย Fed และผลต่อการลงทุนในหุ้นและพันธบัตร",
    readTime: "10 นาที",
    date:     "5 มี.ค. 2026",
    gradient: "from-orange-500 to-red-500",
  },
];

// English version for i18n-aware views
export const MOCK_ARTICLES_EN: Article[] = [
  {
    id:       "a1",
    tag:      "Stock Analysis",
    tagColor: "bg-indigo-100 text-indigo-700",
    title:    "10 SET stocks to watch in Q2 2026",
    excerpt:  "A shortlist of fundamentally strong stocks with attractive growth and valuations.",
    readTime: "8 min",
    date:     "9 Mar 2026",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    id:       "a2",
    tag:      "Funds",
    tagColor: "bg-emerald-100 text-emerald-700",
    title:    "SSF vs RMF in 2026: which should you choose?",
    excerpt:  "Compare tax benefits and investment flows for different stages of life.",
    readTime: "6 min",
    date:     "7 Mar 2026",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id:       "a3",
    tag:      "US Market",
    tagColor: "bg-red-100 text-red-700",
    title:    "Fed rate decision: impact on Thai and US markets",
    excerpt:  "Analyze Fed policy paths and what they mean for equities and bonds.",
    readTime: "10 min",
    date:     "5 Mar 2026",
    gradient: "from-orange-500 to-red-500",
  },
];

// ─── Dashboard / Home Promo Carousel ─────────────────────────────────────────
export const PROMO_ITEMS: PromoItem[] = [
  {
    id:       "1",
    gradient: "from-indigo-600 via-indigo-500 to-violet-600",
    badge:    "InvestIQ Pro",
    emoji:    "✨",
    title:    "Upgrade ฟรี 30 วัน",
    subtitle: "รับการวิเคราะห์พอร์ตด้วย AI และ Smart Alerts แบบ Real-time ไม่มีข้อผูกมัด",
    cta:      "ลองเลย",
    ctaHref:  "#",
  },
  {
    id:       "2",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge:    "0% Commission",
    emoji:    "💸",
    title:    "ซื้อขายหุ้น US ไม่มีค่าธรรมเนียม",
    subtitle: "เปิดบัญชีวันนี้ รับเงินคืน $10 ทันที · ไม่มีขั้นต่ำในการเปิดบัญชี",
    cta:      "เปิดบัญชี",
    ctaHref:  "#",
  },
  {
    id:       "3",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    badge:    "Webinar ฟรี",
    emoji:    "📈",
    title:    "เรียนรู้กลยุทธ์หุ้น Growth",
    subtitle: "Masterclass โดยนักวิเคราะห์มืออาชีพ · วันเสาร์ที่ 15 มีนาคม 2026",
    cta:      "ลงทะเบียน",
    ctaHref:  "#",
  },
  {
    id:       "4",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    badge:    "Smart Alert",
    emoji:    "🔔",
    title:    "ตั้ง Price Alert อัจฉริยะ",
    subtitle: "รับการแจ้งเตือนทันทีเมื่อหุ้นถึงราคาเป้าหมาย · รองรับทุกอุปกรณ์",
    cta:      "ตั้งค่าเลย",
    ctaHref:  "#",
  },
];
