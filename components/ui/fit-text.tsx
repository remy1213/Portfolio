"use client";

import { useLayoutEffect, useRef } from "react";

/**
 * Scales its text so it spans exactly the width of its parent, no matter
 * how long the text is — used for the giant watermarks and wordmarks.
 */
export function FitText({
  text,
  className,
  scale = 1,
}: {
  text: string;
  className?: string;
  /** 1 = span the parent exactly; >1 = oversize and bleed past the edges (center it and clip the parent). */
  scale?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const fit = () => {
      // Measure at a fixed size, then scale the font proportionally.
      el.style.fontSize = "100px";
      const textWidth = el.scrollWidth || 1;
      el.style.fontSize = `${Math.max(12, (parent.clientWidth / textWidth) * 98 * scale)}px`;
    };

    fit();
    // Re-fit once webfonts finish loading (metrics change).
    document.fonts?.ready.then(fit).catch(() => {});
    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [text, scale]);

  return (
    <span
      ref={ref}
      style={{ fontSize: "10vw" }}
      className={`block shrink-0 whitespace-nowrap leading-none ${className || ""}`}
    >
      {text}
    </span>
  );
}
