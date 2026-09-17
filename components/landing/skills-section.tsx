"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import { skills, sectionText, type Capability } from "@/lib/content";
import { FitText } from "@/components/ui/fit-text";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

/** One capability — expands into a paragraph + screenshot when it has them. */
function CapabilityRow({ cap, index }: { cap: Capability; index: number }) {
  const [open, setOpen] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const expandable = Boolean(cap.details || cap.image);

  return (
    <Reveal delay={index * 0.05}>
      <div className="group border-t border-white/10 last:border-b transition-colors duration-300 hover:border-white/30">
        <button
          type="button"
          onClick={() => expandable && setOpen((v) => !v)}
          aria-expanded={expandable ? open : undefined}
          className={`w-full flex items-baseline gap-6 py-7 text-left ${expandable ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className="text-xs font-mono text-white/25 shrink-0 w-8">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <h3 className="text-2xl lg:text-4xl font-display tracking-tight text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all duration-400">
              {cap.name}
            </h3>
            <p className="text-sm text-white/40 mt-2 max-w-md">{cap.desc}</p>
          </div>
          {expandable && (
            <ChevronDown
              className={`w-5 h-5 shrink-0 self-center text-white/40 group-hover:text-white transition-transform duration-400 ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Expanding panel */}
        {expandable && (
          <div
            className={`grid transition-all duration-500 ease-out ${
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pb-8 pl-14 pr-2 flex flex-col lg:flex-row gap-6 items-start">
                {cap.details && (
                  <p className="text-sm text-white/60 leading-relaxed flex-1 max-w-xl">
                    {cap.details}
                  </p>
                )}
                {cap.image && (
                  <img
                    src={cap.image}
                    alt={cap.name}
                    loading="lazy"
                    onClick={() => setZoomOpen(true)}
                    className="w-full lg:w-80 rounded-lg border border-white/10 object-cover cursor-zoom-in hover:border-white/30 transition-colors"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full-size view of the capability image. Rendered via a portal:
            the reveal wrapper carries a CSS transform, which re-anchors
            position:fixed to itself — the portal escapes it so the overlay
            truly covers the screen and the X sits in the corner. */}
        {zoomOpen &&
          cap.image &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setZoomOpen(false)}
            >
              <button
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
                onClick={() => setZoomOpen(false)}
                aria-label="Close"
              >
                <X className="w-8 h-8" />
              </button>
              <img
                src={cap.image}
                alt={cap.name}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body
          )}
      </div>
    </Reveal>
  );
}

export function SkillsSection() {
  return (
    <section id="skills" className="relative py-16 lg:py-40 bg-black text-white border-t border-white/5 overflow-hidden">
      {/* Ghost watermark — oversized and centered, bleeding evenly off both edges */}
      <div aria-hidden="true" className="pointer-events-none select-none absolute top-8 inset-x-0 flex justify-center">
        <FitText text={sectionText.skillsLabel} scale={1.4} className="font-display text-white/[0.05]" />
      </div>

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <Reveal>
            <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
              <span className="w-8 h-px bg-white/30" />
              05 — {sectionText.skillsLabel}
            </span>
          </Reveal>
          <SplitReveal
            text={sectionText.skillsHeading}
            className="text-[clamp(2rem,5vw,4.5rem)] font-display leading-[0.95] tracking-tight"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
          {/* Capabilities — numbered rows that expand into detail panels */}
          <div className="lg:col-span-7">
            {skills.capabilities.map((cap, i) => (
              <CapabilityRow key={cap.name + i} cap={cap} index={i} />
            ))}
          </div>

          {/* Toolbox */}
          <div className="lg:col-span-5 space-y-12">
            <Reveal delay={0.15}>
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
                Software
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {skills.software.map((tool) => (
                  <span
                    key={tool}
                    className="px-4 py-2 border border-white/10 rounded-full text-sm font-mono text-white/60 hover:text-white hover:border-white/40 transition-colors duration-300 cursor-default"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
                Camera & Gear
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {skills.gear.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 bg-white/5 rounded-full text-sm font-mono text-white/60 hover:text-white transition-colors duration-300 cursor-default"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
