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
  return <Landing />;
}
