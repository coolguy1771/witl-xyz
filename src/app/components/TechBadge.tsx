'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TechBadgeProps {
  tech: string;
  index: number;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ tech, index }) => (
  <motion.span
    key={index}
    className="px-3 py-1 text-sm rounded-full bg-foreground/5 text-gray-300"
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.1 }}
  >
    {tech}
  </motion.span>
);
