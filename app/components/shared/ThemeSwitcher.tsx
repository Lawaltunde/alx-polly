"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      className="flex items-center justify-center w-10 h-10 rounded-full bg-muted"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="w-5 h-5 text-foreground dark:hidden" />
      <Moon className="w-5 h-5 text-foreground hidden dark:block" />
    </button>
  );
}