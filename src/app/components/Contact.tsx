'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { fadeIn, slideInFromLeft } from '../lib/animations';

export const ContactSection: React.FC = () => (
  <motion.section 
    id="contact" 
    className="py-24 bg-background/50"
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    variants={fadeIn}
  >
    <div className="max-w-5xl mx-auto px-6 text-center">
      <motion.h2 
        className="text-2xl font-bold mb-6"
        variants={slideInFromLeft}
      >
        Get In Touch
      </motion.h2>
      <motion.p 
        className="text-gray-400 mb-8 max-w-xl mx-auto"
        variants={fadeIn}
      >
        Whether you have a project in mind or just want to chat, 
        feel free to reach out.
      </motion.p>
      <Button href="mailto:twitlin@witl.xyz">Say Hello</Button>
    </div>
  </motion.section>
);