"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { sectionNumber, sections, type SectionId } from "@/lib/sections";
import { LocaleSwitch } from "./locale-switch";

/**
 * Fixed compact navigation.
 * - On the home page it follows the scroll and marks the section in view.
 * - It gets a hairline only after the hero, so it never competes with it.
 * - On small screens the links collapse into a full-screen sheet.
 */
export function Nav({ lang, d }: { lang: Locale; d: Dictionary }) {
  const pathname = usePathname();
  const isHome = pathname === `/${lang}`;
  const [active, setActive] = useState<SectionId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy: the section crossing the upper third of the viewport is active.
  useEffect(() => {
    if (!isHome) {
      setActive(null);
      return;
    }
    const els = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: "-30% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onTop = () => window.scrollY < window.innerHeight * 0.4 && setActive(null);
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [isHome]);

  // Sheet: close on Escape, lock page scroll while open, return focus to the button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    const button = menuButton.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      button?.focus();
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const href = (id: SectionId) => (isHome ? `#${id}` : `/${lang}#${id}`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 h-[var(--nav-h)] transition-[background-color,border-color] duration-[var(--dur-base)] ${
        scrolled || open ? "border-b border-graticule bg-screen" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[96rem] items-center justify-between px-[var(--gutter)]">
        <Link href={`/${lang}`} className="text-sm font-semibold tracking-tight" aria-label={`${d.nav.home} — Maurício Gedrat`}>
          Maurício Gedrat
        </Link>

        <nav aria-label={d.nav.label} className="hidden lg:block">
          <ul className="flex items-center gap-6 text-sm">
            {sections.map((id) => {
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={href(id)}
                    aria-current={isActive ? "location" : undefined}
                    className={`group relative flex items-baseline gap-1.5 py-2 transition-colors duration-[var(--dur-fast)] ${
                      isActive ? "text-ink" : "text-dim hover:text-ink"
                    }`}
                  >
                    <span className="tabular text-xs text-dim">{sectionNumber(id)}</span>
                    {d.nav.sections[id]}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 -bottom-px h-px origin-left bg-ch1 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitch lang={lang} label={d.locale.label} switchTo={d.locale.switchTo} />
          <button
            ref={menuButton}
            type="button"
            className="py-2 text-sm lg:hidden"
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? d.nav.close : d.nav.menu}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="nav-sheet"
          aria-label={d.nav.label}
          className="fixed inset-x-0 bottom-0 top-[var(--nav-h)] overflow-y-auto bg-screen px-[var(--gutter)] pb-10 pt-6 lg:hidden"
        >
          <ul>
            {sections.map((id) => (
              <li key={id} className="border-b border-graticule">
                <a
                  href={href(id)}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 py-4 text-xl font-semibold condensed"
                >
                  <span className="tabular text-sm font-normal text-dim">{sectionNumber(id)}</span>
                  {d.nav.sections[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
