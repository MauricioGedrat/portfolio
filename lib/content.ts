import { cacheLife, cacheTag } from "next/cache";
import { projects as base } from "@/content/projects";
import type { Project } from "@/content/types";
import { applyOverride, type ProjectOverride } from "@/lib/content-merge";
import { rpc } from "@/lib/supabase-public";

/** Overrides saved in /studio. A save in /studio expires this at once (updateTag("projects")). */
export async function getOverrides(): Promise<Record<string, ProjectOverride>> {
  "use cache";
  cacheTag("projects");
  cacheLife("hours"); // self-heals within the hour if Supabase was unreachable
  const { ok, data } = await rpc<Record<string, ProjectOverride>>("get_overrides", {});
  return ok && data && typeof data === "object" ? data : {};
}

/** Projects as the public site shows them: code content + studio edits, hidden ones removed, ranked. */
export async function getProjects(): Promise<Project[]> {
  const o = await getOverrides();
  return base
    .map((p) => applyOverride(p, o[p.slug]))
    .filter((p) => !p.hidden)
    .sort((a, b) => a.order - b.order);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.slug === slug);
}
