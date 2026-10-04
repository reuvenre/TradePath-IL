"use client";

import { useEffect, useState } from "react";
import { he } from "@/lib/strings/he";

/** Thin bar under the top bar showing how far down the lesson the reader is. */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPct(max <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / max) * 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div
      role="progressbar"
      aria-label={he.lesson.readingProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="sticky top-14 z-10 -mx-4 h-1 bg-muted"
    >
      <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
    </div>
  );
}
