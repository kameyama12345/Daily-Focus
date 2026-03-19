"use client";

import { MoonStar, SunMedium } from "lucide-react";

export type ThemeMode = "light" | "dark";

export function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: ThemeMode;
  onToggle: () => void;
}) {
  return (
    <button
      className="surface-soft flex h-10 w-10 items-center justify-center rounded-full transition"
      onClick={onToggle}
      type="button"
    >
      {theme === "dark" ? (
        <SunMedium className="h-4 w-4 text-[var(--accent)]" />
      ) : (
        <MoonStar className="h-4 w-4 text-[var(--accent)]" />
      )}
    </button>
  );
}
