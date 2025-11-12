"use client"

import Landing from "@/pages/Landing";
import { useEffect } from 'react';
import { initLenis, destroyLenis } from '@/lib/lenis';

export default function Page() {
    useEffect(() => {
    const _enisInstance = initLenis();
    
    return () => {
      destroyLenis();
    };
  }, []);

      useEffect(() => {
    // Create toast container
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <span>This site is a work in progress, just like any good data project — improving with every iteration.</span>
        <svg width="22" height="22" viewBox="0 0 36 36" style="flex-shrink: 0;">
          <circle cx="18" cy="18" r="16" stroke="rgba(255,255,255,0.3)" stroke-width="3" fill="none" />
          <circle cx="18" cy="18" r="16" stroke="white" stroke-width="3" fill="none"
            stroke-dasharray="100"
            stroke-dashoffset="0"
            stroke-linecap="round"
            style="transform: rotate(-90deg); transform-origin: center;"
          />
        </svg>
      </div>
    `;

    // Glassy Apple-style design
    Object.assign(toast.style, {
      position: 'fixed',
      top: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: 'rgba(255, 255, 255, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      color: '#fff',
      padding: '14px 22px',
      borderRadius: '16px',
      fontSize: '15px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.6s ease, bottom 0.6s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });

    document.body.appendChild(toast);

    // Animate toast in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.top = '50px';
    }, 200);

    // Animate countdown circle
    const circle = toast.querySelectorAll('circle')[1];
    let offset = 0;
    const duration = 5000; // 5 seconds
    const interval = 50;
    const totalSteps = duration / interval;
    const dashLength = 100;
    const step = dashLength / totalSteps;

    const countdown = setInterval(() => {
      offset += step;
      circle.setAttribute('stroke-dashoffset', offset.toFixed(2));
    }, interval);

    // Fade out & cleanup after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.bottom = '30px';
      clearInterval(countdown);
      setTimeout(() => toast.remove(), 600);
    }, duration);

    return () => {
      clearInterval(countdown);
      toast.remove();
    };
  }, []);
    
  return <Landing />;
}
