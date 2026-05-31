"use client";

import { ReactNode, createContext, useState, useContext, useMemo, useEffect } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "../lib/theme";

type ThemeContextType = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export function ThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme-mode");
      if (savedTheme === "light" || savedTheme === "dark") {
        setMode(savedTheme);
        return;
      }

      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        setMode("light");
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme-mode", newMode);
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
      return newMode;
    });
  };

  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <AppRouterCacheProvider>
      <ThemeContext.Provider value={themeContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeContext.Provider>
    </AppRouterCacheProvider>
  );
}
