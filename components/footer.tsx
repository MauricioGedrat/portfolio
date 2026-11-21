import type { Dictionary, Locale } from "@/lib/i18n";
import { profile } from "@/content/profile";

/** Cached at build time: the site is rebuilt on every deploy. */
async function currentYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function Footer({ lang, d }: { lang: Locale; d: Dictionary }) {
  const year = await currentYear();
  return (
    <footer data-print-hide className="border-t border-graticule">
      <div className="grid-frame gap-y-6 py-10 text-sm text-dim">
        <p className="col-span-12 md:col-span-6">{d.footer.built}</p>
        <ul className="col-span-12 flex flex-wrap gap-x-6 gap-y-2 md:col-span-6 md:justify-end">
          <li>
            <a className="link-quiet hover:text-ink" href={profile.links.github} rel="me noopener" target="_blank">
              GitHub
            </a>
          </li>
          <li>
            <a className="link-quiet hover:text-ink" href={profile.links.linkedin} rel="me noopener" target="_blank">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="link-quiet hover:text-ink" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </li>
          <li className="tabular">© {year}</li>
          <li>{profile.location[lang]}</li>
        </ul>
      </div>
    </footer>
  );
}
