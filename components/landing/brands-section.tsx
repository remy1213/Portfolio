"use client";

import { brands, sectionText } from "@/lib/content";
import { Reveal } from "@/components/gsap/animate";

export function BrandsSection() {
  if (brands.length === 0) return null;

  // Content is duplicated so the -50% translate loops seamlessly.
  const row = [...brands, ...brands];

  return (
    <section className="relative py-14 lg:py-32 bg-black text-white border-t border-white/5 overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-8 lg:mb-14">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em]">
            <span className="w-8 h-px bg-white/30" />
            04 — {sectionText.brandsLabel}
          </span>
        </Reveal>
      </div>

      {/* Single rolling row with edge fades */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden py-4">
          <div className="flex w-max items-center marquee">
            {row.map((brand, i) => (
              <span key={brand.name + i} className="flex items-center shrink-0">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-16 lg:h-24 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-500 mx-10 lg:mx-16"
                  />
                ) : (
                  <span className="text-4xl lg:text-7xl font-display text-white/35 hover:text-white transition-colors duration-500 whitespace-nowrap mx-10 lg:mx-16">
                    {brand.name}
                  </span>
                )}
                <span className="text-white/15 text-2xl lg:text-4xl select-none" aria-hidden="true">
                  ✦
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
