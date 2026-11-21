"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, localizedPath, locales, type Locale } from "@/lib/i18n";

/**
 * PT / EN toggle. Keeps the visitor on the same page and section, and
 * remembers the choice for a year so the redirect on "/" respects it.
 */
export function LocaleSwitch({ lang, label, switchTo }: { lang: Locale; label: string; switchTo: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const go = (to: Locale) => {
    if (to === lang) return;
    document.cookie = `${LOCALE_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
    router.push(localizedPath(pathname, to) + window.location.hash, { scroll: false });
  };

  return (
    <div role="group" aria-label={label} className="flex items-center text-sm">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span aria-hidden className="px-1 text-rule">/</span>}
          <button
            type="button"
            lang={l === "pt" ? "pt-BR" : "en"}
            onClick={() => go(l)}
            data-track={l === lang ? undefined : "locale_switch"}
            data-track-target={l}
            aria-pressed={l === lang}
            title={l === lang ? undefined : switchTo}
            className={`px-0.5 py-2 uppercase transition-colors duration-[var(--dur-fast)] ${
              l === lang ? "text-ink" : "text-dim hover:text-ink"
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
