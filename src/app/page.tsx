'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer, slideInFromLeft, slideInFromRight, scaleUp, navAnimation } from './lib/animations';

import { FaExternalLinkAlt, FaGithub} from "react-icons/fa";
interface Project {
  title: string;
  description: string;
  tech: string[];
  link: string;
}

export default function Home() {
  const projects: Project[] = [
    {
      title: "Project Alpha",
      description: "A full-stack application built with React and Node.js",
      tech: ["React", "Node.js", "PostgreSQL"],
      link: "#"
    },
    {
      title: "Project Beta",
      description: "Real-time data visualization dashboard",
      tech: ["TypeScript", "D3.js", "WebSocket"],
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation Bar */}
      <motion.nav 
        className="fixed w-full bg-background/50 backdrop-blur-sm border-b border-foreground/10 z-10"
        initial="initial"
        animate="animate"
        variants={navAnimation}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.span 
            className="text-lg font-mono"
            variants={fadeIn}
          >
            john.doe
          </motion.span>
          <motion.div 
            className="flex gap-6"
            variants={staggerContainer}
          >
            {["work", "blog", "about", "contact"].map((item) => (
              <motion.a
                key={item}
                href={item === 'blog' ? '/blog' : `#${item}`}
                className="hover:text-gray-300 transition-colors relative group"
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 transition-all group-hover:w-full" />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.h1 
            className="text-5xl sm:text-7xl font-bold mb-6"
            variants={slideInFromLeft}
            initial="initial"
            animate="animate"
          >
            Software Engineer & <br />
            <span className="text-gray-400">Designer</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-400 max-w-2xl mb-8"
            variants={slideInFromRight}
            initial="initial"
            animate="animate"
          >
            Crafting digital experiences with code and creativity. 
            Focused on building scalable, user-centric solutions 
            that make a difference.
          </motion.p>
          <motion.div
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <motion.a 
              href="#work"
              className="inline-block px-6 py-3 bg-foreground text-background font-medium 
                       rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Work
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Work Section */}
      <motion.section 
        id="work" 
        className="py-24 bg-background/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2 
            className="text-2xl font-bold mb-12"
            variants={slideInFromLeft}
          >
            Selected Projects
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={staggerContainer}
          >
            {projects.map((project, index) => (
              <motion.div 
                key={index}
                className="p-6 rounded-lg border border-foreground/10 
                         hover:border-foreground/20 transition-colors"
                variants={scaleUp}
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <motion.a 
                    href={project.link} 
                    className="hover:text-gray-300"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaExternalLinkAlt size={20} />
                  </motion.a>
                </div>
                <p className="text-gray-400 mb-4">{project.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {project.tech.map((tech, techIndex) => (
                    <motion.span 
                      key={techIndex}
                      className="px-3 py-1 text-sm rounded-full 
                               bg-foreground/5 text-gray-300"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: techIndex * 0.1 }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section 
        id="about" 
        className="py-24"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <motion.h2 
              className="text-2xl font-bold mb-6"
              variants={slideInFromLeft}
            >
              About Me
            </motion.h2>
            <motion.p 
              className="text-gray-400 mb-6"
              variants={fadeIn}
            >
              With over 5 years of experience in software development, 
              I specialize in building scalable web applications and 
              intuitive user interfaces. My approach combines technical 
              expertise with design thinking to create meaningful solutions.
            </motion.p>
            <motion.p 
              className="text-gray-400"
              variants={fadeIn}
            >
              Currently working on open-source projects and exploring 
              new technologies in the web development ecosystem.
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
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
          <motion.a 
            href="mailto:hello@example.com"
            className="inline-block px-6 py-3 bg-foreground text-background font-medium 
                     rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Say Hello
          </motion.a>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="py-12 border-t border-foreground/10"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">© 2025 John Doe</span>
            <motion.a 
              href="https://github.com" 
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
    </div>
  );
}