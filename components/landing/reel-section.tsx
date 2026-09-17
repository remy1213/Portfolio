"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { reelClips, sectionText } from "@/lib/content";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

/**
 * Auto-playing clip carousel: the centered clip plays at full brightness
 * while its neighbors sit dimmed beside it. When a clip finishes it
 * advances to the next automatically; arrows and swiping work everywhere.
 */
export function ReelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: reelClips.length > 2,
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);
  const [inView, setInView] = useState(false);

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Only run the show while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The centered clip plays; everything else pauses.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === selected && inView) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [selected, inView]);

  // When the active clip ends, move to the next one (wrap at the end).
  const advance = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) emblaApi.scrollNext();
    else emblaApi.scrollTo(0);
  }, [emblaApi]);

  if (reelClips.length === 0) return null;

  const navBtn =
    "absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-colors";

  return (
    <section
      id="reel"
      ref={sectionRef}
      className="relative py-14 lg:py-28 bg-black text-white border-t border-white/5 overflow-hidden"
    >
      {/* Header */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 mb-8 lg:mb-14">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
            <span className="w-8 h-px bg-white/30" />
            03 — {sectionText.reelLabel}
          </span>
        </Reveal>
        <SplitReveal
          text={sectionText.reelHeading}
          className="text-[clamp(2rem,5vw,4.5rem)] font-display leading-[0.95] tracking-tight"
        />
      </div>

      {/* Carousel */}
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex items-center touch-pan-y">
            {reelClips.map((clip, i) => {
              const active = i === selected;
              return (
                <div
                  key={clip.src + i}
                  className="shrink-0 min-w-0 px-2 sm:px-3 lg:px-4"
                  onClick={() => !active && emblaApi?.scrollTo(i)}
                >
                  <figure
                    className={`relative transition-all duration-500 ease-out ${
                      active
                        ? "opacity-100 scale-100"
                        : "opacity-30 scale-[0.94] cursor-pointer hover:opacity-50"
                    }`}
                  >
                    <div
                      className={`h-[320px] sm:h-[440px] lg:h-[560px] rounded-lg overflow-hidden bg-white/5 ring-1 transition-shadow duration-500 ${
                        active
                          ? "ring-white/30 shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
                          : "ring-white/10"
                      }`}
                    >
                      <video
                        ref={(el) => {
                          videoRefs.current[i] = el;
                        }}
                        src={`${clip.src}#t=0.1`}
                        muted
                        playsInline
                        preload="metadata"
                        onEnded={active ? advance : undefined}
                        draggable={false}
                        className="h-full w-auto min-w-[120px] max-w-none object-cover select-none"
                      />
                    </div>

                    {/* Label — only on the active clip */}
                    {clip.label && (
                      <figcaption
                        className={`absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/85 to-transparent px-4 pb-3.5 pt-10 pointer-events-none transition-opacity duration-500 ${
                          active ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-mono text-white/85">{clip.label}</span>
                      </figcaption>
                    )}
                  </figure>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overlay arrows */}
        {reelClips.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous clip"
              className={`${navBtn} left-3 lg:left-10`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next clip"
              className={`${navBtn} right-3 lg:right-10`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Position dots */}
      {reelClips.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-8">
          {reelClips.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to clip ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === selected ? "w-6 bg-white" : "w-1.5 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
