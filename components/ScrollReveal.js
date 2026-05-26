"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/*
  ScrollReveal — GPU-Optimised (Android-safe)
  ────────────────────────────────────────────
  • Uses ONLY opacity + translateY — both are GPU-composited on Android/Chrome
  • No filter:blur (causes software-render & frame drops on Android)
  • No scale (avoids layout recalculation on low-end devices)
  • Bidirectional:
      Scroll DOWN → element slides in from BELOW  ↑
      Scroll UP   → element slides in from ABOVE  ↓
  • Resets when element leaves viewport so it re-animates each pass
*/

// ── Global scroll direction (module-level, client-only) ──
let _dir   = "down";
let _prevY = 0;
if (typeof window !== "undefined") {
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      _dir   = y >= _prevY ? "down" : "up";
      _prevY = y;
    },
    { passive: true }
  );
}

export default function ScrollReveal({ children, yOffset = 48, delay = 0 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, {
    once:   false,
    margin: "0px 0px -60px 0px",
  });

  // null = hidden | "down" = entered scrolling down | "up" = entered scrolling up
  const [state, setState] = useState(null);

  useEffect(() => {
    if (inView) {
      setState(_dir);     // snapshot direction at moment of entry
    } else {
      setState(null);     // left viewport → reset
    }
  }, [inView]);

  return (
    <motion.div
      ref={ref}
      className="w-full"
      // Force GPU layer from the start — avoids promotion jank on Android
      style={{ willChange: "transform, opacity" }}
      initial={false}
      animate={
        state
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: state === "up" ? -yOffset : yOffset }
      }
      transition={{
        duration: 0.48,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],  // "easeOutQuart" — smooth on all devices
      }}
    >
      {children}
    </motion.div>
  );
}
