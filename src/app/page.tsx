"use client"

// app/page.tsx
import Landing from "@/pages/Landing";
import { useEffect } from 'react';
import { initLenis, destroyLenis } from '@/lib/lenis';

export default function Page() {
    useEffect(() => {
    const lenisInstance = initLenis();
    
    return () => {
      destroyLenis();
    };
  }, []);
  return <Landing />;
}
