import { createContext, use } from "react";
import type { AppTheme } from "@/lib/types.ts";

export const ThemeContext = createContext<{
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
} | null>(null);

export const useTheme = () => {
  const context = use(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
