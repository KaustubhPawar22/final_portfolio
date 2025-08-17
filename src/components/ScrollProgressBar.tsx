"use client";

import React, { useEffect } from "react";
import Lenis, { LenisOptions } from "@studio-freight/lenis";

export default function ScrollProgressBar() {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // ✅ Lenis v4 valid config
    const config: LenisOptions = prefersReduced
      ? { wheelMultiplier: 1 }
      : {
          duration: 0.7,
          lerp: 0.28,
          wheelMultiplier: 0.85,
          touchMultiplier: 0.95,
          easing: (t: number) => Math.pow(t, 1.4),
        };

    const lenis = new Lenis(config);

    let rafId = 0;

    // ✅ Progress bar updater
    function updateProgressBar(lenisInstance: Lenis) {
      const scroll =
        (lenisInstance as unknown as { scroll?: number }).scroll ??
        window.scrollY;
      const limit =
        (lenisInstance as unknown as { limit?: number }).limit ??
        Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

      const progress = limit > 0 ? Math.min(1, Math.max(0, scroll / limit)) : 0;
      const bar = document.getElementById("scroll-progress");
      if (bar) bar.style.width = `${progress * 100}%`;
    }

    function raf(time: number) {
      lenis.raf(time);
      updateProgressBar(lenis);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    if (process.env.NODE_ENV === "development") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        const destroyFn = (lenis as unknown as { destroy?: () => void }).destroy;
        if (destroyFn) destroyFn();
      } catch {
        /* ignore destroy errors */
      }
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return (
    <>
      <style>{`
        #scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 6px;
          width: 0%;
          z-index: 9999;
          background: linear-gradient(
            270deg,
            #ff0000,
            #ff7f00,
            #ffff00,
            #00ff00,
            #0000ff,
            #4b0082,
            #8b00ff,
            #ff0000
          );
          background-size: 1400% 1400%;
          animation: rainbow-wave 6s linear infinite;
          border-radius: 3px;
          box-shadow: 0 0 6px 1px rgba(255, 255, 255, 0.35);
        }

        @keyframes rainbow-wave {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      <div id="scroll-progress" />
    </>
  );
}
