"use client";

import React, { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export default function ScrollProgressBar() {
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Tuned config: firmer mouse-wheel, slight buttery slide, ease-in curve
    const config = prefersReduced
      ? { smooth: false, smoothTouch: false, wheelMultiplier: 1 }
      : {
          smooth: true,
          smoothTouch: true,   // keep touch slightly softer
          duration: 0.7,       // quicker settle than buttery preset
          lerp: 0.28,          // firmer interpolation for mouse wheel
          wheelMultiplier: 0.85, // moderate wheel travel per tick
          touchMultiplier: 0.95,
          // subtle ease-in curve for natural ramp-up
          easing: (t: number) => Math.pow(t, 1.4),
        };

    const lenis = new Lenis(config);

    let rafId = 0;
    function updateProgressBar(lenisInstance: Lenis) {
      const rawLimit = (lenisInstance as any).limit;
      const limit =
        rawLimit && !isNaN(rawLimit)
          ? rawLimit
          : Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);

      const scroll = (lenisInstance as any).scroll ?? window.scrollY;
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

    // expose instance for dev debugging
    if (process.env.NODE_ENV === "development") (window as any).__lenis = lenis;

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        if (typeof (lenis as any).destroy === "function") (lenis as any).destroy();
      } catch (e) {
        /* ignore destroy errors */
      }
      if ((window as any).__lenis) delete (window as any).__lenis;
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
