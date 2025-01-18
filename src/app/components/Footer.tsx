'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';
import { fadeIn } from '../lib/animations';

export const Footer: React.FC = () => (
  <motion.footer 
    className="py-12 border-t border-foreground/10"
    initial="initial"
    animate="animate"
    variants={fadeIn}
  >
    <div className="max-w-5xl mx-auto px-6">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">© {new Date().getFullYear()} Tyler Witlin</span>
        <motion.a 
          href="https://github.com/coolguy1771" 
          className="hover:text-gray-300 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaGithub size={24} />
        </motion.a>
      </div>
    </div>
  </motion.footer>
);
