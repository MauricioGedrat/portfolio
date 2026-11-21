/**
 * Content model — the single source of truth for the public site, the
 * resume page and the PDF. Phase 9 moves this data into Supabase (CMS)
 * with the same shapes, so the frontend never changes when content does.
 *
 * Every factual field carries a confidence level (see docs/ARCHITECTURE.md
 * § Content confidence). Only "verified" content is rendered as fact.
 */

export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];

/** A string available in both languages. */
export type L = Record<Locale, string>;

export type Confidence = "verified" | "likely" | "uncertain" | "conflicting";

export type Discipline = "software" | "data" | "electronics" | "embedded" | "power";

export interface SourceLink {
  label: L;
  href: string;
}

/** One block of a case study's signal chain (rendered as a system diagram). */
export interface ChainNode {
  id: string;
  label: L;
  detail?: L;
}

export interface Metric {
  value: string;
  label: L;
}

export interface Project {
  slug: string;
  /** Lower number = more important. Drives the order everywhere. */
  order: number;
  featured: boolean;
  confidence: Confidence;
  /**
   * Official title. Academic titles stay in Portuguese in both languages
   * (owner's rule), so `title` is plain text and `subtitle` is localized.
   */
  title: string;
  subtitle: L;
  year: number;
  period?: L;
  disciplines: Discipline[];
  collaborators?: string[];
  context?: L;
  award?: L;
  summary: L;
  problem: L;
  approach: L[];
  chain: ChainNode[];
  implementation: L[];
  result: L;
  metrics?: Metric[];
  /** Real photos/captures of this project, in /public/work/<slug>/. First one is the cover. */
  media?: ProjectMedia[];
  technologies: string[];
  lessons?: L;
  sources: SourceLink[];
}

export interface TimelineEntry {
  id: string;
  year: string;
  kind: "education" | "course" | "experience" | "project" | "achievement";
  title: L;
  place?: string;
  detail?: L;
  /** Links the entry to a case study. */
  project?: string;
}

export interface SkillGroup {
  id: string;
  name: L;
  /** What this system of skills is used for, in one line. */
  role: L;
  items: { name: string | L }[];
  /** Projects that prove the skills — used by the interactive skill map. */
  proof: string[];
}

export interface Profile {
  name: string;
  legalName: string;
  role: L;
  statement: L;
  location: L;
  seeking: L;
  email: string;
  links: { github: string; linkedin: string };
  languages: { name: L; level: L }[];
}

export type ProjectMedia = {
  src: string;
  width: number;
  height: number;
  alt: L;
  caption?: L;
};
