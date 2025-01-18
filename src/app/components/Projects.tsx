'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Project } from '../types';
import { fetchGithubProjects } from '../lib/github';
import { ProjectCard } from './ProjectCard';
import { Loading } from './ui/Loading';
import { fadeIn, staggerContainer, slideInFromLeft } from '../lib/animations';

interface ProjectsSectionProps {
  fallbackProjects?: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  fallbackProjects 
}) => {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchGithubProjects('coolguy1771');
        setProjects(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setProjects(fallbackProjects || []);
        setError('Failed to fetch projects. Showing fallback content.');
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [fallbackProjects]);

  if (isLoading && !fallbackProjects?.length) {
    return (
      <motion.section
        className="py-24 bg-background/50"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-5xl mx-auto px-6">
          <Loading />
        </div>
      </motion.section>
    );
  }

  return (
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
          Featured Projects
          {error && <span className="text-sm text-gray-400 ml-2">({error})</span>}
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={staggerContainer}
        >
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};