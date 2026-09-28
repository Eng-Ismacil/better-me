"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Ultra-thin progress bar at the top of the page that shows on every
 * client-side navigation. Gives the "instant feel" of React Router DOM
 * without any hard page reloads or compile waits.
 */
export default function PageProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    // Clear any running timer
    if (timerRef.current) clearInterval(timerRef.current);

    // Start fast progress bar
    setProgress(0);
    setVisible(true);

    let current = 0;
    timerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      // Quick rush to 85 then slow down waiting for render
      const increment = current < 30 ? 15 : current < 60 ? 8 : current < 80 ? 3 : 0.5;
      current = Math.min(current + increment, 89);
      setProgress(current);
    }, 60);

    // Complete after 400ms (most SSR pages render in < 300ms on local)
    const completeTimer = setTimeout(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mountedRef.current) {
        setProgress(100);
        setTimeout(() => {
          if (mountedRef.current) setVisible(false);
        }, 250);
      }
    }, 400);

    return () => {
      clearInterval(timerRef.current!);
      clearTimeout(completeTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div
        className="h-[2.5px] bg-gradient-to-r from-[#007AFF] via-[#22C55E] to-[#007AFF] shadow-[0_0_8px_rgba(0,122,255,0.6)] transition-all"
        style={{
          width: `${progress}%`,
          transition:
            progress === 100
              ? "width 150ms ease-out, opacity 200ms ease"
              : "width 60ms linear",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
