"use client";

import React, { useState } from "react";

type TooltipProps = {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({ label, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const pos =
    side === "top"
      ? "bottom-full left-1/2 -translate-x-1/2 mb-2"
      : side === "bottom"
      ? "top-full left-1/2 -translate-x-1/2 mt-2"
      : side === "left"
      ? "right-full top-1/2 -translate-y-1/2 mr-2"
      : "left-full top-1/2 -translate-y-1/2 ml-2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      <span
        className={`pointer-events-none absolute whitespace-nowrap rounded-md bg-black/85 text-white text-[11px] px-2 py-1 shadow transition-opacity dur-200 ease-standard ${
          open ? "opacity-100" : "opacity-0"
        } ${pos}`}
        role="tooltip"
      >
        {label}
      </span>
    </span>
  );
}
