"use client";

import Link from "next/link";
import ChatSW from "./components/ChatSW";
import ThemeToggle from "./components/ThemeToggle";
import { ColorPaletteSwitcher } from "./components/ColorPaletteSwitcher";
import VisitorCounter from "./components/VisitorCounter";
import ServerVisitorCounter from "./components/ServerVisitorCounter";
import SnowflakeContainer from "./components/SnowflakeContainer";
import Counter from "./components/Counter";
import { ModalTestPanel } from "./components/ModalTestPanel";

// Feature flag for snowflake effect - can be toggled via environment variable or configuration
const SNOWFLAKE_FEATURE_ENABLED = true;

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-600 font-mono relative overflow-hidden">
      {/* Enhanced Snowflake Container with hundreds of animated snowflakes */}
      <SnowflakeContainer
        enabled={SNOWFLAKE_FEATURE_ENABLED}
        snowflakeCount={300}
        speed={1}
        windStrength={0.3}
        opacity={0.8}
      />

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* RED FEATURE BANNER - ARCADE STYLED */}
        <div className="mb-8 w-full max-w-2xl">
          <div className="arcade-featured-card arcade-neon-magenta p-6">
            <div className="text-center">
              <p className="arcade-header">✨ HAPPY HOLIDAYS ✨</p>
              <p className="arcade-header-subtitle">Celebrating Holiday Excellence & Festive Cheer</p>
            </div>
          </div>
        </div>

        {/* Blinking Header - ARCADE STYLED */}
        <div className="mb-8 text-center">
          <h1 className="arcade-header arcade-neon-yellow mb-4 animate-pulse">
            🎄 MERRY CHRISTMAS 🎄
          </h1>
          <div className="arcade-featured-card arcade-neon-cyan p-4">
            <p className="arcade-text-large text-white animate-bounce">
              ★ Welcome to the Retro Christmas Site ★
            </p>
          </div>
        </div>

        {/* Original Visitor Counter Component */}
        <VisitorCounter />

        {/* Counter Component - 90s Styled */}
        <Counter />

        {/* Modal Test Panel - 90s Styled */}
        <ModalTestPanel />

        {/* Server-Side Visitor Counter Component */}
        <ServerVisitorCounter />

        {/* RED FEATURE BOX - ENHANCED WITH ARCADE STYLING */}
        <div className="arcade-featured-card arcade-neon-magenta p-6 max-w-2xl w-full mb-8">
          <h2 className="arcade-card-title arcade-neon-magenta">
            🎅 HAPPY HOLIDAYS STATUS INDICATOR 🎅
          </h2>
          <div className="arcade-featured-card arcade-neon-pink p-4 rounded text-center">
            <div className="flex justify-center mb-3">
              <div className="w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
            </div>
            <p className="arcade-text-medium text-white font-bold">✓ System Operating at Peak Holiday Efficiency</p>
            <p className="arcade-text text-red-100 mt-2">Holiday Mode: ENABLED</p>
          </div>
        </div>

        {/* GREEN FEATURE BOX - NEW WITH ARCADE STYLING */}
        <div className="arcade-featured-card arcade-neon-cyan p-6 max-w-2xl w-full mb-8">
          <h2 className="arcade-card-title arcade-neon-cyan">
            🌲 GREEN STATUS INDICATOR 🌲
          </h2>
          <div className="arcade-featured-card arcade-neon-blue p-4 rounded text-center">
            <div className="flex justify-center mb-3">
              <div className="w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="arcade-text-medium text-white font-bold">✓ System Operating at Peak Green Efficiency</p>
            <p className="arcade-text text-green-100 mt-2">Eco Mode: ENABLED</p>
          </div>
        </div>

        {/* Retro Links Section - ARCADE STYLED */}
        <div className="arcade-featured-card arcade-neon-yellow p-6 max-w-2xl w-full mb-8">
          <h2 className="arcade-card-title arcade-neon-yellow">
            🎁 CHRISTMAS LINKS 🎁
          </h2>
          <div className="space-y-3">
            <Link href="/stats" className="arcade-button w-full text-left">
              <span className="text-xl">📊</span> View Visitor Statistics
            </Link>
            <a href="#" className="arcade-button w-full text-left block">
              <span className="text-xl">🎵</span> Listen to Jingle Bells (MIDI)
            </a>
            <a href="#" className="arcade-button w-full text-left block">
              <span className="text-xl">🎅</span> Track Santa&apos;s Location
            </a>
            <a href="#" className="arcade-button w-full text-left block">
              <span className="text-xl">🎄</span> ASCII Christmas Tree Gallery
            </a>
            <a href="#" className="arcade-button w-full text-left block">
              <span className="text-xl">🎁</span> Sign My Guestbook!
            </a>
          </div>
        </div>

        {/* GREEN ACCENT HIGHLIGHT - ARCADE STYLED */}
        <div className="w-full max-w-2xl mb-8">
          <div className="arcade-featured-card arcade-neon-blue p-4">
            <p className="arcade-text-medium text-white text-center font-bold">
              🟢 Green Initiative Powers This Experience 🟢
            </p>
            <p className="arcade-text text-green-50 text-center mt-2">
              Eco-conscious design and sustainable development practices
            </p>
          </div>
        </div>

        {/* RED ACCENT HIGHLIGHT - ARCADE STYLED */}
        <div className="w-full max-w-2xl mb-8">
          <div className="arcade-featured-card arcade-neon-magenta p-4">
            <p className="arcade-text-medium text-white text-center font-bold">
              🔴 Happy Holidays Spirit Powers This Experience 🔴
            </p>
            <p className="arcade-text text-red-50 text-center mt-2">
              Built with festive enthusiasm and holiday-conscious design
            </p>
          </div>
        </div>

        {/* Under Construction Banner */}
        <div className="arcade-featured-card arcade-neon-yellow border-4 p-4 flex items-center gap-4 mb-8">
          <span className="text-4xl animate-bounce">🚧</span>
          <p className="arcade-text font-bold">UNDER CONSTRUCTION</p>
          <span className="text-4xl animate-bounce">🚧</span>
        </div>

        {/* Marquee Text - ARCADE STYLED */}
        <div className="arcade-marquee w-full max-w-2xl p-2">
          <div className="arcade-marquee-content">
            <span>
              🎄 HAPPY HOLIDAYS! 🎅 MERRY CHRISTMAS! 🎁 SEASON&apos;S GREETINGS! ⭐ JOY TO THE WORLD! 🔔 PEACE ON EARTH! 🎄 HAPPY HOLIDAYS! 🎅 MERRY CHRISTMAS! 🎁
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="arcade-text-medium text-yellow-300 mb-2">
            Best viewed in Netscape Navigator 4.0+
          </p>
          <p className="arcade-text-medium text-yellow-300">
            Made with ❤️ in 1997 (actually {new Date().getFullYear()})
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Best viewed in IE" className="h-8 bg-gray-400 px-4 border-2 border-black" />
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Netscape Now" className="h-8 bg-gray-400 px-4 border-2 border-black" />
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Color Palette Switcher */}
      <ColorPaletteSwitcher />

      {/* ChatWoot Component */}
      <ChatSW />
    </div>
  );
}
