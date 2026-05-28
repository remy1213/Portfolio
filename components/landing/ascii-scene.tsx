"use client";

export function AsciiScene() {
  return (
    <video
      className="absolute inset-0 z-0 w-full h-full object-cover"
      src="/videos/hero.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}
