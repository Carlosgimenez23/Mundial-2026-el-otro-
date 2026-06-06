'use client';

import { useEffect, useState } from 'react';
import { SSR_NOW } from '@/lib/data';

/**
 * Real-time clock. Initial render (server + client hydration) uses a fixed
 * pre-tournament constant so there is no hydration mismatch; after mount it
 * switches to the real system clock and ticks every `intervalMs`.
 */
export function useNow(intervalMs = 1000): { now: number; mounted: boolean } {
  const [now, setNow] = useState(SSR_NOW);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { now, mounted };
}
