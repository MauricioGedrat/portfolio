"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { OWNER_FLAG } from "@/components/analytics";
import { projects } from "@/content/projects";
import type { Locale } from "@/content/types";

const projectTitle = (slug: string) => projects.find((p) => p.slug === slug)?.title.split(":")[0] ?? slug;

type Place = { city: string | null; region: string | null; country: string | null };
type Row = Place & {
  at: string;
  name: string;
  path: string | null;
  target: string | null;
  device: string | null;
  browser: string | null;
  referrer: string | null;
  locale: string | null;
  visitor: string;
};
type Data = {
  totals: {
    visitors: number;
    page_views: number;
    resume_downloads: number;
    project_views: number;
    contact_clicks: number;
    external_clicks: number;
  };
  daily: { day: string; visitors: number; views: number }[];
  cities: (Place & { visitors: number })[];
  referrers: { host: string; visitors: number }[];
  projects: { slug: string; views: number }[];
  devices: { device: string; visitors: number }[];
  downloads: Row[];
  recent: Row[];
};

type Message = { id: number; at: string; name: string; email: string; body: string; locale: string | null; city: string | null; read: boolean };

const KEY = "mg-insights-key";

const copy = {
  pt: {
    title: "Visitas ao portfólio",
    note: "Sem cookies e sem IP salvo. O site sabe a cidade aproximada, de onde a pessoa veio e o que ela fez, mas não o nome de quem visitou.",
    password: "Senha",
    enter: "Entrar",
    wrong: "Senha incorreta.",
    loading: "Carregando…",
    period: "Período",
    days: (n: number) => `${n} dias`,
    visitors: "Visitantes",
    views: "Páginas vistas",
    downloads: "Currículos baixados",
    projects: "Projetos abertos",
    contact: "Cliques no e-mail",
    perDay: "Visitantes por dia",
    cities: "Cidades",
    sources: "De onde vieram",
    direct: "Acesso direto",
    topProjects: "Projetos mais vistos",
    devices: "Dispositivos",
    whoDownloaded: "Quem baixou o currículo",
    recent: "Atividade recente",
    when: "Quando",
    where: "Onde",
    event: "Ação",
    page: "Página",
    from: "Origem",
    device: "Dispositivo",
    lang: "Idioma",
    none: "Nada ainda neste período.",
    unknown: "Desconhecido",
    logout: "Sair",
    messages: "Mensagens",
    noMessages: "Nenhuma mensagem ainda.",
    isNew: "nova",
    reply: "Responder",
    resumeFile: "Currículo",
    estimate: "Visitante = mesma conexão e navegador no mesmo dia.",
    events: {
      page_view: "Abriu página",
      project_view: "Abriu projeto",
      resume_download: "Baixou currículo",
      contact_click: "Clicou no e-mail",
      contact_submit: "Enviou mensagem",
      cta_click: "Clicou em Ver trabalhos",
      external_link_click: "Saiu por link",
      locale_switch: "Trocou idioma",
    } as Record<string, string>,
  },
  en: {
    title: "Portfolio visits",
    note: "No cookies and no stored IP. The site knows the approximate city, where the visitor came from and what they did — not who they are.",
    password: "Password",
    enter: "Enter",
    wrong: "Wrong password.",
    loading: "Loading…",
    period: "Period",
    days: (n: number) => `${n} days`,
    visitors: "Visitors",
    views: "Page views",
    downloads: "Resume downloads",
    projects: "Projects opened",
    contact: "E-mail clicks",
    perDay: "Visitors per day",
    cities: "Cities",
    sources: "Where they came from",
    direct: "Direct",
    topProjects: "Most viewed projects",
    devices: "Devices",
    whoDownloaded: "Who downloaded the resume",
    recent: "Recent activity",
    when: "When",
    where: "Where",
    event: "Action",
    page: "Page",
    from: "From",
    device: "Device",
    lang: "Language",
    none: "Nothing yet in this period.",
    unknown: "Unknown",
    logout: "Log out",
    messages: "Messages",
    noMessages: "No messages yet.",
    isNew: "new",
    reply: "Reply",
    resumeFile: "Resume",
    estimate: "Visitor = same connection and browser on the same day.",
    events: {
      page_view: "Opened page",
      project_view: "Opened project",
      resume_download: "Downloaded resume",
      contact_click: "Clicked e-mail",
      contact_submit: "Sent a message",
      cta_click: "Clicked See work",
      external_link_click: "Left via link",
      locale_switch: "Switched language",
    } as Record<string, string>,
  },
};

const fmtWhen = (iso: string, lang: Locale) =>
  new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));

const place = (p: Place, unknown: string) =>
  [p.city, p.region, p.country].filter(Boolean).join(", ") || unknown;

