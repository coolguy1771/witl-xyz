'use client';
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "href"> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  href,
  className,
  ...props
}) => {
  const baseStyles = "inline-block px-6 py-3 font-medium rounded-full transition-colors";
  const variants = {
    primary: "bg-foreground text-background hover:bg-gray-200 dark:hover:bg-gray-700",
    secondary: "bg-foreground/10 text-foreground hover:bg-foreground/20"
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className || ''}`;
  
  const content = (
    <motion.button
      className={combinedClassName}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );

  return href ? (
    <Link href={href} className={combinedClassName}>
      {content}
    </Link>
  ) : (
    content
  );
};