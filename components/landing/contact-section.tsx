"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile, sectionText } from "@/lib/content";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

/**
 * Big closing call-to-action on the home page. The full contact form
 * lives on /contact.
 */
export function ContactSection() {
  return (
    <section id="contact" className="relative py-20 lg:py-48 bg-black text-white border-t border-white/5 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 lg:px-12 relative z-10 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-8">
            <span className="w-8 h-px bg-white/30" />
            07 — {sectionText.contactLabel}
            <span className="w-8 h-px bg-white/30" />
          </span>
        </Reveal>

        <SplitReveal
          text={profile.contactHeadline}
          className="text-[clamp(2.5rem,8vw,7rem)] font-display leading-[0.95] tracking-tight mb-10 mx-auto max-w-5xl"
        />

        <Reveal delay={0.2}>
          <p className="text-white/50 max-w-lg mx-auto mb-12 leading-relaxed">
            {profile.contactSubheading}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:gap-4"
            >
              Start a project
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="text-sm font-mono text-white/50 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white"
            >
              {profile.contactEmail}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
