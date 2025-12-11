"use client";

import { useState, useEffect } from "react";
import ChatWoot from "./components/ChatWoot";
import ThemeToggle from "./components/ThemeToggle";
import { ColorPaletteSwitcher } from "./components/ColorPaletteSwitcher";
import VisitorCounter from "./components/VisitorCounter";

export default function Home() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 10,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-700 to-red-900 font-mono relative overflow-hidden">
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-0 text-white text-xl animate-fall pointer-events-none"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        >
          ❄
        </div>
      ))}

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* RED FEATURE BANNER - UPDATED */}
        <div className="mb-8 w-full max-w-2xl">
          <div className="bg-gradient-to-r from-red-500 via-red-400 to-red-500 border-4 border-red-700 p-6 rounded-lg shadow-2xl animate-pulse">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">✨ RED INITIATIVE ✨</p>
              <p className="text-lg text-red-50 font-semibold">Celebrating Holiday Excellence & Festive Cheer</p>
            </div>
          </div>
        </div>

        {/* Blinking Header */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-bold text-yellow-300 animate-pulse mb-4" style={{ textShadow: '3px 3px 0px #ff0000, 6px 6px 0px #DC143C' }}>
            🎄 MERRY CHRISTMAS 🎄
          </h1>
          <div className="border-4 border-dashed border-yellow-300 p-4 bg-red-800 bg-opacity-80">
            <p className="text-2xl text-white animate-bounce">
              ★ Welcome to the Retro Christmas Site ★
            </p>
          </div>
        </div>

        {/* Visitor Counter Component */}
        <VisitorCounter />

        {/* RED FEATURE BOX - ENHANCED */}
        <div className="bg-red-600 border-4 border-red-700 p-6 max-w-2xl w-full mb-8 shadow-lg">
          <h2 className="text-3xl text-white text-center mb-4 font-bold underline">
            🎅 RED STATUS INDICATOR 🎅
          </h2>
          <div className="bg-red-700 border-2 border-red-400 p-4 rounded text-center">
            <div className="flex justify-center mb-3">
              <div className="w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white font-bold text-lg">✓ System Operating at Peak Red Efficiency</p>
            <p className="text-red-100 text-sm mt-2">Holiday Mode: ENABLED</p>
          </div>
        </div>

        {/* GREEN FEATURE BOX - NEW */}
        <div className="bg-green-600 border-4 border-green-700 p-6 max-w-2xl w-full mb-8 shadow-lg">
          <h2 className="text-3xl text-white text-center mb-4 font-bold underline">
            🌲 GREEN STATUS INDICATOR 🌲
          </h2>
          <div className="bg-green-700 border-2 border-green-400 p-4 rounded text-center">
            <div className="flex justify-center mb-3">
              <div className="w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <p className="text-white font-bold text-lg">✓ System Operating at Peak Green Efficiency</p>
            <p className="text-green-100 text-sm mt-2">Eco Mode: ENABLED</p>
          </div>
        </div>

        {/* Retro Links Section */}
        <div className="bg-red-800 border-4 border-double border-yellow-300 p-6 max-w-2xl w-full mb-8">
          <h2 className="text-3xl text-yellow-300 text-center mb-4 underline">
            🎁 CHRISTMAS LINKS 🎁
          </h2>
          <div className="space-y-3">
            <a href="#" className="block bg-red-700 border-2 border-yellow-300 p-3 text-yellow-300 hover:bg-red-600 transition-colors">
              <span className="text-xl">🎵</span> Listen to Jingle Bells (MIDI)
            </a>
            <a href="#" className="block bg-red-700 border-2 border-yellow-300 p-3 text-yellow-300 hover:bg-red-600 transition-colors">
              <span className="text-xl">🎅</span> Track Santa&apos;s Location
            </a>
            <a href="#" className="block bg-red-700 border-2 border-yellow-300 p-3 text-yellow-300 hover:bg-red-600 transition-colors">
              <span className="text-xl">🎄</span> ASCII Christmas Tree Gallery
            </a>
            <a href="#" className="block bg-red-700 border-2 border-yellow-300 p-3 text-yellow-300 hover:bg-red-600 transition-colors">
              <span className="text-xl">🎁</span> Sign My Guestbook!
            </a>
          </div>
        </div>

        {/* GREEN ACCENT HIGHLIGHT - NEW */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-600 border-4 border-green-700 p-4 rounded-lg">
            <p className="text-white text-center font-bold text-lg">
              🟢 Green Initiative Powers This Experience 🟢
            </p>
            <p className="text-green-50 text-center text-sm mt-2">
              Eco-conscious design and sustainable development practices
            </p>
          </div>
        </div>

        {/* RED ACCENT HIGHLIGHT - UPDATED */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-gradient-to-r from-red-500 to-red-600 border-4 border-red-700 p-4 rounded-lg">
            <p className="text-white text-center font-bold text-lg">
              🔴 Red Holiday Spirit Powers This Experience 🔴
            </p>
            <p className="text-red-50 text-center text-sm mt-2">
              Built with festive enthusiasm and holiday-conscious design
            </p>
          </div>
        </div>

        {/* Under Construction Banner */}
        <div className="bg-yellow-300 border-4 border-black p-4 flex items-center gap-4 mb-8">
          <span className="text-4xl animate-bounce">🚧</span>
          <p className="text-black font-bold text-xl">UNDER CONSTRUCTION</p>
          <span className="text-4xl animate-bounce">🚧</span>
        </div>

        {/* Marquee Text */}
        <div className="bg-red-700 border-2 border-yellow-300 w-full max-w-2xl p-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-yellow-300 text-xl font-bold">
              🎄 HAPPY HOLIDAYS! 🎅 MERRY CHRISTMAS! 🎁 SEASON&apos;S GREETINGS! ⭐ JOY TO THE WORLD! 🔔 PEACE ON EARTH! 🎄 HAPPY HOLIDAYS! 🎅 MERRY CHRISTMAS! 🎁
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-yellow-300 text-sm mb-2">
            Best viewed in Netscape Navigator 4.0+
          </p>
          <p className="text-yellow-300 text-sm">
            Made with ❤️ in 1997 (actually {new Date().getFullYear()})
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Best viewed in IE" className="h-8 bg-gray-400 px-4 border-2 border-black" />
            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Netscape Now" className="h-8 bg-gray-400 px-4 border-2 border-black" />
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0.8;
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-fall {
          animation: fall linear infinite;
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
      <ChatWoot />
    </div>
  );
}
