"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { profile, skills, photos, sectionText } from "@/lib/content";
import { Reveal, SplitReveal, Parallax } from "@/components/gsap/animate";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Intro */}
      <section className="pt-40 lg:pt-52 pb-20 lg:pb-28 max-w-[1500px] mx-auto px-6 lg:px-12">
        <Reveal>
          <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-8">
            <span className="w-8 h-px bg-white/30" />
            About — {profile.contactLocation}
          </span>
        </Reveal>
        <SplitReveal
          text={profile.aboutHeadline}
          as="h1"
          className="text-[clamp(2.5rem,8vw,7rem)] font-display leading-[0.95] tracking-tight mb-10 max-w-5xl"
        />
        <Reveal delay={0.2}>
          <p className="text-xl lg:text-2xl text-white/60 leading-relaxed max-w-3xl">
            {profile.aboutSubheading}
          </p>
        </Reveal>
      </section>

      {/* Story */}
      <section className="py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            {profile.aboutPortrait ? (
              <Parallax speed={0.08}>
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                  <img
                    src={profile.aboutPortrait}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Parallax>
            ) : photos[0] ? (
              <Parallax speed={0.08}>
                <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                  <img
                    src={photos[0].src}
                    alt={photos[0].caption || "Behind the scenes"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Parallax>
            ) : null}
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-8 self-center">
            <Reveal>
              <span className="text-xs font-mono text-white/40 uppercase tracking-[0.25em] block mb-4">
                {sectionText.aboutStoryLabel}
              </span>
              <p className="text-lg text-white/70 leading-relaxed">{profile.aboutBio1}</p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg text-white/70 leading-relaxed">{profile.aboutBio2}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/10">
                {profile.heroStats.map((stat) => (
                  <div key={stat.label}>
                    <span className="block text-3xl font-display text-white">{stat.value}</span>
                    <span className="text-xs text-white/40">{stat.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <SplitReveal
            text={sectionText.aboutSkillsHeading}
            className="text-[clamp(2rem,5vw,4rem)] font-display leading-[0.95] tracking-tight mb-16"
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
            <div className="lg:col-span-7">
              {skills.capabilities.map((cap, i) => (
                <Reveal key={cap.name} delay={i * 0.04}>
                  <div className="group flex items-baseline gap-6 py-6 border-t border-white/10 last:border-b hover:border-white/30 transition-colors duration-300">
                    <span className="text-xs font-mono text-white/25 shrink-0 w-8">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl lg:text-3xl font-display tracking-tight text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all duration-400">
                        {cap.name}
                      </h3>
                      <p className="text-sm text-white/40 mt-1.5 max-w-md">{cap.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <div className="lg:col-span-5 space-y-12">
              <Reveal delay={0.1}>
                <h3 className="text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">Software</h3>
                <div className="flex flex-wrap gap-2.5">
                  {skills.software.map((tool) => (
                    <span
                      key={tool}
                      className="px-4 py-2 border border-white/10 rounded-full text-sm font-mono text-white/60 hover:text-white hover:border-white/40 transition-colors cursor-default"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <h3 className="text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">Camera & Gear</h3>
                <div className="flex flex-wrap gap-2.5">
                  {skills.gear.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-2 bg-white/5 rounded-full text-sm font-mono text-white/60 hover:text-white transition-colors cursor-default"
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

      {/* CTA */}
      <section className="py-24 lg:py-32 border-t border-white/5 text-center">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <SplitReveal
            text={sectionText.aboutCtaHeading}
            className="text-[clamp(2rem,6vw,5rem)] font-display leading-[0.95] tracking-tight mb-10"
          />
          <Reveal delay={0.15}>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-all hover:gap-4"
            >
              Get in touch
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