export function InsightsApp({ lang }: { lang: Locale }) {
  const c = copy[lang];
  const [key, setKey] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "wrong">("idle");
  const [messages, setMessages] = useState<Message[] | null>(null);

  useEffect(() => {
    try {
      setKey(sessionStorage.getItem(KEY));
    } catch {}
  }, []);

  const load = useCallback(async (k: string, d: number) => {
    setState("loading");
    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k, days: d }),
    });
    if (!res.ok) {
      setState("wrong");
      setKey(null);
      try {
        sessionStorage.removeItem(KEY);
      } catch {}
      return;
    }
    setData(await res.json());
    setState("idle");
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: k }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => m && setMessages((prev) => prev ?? m))
      .catch(() => {});
    try {
      sessionStorage.setItem(KEY, k);
      localStorage.setItem(OWNER_FLAG, "1");
    } catch {}
  }, []);

  useEffect(() => {
    if (key) load(key, days);
  }, [key, days, load]);

  if (!key || (!data && state === "wrong")) {
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
          <label className="mt-10 block text-sm text-dim" htmlFor="insights-key">
            {c.password}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="insights-key"
              type="password"
              autoComplete="current-password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 border border-rule bg-panel px-3 py-2.5 text-ink focus:border-ink"
            />
            <button type="submit" className="bg-ink px-4 py-2.5 text-sm font-semibold text-screen hover:bg-ch1">
              {c.enter}
            </button>
          </div>
          {state === "wrong" && (
            <p role="alert" className="mt-3 text-sm text-danger">
              {c.wrong}
            </p>
          )}
        </div>
      </form>
    );
  }

  if (!data) return <p className="grid-frame py-40 text-dim">{c.loading}</p>;

  const t = data.totals;
  return (
    <div className="grid-frame gap-y-16 pb-24 pt-[calc(var(--nav-h)+3rem)]">
      <header className="col-span-12 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display condensed text-[clamp(2.4rem,6vw,4.5rem)]">{c.title}</h1>
          <p className="measure mt-4 text-sm text-dim">{c.note}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div role="group" aria-label={c.period} className="flex border border-rule">
            {[7, 30, 90].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={days === n}
                onClick={() => setDays(n)}
                className={`px-3 py-2 ${days === n ? "bg-ink text-screen" : "text-dim hover:text-ink"}`}
              >
                {c.days(n)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="text-dim hover:text-ink"
            onClick={() => {
              try {
                sessionStorage.removeItem(KEY);
              } catch {}
              setKey(null);
              setData(null);
              setInput("");
            }}
          >
            {c.logout}
          </button>
        </div>
      </header>

      <dl
        className={`col-span-12 grid grid-cols-2 gap-px bg-graticule md:grid-cols-5 ${state === "loading" ? "opacity-60" : ""}`}
      >
        {[
          [c.visitors, t.visitors],
          [c.views, t.page_views],
          [c.downloads, t.resume_downloads],
          [c.projects, t.project_views],
          [c.contact, t.contact_clicks],
        ].map(([label, value]) => (
          <div key={label} className="bg-screen py-5 pr-4 md:px-5 md:first:pl-0">
            <dt className="text-sm text-dim">{label}</dt>
            <dd className="tabular mt-1 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-none">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="col-span-12">
        <h2 className="text-sm text-dim">{c.perDay}</h2>
        <DailyBars daily={data.daily} lang={lang} labels={{ visitors: c.visitors, views: c.views }} />
        <p className="mt-2 text-xs text-dim">{c.estimate}</p>
      </section>

      <div className="col-span-12 grid gap-x-[var(--gutter)] gap-y-12 md:grid-cols-2">
        <RankList
          title={c.cities}
          empty={c.none}
          rows={data.cities.map((r) => ({ label: place(r, c.unknown), value: r.visitors }))}
        />
        <RankList
          title={c.sources}
          empty={c.none}
          rows={data.referrers.map((r) => ({ label: r.host || c.direct, value: r.visitors }))}
        />
        <RankList title={c.topProjects} empty={c.none} rows={data.projects.map((r) => ({ label: projectTitle(r.slug), value: r.views }))} />
        <RankList title={c.devices} empty={c.none} rows={data.devices.map((r) => ({ label: r.device, value: r.visitors }))} />
      </div>

      <section className="col-span-12">
        <h2 className="text-sm text-dim">
          {c.messages}
          {messages && messages.some((m) => !m.read) && (
            <span className="ml-2 bg-ch1 px-1.5 py-0.5 text-xs font-semibold text-screen">
              {messages.filter((m) => !m.read).length} {c.isNew}
            </span>
          )}
        </h2>
        {!messages || messages.length === 0 ? (
          <p className="mt-3 text-sm text-dim">{c.noMessages}</p>
        ) : (
          <ol className="mt-3">
            {messages.map((m) => (
              <li key={m.id} className="rule-b grid gap-x-[var(--gutter)] gap-y-1 py-4 md:grid-cols-12">
                <div className="text-sm md:col-span-3">
                  <p className="font-semibold">
                    {m.name}
                    {!m.read && <span className="ml-2 text-xs text-ch1">{c.isNew}</span>}
                  </p>
                  <p className="tabular text-dim">{fmtWhen(m.at, lang)}</p>
                  {m.city && <p className="text-dim">{m.city}</p>}
                </div>
                <p className="whitespace-pre-wrap md:col-span-7">{m.body}</p>
                <div className="text-sm md:col-span-2 md:text-right">
                  <a href={`mailto:${m.email}`} className="link-quiet">
                    {c.reply}
                  </a>
                  <p className="break-all text-dim">{m.email}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <EventTable
        title={c.whoDownloaded}
        rows={data.downloads}
        lang={lang}
        cols={[c.when, c.where, c.from, c.device, c.lang]}
        cells={(r) => [
          fmtWhen(r.at, lang),
          place(r, c.unknown),
          r.referrer || c.direct,
          [r.device, r.browser].filter(Boolean).join(" · "),
          (r.target || r.locale || "").toUpperCase(),
        ]}
        empty={c.none}
      />

      <EventTable
        title={c.recent}
        rows={data.recent}
        lang={lang}
        cols={[c.when, c.event, c.page, c.where, c.from]}
        cells={(r) => [
          fmtWhen(r.at, lang),
          c.events[r.name] ?? r.name,
          r.name === "resume_download"
            ? `${c.resumeFile} (${(r.target ?? "").toUpperCase()})`
            : r.name === "project_view" && r.target
              ? projectTitle(r.target)
              : r.target && r.name !== "page_view"
                ? `${r.path ?? ""} → ${r.target}`
                : (r.path ?? ""),
          place(r, c.unknown),
          r.referrer || "—",
        ]}
        empty={c.none}
      />
    </div>
  );
}

function DailyBars({
  daily,
  lang,
  labels,
}: {
  daily: Data["daily"];
  lang: Locale;
  labels: { visitors: string; views: string };
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-GB", { day: "2-digit", month: "short", timeZone: "UTC" }),
    [lang],
  );
  const h = 160;
  const n = daily.length || 1;
  const gap = 2;
  return (
    <div className="relative mt-4">
      <svg
        viewBox={`0 0 ${n * 10} ${h}`}
        preserveAspectRatio="none"
        className="block h-40 w-full"
        role="img"
        aria-label={daily.map((d) => `${fmt.format(new Date(d.day))}: ${d.visitors}`).join(", ")}
        onMouseLeave={() => setHover(null)}
      >
        <line x1="0" x2={n * 10} y1={h - 0.5} y2={h - 0.5} stroke="var(--color-rule)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {daily.map((d, i) => {
          const bh = d.visitors ? Math.max(2, (d.visitors / max) * (h - 8)) : 0;
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)}>
              <rect x={i * 10} y={0} width={10} height={h} fill="transparent" />
              <rect
                x={i * 10 + gap / 2}
                y={h - bh}
                width={10 - gap}
                height={bh}
                rx="1"
                fill={hover === i ? "var(--color-ch1)" : "var(--color-dim)"}
              />
            </g>
          );
        })}
      </svg>
      {hover !== null && daily[hover] && (
        <div
          className="pointer-events-none absolute -top-2 -translate-x-1/2 -translate-y-full border border-rule bg-panel px-3 py-2 text-xs"
          style={{ left: `${((hover + 0.5) / n) * 100}%` }}
        >
          <p className="text-dim">{fmt.format(new Date(daily[hover].day))}</p>
          <p className="tabular">
            {labels.visitors}: {daily[hover].visitors} · {labels.views}: {daily[hover].views}
          </p>
        </div>
      )}
      {daily.length > 0 && (
        <div className="mt-2 flex justify-between text-xs text-dim">
          <span>{fmt.format(new Date(daily[0].day))}</span>
          <span>{fmt.format(new Date(daily[daily.length - 1].day))}</span>
        </div>
      )}
    </div>
  );
}

function RankList({ title, rows, empty }: { title: string; rows: { label: string; value: number }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section>
      <h2 className="text-sm text-dim">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-dim">{empty}</p>
      ) : (
        <ol className="mt-3">
          {rows.map((r) => (
            <li key={r.label} className="rule-b py-2">
              <div className="flex justify-between gap-4 text-sm">
                <span className="truncate">{r.label}</span>
                <span className="tabular text-dim">{r.value}</span>
              </div>
              <div className="mt-1.5 h-[3px] rounded-r-full bg-dim/70" style={{ width: `${(r.value / max) * 100}%` }} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function EventTable({
  title,
  rows,
  cols,
  cells,
  empty,
}: {
  title: string;
  rows: Row[];
  lang: Locale;
  cols: string[];
  cells: (r: Row) => string[];
  empty: string;
}) {
  return (
    <section className="col-span-12">
      <h2 className="text-sm text-dim">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-dim">{empty}</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="rule-b text-dim">
                {cols.map((h) => (
                  <th key={h} scope="col" className="py-2 pr-4 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.at}-${i}`} className="rule-b">
                  {cells(r).map((v, j) => (
                    <td key={j} className={`py-2 pr-4 ${j === 0 ? "tabular whitespace-nowrap text-dim" : ""}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
