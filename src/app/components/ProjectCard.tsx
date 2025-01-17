import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Project } from '../types';
import { scaleUp } from '../lib/animations';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.div 
      className="p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors"
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
          <ExternalLink size={20} />
        </motion.a>
      </div>
      <p className="text-gray-400 mb-4">{project.description}</p>
      <div className="flex gap-2 flex-wrap">
        {project.tech.map((tech, techIndex) => (
          <motion.span 
            key={techIndex}
            className="px-3 py-1 text-sm rounded-full bg-foreground/5 text-gray-300"
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
  );
}