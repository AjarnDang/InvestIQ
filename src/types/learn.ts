export type LearnItem = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
};

export type LearnResource = {
  label: string;
  href: string;
  kind: "read" | "youtube";
};

export type LearnSection = {
  titleTh: string;
  titleEn: string;
  paragraphsTh: string[];
  paragraphsEn: string[];
  bulletsTh?: string[];
  bulletsEn?: string[];
};

export type LearnContent = {
  keyTermsTh: string[];
  keyTermsEn: string[];
  sections: LearnSection[];
  resources: LearnResource[];
};

