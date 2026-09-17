"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { profile } from "@/lib/content";
import { FitText } from "@/components/ui/fit-text";

const footerLinks = [
  { name: "Work", href: "/#work" },
  { name: "Gallery", href: "/gallery" },
  { name: "Reviews", href: "/reviews" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function FooterSection() {
  const year = new Date().getFullYear();
  const socials = profile.socials.filter((s) => s.url);

  return (
    <footer className="relative bg-black">
      {/* Panoramic banner image — editable in admin, hidden when empty */}
      {profile.footerBanner && (
        <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
          <img
            src={profile.footerBanner}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        </div>
      )}

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-3">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <span className="text-2xl font-display text-white">{profile.name}</span>
              </Link>
              <p className="text-white/50 leading-relaxed max-w-xs text-sm">
                {profile.heroEyebrow}
              </p>
            </div>

            {/* Navigation */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-sm font-medium text-white mb-6">Navigation</h3>
              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials / Email */}
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-sm font-medium text-white mb-6">Elsewhere</h3>
              <ul className="space-y-4">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/40 hover:text-white transition-colors inline-flex items-center gap-1 group"
                    >
                      {social.name}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${profile.contactEmail}`}
                    className="text-sm text-white/40 hover:text-white transition-colors"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Giant wordmark */}
        <div className="overflow-hidden pb-6 select-none" aria-hidden="true">
          <FitText text={profile.name} className="font-display text-white/[0.06]" />
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            &copy; {year} {profile.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-white/30">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#52e2a0] animate-pulse" />
              {profile.availability}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
