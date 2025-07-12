"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Box, useTheme } from "@mui/material";

// interface Particle {
//   id: number;
//   x: number;
//   y: number;
//   size: number;
//   duration: number;
//   delay: number;
// }

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  color,
  minSize = 2,
  maxSize = 6,
  speed = 1,
}) => {
  const theme = useTheme();
  const effectiveColor = color || theme.palette.primary.main;

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      duration: (Math.random() * 10 + 10) / speed,
      delay: Math.random() * 5,
    }));
  }, [count, minSize, maxSize, speed]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          style={{
            position: "absolute",
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            background: effectiveColor,
            opacity: 0.6,
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </Box>
  );
};
