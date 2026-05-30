import { createTheme, PaletteMode } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

// Terminal-inspired color palette
export const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === "dark" ? "#00d4ff" : "#0077aa",
      light: mode === "dark" ? "#40e0ff" : "#0099cc",
      dark: mode === "dark" ? "#0099bb" : "#005580",
      contrastText: mode === "dark" ? "#0a0e14" : "#ffffff",
    },
    secondary: {
      main: mode === "dark" ? "#3dd68c" : "#2d8c60",
      light: mode === "dark" ? "#6ee7a8" : "#3aad78",
      dark: mode === "dark" ? "#28b870" : "#1f6644",
      contrastText: mode === "dark" ? "#0a0e14" : "#ffffff",
    },
    background:
      mode === "dark"
        ? {
            default: "#0a0e14",
            paper: "#141c27",
          }
        : {
            default: "#f0f4f8",
            paper: "#ffffff",
          },
    text:
      mode === "dark"
        ? {
            primary: "#e2e8f0",
            secondary: "#94a3b8",
          }
        : {
            primary: "#0d1117",
            secondary: "#4b5563",
          },
    divider: mode === "dark" ? "#1e293b" : "#d1d5db",
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: mode === "dark" ? "#3dd68c" : "#2d8c60",
      light: "#6ee7a8",
      dark: "#28b870",
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
          backgroundColor: mode === "dark" ? "#0a0e14" : "#f0f4f8",
          color: mode === "dark" ? "#e2e8f0" : "#0d1117",
          colorScheme: mode,
          scrollBehavior: "smooth",
        },
        "::selection": {
          backgroundColor: mode === "dark" ? "#00d4ff" : "#0077aa",
          color: mode === "dark" ? "#0a0e14" : "#ffffff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          textTransform: "none",
          transition: "all 0.2s ease",
          fontWeight: 500,
          padding: "10px 16px",
          letterSpacing: "0.02em",
          fontFamily: "'Geist Mono', monospace",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: mode === "dark"
              ? "0 4px 12px rgba(0, 212, 255, 0.2)"
              : "0 4px 12px rgba(0, 119, 170, 0.2)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: mode === "dark" ? "#141c27" : "#ffffff",
          borderRadius: "6px",
          border: `1px solid ${mode === "dark" ? "#1e293b" : "#d1d5db"}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === "dark" ? "#0a0e14" : "#f0f4f8",
          backdropFilter: "none",
          transition: "background-color 0.3s ease",
          boxShadow: "none",
          borderBottom: `1px solid ${mode === "dark" ? "#1e293b" : "#d1d5db"}`,
          borderRadius: 0,
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
          borderRadius: "4px",
          fontSize: "0.8rem",
          height: "auto",
          padding: "4px 0",
          fontFamily: "'Geist Mono', monospace",
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
