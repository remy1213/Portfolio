"use client";

import { profile } from "@/lib/content";

/**
 * Rolling strip of the hero's rotating words — a visual divider between
 * the hero and the work section. Content comes from the same editable
 * word list as the hero headline.
 */
export function WordsMarquee() {
  const words = profile.heroWords.length > 0 ? profile.heroWords : ["Videography"];
  // Repeat until one half is comfortably wider than any viewport, then
  // duplicate it so the -50% translate loops seamlessly.
  const repeats = Math.max(1, Math.ceil(12 / words.length));
  const half = Array(repeats).fill(words).flat() as string[];
  const row = [...half, ...half];

  return (
    <div aria-hidden="true" className="relative bg-black border-y border-white/5 py-6 lg:py-8 overflow-hidden">
      <div className="flex w-max items-center marquee-reverse">
        {row.map((word, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span className="mx-6 lg:mx-10 text-2xl lg:text-4xl font-display uppercase tracking-wide text-white/20 whitespace-nowrap">
              {word}
            </span>
            <span className="text-white/10 text-lg select-none">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
