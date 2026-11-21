import type { L, Project } from "@/content/types";

/** Fields that /studio can override. Everything else stays as written in content/projects.ts. */
export type ProjectOverride = Partial<{
  title: string;
  subtitle: L;
  summary: L;
  problem: L;
  result: L;
  lessons: L;
  order: number;
  featured: boolean;
  hidden: boolean;
}>;

export const editableText = ["subtitle", "summary", "problem", "result", "lessons"] as const;

function isL(v: unknown): v is L {
  return !!v && typeof v === "object" && typeof (v as L).pt === "string" && typeof (v as L).en === "string";
}

export function applyOverride(p: Project, o: ProjectOverride | undefined): Project & { hidden?: boolean } {
  if (!o) return p;
  const next: Project & { hidden?: boolean } = { ...p };
  if (typeof o.title === "string" && o.title.trim()) next.title = o.title.trim();
  for (const k of editableText) {
    const v = o[k];
    if (isL(v) && (v.pt.trim() || v.en.trim())) next[k] = { pt: v.pt.trim(), en: v.en.trim() };
  }
  if (typeof o.order === "number" && Number.isFinite(o.order)) next.order = o.order;
  if (typeof o.featured === "boolean") next.featured = o.featured;
  if (o.hidden === true) next.hidden = true;
  return next;
}
