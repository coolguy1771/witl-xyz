'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/animations';

export const Loading: React.FC = () => (
  <motion.div
    className="flex items-center justify-center h-64"
    variants={fadeIn}
    initial="initial"
    animate="animate"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground" />
  </motion.div>
);
