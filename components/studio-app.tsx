"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { loadStudio, resetProject, saveProject } from "@/app/[lang]/studio/actions";
import { OWNER_FLAG } from "@/components/analytics";
import type { L, Locale, Project } from "@/content/types";
import { applyOverride, editableText, type ProjectOverride } from "@/lib/content-merge";

const KEY = "mg-insights-key";

const copy = {
  pt: {
    title: "Studio",
    intro: "Edite os textos dos projetos. Ao salvar, o site atualiza na hora. “Restaurar” volta ao texto original.",
    password: "Senha (a mesma do painel de visitas)",
    enter: "Entrar",
    wrong: "Senha incorreta.",
    offline: "Não consegui falar com o banco de dados. Tente de novo em alguns minutos.",
    edited: "editado",
    hiddenTag: "oculto",
    fields: {
      title: "Título (sempre em português)",
      subtitle: "Subtítulo",
      summary: "Visão geral",
      problem: "O problema",
      result: "Resultado",
      lessons: "O que aprendi",
    } as Record<string, string>,
    order: "Ordem",
    featured: "Destaque no currículo",
    hidden: "Esconder do site",
    save: "Salvar",
    saving: "Salvando…",
    saved: "Salvo. O site já mostra a versão nova.",
    failed: "Não salvou. Confira a senha ou tente de novo.",
    reset: "Restaurar original",
    view: "Ver página",
    insights: "Painel de visitas",
  },
  en: {
    title: "Studio",
    intro: "Edit the project texts. Saving updates the site right away. “Restore” goes back to the original text.",
    password: "Password (same as the visits dashboard)",
    enter: "Enter",
    wrong: "Wrong password.",
    offline: "Couldn't reach the database. Try again in a few minutes.",
    edited: "edited",
    hiddenTag: "hidden",
    fields: {
      title: "Title (always in Portuguese)",
      subtitle: "Subtitle",
      summary: "Overview",
      problem: "The problem",
      result: "Result",
      lessons: "What I learned",
    } as Record<string, string>,
    order: "Order",
    featured: "Featured on the resume",
    hidden: "Hide from the site",
    save: "Save",
    saving: "Saving…",
    saved: "Saved. The site already shows the new version.",
    failed: "Not saved. Check the password or try again.",
    reset: "Restore original",
    view: "View page",
    insights: "Visits dashboard",
  },
};

type Draft = {
  title: string;
  order: number;
  featured: boolean;
  hidden: boolean;
} & Record<(typeof editableText)[number], L>;

function toDraft(p: Project & { hidden?: boolean }): Draft {
  const empty = { pt: "", en: "" };
  return {
    title: p.title,
    order: p.order,
    featured: p.featured,
    hidden: !!p.hidden,
    subtitle: p.subtitle ?? empty,
    summary: p.summary ?? empty,
    problem: p.problem ?? empty,
    result: p.result ?? empty,
    lessons: p.lessons ?? empty,
  };
}

