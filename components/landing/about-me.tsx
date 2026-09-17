"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile, sectionText } from "@/lib/content";
import { Reveal, SplitReveal, Parallax } from "@/components/gsap/animate";

export function AboutMe() {
  return (
    <section id="about" className="relative py-16 lg:py-40 bg-black text-white border-t border-white/5 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="lg:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
                <span className="w-8 h-px bg-white/30" />
                06 — {sectionText.aboutLabel}
              </span>
            </Reveal>
            <SplitReveal
              text={profile.aboutHeadline}
              className="text-[clamp(2.2rem,5.5vw,5rem)] font-display leading-[0.95] tracking-tight mb-8"
            />
            <Reveal delay={0.15}>
              <p className="text-lg lg:text-xl text-white/60 leading-relaxed max-w-2xl mb-6">
                {profile.aboutSubheading}
              </p>
              <p className="text-sm text-white/40 leading-relaxed max-w-xl mb-10">
                {profile.aboutBio1}
              </p>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-white/70 hover:text-white transition-colors"
              >
                <span className="relative">
                  More about me
                  <span className="absolute -bottom-1 left-0 w-full h-px bg-white/30 group-hover:bg-white transition-colors" />
                </span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Reveal>
          </div>

          {/* Portrait (optional, editable in admin) — fades and eases in on scroll */}
          <div className="lg:col-span-5">
            {profile.aboutPortrait ? (
              <Reveal delay={0.15} y={64}>
                <Parallax speed={0.08}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    <img
                      src={profile.aboutPortrait}
                      alt={profile.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Parallax>
              </Reveal>
            ) : (
              <Reveal delay={0.2}>
                <div className="border-l border-white/15 pl-8 py-4">
                  <p className="text-2xl lg:text-3xl font-display text-white/50 leading-snug italic">
                    “Digital experiences should feel as alive and intentional as a well-composed frame.”
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
