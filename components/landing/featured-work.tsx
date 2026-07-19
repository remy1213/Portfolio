"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredWork, sectionText, isVerticalVideoUrl, type FeaturedItem } from "@/lib/content";
import { FitText } from "@/components/ui/fit-text";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

/**
 * Preview video that only loads and plays while near the viewport,
 * and loops between the configured start/end points.
 */
function LazyPreviewVideo({
  item,
  className,
  onOrientation,
}: {
  item: FeaturedItem;
  className?: string;
  onOrientation?: (vertical: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;
    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, shouldLoad]);

  // Loop range: if the file is already cropped shorter than the configured
  // end point, loop the whole file; otherwise loop between start and end.
  const getRange = (video: HTMLVideoElement) => {
    const duration = video.duration || 0;
    const start = item.videoPreviewStart ?? 0;
    const end = item.videoPreviewEnd;
    const isPreCropped = end !== undefined && duration > 0.1 && duration < end;
    return {
      start: isPreCropped ? 0 : Math.min(start, Math.max(0, duration - 0.05)),
      end: isPreCropped ? undefined : end,
    };
  };

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? item.videoPreview : undefined}
      poster={item.img || undefined}
      muted
      playsInline
      preload="none"
      loop={item.videoPreviewEnd === undefined}
      className={className}
      onLoadedMetadata={(e) => {
        const video = e.currentTarget;
        if (video.videoWidth > 0) onOrientation?.(video.videoHeight > video.videoWidth);
        const { start } = getRange(video);
        if (start > 0) video.currentTime = start;
        if (inView) video.play().catch(() => {});
      }}
      onTimeUpdate={(e) => {
        const video = e.currentTarget;
        const { start, end } = getRange(video);
        if (end !== undefined && video.currentTime + 0.12 >= end) {
          video.currentTime = start;
          video.play().catch(() => {});
        }
      }}
      onEnded={(e) => {
        const video = e.currentTarget;
        const { start } = getRange(video);
        video.currentTime = start;
        video.play().catch(() => {});
      }}
    />
  );
}

/**
 * Square work card. On desktop hover the media box expands toward the
 * video's real orientation — vertical clips grow taller (≈4:5), landscape
 * clips grow wider (≈5:4) — floating over neighboring cards.
 */
function WorkCard({ item, index }: { item: FeaturedItem; index: number }) {
  // Initial guess from the YouTube link (Shorts = vertical); refined with
  // the preview video's actual dimensions once its metadata loads.
  const [vertical, setVertical] = useState(isVerticalVideoUrl(item.videoUrl));

  const expandClasses = vertical
    ? "md:group-hover:-top-[13%] md:group-hover:-bottom-[13%]"
    : "md:group-hover:-left-[13%] md:group-hover:-right-[13%]";

  return (
    <Link href={`/work/${item.slug}`} className="group relative block aspect-square md:hover:z-20">
      <div
        className={`absolute inset-0 overflow-hidden rounded-lg bg-white/5 border border-white/10 transition-all duration-500 ease-out md:group-hover:border-white/40 md:group-hover:scale-[1.045] md:group-hover:shadow-[0_35px_90px_rgba(0,0,0,0.85)] ${expandClasses}`}
      >
        {/* Media */}
        {item.videoPreview ? (
          <LazyPreviewVideo
            item={item}
            onOrientation={setVertical}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-[1.06]"
          />
        ) : item.img ? (
          <img
            src={item.img}
            alt={item.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 font-mono text-sm">
            No media
          </div>
        )}

        {/* Index — always visible, top left */}
        <span className="absolute top-5 left-5 text-xs font-mono text-white/50 z-10">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Title overlay — always visible on mobile, revealed on hover on desktop */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 lg:p-8 transition-opacity duration-500 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
          <div className="transition-transform duration-500 ease-out pointer-fine:translate-y-3 pointer-fine:group-hover:translate-y-0">
            <h3 className="text-2xl lg:text-3xl font-display tracking-tight mb-1.5">
              {item.title}
            </h3>
            <div className="flex items-center gap-2.5 text-xs font-mono text-white/50 uppercase tracking-wider">
              {item.client && <span>{item.client}</span>}
              {item.client && item.date && <span className="text-white/25">/</span>}
              {item.date && <span>{item.date}</span>}
              <ArrowUpRight className="w-3.5 h-3.5 ml-auto text-white/70" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedWork() {
  const items = featuredWork;

  return (
    <section id="work" className="relative py-28 lg:py-40 bg-black text-white overflow-hidden">
      {/* Ghost watermark — oversized and centered, bleeding evenly off both edges */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute top-8 inset-x-0 flex justify-center">
        <FitText text={sectionText.workLabel} scale={1.4} className="font-display text-white/[0.05]" />
      </div>

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-16 lg:mb-24">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
              <span className="w-8 h-px bg-white/30" />
              01 — {sectionText.workLabel}
            </span>
          </Reveal>
          <SplitReveal
            text={sectionText.workHeading}
            className="text-[clamp(2.5rem,7vw,6rem)] font-display leading-[0.95] tracking-tight"
          />
        </div>

        {/* Square grid — on hover (desktop) the media box grows toward the
            video's real orientation and floats over its neighbors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
          {items.map((item, i) => (
            // relative + hover z on the wrapper: the reveal animation leaves a
            // transform on it, making it a stacking context — the hovered card
            // must outrank sibling WRAPPERS, not just sibling cards.
            <Reveal key={item.slug} delay={(i % 2) * 0.08} y={56} className="relative md:hover:z-30">
              <WorkCard item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
