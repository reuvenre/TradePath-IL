"use client";

import { useEffect } from "react";
import { addLessonTime, startLesson } from "@/lib/learner/actions";

const TICK_SECONDS = 60;

/** Marks the lesson started and adds a minute of reading time for every visible minute on the page. */
export function LessonTimer({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    void startLesson(lessonId);
    let visibleSince = document.visibilityState === "visible" ? Date.now() : null;
    let banked = 0;

    const flush = () => {
      if (visibleSince !== null) {
        banked += (Date.now() - visibleSince) / 1000;
        visibleSince = Date.now();
      }
      const whole = Math.floor(banked);
      if (whole >= TICK_SECONDS) {
        banked -= whole;
        void addLessonTime(lessonId, Math.min(whole, 600));
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") visibleSince = Date.now();
      else {
        flush();
        visibleSince = null;
      }
    };
    const interval = window.setInterval(flush, TICK_SECONDS * 1000);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [lessonId]);
  return null;
}
