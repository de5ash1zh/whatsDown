"use client";

import React from "react";

export type BottomTab = 'chats' | 'contacts' | 'settings';

type Props = {
  active: BottomTab;
  onChange: (t: BottomTab) => void;
};

export default function BottomTabBar({ active, onChange }: Props) {
  const item = (key: BottomTab, label: string, path?: string) => (
    <button
      key={key}
      onClick={() => onChange(key)}
      className={`flex flex-col items-center justify-center flex-1 py-2 ${
        active === key ? 'text-blue-500' : 'text-gray-400'
      }`}
      aria-label={label}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active === key ? 'bg-blue-50' : ''}`}>
        {key === 'chats' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {key === 'contacts' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A6 6 0 1118 13m-6 8a9 9 0 100-18 9 9 0 000 18z" />
          </svg>
        )}
        {key === 'settings' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.983 4.5a1.5 1.5 0 012.598-1.06l.53.53a1.5 1.5 0 001.06.44h.75a1.5 1.5 0 011.5 1.5v.75a1.5 1.5 0 00.44 1.06l.53.53a1.5 1.5 0 010 2.121l-.53.53a1.5 1.5 0 00-.44 1.06v.75a1.5 1.5 0 01-1.5 1.5h-.75a1.5 1.5 0 00-1.06.44l-.53.53a1.5 1.5 0 01-2.121 0l-.53-.53a1.5 1.5 0 00-1.06-.44h-.75a1.5 1.5 0 01-1.5-1.5v-.75a1.5 1.5 0 00-.44-1.06l-.53-.53a1.5 1.5 0 010-2.121l.53-.53a1.5 1.5 0 00.44-1.06v-.75a1.5 1.5 0 011.5-1.5h.75a1.5 1.5 0 001.06-.44l.53-.53a1.5 1.5 0 01.44-.34z" />
          </svg>
        )}
      </div>
      <span className="text-[11px] leading-tight mt-1">{label}</span>
    </button>
  );

  return (
    <div className="fixed bottom-0 inset-x-0 md:hidden bg-white/95 backdrop-blur border-t border-gray-200 z-[120]">
      <div className="max-w-screen-sm mx-auto flex items-center justify-around">
        {item('chats', 'Chats')}
        {item('contacts', 'Contacts')}
        {item('settings', 'Settings')}
      </div>
    </div>
  );
}
