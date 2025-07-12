"use client";
import {
  ReactNode,
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "../lib/theme";

// Create a theme context with toggle function
type ThemeContextType = {
  mode: "light" | "dark";
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  toggleTheme: () => {},
});

// Hook to use the theme context
export const useThemeMode = () => useContext(ThemeContext);

// Separate component for client-side rendering
function ClientThemeRegistry({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");

  // Effect to load saved theme preference after hydration
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme-mode");
      if (savedTheme === "light" || savedTheme === "dark") {
        setMode(savedTheme);
      } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ) {
        // Use system preference as fallback
        setMode("light");
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, []);

  // Toggle function
  const toggleTheme = () => {
    setMode(prevMode => {
      const newMode = prevMode === "light" ? "dark" : "light";
      try {
        localStorage.setItem("theme-mode", newMode);
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
      return newMode;
    });
  };

  // Create memoized context value
  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
    }),
    [mode]
  );

  // Create theme
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeProvider theme={theme}>
        {children}
        <style jsx global>{`
          /* Global transition effects */
          *,
          *::before,
          *::after {
            transition:
              background-color 0.3s ease,
              color 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease;
          }

          /* Animations */
          @keyframes toDark {
            0% {
              filter: brightness(1.1) saturate(1.05);
            }
            100% {
              filter: brightness(1) saturate(1);
            }
          }

          @keyframes toLight {
            0% {
              filter: brightness(0.9) saturate(0.95);
            }
            100% {
              filter: brightness(1) saturate(1);
            }
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -100% 0;
            }
            100% {
              background-position: 100% 0;
            }
          }
        `}</style>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

// Main ThemeRegistry component
export function ThemeRegistry({ children }: { children: ReactNode }) {
  // Use static theme for server rendering
  const serverTheme = createAppTheme("dark");

  // For server-side rendering or during hydration
  return (
    <ThemeProvider theme={serverTheme}>
      <CssBaseline />
      <ClientThemeRegistry>{children}</ClientThemeRegistry>
    </ThemeProvider>
  );
}
