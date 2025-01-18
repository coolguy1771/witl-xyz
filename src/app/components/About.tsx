"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeIn, slideInFromLeft } from "../lib/animations";

export const AboutSection: React.FC = () => (
  <motion.section
    id="about"
    className="py-24"
    aria-labelledby="about-heading"
    initial="initial"
    whileInView="animate"
    viewport={{ once: true }}
    variants={fadeIn}
  >
    <div className="max-w-5xl mx-auto px-6">
      <div className="max-w-2xl">
        <motion.h2
          id="about-heading"
          className="text-2xl font-bold mb-6"
          variants={slideInFromLeft}
        >
          About Me
        </motion.h2>
        <motion.p className="text-gray-400 mb-6 leading-relaxed" variants={fadeIn}>
          I'm experienced in building CI/CD pipelines, deploying Kubernetes clusters, 
          and setting up developer-friendly infrastructures to make workflows smoother. 
          I also specialize in network systems, handling everything from planning and troubleshooting 
          to delivering reliable solutions—even in tricky setups like air-gapped networks. 
          My focus is on blending tech know-how with design thinking to create practical, impactful results.
        </motion.p>
        <motion.p className="text-gray-400 leading-relaxed" variants={fadeIn}>
          Right now, I’m diving into open-source projects and staying up-to-date with the latest 
          in web development. I’m also a 
          <span className="font-bold"> Certified Kubernetes Administrator</span>, 
          always learning and growing to keep up with the fast-paced tech world.
        </motion.p>
      </div>
    </div>
  </motion.section>
);
