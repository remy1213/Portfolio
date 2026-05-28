"use client";

import { useEffect, useState, useRef } from "react";

const words = ["Videography", "Editing", "Strategy", "Design", "Websites"];
const heroVideos = [
  "/videos/hero.mp4",
];

function BlurWord({ word, trigger }: { word: string; trigger: number }) {
  const letters = word.split("");
  const STAGGER = 45;      // ms between each letter
  const DURATION = 500;    // blur+opacity fade duration per letter
  const GRADIENT_HOLD = STAGGER * letters.length + DURATION + 200;

  const [letterStates, setLetterStates] = useState<{ opacity: number; blur: number }[]>(
    letters.map(() => ({ opacity: 0, blur: 20 }))
  );
  const [showGradient, setShowGradient] = useState(true);
  const framesRef = useRef<number[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // reset
    framesRef.current.forEach(cancelAnimationFrame);
    timersRef.current.forEach(clearTimeout);
    framesRef.current = [];
    timersRef.current = [];

    setLetterStates(letters.map(() => ({ opacity: 0, blur: 20 })));
    setShowGradient(true);

    // stagger each letter
    letters.forEach((_, i) => {
      const t = setTimeout(() => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / DURATION, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setLetterStates(prev => {
            const next = [...prev];
            next[i] = { opacity: eased, blur: 20 * (1 - eased) };
            return next;
          });
          if (progress < 1) {
            const id = requestAnimationFrame(tick);
            framesRef.current.push(id);
          }
        };
        const id = requestAnimationFrame(tick);
        framesRef.current.push(id);
      }, i * STAGGER);
      timersRef.current.push(t);
    });

    // remove gradient once all letters are settled
    const gt = setTimeout(() => setShowGradient(false), GRADIENT_HOLD);
    timersRef.current.push(gt);

    return () => {
      framesRef.current.forEach(cancelAnimationFrame);
      timersRef.current.forEach(clearTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  // gradient colours cycling across letter positions
  const gradientColors = ["#eca8d6", "#a78bfa", "#67e8f9", "#fbbf24", "#eca8d6"];

  return (
    <>
      {letters.map((char, i) => {
        const colorIndex = (i / Math.max(letters.length - 1, 1)) * (gradientColors.length - 1);
        const lower = Math.floor(colorIndex);
        const upper = Math.min(lower + 1, gradientColors.length - 1);
        const t = colorIndex - lower;

        // lerp hex colours
        const hex2rgb = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return [r, g, b];
        };
        const [r1, g1, b1] = hex2rgb(gradientColors[lower]);
        const [r2, g2, b2] = hex2rgb(gradientColors[upper]);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: letterStates[i]?.opacity ?? 0,
              filter: `blur(${letterStates[i]?.blur ?? 20}px)`,
              color: showGradient ? `rgb(${r},${g},${b})` : "white",
              transition: "color 0.4s ease",
            }}
          >
            {char}
          </span>
        );
      })}
    </>
  );
}

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isSingleVideo = heroVideos.length === 1;

  useEffect(() => {
    setIsVisible(true);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isMounted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.loop = isSingleVideo;
    video.src = heroVideos[videoIndex];
    video.load();
    video.play().catch(() => {
      /* autoplay may be blocked if not muted */
    });
  }, [videoIndex, isSingleVideo]);

  // Dynamic grid warp effect restricted to the hero video wrap boundary
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Mouse coordinates relative to wrap
    let mx: number | null = null;
    let my: number | null = null;
    let targetSpotlightOpacity = 0;
    let spotlightOpacity = 0;

    // Grid settings
    const spacing = 45; // grid cell size
    const springStrength = 0.03;
    const damping = 0.85;
    const forceRadius = 180;
    const forceStrength = 55;

    type Point = {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
    };

    let points: Point[] = [];
    let cols = 0;
    let rows = 0;

    const initGrid = () => {
      const rect = wrap.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;

      // Fallback if client dimensions aren't layouted yet
      if (w === 0) w = wrap.offsetWidth || window.innerWidth;
      if (h === 0) h = wrap.offsetHeight || window.innerHeight;

      canvas.width = w;
      canvas.height = h;

      cols = Math.ceil(w / spacing) + 1;
      rows = Math.ceil(h / spacing) + 1;

      points = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * spacing;
          const py = r * spacing;
          points.push({
            x: px,
            y: py,
            targetX: px,
            targetY: py,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    // Use ResizeObserver for high-performance layout scaling
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width: rw, height: rh } = entry.contentRect;
        if (rw > 0 && rh > 0) {
          initGrid();
        }
      }
    });
    resizeObserver.observe(wrap);

    // Initial grid setup
    initGrid();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      // Keep effect active only when hovering directly over the video boundary
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        mx = clientX - rect.left;
        my = clientY - rect.top;
        targetSpotlightOpacity = 1;
      } else {
        mx = null;
        my = null;
        targetSpotlightOpacity = 0;
      }
    };

    const handleMouseLeave = () => {
      mx = null;
      my = null;
      targetSpotlightOpacity = 0;
    };

    // Listen to window mouse movements so cursor tracks even when hovering over absolute content on top
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;

      if (w === 0 || h === 0) {
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Smoothly fade spotlight opacity in/out
      spotlightOpacity += (targetSpotlightOpacity - spotlightOpacity) * 0.1;

      // Update grid points
      const hasMouse = mx !== null && my !== null;
      
      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        let tx = p.targetX;
        let ty = p.targetY;

        if (hasMouse) {
          const dx = p.targetX - mx!;
          const dy = p.targetY - my!;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < forceRadius) {
            const force = (forceRadius - dist) / forceRadius;
            const push = force * forceStrength;
            const angle = Math.atan2(dy, dx);
            tx = p.targetX + Math.cos(angle) * push;
            ty = p.targetY + Math.sin(angle) * push;
          }
        }

        // Spring physics
        const ax = (tx - p.x) * springStrength;
        const ay = (ty - p.y) * springStrength;
        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw grid lines
      ctx.lineWidth = 1.0;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const p = points[idx];
          if (!p) continue;

          if (c < cols - 1) {
            const rightIdx = idx + 1;
            const pRight = points[rightIdx];
            if (pRight) {
              drawLine(p, pRight);
            }
          }

          if (r < rows - 1) {
            const bottomIdx = idx + cols;
            const pBottom = points[bottomIdx];
            if (pBottom) {
              drawLine(p, pBottom);
            }
          }
        }
      }

      function drawLine(p1: Point, p2: Point) {
        // Subtle background grid always visible, glowing and warping on mouse proximity
        const baseOpacity = 0.04;
        let glowOpacity = 0;

        if (hasMouse) {
          const d1 = Math.sqrt((p1.x - mx!) ** 2 + (p1.y - my!) ** 2);
          const d2 = Math.sqrt((p2.x - mx!) ** 2 + (p2.y - my!) ** 2);
          const avgDist = (d1 + d2) / 2;
          
          if (avgDist < forceRadius) {
            glowOpacity = (1 - avgDist / forceRadius) * 0.16 * spotlightOpacity;
          }
        }

        const totalOpacity = baseOpacity + glowOpacity;

        if (totalOpacity > 0.005) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${totalOpacity})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted]);

  const handleVideoEnded = () => {
    setVideoIndex((prev) => (prev + 1) % heroVideos.length);
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-start overflow-hidden bg-black">
      {/* Background video with Warp Canvas restricted to its bounds */}
      <div id="hero-video-wrap" ref={wrapRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onEnded={isSingleVideo ? undefined : handleVideoEnded}
          className="hero-video w-full h-full object-cover object-center opacity-80 pointer-events-none"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-[1] mix-blend-screen opacity-75"
        />
        {/* Subtle overlays to ensure text readability on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent z-[2] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-[2] pointer-events-none" />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none opacity-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      {/* Hero content container with z-20 to sit on top of warp canvas and remain fully interactive */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div className="lg:max-w-[55%]">
        {/* Eyebrow */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-white/60">
            <span className="w-8 h-px bg-white/30" />
            Filmed by Remy Wilkins, a Vancouver Island based creator.
          </span>
        </div>
        
        {/* Main headline */}
        <div className="mb-12">
          <h1 
            className={`text-left text-[clamp(2rem,6vw,7rem)] font-display leading-[0.92] tracking-tight text-white transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block whitespace-nowrap">Bringing ideas to</span>
            <span className="block whitespace-nowrap">
              life with{" "}
              <span className="relative inline-block">
                <BlurWord word={words[wordIndex]} trigger={wordIndex} />
              </span>
            </span>
          </h1>
        </div>
        </div>
      </div>
      
      {/* Stats — 3 metrics static, no auto-scroll */}
      <div 
        className={`absolute bottom-12 left-0 right-0 px-6 lg:px-12 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-start gap-10 lg:gap-20">
          {[
            { value: "50+", label: "videos delivered" },
            { value: "500+", label: "hours of experience" },
            { value: "10+", label: "websites built" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2">
              <span className="text-3xl lg:text-4xl font-display text-white">{stat.value}</span>
              <span className="text-xs text-white/50 leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}

    </section>
  );
}
