"use client";

import React from "react";

/**
 * Thin animated accent line that sweeps across the top (Linear-style).
 * Always visible, extremely subtle. Position: fixed; z-index high.
 */
export default function TopAccentSweep() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 h-[2px] z-[100] overflow-hidden"
      aria-hidden
    >
      <div className="top-sweep h-full w-full" />
    </div>
  );
}
