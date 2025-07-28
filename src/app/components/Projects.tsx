"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Container, Typography, Grid, useTheme } from "@mui/material";
import { Project } from "../types";
import { fetchGithubProjects } from "../lib/github";
import { ProjectCard } from "./ProjectCard";
import { Loading } from "./ui/Loading";
import { fadeIn, staggerContainer, slideInFromLeft, revealFromBottom } from "../lib/animations";

interface ProjectsSectionProps {
  fallbackProjects?: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ fallbackProjects }) => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>(fallbackProjects || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchGithubProjects("coolguy1771");
        setProjects(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects(fallbackProjects || []);
        setError("Failed to fetch projects. Showing fallback content.");
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [fallbackProjects]);

  if (isLoading && !fallbackProjects?.length) {
    return (
      <Box
        component={motion.section}
        sx={{
          py: 12,
          backgroundColor: theme.palette.background.default,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
            opacity: 0.4,
            zIndex: -1,
          },
        }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <Container maxWidth="lg">
          <Loading />
        </Container>
      </Box>
    );
  }

  return (
    <Box
      component={motion.section}
      id="work"
      sx={{
        py: 12,
        backgroundColor: theme.palette.background.default,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          opacity: 0.4,
          zIndex: -1,
        },
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={revealFromBottom}
    >
      <Container maxWidth="lg">
        <Box component={motion.div} variants={slideInFromLeft} mb={6}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{
              mb: 6,
              color: theme.palette.text.primary,
              textShadow: `0 1px 2px rgba(0,0,0,0.1)`,
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 60,
                height: 4,
                borderRadius: 2,
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            Featured Projects
            {error && (
              <Typography
                component="span"
                variant="caption"
                sx={{
                  ml: 2,
                  color: theme.palette.error.main,
                  fontWeight: "normal",
                }}
              >
                ({error})
              </Typography>
            )}
          </Typography>
        </Box>

        <Grid container spacing={3} component={motion.div} variants={staggerContainer}>
          {projects.map((project, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index} component={motion.div} variants={fadeIn}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
