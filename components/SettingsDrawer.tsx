"use client";

import React from "react";

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-[200] ${open ? '' : 'pointer-events-none'}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity dur-200 ease-standard ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[88%] sm:w-[420px] bg-white shadow-2xl border-l border-gray-200 p-5 transition-transform dur-250 ease-standard ${
          open ? 'translate-x-0 slide-fade-right' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            className="rounded-md p-2 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Toggle: Reduce motion */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Reduce motion</div>
              <div className="text-xs text-gray-500">Minimize animations for performance</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors dur-200 ease-standard">
              <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow ring-1 ring-gray-300 transition dur-200 ease-standard translate-x-0" />
            </button>
          </div>

          {/* Toggle: Compact density */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Compact density</div>
              <div className="text-xs text-gray-500">Smaller paddings in list and bubbles</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500/20 transition-colors dur-200 ease-standard">
              <span className="inline-block h-5 w-5 transform rounded-full bg-blue-500 shadow transition dur-200 ease-standard translate-x-5" />
            </button>
          </div>

          {/* Toggle: Unread glow */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">Unread glow</div>
              <div className="text-xs text-gray-500">Animate unread indicators</div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500/20 transition-colors dur-200 ease-standard">
              <span className="inline-block h-5 w-5 transform rounded-full bg-blue-500 shadow transition dur-200 ease-standard translate-x-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          Changes are applied instantly and saved locally.
        </div>
      </div>
    </div>
  );
}
