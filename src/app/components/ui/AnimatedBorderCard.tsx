"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Box, useTheme } from "@mui/material";

interface AnimatedBorderCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export const AnimatedBorderCard: React.FC<AnimatedBorderCardProps> = ({
  children,
  className,
  glowColor,
}) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]));
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      <Box
        sx={{
          position: "relative",
          height: "100%",
          background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
          borderRadius: 2,
          padding: 0,
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            padding: "2px",
            background: `linear-gradient(45deg, ${glowColor || theme.palette.primary.main}, transparent, ${glowColor || theme.palette.secondary.main})`,
            borderRadius: "inherit",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "xor",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "2px",
            background: theme.palette.background.paper,
            borderRadius: "inherit",
            zIndex: 0,
          },
        }}
        component={motion.div}
        whileHover={{
          boxShadow: `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 30px ${glowColor || theme.palette.primary.main}33`,
        }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ position: "relative", zIndex: 1, height: "100%" }}>
          {children}
        </Box>
      </Box>
    </motion.div>
  );
};
