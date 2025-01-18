'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { Project } from '../types';
import { TechBadge } from './TechBadge';
import { scaleUp } from '../lib/animations';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => (
  <motion.div
    className="p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors"
    variants={scaleUp}
    whileHover={{ y: -5 }}
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold">{project.title}</h3>
      <div className="flex gap-3">
        {project.githubUrl && (
          <motion.a
            href={project.githubUrl}
            className="hover:text-gray-300"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={20} />
          </motion.a>
        )}
        <motion.a
          href={project.link}
          className="hover:text-gray-300"
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9 }}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt size={20} />
        </motion.a>
      </div>
    </div>
    <p className="text-gray-400 mb-4">{project.description}</p>
    <div className="flex gap-2 flex-wrap">
      {project.tech.map((tech, index) => (
        <TechBadge key={index} tech={tech} index={index} />
      ))}
    </div>
  </motion.div>
);