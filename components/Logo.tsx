"use client";

import React from "react";

type LogoProps = {
  size?: number; // px
  className?: string;
  glowColor?: string; // tailwind-compatible e.g. 'shadow-blue-400/40'
};

export default function Logo({ size = 64, className = "", glowColor = "shadow-blue-400/40" }: LogoProps) {
  const px = `${size}px`;
  return (
    <div
      className={[
        "inline-flex items-center justify-center rounded-2xl bg-gray-900",
        "shadow-lg",
        glowColor,
        className,
      ].join(" ")}
      style={{ width: px, height: px }}
      aria-label="WhatsDown logo"
    >
      {/* Minimal geometric speech bubble outline */}
      <svg
        width={Math.round(size * 0.58)}
        height={Math.round(size * 0.58)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
      >
        <path
          d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9.5L5 21v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
