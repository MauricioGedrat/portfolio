import { sectionNumber, type SectionId } from "@/lib/sections";

/** Section opener: position number on the hairline, title in condensed display type. */
export function SectionHeading({ id, title, intro }: { id: SectionId; title: string; intro?: string }) {
  return (
    <div className="col-span-12 grid grid-cols-12 gap-x-[var(--gutter)] border-t border-graticule pt-5">
      <span className="tabular col-span-2 text-sm text-dim md:col-span-1">{sectionNumber(id)}</span>
      <div className="col-span-10 md:col-span-11">
        <h2 id={`${id}-title`} className="display condensed text-[clamp(2.6rem,7vw,6rem)]">
          {title}
        </h2>
        {intro && <p className="measure mt-5 text-dim">{intro}</p>}
      </div>
    </div>
  );
}
