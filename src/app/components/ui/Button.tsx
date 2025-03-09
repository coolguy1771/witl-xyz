"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import MuiButton from "@mui/material/Button";

interface ButtonProps {
  variant?: "contained" | "outlined" | "text"; // Match MUI button variants
  color?: "primary" | "secondary";
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "contained",
  color = "primary",
  children,
  href,
  className = "",
}) => {
  const MotionButton = motion(MuiButton);

  const content = (
    <MotionButton
      variant={variant}
      color={color}
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </MotionButton>
  );

  return href ? (
    <Link href={href} passHref>
      {content}
    </Link>
  ) : (
    content
  );
};
