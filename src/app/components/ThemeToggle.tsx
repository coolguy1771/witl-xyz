"use client";

import React from "react";
import { IconButton, Tooltip, Box } from "@mui/material";
import { Sun, Moon } from "lucide-react";
import { useThemeMode } from "./ThemeRegistry";
import { alpha } from "@mui/material/styles";

export interface ThemeToggleProps {}

const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <span>Switch to {mode === "dark" ? "light" : "dark"} mode</span>
          {mode === "dark" ? (
            <Sun size={14} style={{ animation: "spin 1.5s ease infinite" }} />
          ) : (
            <Moon size={14} style={{ animation: "pulse 1.5s ease infinite" }} />
          )}
        </Box>
      }
      arrow
    >
      <IconButton
        onClick={toggleTheme}
        sx={{
          bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          "&:hover": {
            bgcolor: theme => alpha(theme.palette.primary.main, 0.2),
            transform: "rotate(12deg)",
          },
          height: 36,
          width: 36,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
            borderRadius: "50%",
            top: 0,
            left: 0,
            transform: "scale(0)",
            transition: "transform 0.4s ease",
          },
          "&:active::before": {
            transform: "scale(2)",
            opacity: 0,
            transition: "transform 0.3s ease, opacity 0.3s ease",
          },
        }}
      >
        {mode === "dark" ? (
          <Sun size={18} style={{ animation: "fadeIn 0.3s ease" }} />
        ) : (
          <Moon size={18} style={{ animation: "fadeIn 0.3s ease" }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
