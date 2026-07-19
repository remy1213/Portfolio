"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { showcasePhoto } from "@/lib/content";
import { gsap, Reveal } from "@/components/gsap/animate";

/**
 * Featured-still comparison. The detail crop starts tucked behind the base
 * photo and slides out as you scroll, settling into a clean side-by-side:
 * full frame on the left, magnified detail on the right. Both are light,
 * pre-rendered images; both frames follow the photo's natural orientation.
 */
export function PhotoZoomSection() {
  const sp = showcasePhoto;
  const sectionRef = useRef<HTMLElement>(null);
  const baseWrapRef = useRef<HTMLElement>(null);
  const detailWrapRef = useRef<HTMLElement>(null);
  const [ratio, setRatio] = useState<number>(1.5);

  // Measure the photo's aspect eagerly so the layout is right from the start.
  useEffect(() => {
    if (!sp?.image) return;
    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalWidth > 0) setRatio(probe.naturalWidth / probe.naturalHeight);
    };
    probe.src = sp.preview || sp.image;
  }, [sp?.image, sp?.preview]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const base = baseWrapRef.current;
    const detail = detailWrapRef.current;
    if (!section || !base || !sp?.image) return;

    const mm = gsap.matchMedia();

    if (detail) {
      // Desktop: the pair starts stacked in the middle, then slides apart.
      mm.add("(min-width: 640px)", () => {
        const st = {
          trigger: section,
          start: "top 75%",
          end: "center 45%",
          scrub: 1,
        };
        gsap.fromTo(base, { xPercent: 54 }, { xPercent: 0, ease: "none", scrollTrigger: st });
        gsap.fromTo(
          detail,
          { xPercent: -54, scale: 0.9, rotate: -2, autoAlpha: 0.6 },
          { xPercent: 0, scale: 1, rotate: 0, autoAlpha: 1, ease: "none", scrollTrigger: st }
        );
      });
      // Mobile (stacked vertically): the detail fades in and rises.
      mm.add("(max-width: 639px)", () => {
        gsap.fromTo(
          detail,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: detail, start: "top 88%", once: true },
          }
        );
      });
    } else {
      mm.add("all", () => {
        gsap.fromTo(
          base,
          { scale: 1.06 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 80%", end: "center 45%", scrub: 1 },
          }
        );
      });
    }
    return () => mm.revert();
  }, [sp?.image, sp?.zoomImage]);

  if (!sp?.image) return null;

  const baseImage = sp.preview || sp.image;
  const pair = Boolean(sp.zoomImage);

  // Sized via a CSS variable so mobile/desktop caps can live in classes:
  // phones get most of the viewport width, desktop fits both frames side by side.
  const frameClass = `relative overflow-hidden rounded-lg bg-white/5 border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.7)] [aspect-ratio:var(--r)] h-[min(52vh,calc(86vw/var(--r)))] ${
    pair ? "sm:h-[min(64vh,calc(41vw/var(--r)))]" : "sm:h-[min(72vh,calc(80vw/var(--r)))]"
  }`;
  const frameStyle = { ["--r" as string]: String(ratio) };

  const tag =
    "absolute bottom-2.5 left-3.5 text-[10px] font-mono uppercase tracking-[0.25em] text-white/70 bg-black/40 backdrop-blur px-2 py-1 rounded";

  return (
    <section ref={sectionRef} className="relative py-16 lg:py-24 bg-black text-white overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-10">
            <span className="w-8 h-px bg-white/30" />
            Featured still
          </span>
        </Reveal>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 lg:gap-8">
          {/* Full frame */}
          <figure ref={baseWrapRef} className={`z-10 ${frameClass}`} style={frameStyle}>
            <img
              src={baseImage}
              alt={sp.caption || "Featured still — full frame"}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <span className={tag}>Full frame</span>
          </figure>

          {/* Detail crop — slides out from behind the full frame */}
          {pair && (
            <figure ref={detailWrapRef} className={frameClass} style={frameStyle}>
              <img
                src={sp.zoomImage}
                alt="Magnified detail"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <span className={tag}>Detail — zoomed in</span>
            </figure>
          )}
        </div>

        {sp.caption && (
          <figcaption className="flex items-baseline justify-center gap-3 mt-6 text-xs font-mono text-white/40">
            <span className="w-6 h-px bg-white/20 self-center" />
            {sp.caption}
          </figcaption>
        )}
      </div>
    </section>
  );
}
