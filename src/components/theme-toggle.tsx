import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme.ts";
import { Switch } from "@/components/ui/switch.tsx";
import { Label } from "@/components/ui/label.tsx";
import { memo } from "react";

export const ThemeToggle = memo(function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className="h-4 w-4 text-orange-200 transition-colors" />
      <Switch
        id="theme-mode"
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
        aria-label="Toggle dark mode"
        className="cursor-pointer"
      />
      <Moon className="h-4 w-4 text-slate-200 transition-colors" />

      <Label htmlFor="theme-mode" className="sr-only">
        Toggle Dark Mode
      </Label>
    </div>
  );
});
