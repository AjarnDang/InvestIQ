import type { LearnContent } from "@/src/types/learn";

/**
 * Content for /learn (docs-style learning center).
 * Order must match the first 5 items in LEARN_TOPICS / LEARN_TOPICS_EN.
 */
export const LEARN_CONTENT: LearnContent[] = [
  // 1) What are stocks?
  {
    keyTermsTh: [
      "หุ้นสามัญ (Common Stock)",
      "มูลค่าหลักทรัพย์ตามราคาตลาด (Market Cap)",
      "กำไรต่อหุ้น (EPS)",
      "อัตราส่วน P/E",
      "เงินปันผล (Dividend)",
    ],
    keyTermsEn: ["Common stock", "Market cap", "EPS", "P/E ratio", "Dividend"],
    sections: [
      {
        titleTh: "หุ้นคืออะไร และเราซื้อ “อะไร” กันแน่",
        titleEn: "What a stock is (what you actually buy)",
        paragraphsTh: [
          "หุ้นคือ “สิทธิความเป็นเจ้าของ” ในบริษัท คุณไม่ได้ซื้อสินค้า/บริการของบริษัท แต่ซื้อส่วนแบ่งความเป็นเจ้าของที่มีสิทธิ์รับผลตอบแทนจากกำไรในอนาคต (เช่น เงินปันผล) และโอกาสที่มูลค่าบริษัทจะเติบโต (ราคาหุ้นขึ้น).",
          "ราคาหุ้นในตลาดคือผลรวมความคาดหวังของผู้เล่นจำนวนมาก—ทั้งข้อมูลพื้นฐาน กำไรในอนาคต ดอกเบี้ย สภาพคล่อง และอารมณ์ตลาด.",
        ],
        paragraphsEn: [
          "A stock represents ownership in a company. You’re buying a claim on future cash flows (e.g., dividends) and the potential growth of the business (price appreciation).",
          "The market price reflects collective expectations—fundamentals, future earnings, interest rates, liquidity, and sentiment.",
        ],
      },
      {
        titleTh: "ผลตอบแทนมาจากไหน (Return = Price + Cashflow)",
        titleEn: "Where returns come from",
        paragraphsTh: [
          "ผลตอบแทนของหุ้นมักมาจาก 2 ส่วน: (1) ราคาหุ้นเพิ่มขึ้น (Capital Gain) และ (2) เงินสดที่บริษัทจ่ายให้ผู้ถือหุ้น (Dividend).",
          "ระยะสั้นราคาสามารถแกว่งแรงจากข่าว/อารมณ์ แต่ระยะยาวมักผูกกับ “กำไร” และ “การเติบโต” ของบริษัทเป็นหลัก.",
        ],
        paragraphsEn: [
          "Equity returns usually come from (1) price appreciation and (2) cash distributions (dividends).",
          "Short-term moves can be sentiment-driven, while long-term performance is tied more to earnings and business growth.",
        ],
        bulletsTh: [
          "หลีกเลี่ยงการดูแค่ราคา: ให้ดู “ธุรกิจ + กำไร + ความเสี่ยง”",
          "เปรียบเทียบหุ้นกับทางเลือกอื่น: พันธบัตร/เงินฝาก/กองทุนตลาดเงิน",
        ],
        bulletsEn: [
          "Don’t look at price alone—focus on business, earnings, and risk.",
          "Compare against alternatives: bonds, cash, money market funds.",
        ],
      },
      {
        titleTh: "เช็กลิสต์ก่อนซื้อหุ้นตัวแรก",
        titleEn: "First-stock checklist",
        paragraphsTh: [
          "ก่อนซื้อหุ้นตัวแรก ให้เขียนเหตุผลแบบชัดเจน: ซื้อเพราะอะไร จะขายเมื่อไร และยอมรับการขาดทุนได้เท่าไร.",
        ],
        paragraphsEn: [
          "Before your first buy, write down: why you buy, when you sell, and your max acceptable loss.",
        ],
        bulletsTh: [
          "รู้ว่าบริษัททำเงินจากอะไร (Business model)",
          "ดูรายได้/กำไรย้อนหลัง 3–5 ปี",
          "ดูหนี้/กระแสเงินสด (อย่าให้กำไรดีแต่เงินสดแย่)",
          "กำหนดขนาดการลงทุนต่อไม้ (Position sizing)",
        ],
        bulletsEn: [
          "Understand the business model.",
          "Check revenue/earnings over 3–5 years.",
          "Check debt and cash flow (profits can be misleading).",
          "Decide position sizing per trade.",
        ],
      },
    ],
    resources: [
      { kind: "read", label: "Investopedia — Stock", href: "https://www.investopedia.com/terms/s/stock.asp" },
      { kind: "read", label: "SEC Investor.gov — Stocks", href: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks" },
      { kind: "youtube", label: "Ben Felix — Stocks & expected returns (playlist)", href: "https://www.youtube.com/@BenFelixCSI/playlists" },
    ],
  },

  // 2) Reading financial statements
  {
    keyTermsTh: [
      "งบกำไรขาดทุน (Income Statement)",
      "งบดุล (Balance Sheet)",
      "งบกระแสเงินสด (Cash Flow)",
      "กระแสเงินสดจากการดำเนินงาน (CFO)",
      "Free Cash Flow (FCF)",
    ],
    keyTermsEn: ["Income statement", "Balance sheet", "Cash flow", "Operating cash flow", "Free cash flow"],
    sections: [
      {
        titleTh: "งบการเงิน 3 งบอ่านยังไงให้เร็ว",
        titleEn: "The 3 statements—how to read fast",
        paragraphsTh: [
          "งบกำไรขาดทุนบอก “ทำกำไรได้ไหม”, งบดุลบอก “ฐานะการเงินแข็งแรงไหม”, งบกระแสเงินสดบอก “เงินสดเข้าออกจริงไหม”.",
          "มือใหม่มักดูแค่กำไรสุทธิ แต่สิ่งที่ต้องดูคู่กันคือกระแสเงินสดจากการดำเนินงาน (CFO) และหนี้.",
        ],
        paragraphsEn: [
          "Income statement shows profitability, balance sheet shows financial strength, and cash flow shows real cash movement.",
          "Beginners often focus only on net income—pair it with operating cash flow and debt.",
        ],
        bulletsTh: [
          "กำไรโต แต่ CFO ติดลบต่อเนื่อง = ต้องระวังคุณภาพกำไร",
          "หนี้สูง + ดอกเบี้ยขึ้น = ความเสี่ยงเพิ่ม",
        ],
        bulletsEn: [
          "Growing profit but consistently negative CFO can be a red flag.",
          "High debt + rising rates increases risk.",
        ],
      },
      {
        titleTh: "ตัวชี้วัดที่ควรจำ (ฉบับง่าย)",
        titleEn: "Beginner-friendly metrics",
        paragraphsTh: ["เริ่มจากตัวชี้วัดพื้นฐานก่อน แล้วค่อยลึกขึ้นเมื่อคุณคุ้นกับธุรกิจ."],
        paragraphsEn: ["Start with basics, then go deeper once you understand the business."],
        bulletsTh: [
          "Margin (Gross/Operating/Net): ธุรกิจเก่งทำกำไรแค่ไหน",
          "ROE/ROA: ใช้ทุน/สินทรัพย์แล้วทำกำไรได้ดีไหม",
          "Current Ratio: สภาพคล่องระยะสั้น",
          "FCF: เงินสดหลังลงทุนเพื่อรักษาธุรกิจ",
        ],
        bulletsEn: [
          "Margins: profitability strength",
          "ROE/ROA: efficiency of capital/assets",
          "Current ratio: short-term liquidity",
          "FCF: cash after reinvestment needs",
        ],
      },
    ],
    resources: [
      { kind: "read", label: "Khan Academy — Financial statements (intro)", href: "https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme" },
      { kind: "read", label: "Investopedia — Financial Statements", href: "https://www.investopedia.com/terms/f/financialstatements.asp" },
      { kind: "youtube", label: "Aswath Damodaran — Accounting basics (channel)", href: "https://www.youtube.com/@AswathDamodaranonValuation/playlists" },
    ],
  },

  // 3) Technical Analysis
  {
    keyTermsTh: ["แนวรับ-แนวต้าน (Support/Resistance)", "แนวโน้ม (Trend)", "ปริมาณซื้อขาย (Volume)", "ค่าเฉลี่ยเคลื่อนที่ (MA)", "RSI"],
    keyTermsEn: ["Support/resistance", "Trend", "Volume", "Moving average", "RSI"],
    sections: [
      {
        titleTh: "Technical ช่วยอะไร และไม่ช่วยอะไร",
        titleEn: "What technical analysis can (and can’t) do",
        paragraphsTh: [
          "Technical analysis เน้นพฤติกรรมราคา/ปริมาณ เพื่อหาจุดเข้า-ออกและบริหารความเสี่ยง ไม่ได้บอกคุณภาพธุรกิจ.",
          "ให้ใช้ Technical เป็น “เครื่องมือจัดการความเสี่ยง” เช่น วางจุดตัดขาดทุน/จุดทำกำไร และวางแผนขนาดไม้.",
        ],
        paragraphsEn: [
          "Technical analysis focuses on price/volume behavior to plan entries/exits and manage risk—not to judge business quality.",
          "Use it primarily as a risk management tool: stop-loss, take-profit, and sizing.",
        ],
      },
      {
        titleTh: "โครงสร้างที่มือใหม่ควรฝึก (ใช้ได้จริง)",
        titleEn: "Practical beginner framework",
        paragraphsTh: ["โฟกัส 3 อย่าง: (1) Trend (2) Key levels (3) Risk. ถ้าจัด 3 อย่างนี้ได้ คุณจะเทรดเป็นระบบขึ้นมาก."],
        paragraphsEn: ["Focus on: (1) trend, (2) key levels, (3) risk. This makes your trading systematic."],
        bulletsTh: [
          "Trend: ดู higher highs/higher lows หรือ MA ช่วยกรอง",
          "Levels: ขีดแนวรับแนวต้านจาก swing high/low",
          "Risk: กำหนด stop-loss ก่อนกดซื้อเสมอ",
        ],
        bulletsEn: [
          "Trend: higher highs/higher lows or use MAs as filters",
          "Levels: mark swing highs/lows for S/R",
          "Risk: define stop-loss before entry",
        ],
      },
    ],
    resources: [
      { kind: "read", label: "CFA Institute — Technical analysis overview", href: "https://www.cfainstitute.org/en/research/industry-research/technical-analysis" },
      { kind: "read", label: "Investopedia — Support/Resistance", href: "https://www.investopedia.com/terms/s/support.asp" },
      { kind: "youtube", label: "Rayner Teo — Price action basics (channel)", href: "https://www.youtube.com/@RaynerTeo/playlists" },
    ],
  },

  // 4) Mutual funds
  {
    keyTermsTh: ["กองทุนรวม", "NAV", "ค่าธรรมเนียม (Expense ratio)", "Active vs Passive", "DCA"],
    keyTermsEn: ["Mutual fund", "NAV", "Expense ratio", "Active vs passive", "DCA"],
    sections: [
      {
        titleTh: "กองทุนรวมต่างจากหุ้นยังไง",
        titleEn: "How mutual funds differ from stocks",
        paragraphsTh: [
          "กองทุนรวมคือการ “เอาเงินไปให้ผู้จัดการกองทุน/ระบบ” ลงทุนแทน คุณได้กระจายความเสี่ยงทันที แต่แลกกับค่าธรรมเนียมและข้อจำกัดบางอย่าง.",
          "มือใหม่ที่ยังไม่มั่นใจการเลือกหุ้นรายตัว มักเริ่มด้วยกองทุนดัชนี/กองทุนที่กระจายดี แล้วค่อยขยับไปหุ้นรายตัว.",
        ],
        paragraphsEn: [
          "Funds let a manager or rules-based strategy invest for you. You get diversification, but pay fees and accept constraints.",
          "Beginners often start with diversified index funds, then move to single stocks later.",
        ],
      },
      {
        titleTh: "ดูอะไรเวลาจะเลือกกองทุน",
        titleEn: "How to pick a fund",
        paragraphsTh: ["อย่าดูผลตอบแทนย้อนหลังอย่างเดียว ให้ดูต้นทุน (fees), นโยบาย, ความเสี่ยง, และความสม่ำเสมอ."],
        paragraphsEn: ["Don’t look at past returns only—check fees, policy, risk, and consistency."],
        bulletsTh: [
          "Expense ratio / ค่าธรรมเนียมรวม",
          "นโยบายการลงทุน (ลงทุนอะไร, กระจายแค่ไหน)",
          "Tracking error (ถ้าเป็นกองทุนดัชนี)",
          "ความเสี่ยงค่าเงิน (ถ้าลงทุนต่างประเทศ)",
        ],
        bulletsEn: [
          "Expense ratio / total fees",
          "Investment policy (what it holds, diversification)",
          "Tracking error (for index funds)",
          "Currency risk (for international funds)",
        ],
      },
    ],
    resources: [
      { kind: "read", label: "Investor.gov — Mutual Funds", href: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-etfs" },
      { kind: "read", label: "Investopedia — Expense Ratio", href: "https://www.investopedia.com/terms/e/expenseratio.asp" },
      { kind: "youtube", label: "Ben Felix — Index funds & costs (channel)", href: "https://www.youtube.com/@BenFelixCSI/videos" },
    ],
  },

  // 5) Risk management
  {
    keyTermsTh: ["Risk/Reward", "Stop-loss", "Position sizing", "Drawdown", "Diversification"],
    keyTermsEn: ["Risk/reward", "Stop-loss", "Position sizing", "Drawdown", "Diversification"],
    sections: [
      {
        titleTh: "เป้าหมายของการบริหารความเสี่ยง",
        titleEn: "The goal of risk management",
        paragraphsTh: [
          "เป้าหมายไม่ใช่ “ไม่ขาดทุน” แต่คือ “ขาดทุนแบบควบคุมได้” เพื่อให้คุณอยู่ในเกมได้นานพอจนความได้เปรียบทำงาน.",
          "ถ้าคุณควบคุมขนาดการขาดทุนต่อครั้งได้ ผลลัพธ์ระยะยาวจะนิ่งขึ้นมาก แม้คุณยังทายทางผิดบ่อย.",
        ],
        paragraphsEn: [
          "The goal isn’t to never lose—it’s to lose in a controlled way so you can stay in the game long enough for your edge to work.",
          "Controlling loss per trade stabilizes long-term results even if you’re wrong often.",
        ],
      },
      {
        titleTh: "สูตรง่ายๆ ที่ใช้ได้จริง: ขนาดไม้ + จุดตัดขาดทุน",
        titleEn: "Practical formula: sizing + stop",
        paragraphsTh: [
          "เริ่มจากกำหนด “ยอมเสียได้กี่บาทต่อครั้ง” (เช่น 1% ของพอร์ต) แล้วค่อยคำนวณจำนวนหุ้นจากระยะห่างระหว่างราคาเข้าและ stop-loss.",
          "ตัวอย่าง: พอร์ต 100,000 บาท ยอมเสีย 1% = 1,000 บาท หาก stop ห่าง 5 บาท/หุ้น ⇒ ซื้อได้ ~200 หุ้น (ไม่รวมค่าธรรมเนียม).",
        ],
        paragraphsEn: [
          "Decide your max loss per trade (e.g., 1% of portfolio), then compute shares based on entry-to-stop distance.",
          "Example: $3,000 portfolio, 1% risk = $30. If stop distance is $0.50/share, position size ≈ 60 shares (fees ignored).",
        ],
        bulletsTh: [
          "หลีกเลี่ยงการเพิ่มไม้ถัวเฉลี่ยแบบไร้แผนในขาลง",
          "กระจายความเสี่ยง: อย่ามีหุ้นตัวเดียวกินสัดส่วนพอร์ตเกินเหตุ",
        ],
        bulletsEn: [
          "Avoid averaging down without a plan.",
          "Diversify—don’t let a single name dominate your portfolio.",
        ],
      },
    ],
    resources: [
      { kind: "read", label: "CFA Institute — Risk management basics", href: "https://www.cfainstitute.org/en/research/foundation/2020/risk-management" },
      { kind: "read", label: "Investopedia — Position Sizing", href: "https://www.investopedia.com/terms/p/position-sizing.asp" },
      { kind: "youtube", label: "Ray Dalio — Principles (risk/portfolio)", href: "https://www.youtube.com/watch?v=B9XGUpQZY38" },
    ],
  },
];

