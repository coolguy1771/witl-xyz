"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { fadeIn, slideInFromRight } from "../lib/animations";

export const HeroSection: React.FC = () => {
  const textWave = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        staggerChildren: 0.05,
        when: "beforeChildren",
      },
    },
  };

  const letterWave = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Animated Text */}
        <motion.div
          className="text-5xl sm:text-7xl font-bold mb-6 leading-tight"
          variants={textWave}
          initial="initial"
          animate="animate"
        >
          {"Software Engineer &".split("").map((char, index) => (
            <motion.span
              key={index}
              className={char === " " ? "inline-block w-2" : ""}
              variants={letterWave}
            >
              {char}
            </motion.span>
          ))}
          <br />
          {"Kubernetes Administrator".split("").map((char, index) => (
            <motion.span
              key={index}
              className="text-gray-400"
              variants={letterWave}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Animated Subheading */}
        <motion.p
          className="text-xl text-gray-400 max-w-2xl mb-8"
          variants={slideInFromRight}
          initial="initial"
          animate="animate"
        >
          I bring ideas to life with code and a touch of creativity. Whether
          it&apos;s scaling apps or crafting user-friendly designs, I&apos;m here to build
          solutions that matter.
        </motion.p>

        {/* Animated Button */}
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          <Button href="#work">View My Work</Button>
        </motion.div>
      </div>
    </section>
  );
};
