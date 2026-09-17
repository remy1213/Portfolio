"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sectionText } from "@/lib/content";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

type PublicReview = { id: string; name: string; stars: number; text: string; date: string };

function Stars({ value, className = "w-4 h-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= value ? "text-amber-300 fill-amber-300" : "text-white/20"}`}
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<PublicReview[] | null>(null);
  const [form, setForm] = useState({ name: "", text: "", stars: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => setReviews(d.ok ? d.reviews : []))
      .catch(() => setReviews([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) setSubmitted(true);
      else setError(data.error || "Something went wrong — please try again.");
    } catch {
      setError("Something went wrong — please try again.");
    }
    setSubmitting(false);
  };

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      <section className="pt-40 lg:pt-52 pb-24 lg:pb-32">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="mb-14 lg:mb-20">
            <Reveal>
              <span className="inline-flex items-center gap-3 text-xs font-mono text-white/40 uppercase tracking-[0.25em] mb-8">
                <span className="w-8 h-px bg-white/30" />
                {sectionText.reviewsLabel}
              </span>
            </Reveal>
            <SplitReveal
              text={sectionText.reviewsHeading}
              as="h1"
              className="text-[clamp(2.5rem,7vw,6rem)] font-display leading-[0.95] tracking-tight max-w-5xl"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Approved reviews */}
            <div className="lg:col-span-7">
              {reviews === null ? (
                <p className="text-white/40 font-mono text-sm">Loading…</p>
              ) : reviews.length === 0 ? (
                <p className="text-white/40 font-mono text-sm">
                  No reviews yet — be the first to leave one.
                </p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <Reveal key={review.id}>
                      <blockquote className="p-6 lg:p-8 rounded-xl bg-white/[0.04] border border-white/10">
                        <Stars value={review.stars} />
                        <p className="text-white/80 leading-relaxed mt-4">{review.text}</p>
                        <footer className="mt-5 flex items-baseline gap-3 text-xs font-mono text-white/40">
                          <span className="text-white/70">{review.name}</span>
                          <span>·</span>
                          <span>{new Date(review.date).toLocaleDateString("en-CA", { year: "numeric", month: "short" })}</span>
                        </footer>
                      </blockquote>
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* Submission form */}
            <div className="lg:col-span-5">
              <Reveal delay={0.15}>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl lg:sticky lg:top-28">
                  {submitted ? (
                    <div className="flex flex-col items-center text-center py-8">
                      <CheckCircle2 className="w-14 h-14 text-emerald-400 mb-5" />
                      <h3 className="text-xl font-display mb-2">Thank you!</h3>
                      <p className="text-white/60 text-sm">
                        Your review has been submitted and will appear once it's approved.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <h3 className="text-xl font-display">Worked with me? Leave a review.</h3>
                      <div>
                        <label htmlFor="rev-name" className="block text-xs font-mono text-white/60 uppercase mb-2">
                          Name
                        </label>
                        <Input
                          id="rev-name"
                          type="text"
                          required
                          maxLength={60}
                          placeholder="Your name or company"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="bg-white/5 border-white/10 focus:border-white/30 focus:ring-0 text-white rounded-lg h-12 px-4"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-mono text-white/60 uppercase mb-2">Rating</span>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              aria-label={`${n} stars`}
                              onClick={() => setForm({ ...form, stars: n })}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-7 h-7 ${n <= form.stars ? "text-amber-300 fill-amber-300" : "text-white/25"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="rev-text" className="block text-xs font-mono text-white/60 uppercase mb-2">
                          Your review
                        </label>
                        <Textarea
                          id="rev-text"
                          required
                          rows={5}
                          maxLength={1200}
                          placeholder="What was it like working together?"
                          value={form.text}
                          onChange={(e) => setForm({ ...form, text: e.target.value })}
                          className="bg-white/5 border-white/10 focus:border-white/30 focus:ring-0 text-white rounded-lg p-4 resize-none"
                        />
                      </div>
                      {error && <p className="text-xs text-red-400">{error}</p>}
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-lg"
                      >
                        {submitting ? "Sending…" : "Submit review"}
                      </Button>
                      <p className="text-[11px] text-white/30 text-center">
                        Reviews are checked before they appear on the site.
                      </p>
                    </form>
                  )}
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
