"use client";
import { profileData } from "@/data/profile";
import BadgeCard, { BadgeData } from "@/components/ui/badge-card";

const badgeData: BadgeData = {
  name: "Remy Wilkins",
  role: "Filmmaker",
  roleType: "Videographer",
  eventCode: "RW",
  date: "2025",
  location: "Vancouver Island, BC",
  venue: "Vancouver Island",
  address: "British Columbia, Canada",
  website: "remywilkins.work",
  email: "remyw554@gmail.com",
  phone: "",
  company: "Remy Wilkins",
  tagline: "Bringing ideas to life through film",
  colors: {
    cardBg: "#0a0a0a",
    accentColor: "#cab645",
    nameColor: "#ffffff",
    roleColor: "#cab645",
    metaColor: "#6b7280",
    footerBg: "#111111",
    footerText: "#9ca3af",
    ringColor: "#cab645",
  },
};

export function AboutMe() {
  return (
    <section id="about" className="relative py-24 bg-black text-white overflow-visible border-t border-white/5">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

      {/* Badge — lives outside the grid, floats over everything */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: 0, width: 400, height: 820, zIndex: 9999 }}
      >
        <BadgeCard data={badgeData} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-center">

          {/* Left text */}
          <div className="space-y-8 lg:text-right">
            <div>
              <h2 className="text-4xl lg:text-6xl font-display leading-[0.95] tracking-tight mb-6">
                {profileData.aboutHeadline}
              </h2>
              <p className="text-white/60 leading-relaxed">
                {profileData.aboutSubheading}
              </p>
            </div>
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Videography & Editing</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Cinematic storytelling from concept to final cut.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Brand Strategy</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Connecting your story with the right audience.
                </p>
              </div>
            </div>
          </div>

          {/* Center: empty spacer so grid maintains 3 cols */}
          <div className="w-full h-[820px]" />

          {/* Right text */}
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none text-white/60 space-y-4 text-sm leading-relaxed">
              <p>{profileData.aboutBio1}</p>
              <p>{profileData.aboutBio2}</p>
            </div>
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Design & Websites</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Next.js, React, and motion-rich interfaces.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Creative Direction</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Visual consistency from concept to execution.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}