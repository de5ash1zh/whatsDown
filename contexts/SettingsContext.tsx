"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SettingsState = {
  reduceMotion: boolean;
  compactDensity: boolean;
  unreadGlow: boolean;
  setReduceMotion: (v: boolean) => void;
  setCompactDensity: (v: boolean) => void;
  setUnreadGlow: (v: boolean) => void;
};

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [compactDensity, setCompactDensity] = useState(false);
  const [unreadGlow, setUnreadGlow] = useState(true);

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('whatsdown_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.reduceMotion === 'boolean') setReduceMotion(parsed.reduceMotion);
        if (typeof parsed.compactDensity === 'boolean') setCompactDensity(parsed.compactDensity);
        if (typeof parsed.unreadGlow === 'boolean') setUnreadGlow(parsed.unreadGlow);
      }
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(
        'whatsdown_settings',
        JSON.stringify({ reduceMotion, compactDensity, unreadGlow })
      );
    } catch {}
  }, [reduceMotion, compactDensity, unreadGlow]);

  // Apply body class for reduce-motion
  useEffect(() => {
    const cls = 'reduce-motion';
    if (reduceMotion) document.documentElement.classList.add(cls);
    else document.documentElement.classList.remove(cls);
  }, [reduceMotion]);

  // Apply class for compact density
  useEffect(() => {
    const cls = 'compact-density';
    if (compactDensity) document.documentElement.classList.add(cls);
    else document.documentElement.classList.remove(cls);
  }, [compactDensity]);

  // Apply class for unread glow toggle (disable when false)
  useEffect(() => {
    const cls = 'no-unread-glow';
    if (!unreadGlow) document.documentElement.classList.add(cls);
    else document.documentElement.classList.remove(cls);
  }, [unreadGlow]);

  const value = useMemo(
    () => ({ reduceMotion, compactDensity, unreadGlow, setReduceMotion, setCompactDensity, setUnreadGlow }),
    [reduceMotion, compactDensity, unreadGlow]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
