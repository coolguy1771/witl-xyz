"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps, useTheme } from "@mui/material";

interface GlowButtonProps extends Omit<ButtonProps, "component"> {
  glowColor?: string;
  intensity?: number;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  glowColor,
  intensity = 0.5,
  ...props
}) => {
  const theme = useTheme();
  const effectiveGlowColor = glowColor || theme.palette.primary.main;

  return (
    <Button
      {...props}
      component={motion.button}
      whileHover={{
        scale: 1.05,
        boxShadow: `0 0 20px ${effectiveGlowColor}${Math.round(intensity * 255)
          .toString(16)
          .padStart(2, "0")}, 0 0 40px ${effectiveGlowColor}${Math.round(
          intensity * 128
        )
          .toString(16)
          .padStart(2, "0")}`,
      }}
      whileTap={{ scale: 0.95 }}
      sx={{
        position: "relative",
        background: `linear-gradient(45deg, ${effectiveGlowColor}, ${theme.palette.primary.dark})`,
        border: "none",
        borderRadius: 2,
        transition: "all 0.3s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `linear-gradient(45deg, ${effectiveGlowColor}, transparent, ${effectiveGlowColor})`,
          borderRadius: "inherit",
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover::before": {
          opacity: 0.2,
        },
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
};
