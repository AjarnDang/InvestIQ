// ─── Landing / Promo Content ──────────────────────────────────────────────────

export interface PromoItem {
  id: string;
  gradient: string;
  badge: string;
  emoji: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaHref: string;
}

export interface LearnTopic {
  icon: string;
  title: string;
  desc: string;
  time: string;
}

export interface Article {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  gradient: string;
}

