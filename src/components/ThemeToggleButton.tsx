import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggleButton() {
  const [isDark, setIsDark] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");

  // Initialize theme
  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // Scroll show/hide and direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY + 10) {
        setScrollDirection("down");
        if (visible) setVisible(false);
      } else if (currentScrollY < lastScrollY - 10) {
        setScrollDirection("up");
        if (!visible) setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, visible]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      window.dispatchEvent(new Event("theme-change"));
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Transform depending on scroll direction
  const transformClass = visible
    ? "translate-y-0 opacity-100"
    : scrollDirection === "down"
    ? "-translate-y-20 opacity-0" // hide upwards when scrolling down
    : "translate-y-20 opacity-0"; // hide downwards when scrolling up

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 transition-transform duration-300 ease-in-out ${transformClass}`}
    >
      <div className="switch-wrapper cursor-pointer" onClick={toggleTheme}>
        <input type="checkbox" checked={isDark} readOnly className="hidden" />
        <span
          className="slider glass-slider relative block w-12 h-6 rounded-full transition-all duration-300
          backdrop-blur-md bg-white/20 dark:bg-gray-900/30 border border-white/30 dark:border-gray-700/50"
        >
          {/* Knob */}
          <span
            className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300
              ${isDark ? "left-[calc(100%-1rem)] bg-gray-900/60" : "left-1 bg-white/70"}`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-indigo-300 m-auto mt-0.5" />
            ) : (
              <Sun className="w-3 h-3 text-yellow-400 m-auto mt-0.5" />
            )}
          </span>
        </span>
      </div>
    </div>
  );
}
