"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { TrackEvent } from "@/lib/track-events";

/** Visitors who open /insights once are marked so their own visits don't count. */
export const OWNER_FLAG = "mg-owner";

function isOwner() {
  try {
    return localStorage.getItem(OWNER_FLAG) === "1";
  } catch {
    return false;
  }
}

export function track(name: TrackEvent, extra: { target?: string } = {}) {
  if (isOwner()) return;
  const body = JSON.stringify({
    name,
    path: location.pathname,
    locale: document.documentElement.lang.startsWith("pt") ? "pt" : "en",
    referrer: document.referrer,
    ...extra,
  });
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/track", blob)) {
    fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
      () => {},
    );
  }
}

/**
 * Page views on every route change, plus clicks on anything marked
 * data-track="<event>" and on links that leave the site.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.includes("/insights")) return;
    track("page_view");
    const m = pathname.match(/\/work\/([^/]+)/);
    if (m) track("project_view", { target: m[1] });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button");
      if (!el) return;
      const marked = el.getAttribute("data-track") as TrackEvent | null;
      const href = el.getAttribute("href") ?? "";
      if (marked) {
        track(marked, { target: el.getAttribute("data-track-target") ?? href });
      } else if (href.startsWith("mailto:")) {
        track("contact_click", { target: "email" });
      } else if (/^https?:\/\//.test(href) && !href.includes(location.host)) {
        try {
          track("external_link_click", { target: new URL(href).hostname.replace(/^www\./, "") });
        } catch {}
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
