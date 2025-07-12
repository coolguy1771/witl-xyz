import { createTheme, ThemeOptions } from "@mui/material/styles";

const baseTheme: ThemeOptions = {
  typography: {
    fontFamily: "var(--font-geist-sans)",
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "light",
    primary: {
      main: "#0070f3",
      light: "#3291ff",
      dark: "#0761d1",
    },
    secondary: {
      main: "#7928ca",
      light: "#8a63d2",
      dark: "#6b24b2",
    },
    background: {
      default: "#ffffff",
      paper: "#fafafa",
    },
    text: {
      primary: "#000000",
      secondary: "#666666",
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#0070f3",
      light: "#3291ff",
      dark: "#0761d1",
    },
    secondary: {
      main: "#7928ca",
      light: "#8a63d2",
      dark: "#6b24b2",
    },
    background: {
      default: "#000000",
      paper: "#111111",
    },
    text: {
      primary: "#ffffff",
      secondary: "#888888",
    },
  },
});
