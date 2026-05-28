"use client";

import { featuredItems } from "@/data/featured-work";
import { Play } from "lucide-react";

export function FeaturedWork() {
  const items = featuredItems;

  const handleCardClick = (slug?: string, link?: string) => {
    if (slug) {
      window.location.href = `/work/${slug}`;
    } else if (link) {
      window.location.href = link;
    }
  };

  return (
    <section id="featured" className="relative py-24 bg-black text-white">
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <h2 className="text-4xl lg:text-5xl font-display mb-12">Featured Work</h2>
        {items.length === 0 ? (
          <div className="p-12 rounded-lg bg-background/5 text-center">
            <p className="mb-4">No featured work yet.</p>
            <p className="text-sm text-background/50">Add items to <strong>data/featured-work.ts</strong> with images or videos in <strong>/public</strong>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
            {items.map((it) => (
              <div
                key={it.title}
                onClick={() => handleCardClick(it.slug, it.link)}
                className="group relative aspect-square overflow-hidden rounded-lg bg-background/5 border-2 border-white/15 hover:border-white/40 cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                {/* Image or Video Preview */}
                {it.img ? (
                  <img src={it.img} alt={it.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
                ) : it.videoPreview ? (
                  <video
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                    src={it.videoPreview}
                    autoPlay
                    muted
                    playsInline
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      const requestedStart = it.videoPreviewStart ?? 0;
                      try {
                        const duration = video.duration || 0;
                        const epsilon = 0.05;
                        
                        // If the video's actual duration is shorter than the configured loop end,
                        // it means the video itself has already been cropped by FFmpeg to the correct length!
                        // In this case, we play from 0 and loop the whole video.
                        const isPreCropped = it.videoPreviewEnd !== undefined && duration > 0.1 && duration < it.videoPreviewEnd;
                        const actualStart = isPreCropped ? 0 : requestedStart;

                        const target = Math.min(actualStart, Math.max(0, duration - epsilon));

                        const handleSeeked = () => {
                          const p = video.play();
                          if (p && typeof p.then === 'function') p.catch(() => {});
                        };

                        const trySeek = (t: number) => {
                          if (Math.abs(video.currentTime - t) > 0.1) {
                            video.addEventListener('seeked', handleSeeked, { once: true });
                            try {
                              video.currentTime = t;
                            } catch (_) {
                              // ignore
                            }
                          } else {
                            handleSeeked();
                          }
                        };

                        if (!isNaN(duration) && duration > 0.1) {
                          trySeek(target);
                          if (requestedStart > duration - epsilon && !isPreCropped) {
                            const onCanPlay = () => {
                              trySeek(Math.min(requestedStart, Math.max(0, (video.duration || 0) - epsilon)));
                              video.removeEventListener('canplay', onCanPlay);
                            };
                            video.addEventListener('canplay', onCanPlay);
                          }
                        } else {
                          const onCanPlay = () => {
                            trySeek(isPreCropped ? 0 : requestedStart);
                            video.removeEventListener('canplay', onCanPlay);
                          };
                          video.addEventListener('canplay', onCanPlay);
                          setTimeout(() => trySeek(isPreCropped ? 0 : requestedStart), 250);
                        }
                      } catch (err) {
                        const p = video.play();
                        if (p && typeof p.then === 'function') p.catch(() => {});
                      }
                    }}
                    onTimeUpdate={(e) => {
                      const video = e.currentTarget;
                      const duration = video.duration || 0;
                      const requestedStart = it.videoPreviewStart ?? 0;
                      const requestedEnd = it.videoPreviewEnd;

                      const isPreCropped = requestedEnd !== undefined && duration > 0.1 && duration < requestedEnd;
                      const start = isPreCropped ? 0 : requestedStart;
                      const end = isPreCropped ? duration : requestedEnd;

                      const epsilon = 0.12;
                      if (end !== undefined && video.currentTime + epsilon >= end) {
                        video.currentTime = start;
                        const p = video.play();
                        if (p && typeof p.then === 'function') p.catch(() => {});
                      }
                    }}
                    onEnded={(e) => {
                      const video = e.currentTarget;
                      const duration = video.duration || 0;
                      const requestedStart = it.videoPreviewStart ?? 0;
                      const isPreCropped = it.videoPreviewEnd !== undefined && duration > 0.1 && duration < it.videoPreviewEnd;
                      
                      video.currentTime = isPreCropped ? 0 : (requestedStart < duration ? requestedStart : 0);
                      const p = video.play();
                      if (p && typeof p.then === 'function') p.catch(() => {});
                    }}
                    loop={it.videoPreviewEnd === undefined}
                  />
                ) : (
                  <div className="w-full h-full bg-background/20 flex items-center justify-center text-background/50">No media</div>
                )}

                {/* Title overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end">
                  <div className="p-6 w-full">
                    <h3 className="text-lg font-display text-white">{it.title}</h3>
                  </div>
                </div>

                {/* Play icon on hover (if video) */}
                {(it.videoFull || it.videoPreview) && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


    </section>
  );
}
