"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { profile } from "@/lib/content";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  // No mail server needed: submitting opens the visitor's email app with
  // everything pre-filled, addressed to the contact email.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Hi Remy,\n\n${formData.message}\n\n— ${formData.name}\n${formData.email}`
    );
    window.location.href = `mailto:${profile.contactEmail}?subject=${subject}&body=${body}`;
  };

  const socials = profile.socials.filter((s) => s.url);

  // embed_domain + embed_type=Inline make Calendly serve its embed layout
  // (full-width, no page padding, no corner ribbon) instead of the
  // standalone page. The domain is only known in the browser.
  const [embedHost, setEmbedHost] = useState<string | null>(null);
  useEffect(() => setEmbedHost(window.location.hostname), []);

  const bookingEmbedUrl =
    profile.bookingUrl && embedHost
      ? `${profile.bookingUrl}${profile.bookingUrl.includes("?") ? "&" : "?"}embed_domain=${embedHost}&embed_type=Inline&hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=ffffff`
      : null;

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      <section className="pt-40 lg:pt-52 pb-24 lg:pb-32">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="mb-16 lg:mb-24">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-8">
                <span className="w-8 h-px bg-white/30" />
                Contact
              </span>
            </Reveal>
            <SplitReveal
              text={profile.contactHeadline}
              as="h1"
              className="text-[clamp(2.5rem,8vw,7rem)] font-display leading-[0.95] tracking-tight max-w-5xl"
            />
          </div>

          {/* Booking calendar — appears when a booking link is set in the admin */}
          {bookingEmbedUrl && (
            <div className="mb-20 lg:mb-28">
              <Reveal>
                <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-6">
                  <span className="w-8 h-px bg-white/30" />
                  Book a call
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                {/* Calendly's card has a fixed max size — size the frame to the
                    card instead of stretching a big box around it. */}
                <div className="max-w-[1020px] mx-auto">
                  <iframe
                    src={bookingEmbedUrl}
                    title="Book a call"
                    className="w-full h-[1050px] sm:h-[950px] lg:h-[700px] rounded-2xl border border-white/10 bg-[#0a0a0a]"
                  />
                </div>
              </Reveal>
            </div>
          )}

          {/* Email / message section header */}
          {bookingEmbedUrl && (
            <Reveal>
              <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-10">
                <span className="w-8 h-px bg-white/30" />
                Or just email directly
              </span>
            </Reveal>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Info */}
            <div className="lg:col-span-5">
              <Reveal delay={0.1}>
                <p className="text-lg text-white/60 leading-relaxed max-w-sm mb-12">
                  {profile.contactSubheading}
                </p>

                <div className="space-y-8 text-sm font-mono text-white/50">
                  <div>
                    <span className="block text-xs text-white/30 uppercase tracking-widest mb-2">Based in</span>
                    <span className="text-white">{profile.contactLocation}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-white/30 uppercase tracking-widest mb-2">Email</span>
                    <a
                      href={`mailto:${profile.contactEmail}`}
                      className="text-white hover:text-white/70 transition-colors underline underline-offset-4 decoration-white/20"
                    >
                      {profile.contactEmail}
                    </a>
                  </div>
                  {socials.length > 0 && (
                    <div>
                      <span className="block text-xs text-white/30 uppercase tracking-widest mb-2">Elsewhere</span>
                      <div className="flex flex-wrap gap-4">
                        {socials.map((s) => (
                          <a
                            key={s.name}
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-white/70 transition-colors"
                          >
                            {s.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs text-white/30 uppercase tracking-widest mb-2">Status</span>
                    <span className="flex items-center gap-2 text-white">
                      <span className="w-2 h-2 rounded-full bg-[#52e2a0] animate-pulse" />
                      {profile.availability}
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <Reveal delay={0.2}>
                <div className="p-8 lg:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-xs font-mono text-white/60 uppercase mb-2">
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        required
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-white/30 focus:ring-0 text-white rounded-lg h-12 px-4"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-mono text-white/60 uppercase mb-2">
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-white/30 focus:ring-0 text-white rounded-lg h-12 px-4"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs font-mono text-white/60 uppercase mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        placeholder="Tell me about your project, timeline, and ideas..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-white/5 border-white/10 focus:border-white/30 focus:ring-0 text-white rounded-lg p-4 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      Send Message
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-white/30 text-center">
                      Submitting opens your email app with the message ready to send.
                    </p>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
