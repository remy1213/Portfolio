"use client";

import { useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Navigation } from "@/components/landing/navigation";
import { FooterSection } from "@/components/landing/footer-section";
import { photos, sectionText, type Photo } from "@/lib/content";
import { Reveal, SplitReveal } from "@/components/gsap/animate";

export default function GalleryPage() {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [showZoom, setShowZoom] = useState(false);

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
                {sectionText.stillsLabel} — {photos.length} photos
              </span>
            </Reveal>
            <SplitReveal
              text={sectionText.stillsHeading}
              as="h1"
              className="text-[clamp(2.5rem,7vw,6rem)] font-display leading-[0.95] tracking-tight max-w-5xl"
            />
          </div>

          {/* Masonry grid — natural aspect ratios, lazy loaded */}
          {photos.length === 0 ? (
            <p className="text-white/40 font-mono text-sm">
              No photos yet — add some in the admin under Photos.
            </p>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 lg:gap-6 [column-fill:_balance]">
              {photos.map((photo, i) => (
                <figure
                  key={photo.src + i}
                  onClick={() => {
                    setActivePhoto(photo);
                    setShowZoom(false);
                  }}
                  className="group relative mb-5 lg:mb-6 break-inside-avoid cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg bg-white/5 border border-white/10 group-hover:border-white/25 transition-colors duration-500">
                    <img
                      src={photo.src}
                      alt={photo.caption || `Still ${i + 1}`}
                      loading="lazy"
                      className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <figcaption className="flex items-baseline gap-3 mt-2.5 text-xs font-mono text-white/40">
                    <span className="text-white/25">{String(i + 1).padStart(2, "0")}</span>
                    {photo.caption && <span>{photo.caption}</span>}
                    {photo.zoomSrc && (
                      <span className="ml-auto inline-flex items-center gap-1 text-white/30">
                        <ZoomIn className="w-3 h-3" /> detail
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />

      {/* Lightbox — photos with a detail crop can toggle into it */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setActivePhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={() => setActivePhoto(null)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          <img
            src={showZoom && activePhoto.zoomSrc ? activePhoto.zoomSrc : activePhoto.src}
            alt={activePhoto.caption || "Full-size still"}
            className={`max-w-full max-h-[85vh] object-contain ${activePhoto.zoomSrc ? (showZoom ? "cursor-zoom-out" : "cursor-zoom-in") : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (activePhoto.zoomSrc) setShowZoom((v) => !v);
            }}
          />

          {activePhoto.zoomSrc && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowZoom((v) => !v);
              }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-5 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 text-sm text-white hover:bg-white/20 transition-colors"
            >
              {showZoom ? (
                <>
                  <ZoomOut className="w-4 h-4" /> Full photo
                </>
              ) : (
                <>
                  <ZoomIn className="w-4 h-4" /> Detail crop
                </>
              )}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
