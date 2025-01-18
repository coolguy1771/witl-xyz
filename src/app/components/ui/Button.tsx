'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  href,
  ...props 
}) => {
  const baseStyles = "inline-block px-6 py-3 font-medium rounded-full transition-colors";
  const variants = {
    primary: "bg-foreground text-background hover:bg-gray-200 dark:hover:bg-gray-700",
    secondary: "bg-foreground/10 text-foreground hover:bg-foreground/20"
  };

  const content = (
    <motion.span
      className={`${baseStyles} ${variants[variant]}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.span>
  );

  return href ? (
    <a href={href}>{content}</a>
  ) : (
    content
  );
};
