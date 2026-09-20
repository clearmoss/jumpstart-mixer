import { Moon, Sun } from "lucide-react";
import { memo } from "react";

import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { useTheme } from "@/hooks/use-theme.ts";

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-orange-100 px-3 py-2 dark:bg-card"
      title="Toggle theme"
    >
      <Sun className="h-4 w-4 text-orange-700 transition-colors dark:text-orange-300" />
      <Switch
        id="theme-mode"
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
        aria-label="Toggle dark mode"
        className="cursor-pointer"
      />
      <Moon className="h-4 w-4 text-slate-500 transition-colors dark:text-slate-200" />

      <Label htmlFor="theme-mode" className="sr-only">
        Toggle Dark Mode
      </Label>
    </div>
  );
});
