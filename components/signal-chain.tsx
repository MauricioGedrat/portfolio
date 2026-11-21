import type { ChainNode, Locale } from "@/content/types";
import { t } from "@/lib/i18n";

/**
 * A project's system as a signal chain: each block feeds the next.
 * Horizontal on wide screens, vertical on phones. `compact` is the
 * one-line version used in the work index.
 */
export function SignalChain({ nodes, lang, compact = false }: { nodes: ChainNode[]; lang: Locale; compact?: boolean }) {
  if (compact) {
    return (
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-dim" aria-label="Signal chain">
        {nodes.map((n, i) => (
          <li key={n.id} className="flex items-center gap-2">
            {i > 0 && <Arrow />}
            {t(n.label, lang)}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="grid gap-px bg-graticule md:auto-cols-fr md:grid-flow-col">
      {nodes.map((n, i) => (
        <li key={n.id} className="relative bg-screen p-5 md:min-h-40">
          <span className="tabular text-xs text-dim">{String(i + 1).padStart(2, "0")}</span>
          <p className="mt-6 text-lg font-semibold leading-tight condensed">{t(n.label, lang)}</p>
          {n.detail && <p className="mt-1 text-sm text-dim">{t(n.detail, lang)}</p>}
        </li>
      ))}
    </ol>
  );
}

function Arrow() {
  return (
    <svg width="18" height="8" viewBox="0 0 18 8" aria-hidden className="text-rule">
      <path d="M0 4h16M13 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
