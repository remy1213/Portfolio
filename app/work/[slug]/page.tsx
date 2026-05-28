"use client";

import { useParams } from "next/navigation";
import { featuredItems } from "@/data/featured-work";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { ArrowLeft, Camera, Film, Calendar, User, X } from "lucide-react";
import React, { useState } from "react";

export default function WorkDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Find the matching work item
  const item = featuredItems.find((it) => it.slug === slug);
  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);

  if (!item) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-display mb-4">Project Not Found</h1>
        <a href="/" className="text-sm font-mono text-white/60 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Navigation />

      {/* Main Content Area */}
      <main className="pt-32 pb-24 max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Back Button */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-mono text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            back to work
          </a>
        </div>

        {/* Full Quality Video Container */}
        {item.videoFull && (
          <div className="w-full rounded-2xl overflow-hidden bg-white/5 border-2 border-white/10 shadow-2xl mb-16 relative flex items-center justify-center bg-black/40 max-h-[85vh]">
            <video
              src={item.videoFull}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        )}

        {/* Two-Column Grid: Info & Stills */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Project Information - 5 cols */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest block mb-3">Project Showcase</span>
              <h1 className="text-4xl lg:text-6xl font-display leading-[0.95] tracking-tight mb-6">
                {item.title}
              </h1>
              <p className="text-white/60 leading-relaxed text-base">
                {item.description}
              </p>
            </div>

            {/* Spec Details Card */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-6 font-mono text-sm text-white/70">
              <h3 className="text-xs uppercase text-white/40 tracking-widest font-sans font-semibold border-b border-white/10 pb-3">
                Production Specs
              </h3>
              
              {item.client && (
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-white/40 mt-0.5" />
                  <div>
                    <span className="block text-xs text-white/30 uppercase">Client</span>
                    <span className="text-white">{item.client}</span>
                  </div>
                </div>
              )}

              {item.role && (
                <div className="flex items-start gap-3">
                  <Film className="w-4 h-4 text-white/40 mt-0.5" />
                  <div>
                    <span className="block text-xs text-white/30 uppercase">Role</span>
                    <span className="text-white">{item.role}</span>
                  </div>
                </div>
              )}

              {item.date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-white/40 mt-0.5" />
                  <div>
                    <span className="block text-xs text-white/30 uppercase">Release</span>
                    <span className="text-white">{item.date}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Gear & Software Used */}
            {item.gear && item.gear.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs uppercase text-white/40 tracking-widest font-sans font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Tools & Setup
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.gear.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-white/80"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Shoot Photos / Stills - 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            <h2 className="text-xs uppercase text-white/40 tracking-widest font-sans font-semibold border-b border-white/10 pb-4">
              Shoot Gallery & Stills
            </h2>
            
            {item.photos && item.photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {item.photos.map((photo, i) => {
                  const isVid = isVideo(photo);
                  return (
                    <div
                      key={i}
                      onClick={() => setActivePhoto(photo)}
                      className="group relative aspect-video overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer shadow-md hover:shadow-2xl"
                    >
                      {isVid ? (
                        <video
                          src={photo}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                        />
                      ) : (
                        <img
                          src={photo}
                          alt={`${item.title} shoot frame ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs font-mono text-white/70">
                          {isVid ? "Video Clip" : `Frame #${i + 1}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-xl bg-white/5 border border-white/10 text-white/40 font-mono text-sm">
                No stills added for this shoot.
              </div>
            )}
          </div>

        </div>
      </main>

      <FooterSection />

      {/* Lightbox / Full-Screen Image Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setActivePhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-[60]"
            onClick={() => setActivePhoto(null)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-black" onClick={(e) => e.stopPropagation()}>
            {isVideo(activePhoto) ? (
              <video
                src={activePhoto}
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[80vh] object-contain rounded-xl border border-white/10"
              />
            ) : (
              <img
                src={activePhoto}
                alt="Full-size shoot frame"
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain border border-white/10"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
