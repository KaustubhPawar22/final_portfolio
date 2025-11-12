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
    const toast = document.createElement('div');
    toast.textContent = 'This site is a work in progress, just like any good data project — improving with every iteration.';
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#333',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '10px',
      fontSize: '15px',
      zIndex: '1000',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      opacity: '0',
      transition: 'opacity 0.5s',
    });

    document.body.appendChild(toast);
    setTimeout(() => (toast.style.opacity = '1'), 200);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, 5000); // disappears after 5 seconds

    return () => toast.remove();
  }, []);
    
  return <Landing />;
}
