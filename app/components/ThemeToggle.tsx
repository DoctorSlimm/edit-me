"use client";

import { useTheme } from "@/lib/use-theme";

export function ThemeToggle() {
  const { backgroundInverted, toggleBackgroundInversion } = useTheme();

  return (
    <button
      onClick={toggleBackgroundInversion}
      className="fixed top-4 right-4 z-50 px-4 py-2 bg-yellow-300 text-black border-2 border-black rounded hover:bg-yellow-200 transition-colors font-bold"
      title={backgroundInverted ? "Disable inversion" : "Enable inversion"}
      aria-label="Toggle background inversion"
    >
      {backgroundInverted ? "🌙 Invert Off" : "☀️ Invert On"}
    </button>
  );
}
