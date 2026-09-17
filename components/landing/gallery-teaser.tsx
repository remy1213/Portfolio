"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { photos, sectionText } from "@/lib/content";
import { Reveal, SplitReveal, Parallax } from "@/components/gsap/animate";

// Scatter layout for the three preview photos behind the button —
// kept tight so the spread reads full, not sparse.
const SCATTER = [
  { left: "3%", top: "6%", w: "36%", rotate: -2.5, speed: 0.06 },
  { left: "33%", top: "22%", w: "34%", rotate: 1.5, speed: 0.1 },
  { left: "63%", top: "4%", w: "34%", rotate: -1.5, speed: 0.08 },
];

/**
 * Home-page teaser for the gallery: section text, then a spread of photos
 * with a big "view gallery" button floating over them.
 */
export function GalleryTeaser() {
  if (photos.length === 0) return null;
  const preview = photos.slice(0, SCATTER.length);

  return (
    <section id="stills" className="relative py-28 lg:py-36 bg-black text-white border-t border-white/5 overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        {/* Text */}
        <div className="mb-14 lg:mb-20 max-w-3xl">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
              <span className="w-8 h-px bg-white/30" />
              02 — {sectionText.stillsLabel}
            </span>
          </Reveal>
          <SplitReveal
            text={sectionText.stillsHeading}
            className="text-[clamp(2rem,5vw,4.5rem)] font-display leading-[0.95] tracking-tight mb-6"
          />
          <Reveal delay={0.15}>
            <p className="text-white/50 leading-relaxed max-w-xl">{sectionText.stillsBlurb}</p>
          </Reveal>
        </div>

        {/* Photo spread with the button floating over it */}
        <Reveal delay={0.1}>
          <Link
            href="/gallery"
            className="group relative block h-[320px] lg:h-[420px] rounded-lg overflow-hidden border border-white/10 hover:border-white/25 transition-colors duration-500"
          >
            {preview.map((photo, i) => {
              const pos = SCATTER[i];
              return (
                <div
                  key={photo.src + i}
                  className="absolute"
                  style={{ left: pos.left, top: pos.top, width: pos.w, rotate: `${pos.rotate}deg` }}
                >
                  <Parallax speed={pos.speed}>
                    <div className="rounded-md overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)] opacity-70 group-hover:opacity-90 transition-opacity duration-700">
                      <img
                        src={photo.src}
                        alt={photo.caption || `Still ${i + 1}`}
                        loading="lazy"
                        className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  </Parallax>
                </div>
              );
            })}

            {/* Dark wash + centered button */}
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-sm font-medium shadow-2xl transition-all duration-500 group-hover:gap-4 group-hover:scale-105">
                {sectionText.stillsButton}
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-white/60 uppercase tracking-[0.25em]">
                {photos.length} photos
              </span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
