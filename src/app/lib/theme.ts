import { createTheme, PaletteMode } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

// Create theme options for both light and dark modes
export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: "#3b82f6", // Vibrant blue (passes AA contrast)
      light: "#60a5fa", // Soft blue highlight
      dark: "#2563eb", // Deep blue
      contrastText: "#ffffff", // High-contrast white
    },
    secondary: {
      main: "#10b981", // Emerald green (better AA contrast than previous green)
      light: "#34d399", // Softer green highlight
      dark: "#059669", // Dark green
      contrastText: "#ffffff", // White text
    },
    background:
      mode === "dark"
        ? {
            default: "#050507", // Deeper charcoal for better contrast
            paper: "#18181b", // UI surface (cards, modals)
          }
        : {
            default: "#f9fafb", // Light background
            paper: "#ffffff", // White surface
          },
    text:
      mode === "dark"
        ? {
            primary: "#f9fafb", // Crisp white (passes AAA contrast)
            secondary: "#d1d5db", // Light gray (increased contrast - passes AA)
          }
        : {
            primary: "#18181b", // Dark text for light mode
            secondary: "#4b5563", // Medium gray for secondary text
          },
    error: {
      main: "#ef4444", // Red with better contrast
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b", // Amber with better contrast
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#10b981", // Emerald with better contrast
      light: "#34d399",
      dark: "#059669",
    },
  },
  typography: {
    fontFamily: "'Geist Sans', sans-serif",
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === "dark" ? "#050507" : "#f9fafb",
          color: mode === "dark" ? "#f9fafb" : "#18181b",
          colorScheme: mode,
          scrollBehavior: "smooth",
        },
        "::selection": {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          textTransform: "none",
          transition: "all 0.3s ease",
          fontWeight: 500,
          padding: "10px 16px",
          letterSpacing: "0.01em",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: mode === "dark" ? "#18181b" : "#ffffff",
          borderRadius: "12px",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "rgba(5, 5, 7, 0.8)" : "rgba(249, 250, 251, 0.8)",
          backdropFilter: "blur(10px)",
          transition: "background-color 0.3s ease",
          boxShadow:
            mode === "dark" ? "0 4px 20px rgba(0, 0, 0, 0.25)" : "0 1px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: 0, // Explicitly set no border radius
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          fontSize: "0.85rem",
          height: "auto",
          padding: "6px 0",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          transition: "color 0.2s ease",
          position: "relative",
          "&:hover": {
            textDecoration: "none",
          },
        },
      },
    },
  },
});

// Create themes
export const createAppTheme = (mode: PaletteMode) => {
  return createTheme(getThemeOptions(mode));
};

// Export default themes
const darkTheme = createAppTheme("dark");
export const lightTheme = createAppTheme("light");

export default darkTheme;
