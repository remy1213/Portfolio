"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { profileData } from "@/data/profile";

export function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="relative py-24 bg-black text-white border-t border-white/5">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Info - 5 cols */}
          <div className="lg:col-span-5">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-4">Get In Touch</span>
            <h2 className="text-5xl lg:text-7xl font-display leading-[0.95] tracking-tight mb-8">
              {profileData.contactHeadline}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed max-w-sm mb-12">
              {profileData.contactSubheading}
            </p>

            <div className="space-y-6 text-sm font-mono text-white/50">
              <div>
                <span className="block text-xs text-white/30 uppercase mb-1">Based In</span>
                <span>{profileData.contactLocation}</span>
              </div>
              <div>
                <span className="block text-xs text-white/30 uppercase mb-1">Email</span>
                <a href={`mailto:${profileData.contactEmail}`} className="text-white hover:text-white/80 transition-colors">
                  {profileData.contactEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Form - 7 cols */}
          <div className="lg:col-span-7">
            <div className="p-8 lg:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-6 animate-bounce" />
                  <h3 className="text-2xl font-display text-white mb-2">Message Sent!</h3>
                  <p className="text-white/60 text-sm max-w-sm">
                    Thank you for reaching out. I will get back to you as soon as possible.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline" 
                    className="mt-8 border-white/20 hover:bg-white/10 text-white"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
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
                      rows={5}
                      placeholder="Tell me about your project, timeline, and ideas..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="bg-white/5 border-white/10 focus:border-white/30 focus:ring-0 text-white rounded-lg p-4 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-white text-black hover:bg-white/90 font-medium rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
