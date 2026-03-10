import { NextResponse } from "next/server";
import type { NewsItem } from "@/src/types";

// ─── RSS Sources ──────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  {
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    name: "MarketWatch",
  },
  {
    url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    name: "CNBC",
  },
  {
    url: "https://feeds.reuters.com/reuters/businessNews",
    name: "Reuters",
  },
  {
    url: "https://www.bangkokpost.com/rss/data/business.xml",
    name: "Bangkok Post",
  },
];

// ─── XML Parsing Helpers ──────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function extractCDATA(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, "i")
  );
  return match ? match[1].trim() : "";
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, "i"));
  return match ? match[1] : "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseRSSFeed(xml: string, defaultSource: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const title =
      extractCDATA(itemXml, "title") || stripHtml(extractTag(itemXml, "title"));
    const link =
      extractTag(itemXml, "link") ||
      extractAttr(itemXml, "guid", "isPermaLink") === "false"
        ? extractTag(itemXml, "link") || extractTag(itemXml, "guid")
        : extractTag(itemXml, "guid") || extractTag(itemXml, "link");
    const description =
      extractCDATA(itemXml, "description") ||
      stripHtml(extractTag(itemXml, "description"));
    const pubDate =
      extractTag(itemXml, "pubDate") || extractTag(itemXml, "dc:date");
    const imageUrl =
      extractAttr(itemXml, "media:content", "url") ||
      extractAttr(itemXml, "media:thumbnail", "url") ||
      extractAttr(itemXml, "enclosure", "url");

    if (!title || !link) continue;

    let parsedDate: string;
    try {
      parsedDate = pubDate
        ? new Date(pubDate).toISOString()
        : new Date().toISOString();
    } catch {
      parsedDate = new Date().toISOString();
    }

    items.push({
      id: link,
      title: stripHtml(title).slice(0, 200),
      description: description.slice(0, 250),
      url: link,
      source: defaultSource,
      publishedAt: parsedDate,
      imageUrl: imageUrl || undefined,
    });
  }

  return items;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

// GET /api/news
export async function GET() {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async ({ url, name }) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; InvestIQ/1.0; +https://investiq.app)",
            Accept: "application/rss+xml, application/xml, text/xml, */*",
          },
          next: { revalidate: 900 }, // cache for 15 minutes
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        return parseRSSFeed(xml, name);
      } finally {
        clearTimeout(timer);
      }
    })
  );

  // Collect all successfully fetched items
  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by publishedAt descending, deduplicate by id, return top 30
  const seen = new Set<string>();
  const news = allItems
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, 30);

  return NextResponse.json({ news, count: news.length });
}
