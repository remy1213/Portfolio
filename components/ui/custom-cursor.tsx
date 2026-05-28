"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setHasFinePointer(window.matchMedia("(pointer: fine)").matches);
    }
  }, []);

  useEffect(() => {
    if (!mounted || !hasFinePointer) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Set initial position off-screen
    cursor.style.left = "-100px";
    cursor.style.top = "-100px";

    const onMouseMove = (e: MouseEvent) => {
      // Use left and top instead of transform to avoid triggering a new stacking context
      cursor.style.left = `${e.clientX - 8}px`;
      cursor.style.top = `${e.clientY - 8}px`;
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [mounted, hasFinePointer]);

  if (!mounted || !hasFinePointer) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] w-4 h-4 bg-white rounded-full mix-blend-difference opacity-70"
    />
  );
}
