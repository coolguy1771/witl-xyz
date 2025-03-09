'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import { Box, Card, CardContent, Typography, Stack, IconButton, useTheme } from '@mui/material';
import { Project } from '../types';
import { TechBadge } from './TechBadge';
import { scaleUp, cardHover } from '../lib/animations';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const theme = useTheme();
  
  return (
    <Card
      component={motion.div}
      variants={{
        ...scaleUp,
        hover: cardHover.hover
      }}
      whileHover="hover"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        overflow: 'visible',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.12)`
        }
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
            {project.title}
          </Typography>
          
          <Stack direction="row" spacing={1}>
            {project.githubUrl && (
              <IconButton 
                component={motion.a}
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': { 
                    color: theme.palette.text.primary,
                    backgroundColor: 'transparent' 
                  }
                }}
              >
                <FaGithub size={20} />
              </IconButton>
            )}
            <IconButton 
              component={motion.a}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': { 
                  color: theme.palette.text.primary,
                  backgroundColor: 'transparent' 
                }
              }}
            >
              <FaExternalLinkAlt size={18} />
            </IconButton>
          </Stack>
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            mb: 3,
            minHeight: '2.5rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {project.description}
        </Typography>

        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap="wrap" 
          useFlexGap
          sx={{ mt: 'auto' }}
        >
          {project.tech.map((tech, index) => (
            <TechBadge key={index} tech={tech} index={index} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};