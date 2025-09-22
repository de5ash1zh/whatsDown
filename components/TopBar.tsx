"use client";

import React from "react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import Logo from "@/components/Logo";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-[100] bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75 border-b border-white/10 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size={28} className="shadow-none" />
          <span className="text-sm text-white/90 font-semibold tracking-wide">WhatsDown</span>
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton>
            <button className="text-xs px-3 py-1.5 rounded-md border border-white/15 text-white/90 hover:border-white/25 hover:bg-white/5 transition dur-200 ease-standard">
              Logout
            </button>
          </SignOutButton>
          <div className="h-8 w-[1px] bg-white/10 mx-1" />
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        </div>
      </div>
    </div>
  );
}
