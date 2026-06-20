import * as React from "react";
import { useEffect, useState } from "react";
import type { AppTheme } from "@/lib/types.ts";
import { ThemeContext } from "@/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(() => {
    // use the theme from local storage if available
    const saved = localStorage.getItem("theme") as AppTheme | null;
    if (saved) return saved;

    // otherwise, set the initial theme based on system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}
