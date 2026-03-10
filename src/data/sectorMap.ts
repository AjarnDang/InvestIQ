import type { StockSector, InstrumentType } from "@/src/types";

// ─── StockMeta ────────────────────────────────────────────────────────────────

export interface StockMeta {
  /** Clean, URL-safe symbol used inside the app (e.g. "PTT", "AAPL", "BTC") */
  symbol:          string;
  /** Exact ticker Yahoo Finance accepts (e.g. "PTT.BK", "AAPL", "BTC-USD") */
  yahooSymbol:     string;
  /** Full display name */
  name:            string;
  /** Industry / asset-class category */
  sector:          StockSector;
  /** Asset class — defaults to "STOCK" when absent */
  type?:           InstrumentType;
  /** Listing exchange (informational) */
  exchange?:       string;
  /**
   * Extra search keywords (Thai names, abbreviations, common aliases).
   * Used by the auto-complete search to widen matching beyond symbol + name.
   */
  searchKeywords?: string[];
}

// ─── Thai SET Stocks ──────────────────────────────────────────────────────────

export const STOCK_META: StockMeta[] = [
  // ── Energy ──────────────────────────────────────────────────────────────────
  {
    symbol: "PTT", yahooSymbol: "PTT.BK", name: "PTT Public Company Limited",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["ปตท", "บริษัท ปตท", "การปิโตรเลียม", "น้ำมัน", "ptt", "petroleum"],
  },
  {
    symbol: "PTTGC", yahooSymbol: "PTTGC.BK", name: "PTT Global Chemical PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["ปตท จีซี", "ปตท โกลบอล", "เคมีภัณฑ์", "global chemical"],
  },
  {
    symbol: "TOP", yahooSymbol: "TOP.BK", name: "Thai Oil PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["ไทยออยล์", "thaioil", "โรงกลั่น", "น้ำมัน"],
  },
  {
    symbol: "IRPC", yahooSymbol: "IRPC.BK", name: "IRPC PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["ไออาร์พีซี", "โรงกลั่น", "ปิโตรเคมี"],
  },
  {
    symbol: "RATCH", yahooSymbol: "RATCH.BK", name: "Ratch Group PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["ราช กรุ๊ป", "พลังงาน", "ratch group", "ไฟฟ้า"],
  },
  {
    symbol: "BGRIM", yahooSymbol: "BGRIM.BK", name: "B.Grimm Power PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["บีกริม", "b grimm", "พลังงาน", "ไฟฟ้า"],
  },
  {
    symbol: "EA", yahooSymbol: "EA.BK", name: "Energy Absolute PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["พลังงานบริสุทธิ์", "energy absolute", "พลังงาน", "โซลาร์"],
  },
  {
    symbol: "GULF", yahooSymbol: "GULF.BK", name: "Gulf Energy Development PCL",
    sector: "Energy", exchange: "SET",
    searchKeywords: ["กัลฟ์", "gulf energy", "ไฟฟ้า", "พลังงาน"],
  },

  // ── Banking ──────────────────────────────────────────────────────────────────
  {
    symbol: "KBANK", yahooSymbol: "KBANK.BK", name: "Kasikornbank PCL",
    sector: "Banking", exchange: "SET",
    searchKeywords: ["กสิกร", "กสิกรไทย", "kasikorn", "ธนาคารกสิกร", "kbank"],
  },
  {
    symbol: "SCB", yahooSymbol: "SCB.BK", name: "SCB X PCL",
    sector: "Banking", exchange: "SET",
    searchKeywords: ["ไทยพาณิชย์", "scbx", "ธนาคารไทยพาณิชย์", "siam commercial"],
  },
  {
    symbol: "BBL", yahooSymbol: "BBL.BK", name: "Bangkok Bank PCL",
    sector: "Banking", exchange: "SET",
    searchKeywords: ["กรุงเทพ", "ธนาคารกรุงเทพ", "bangkok bank", "bbl"],
  },
  {
    symbol: "KTB", yahooSymbol: "KTB.BK", name: "Krungthai Bank PCL",
    sector: "Banking", exchange: "SET",
    searchKeywords: ["กรุงไทย", "ธนาคารกรุงไทย", "krungthai", "ktb"],
  },
  {
    symbol: "BAY", yahooSymbol: "BAY.BK", name: "Bank of Ayudhya PCL",
    sector: "Banking", exchange: "SET",
    searchKeywords: ["กรุงศรี", "ธนาคารกรุงศรี", "ayudhya", "krungsri"],
  },
  {
    symbol: "KTC", yahooSymbol: "KTC.BK", name: "Krungthai Card PCL",
    sector: "Finance", exchange: "SET",
    searchKeywords: ["กรุงไทยการ์ด", "krungthai card", "บัตรเครดิต"],
  },
  {
    symbol: "TIDLOR", yahooSymbol: "TIDLOR.BK", name: "Ngern Tid Lor PCL",
    sector: "Finance", exchange: "SET",
    searchKeywords: ["เงินติดล้อ", "ngern tid lor", "สินเชื่อ", "ลีสซิ่ง"],
  },
  {
    symbol: "MTC", yahooSymbol: "MTC.BK", name: "Muangthai Capital PCL",
    sector: "Finance", exchange: "SET",
    searchKeywords: ["เมืองไทย แคปปิตอล", "muangthai capital", "สินเชื่อ"],
  },

  // ── Technology / Telecom ──────────────────────────────────────────────────────
  {
    symbol: "ADVANC", yahooSymbol: "ADVANC.BK", name: "Advanced Info Service PCL",
    sector: "Technology", exchange: "SET",
    searchKeywords: ["เอไอเอส", "ais", "advanced info", "โทรศัพท์มือถือ", "มือถือ"],
  },
  {
    symbol: "DELTA", yahooSymbol: "DELTA.BK", name: "Delta Electronics Thailand PCL",
    sector: "Technology", exchange: "SET",
    searchKeywords: ["เดลต้า", "delta electronics", "อิเล็กทรอนิกส์"],
  },
  {
    symbol: "TRUE", yahooSymbol: "TRUE.BK", name: "True Corporation PCL",
    sector: "Technology", exchange: "SET",
    searchKeywords: ["ทรู", "true corporation", "โทรคมนาคม", "มือถือ"],
  },
  {
    symbol: "HANA", yahooSymbol: "HANA.BK", name: "Hana Microelectronics PCL",
    sector: "Technology", exchange: "SET",
    searchKeywords: ["ฮานา", "hana microelectronics", "อิเล็กทรอนิกส์"],
  },
  {
    symbol: "INSET", yahooSymbol: "INSET.BK", name: "Infraset PCL",
    sector: "Technology", exchange: "SET",
    searchKeywords: ["อินฟราเซ็ต", "infraset", "โทรคมนาคม"],
  },

  // ── Consumer / Retail ──────────────────────────────────────────────────────────
  {
    symbol: "CPALL", yahooSymbol: "CPALL.BK", name: "CP All PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["ซีพีออลล์", "cp all", "เซเว่น", "7-eleven", "ร้านสะดวกซื้อ"],
  },
  {
    symbol: "BJC", yahooSymbol: "BJC.BK", name: "Berli Jucker PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["เบอร์ลี่ จุ๊กเกอร์", "berli jucker", "บิ๊กซี"],
  },
  {
    symbol: "TU", yahooSymbol: "TU.BK", name: "Thai Union Group PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["ไทยยูเนี่ยน", "thai union", "อาหารทะเล", "ปลากระป๋อง"],
  },
  {
    symbol: "CPF", yahooSymbol: "CPF.BK", name: "Charoen Pokphand Foods PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["ซีพีเอฟ", "charoen pokphand foods", "เจริญโภคภัณฑ์", "อาหาร"],
  },
  {
    symbol: "MINT", yahooSymbol: "MINT.BK", name: "Minor International PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["ไมเนอร์", "minor international", "โรงแรม", "restaurant", "อาหาร"],
  },
  {
    symbol: "CENTEL", yahooSymbol: "CENTEL.BK", name: "Central Plaza Hotel PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["เซ็นทรัล", "central plaza hotel", "โรงแรม", "central"],
  },
  {
    symbol: "CRC", yahooSymbol: "CRC.BK", name: "Central Retail Corporation PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["เซ็นทรัล รีเทล", "central retail", "ห้างสรรพสินค้า", "ซีอาร์ซี"],
  },
  {
    symbol: "HMPRO", yahooSymbol: "HMPRO.BK", name: "Home Product Center PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["โฮมโปร", "home pro", "home product", "วัสดุก่อสร้าง"],
  },
  {
    symbol: "MAKRO", yahooSymbol: "MAKRO.BK", name: "Siam Makro PCL",
    sector: "Consumer", exchange: "SET",
    searchKeywords: ["แมคโคร", "siam makro", "ค้าปลีก", "superstore"],
  },

  // ── Industrial / Infrastructure ───────────────────────────────────────────────
  {
    symbol: "SCC", yahooSymbol: "SCC.BK", name: "Siam Cement Group PCL",
    sector: "Industrial", exchange: "SET",
    searchKeywords: ["เอสซีจี", "scg", "ปูนซิเมนต์ไทย", "siam cement"],
  },
  {
    symbol: "AOT", yahooSymbol: "AOT.BK", name: "Airports of Thailand PCL",
    sector: "Industrial", exchange: "SET",
    searchKeywords: ["ท่าอากาศยาน", "airports of thailand", "สนามบิน", "ทอท"],
  },
  {
    symbol: "BEM", yahooSymbol: "BEM.BK", name: "Bangkok Expressway and Metro PCL",
    sector: "Industrial", exchange: "SET",
    searchKeywords: ["บีอีเอ็ม", "bangkok expressway", "รถไฟฟ้า", "ทางด่วน", "bem"],
  },
  {
    symbol: "CPN", yahooSymbol: "CPN.BK", name: "Central Pattana PCL",
    sector: "Industrial", exchange: "SET",
    searchKeywords: ["เซ็นทรัลพัฒนา", "central pattana", "ศูนย์การค้า", "cpn"],
  },

  // ── Healthcare ────────────────────────────────────────────────────────────────
  {
    symbol: "BH", yahooSymbol: "BH.BK", name: "Bumrungrad Hospital PCL",
    sector: "Healthcare", exchange: "SET",
    searchKeywords: ["บำรุงราษฎร์", "bumrungrad", "โรงพยาบาล", "รพ"],
  },
  {
    symbol: "BCH", yahooSymbol: "BCH.BK", name: "Bangkok Chain Hospital PCL",
    sector: "Healthcare", exchange: "SET",
    searchKeywords: ["กรุงเทพดุสิตเวชการ", "bdms", "โรงพยาบาล", "bangkok chain"],
  },
  {
    symbol: "THG", yahooSymbol: "THG.BK", name: "Thonburi Healthcare Group PCL",
    sector: "Healthcare", exchange: "SET",
    searchKeywords: ["ธนบุรี", "thonburi healthcare", "โรงพยาบาล"],
  },

  // ── US Stocks ─────────────────────────────────────────────────────────────────
  {
    symbol: "AAPL", yahooSymbol: "AAPL", name: "Apple Inc.",
    sector: "Technology", exchange: "NASDAQ",
    searchKeywords: ["apple", "iphone", "ipad", "macbook", "แอปเปิล"],
  },
  {
    symbol: "MSFT", yahooSymbol: "MSFT", name: "Microsoft Corporation",
    sector: "Technology", exchange: "NASDAQ",
    searchKeywords: ["microsoft", "windows", "azure", "ไมโครซอฟต์"],
  },
  {
    symbol: "NVDA", yahooSymbol: "NVDA", name: "NVIDIA Corporation",
    sector: "Technology", exchange: "NASDAQ",
    searchKeywords: ["nvidia", "gpu", "ai chip", "เอ็นวิเดีย", "กราฟิก"],
  },
  {
    symbol: "GOOGL", yahooSymbol: "GOOGL", name: "Alphabet Inc.",
    sector: "Communication", exchange: "NASDAQ",
    searchKeywords: ["google", "alphabet", "youtube", "กูเกิล", "ยูทูบ"],
  },
  {
    symbol: "META", yahooSymbol: "META", name: "Meta Platforms Inc.",
    sector: "Communication", exchange: "NASDAQ",
    searchKeywords: ["meta", "facebook", "instagram", "whatsapp", "เฟซบุ๊ก"],
  },
  {
    symbol: "AMZN", yahooSymbol: "AMZN", name: "Amazon.com Inc.",
    sector: "Consumer", exchange: "NASDAQ",
    searchKeywords: ["amazon", "aws", "อเมซอน", "cloud", "e-commerce"],
  },
  {
    symbol: "TSLA", yahooSymbol: "TSLA", name: "Tesla Inc.",
    sector: "Consumer", exchange: "NASDAQ",
    searchKeywords: ["tesla", "elon musk", "รถยนต์ไฟฟ้า", "ev", "เทสลา"],
  },
  {
    symbol: "NFLX", yahooSymbol: "NFLX", name: "Netflix Inc.",
    sector: "Communication", exchange: "NASDAQ",
    searchKeywords: ["netflix", "streaming", "เน็ตฟลิกซ์", "ซีรีส์"],
  },
  {
    symbol: "JPM", yahooSymbol: "JPM", name: "JPMorgan Chase & Co.",
    sector: "Finance", exchange: "NYSE",
    searchKeywords: ["jpmorgan", "chase", "bank", "ธนาคาร"],
  },
  {
    symbol: "XOM", yahooSymbol: "XOM", name: "Exxon Mobil Corporation",
    sector: "Energy", exchange: "NYSE",
    searchKeywords: ["exxon", "mobil", "oil", "energy", "น้ำมัน"],
  },
  {
    symbol: "AMD", yahooSymbol: "AMD", name: "Advanced Micro Devices Inc.",
    sector: "Technology", exchange: "NASDAQ",
    searchKeywords: ["amd", "ryzen", "radeon", "cpu", "gpu", "semiconductor"],
  },
  {
    symbol: "INTC", yahooSymbol: "INTC", name: "Intel Corporation",
    sector: "Technology", exchange: "NASDAQ",
    searchKeywords: ["intel", "cpu", "processor", "chip", "semiconductor"],
  },
  {
    symbol: "DIS", yahooSymbol: "DIS", name: "The Walt Disney Company",
    sector: "Communication", exchange: "NYSE",
    searchKeywords: ["disney", "walt disney", "disney+", "marvel", "ดิสนีย์"],
  },
  {
    symbol: "V", yahooSymbol: "V", name: "Visa Inc.",
    sector: "Finance", exchange: "NYSE",
    searchKeywords: ["visa", "payment", "card", "บัตรเครดิต"],
  },
  {
    symbol: "MA", yahooSymbol: "MA", name: "Mastercard Incorporated",
    sector: "Finance", exchange: "NYSE",
    searchKeywords: ["mastercard", "payment", "card", "master card"],
  },
  {
    symbol: "WMT", yahooSymbol: "WMT", name: "Walmart Inc.",
    sector: "Consumer", exchange: "NYSE",
    searchKeywords: ["walmart", "retail", "wal-mart", "superstore"],
  },

  // ── ETFs ──────────────────────────────────────────────────────────────────────
  {
    symbol: "SPY", yahooSymbol: "SPY", name: "SPDR S&P 500 ETF Trust",
    sector: "ETF", type: "ETF", exchange: "NYSE",
    searchKeywords: ["s&p500", "sp500", "s&p 500", "index etf", "spdr"],
  },
  {
    symbol: "QQQ", yahooSymbol: "QQQ", name: "Invesco QQQ Trust (Nasdaq-100)",
    sector: "ETF", type: "ETF", exchange: "NASDAQ",
    searchKeywords: ["nasdaq 100", "qqq", "invesco", "tech etf", "nasdaq etf"],
  },
  {
    symbol: "VTI", yahooSymbol: "VTI", name: "Vanguard Total Stock Market ETF",
    sector: "ETF", type: "ETF", exchange: "NYSE",
    searchKeywords: ["vanguard", "total market", "vti", "broad market etf"],
  },
  {
    symbol: "TLT", yahooSymbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF",
    sector: "ETF", type: "ETF", exchange: "NASDAQ",
    searchKeywords: ["treasury bond", "tlt", "ishares", "พันธบัตร", "bond etf"],
  },
  {
    symbol: "AGG", yahooSymbol: "AGG", name: "iShares Core U.S. Aggregate Bond ETF",
    sector: "ETF", type: "ETF", exchange: "NYSE",
    searchKeywords: ["aggregate bond", "agg", "ishares", "bond etf", "ตราสารหนี้"],
  },
  {
    symbol: "GLD", yahooSymbol: "GLD", name: "SPDR Gold Shares ETF",
    sector: "ETF", type: "ETF", exchange: "NYSE",
    searchKeywords: ["gold etf", "ทองคำ", "gld", "spdr gold", "gold fund"],
  },
  {
    symbol: "SLV", yahooSymbol: "SLV", name: "iShares Silver Trust ETF",
    sector: "ETF", type: "ETF", exchange: "NYSE",
    searchKeywords: ["silver etf", "เงิน", "silver", "ishares silver"],
  },
  {
    symbol: "USO", yahooSymbol: "USO", name: "United States Oil Fund ETF",
    sector: "ETF", type: "ETF", exchange: "NYSE",
    searchKeywords: ["oil etf", "uso", "crude oil", "น้ำมัน etf"],
  },

  // ── Crypto ────────────────────────────────────────────────────────────────────
  {
    symbol: "BTC", yahooSymbol: "BTC-USD", name: "Bitcoin",
    sector: "Crypto", type: "CRYPTO",
    searchKeywords: ["bitcoin", "btc", "บิตคอยน์", "คริปโต", "crypto"],
  },
  {
    symbol: "ETH", yahooSymbol: "ETH-USD", name: "Ethereum",
    sector: "Crypto", type: "CRYPTO",
    searchKeywords: ["ethereum", "eth", "อีเธอเรียม", "คริปโต", "defi"],
  },
  {
    symbol: "BNB", yahooSymbol: "BNB-USD", name: "BNB (Binance Coin)",
    sector: "Crypto", type: "CRYPTO",
    searchKeywords: ["binance", "bnb", "binance coin", "บิแนนซ์"],
  },
  {
    symbol: "SOL", yahooSymbol: "SOL-USD", name: "Solana",
    sector: "Crypto", type: "CRYPTO",
    searchKeywords: ["solana", "sol", "โซลานา", "blockchain"],
  },
  {
    symbol: "XRP", yahooSymbol: "XRP-USD", name: "XRP (Ripple)",
    sector: "Crypto", type: "CRYPTO",
    searchKeywords: ["xrp", "ripple", "ริปเปิล", "crypto payment"],
  },
  {
    symbol: "ADA", yahooSymbol: "ADA-USD", name: "Cardano",
    sector: "Crypto", type: "CRYPTO",
    searchKeywords: ["cardano", "ada", "คาร์ดาโน", "blockchain"],
  },
];

