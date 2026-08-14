import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Command } from "lucide-react";
import { SECTIONS } from "../../constants";
import { scrollToSection } from "../../hooks/useLenis";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { togglePalette } from "../../store/slices/uiSlice";
import { ThemeToggle } from "./ThemeToggle";
import { AIChatLauncher } from "../ai/AIChatLauncher";
import { cn } from "../../utils/cn";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const active = useAppSelector((s) => s.ui.activeSection);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = SECTIONS.filter((s) =>
    ["about", "projects", "ai-assistant", "contact"].includes(s.id),
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all",
        scrolled ? "py-3" : "py-5",
      )}
    >
      <div className="section-container">
        <div
          className={cn(
            "flex items-center justify-between rounded-full px-4 py-2 transition-all",
            scrolled ? "glass shadow-card" : "bg-transparent",
          )}
        >
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-2 font-mono text-sm font-medium"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-text-inverse">
              V
            </span>
            <span className="hidden sm:inline">Vishnu Baalan B</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {visible.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text",
                  active === s.id && "text-text",
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AIChatLauncher variant="pill" />
            <button
              onClick={() => dispatch(togglePalette())}
              className="hidden items-center gap-1.5 rounded-full border border-border bg-surface/60 px-2.5 py-1 text-xs text-text-muted transition-colors hover:text-text sm:flex"
              aria-label="Open command palette"
            >
              <Command className="h-3 w-3" />
              <span className="font-mono">K</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