export function StudioApp({ lang, base }: { lang: Locale; base: Project[] }) {
  const c = copy[lang];
  const [key, setKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [overrides, setOverrides] = useState<Record<string, ProjectOverride> | null>(null);
  const [error, setError] = useState<"" | "auth" | "offline">("");
  const [slug, setSlug] = useState(base[0]?.slug ?? "");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<"" | "saved" | "failed">("");
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      const k = sessionStorage.getItem(KEY);
      if (k) setKey(k);
    } catch {}
  }, []);

  useEffect(() => {
    if (!key) return;
    start(async () => {
      const r = await loadStudio(key);
      if (!r.ok) {
        setError(r.reason);
        if (r.reason === "auth") {
          setKey(null);
          try {
            sessionStorage.removeItem(KEY);
          } catch {}
        }
        return;
      }
      setError("");
      setOverrides(r.overrides);
      try {
        sessionStorage.setItem(KEY, key);
        localStorage.setItem(OWNER_FLAG, "1");
      } catch {}
    });
  }, [key]);

  const merged = useMemo(
    () => base.map((p) => applyOverride(p, overrides?.[p.slug])).sort((a, b) => a.order - b.order),
    [base, overrides],
  );

  useEffect(() => {
    const p = merged.find((x) => x.slug === slug);
    if (p && overrides) setDraft(toDraft(p));
    setMsg("");
  }, [slug, merged, overrides]);

  if (!key || !overrides) {
    return (
      <form
        className="grid-frame min-h-[70svh] content-center py-24"
        onSubmit={(e) => {
          e.preventDefault();
          if (input) setKey(input);
        }}
      >
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <h1 className="display condensed text-[clamp(2.4rem,6vw,4.5rem)]">{c.title}</h1>
          <label className="mt-10 block text-sm text-dim" htmlFor="studio-key">
            {c.password}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="studio-key"
              type="password"
              autoComplete="current-password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 border border-rule bg-panel px-3 py-2.5 text-ink focus:border-ink"
            />
            <button type="submit" disabled={pending} className="bg-ink px-4 py-2.5 text-sm font-semibold text-screen hover:bg-ch1">
              {c.enter}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {error === "auth" ? c.wrong : c.offline}
            </p>
          )}
        </div>
      </form>
    );
  }

  const setL = (k: (typeof editableText)[number], which: "pt" | "en", v: string) =>
    setDraft((d) => (d ? { ...d, [k]: { ...d[k], [which]: v } } : d));

  const save = () =>
    draft &&
    start(async () => {
      const r = await saveProject(key, slug, draft);
      setMsg(r.ok ? "saved" : "failed");
      if (r.ok) setOverrides((o) => ({ ...(o ?? {}), [slug]: draft }));
    });

  const reset = () =>
    start(async () => {
      const r = await resetProject(key, slug);
      setMsg(r.ok ? "saved" : "failed");
      if (r.ok)
        setOverrides((o) => {
          const n = { ...(o ?? {}) };
          delete n[slug];
          return n;
        });
    });

  const field = "mt-1 w-full border border-rule bg-panel px-3 py-2 text-ink focus:border-ink";

  return (
    <div className="grid-frame gap-y-10 pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <header className="col-span-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display condensed text-[clamp(2.4rem,6vw,4.5rem)]">{c.title}</h1>
          <p className="measure mt-3 text-sm text-dim">{c.intro}</p>
        </div>
        <Link href={`/${lang}/insights`} className="link-quiet text-sm">
          {c.insights}
        </Link>
      </header>

      <nav className="col-span-12 md:col-span-3" aria-label="Projects">
        <ol>
          {merged.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                aria-current={p.slug === slug}
                onClick={() => setSlug(p.slug)}
                className={`rule-b w-full py-3 text-left text-sm ${p.slug === slug ? "text-ink" : "text-dim hover:text-ink"}`}
              >
                <span className="tabular mr-2 text-dim">{String(p.order).padStart(2, "0")}</span>
                {p.title.split(":")[0]}
                {overrides[p.slug] && <span className="ml-2 text-xs text-ch1">{c.edited}</span>}
                {(p as { hidden?: boolean }).hidden && <span className="ml-2 text-xs text-danger">{c.hiddenTag}</span>}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {draft && (
        <form
          className="col-span-12 space-y-6 md:col-span-9"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label className="block text-sm">
            <span className="text-dim">{c.fields.title}</span>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={field} />
          </label>

          {editableText.map((k) => (
            <fieldset key={k} className="grid gap-3 md:grid-cols-2">
              <legend className="mb-1 text-sm text-dim">{c.fields[k]}</legend>
              {(["pt", "en"] as const).map((w) => (
                <label key={w} className="block text-sm">
                  <span className="text-xs uppercase text-dim">{w}</span>
                  <textarea
                    value={draft[k][w]}
                    onChange={(e) => setL(k, w, e.target.value)}
                    rows={k === "subtitle" ? 2 : 4}
                    className={`${field} resize-y`}
                  />
                </label>
              ))}
            </fieldset>
          ))}

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-dim">{c.order}</span>
              <input
                type="number"
                value={draft.order}
                onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) })}
                className="w-20 border border-rule bg-panel px-2 py-1.5"
              />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.featured} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} className="accent-[var(--color-ch1)]" />
              {c.featured}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={draft.hidden} onChange={(e) => setDraft({ ...draft, hidden: e.target.checked })} className="accent-[var(--color-danger)]" />
              {c.hidden}
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-graticule pt-6">
            <button type="submit" disabled={pending} className="bg-ink px-5 py-2.5 text-sm font-semibold text-screen hover:bg-ch1 disabled:opacity-60">
              {pending ? c.saving : c.save}
            </button>
            {overrides[slug] && (
              <button type="button" onClick={reset} disabled={pending} className="border border-rule px-4 py-2.5 text-sm hover:border-ink">
                {c.reset}
              </button>
            )}
            <Link href={`/${lang}/work/${slug}`} className="link-quiet text-sm" target="_blank">
              {c.view}
            </Link>
            {msg && (
              <p role="status" className={`text-sm ${msg === "saved" ? "text-ch1" : "text-danger"}`}>
                {msg === "saved" ? c.saved : c.failed}
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