// ─── SET Index Registry ────────────────────────────────────────────────────────

export interface IndexMeta {
  yahooSymbol:  string;
  displayName:  string;
}

export const INDEX_META: IndexMeta[] = [
  { yahooSymbol: "^SET",    displayName: "SET Index" },
  { yahooSymbol: "^SET50",  displayName: "SET50"     },
  { yahooSymbol: "^SET100", displayName: "SET100"    },
  { yahooSymbol: "^MAI",    displayName: "MAI"       },
];

// ─── Lookup Maps ──────────────────────────────────────────────────────────────

/** Yahoo Finance symbol → StockMeta */
export const YAHOO_TO_META: Record<string, StockMeta> = Object.fromEntries(
  STOCK_META.map((m) => [m.yahooSymbol, m])
);

/** Internal (app) symbol → StockMeta */
export const SYMBOL_TO_META: Record<string, StockMeta> = Object.fromEntries(
  STOCK_META.map((m) => [m.symbol, m])
);

/** All Yahoo stock symbols, comma-joined for API calls */
export const ALL_YAHOO_STOCK_SYMBOLS = STOCK_META.map((m) => m.yahooSymbol).join(",");

/** All Yahoo index symbols, comma-joined for API calls */
export const ALL_YAHOO_INDEX_SYMBOLS = INDEX_META.map((m) => m.yahooSymbol).join(",");

/** Array of Yahoo symbols grouped into chunks of `size` (for chunked API calls) */
export function chunkYahooSymbols(size = 25): string[][] {
  const syms = STOCK_META.map((m) => m.yahooSymbol);
  const chunks: string[][] = [];
  for (let i = 0; i < syms.length; i += size) {
    chunks.push(syms.slice(i, i + size));
  }
  return chunks;
}
