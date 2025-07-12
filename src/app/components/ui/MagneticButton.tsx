"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { IconButton, IconButtonProps, useTheme } from "@mui/material";

interface MagneticButtonProps extends Omit<IconButtonProps, "component"> {
  strength?: number;
  children: React.ReactNode;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.3,
  ...props
}) => {
  const theme = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <IconButton
      {...props}
      ref={ref}
      component={motion.button}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      whileTap={{ scale: 0.9 }}
      sx={{
        position: "relative",
        transition: "all 0.3s ease",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: -4,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, transparent, ${theme.palette.secondary.main})`,
          borderRadius: "50%",
          opacity: 0,
          transition: "opacity 0.3s ease",
          zIndex: -1,
        },
        "&:hover::before": {
          opacity: 0.3,
        },
        ...props.sx,
      }}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotate: isHovered ? [0, -5, 5, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 0.5, repeat: isHovered ? Infinity : 0 },
        }}
      >
        {children}
      </motion.div>
    </IconButton>
  );
};
