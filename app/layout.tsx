import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import TopAccentSweep from '@/components/TopAccentSweep';
import TopBar from '@/components/TopBar';
import { SettingsProvider } from '@/contexts/SettingsContext';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhatsDown - Real-time Chat",
  description: "A real-time chat application with Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SettingsProvider>
            <RealtimeProvider>
              <TopAccentSweep />
              <TopBar />
              <div className="pt-12">{children}</div>
            </RealtimeProvider>
          </SettingsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
