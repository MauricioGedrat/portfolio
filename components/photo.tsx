"use client";

import Image, { type ImageLoaderProps } from "next/image";
import type { Locale } from "@/content/types";
import { photos, type PhotoKey } from "@/lib/photos";

const loader = ({ src, width, quality }: ImageLoaderProps) =>
  `https://images.unsplash.com/${src}?w=${width}&q=${quality ?? 72}&auto=format&fit=crop`;

/** An Unsplash photo served by Unsplash's own CDN (resized and converted there). */
export function Photo({
  name,
  lang,
  className = "",
  sizes = "100vw",
  priority = false,
  decorative = true,
}: {
  name: PhotoKey;
  lang: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  const ph = photos[name];
  return (
    <Image
      loader={loader}
      src={ph.id}
      width={ph.w}
      height={ph.h}
      sizes={sizes}
      alt={decorative ? "" : ph.alt[lang]}
      priority={priority}
      className={className}
    />
  );
}
