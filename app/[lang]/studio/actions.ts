"use server";

import { updateTag } from "next/cache";
import { projects } from "@/content/projects";
import { editableText, type ProjectOverride } from "@/lib/content-merge";
import { rpc } from "@/lib/supabase-public";

type Loaded = { ok: true; overrides: Record<string, ProjectOverride> } | { ok: false; reason: "auth" | "offline" };

export async function loadStudio(key: string): Promise<Loaded> {
  const check = await rpc<boolean>("check_key", { p_key: String(key).slice(0, 200) });
  if (!check.ok) return { ok: false, reason: "offline" };
  if (check.data !== true) return { ok: false, reason: "auth" };
  const o = await rpc<Record<string, ProjectOverride>>("get_overrides", {});
  return { ok: true, overrides: o.ok && o.data ? o.data : {} };
}

/** Keep only fields the site knows how to apply, trimmed and length-capped. */
function clean(input: ProjectOverride): ProjectOverride {
  const out: ProjectOverride = {};
  if (typeof input.title === "string") out.title = input.title.slice(0, 200);
  for (const k of editableText) {
    const v = input[k];
    if (v && typeof v.pt === "string" && typeof v.en === "string") out[k] = { pt: v.pt.slice(0, 4000), en: v.en.slice(0, 4000) };
  }
  if (typeof input.order === "number" && Number.isFinite(input.order)) out.order = Math.round(input.order);
  if (typeof input.featured === "boolean") out.featured = input.featured;
  if (typeof input.hidden === "boolean") out.hidden = input.hidden;
  return out;
}

export async function saveProject(key: string, slug: string, data: ProjectOverride) {
  if (!projects.some((p) => p.slug === slug)) return { ok: false as const };
  const r = await rpc<boolean>("save_override", { p_key: String(key).slice(0, 200), p_slug: slug, p_data: clean(data) });
  if (r.ok && r.data === true) {
    updateTag("projects");
    return { ok: true as const };
  }
  return { ok: false as const };
}

export async function resetProject(key: string, slug: string) {
  const r = await rpc<boolean>("delete_override", { p_key: String(key).slice(0, 200), p_slug: slug });
  if (r.ok && r.data === true) {
    updateTag("projects");
    return { ok: true as const };
  }
  return { ok: false as const };
}
