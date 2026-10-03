"use client";

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = "(max-width: 767px)";

export function useCalendarViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return { isMobile };
}
