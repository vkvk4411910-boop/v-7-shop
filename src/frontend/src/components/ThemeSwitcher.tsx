import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { THEMES } from "@/types";
import { useEffect } from "react";

export function ThemeSwitcher() {
  const { activeTheme, setTheme } = useStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  return (
    <div
      className="flex items-center gap-1.5"
      role="radiogroup"
      aria-label="Color theme"
      data-ocid="theme-switcher"
    >
      {THEMES.map((theme) => (
        <button
          type="button"
          key={theme.id}
          role="radio"
          aria-checked={activeTheme === theme.id}
          aria-label={`${theme.label} theme`}
          onClick={() => setTheme(theme.id)}
          className={cn(
            "w-6 h-6 rounded-full border-2 transition-smooth cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
            activeTheme === theme.id
              ? "border-white scale-110 shadow-lg ring-2 ring-white/50"
              : "border-white/40 hover:border-white hover:scale-105 opacity-80 hover:opacity-100",
          )}
          style={{ backgroundColor: theme.color }}
          data-ocid={`theme-${theme.id}`}
        />
      ))}
    </div>
  );
}
