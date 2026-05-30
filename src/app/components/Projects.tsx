"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Grid, useTheme } from "@mui/material";
import { MotionBox } from "./motion-ui";
import { Project } from "../types";
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
        const response = await fetch("/api/github/projects?username=coolguy1771");
        if (!response.ok) {
          throw new Error(`GitHub API returned ${response.status}`);
        }
        const data = (await response.json()) as Project[];
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
      <MotionBox
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
      </MotionBox>
    );
  }

  return (
    <MotionBox
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
        <MotionBox variants={slideInFromLeft} sx={{ mb: 6 }}>
          <Typography
            sx={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.85rem",
              color: theme.palette.secondary.main,
              mb: 1,
            }}
          >
            $ gh repo list coolguy1771 --limit 6
          </Typography>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              mb: 6,
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem" },
              color: theme.palette.primary.main,
              letterSpacing: "-0.02em",
            }}
          >
            Projects
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
        </MotionBox>

        <Grid container spacing={3} component={MotionBox} variants={staggerContainer}>
          {projects.map((project, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index} component={MotionBox} variants={fadeIn}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </MotionBox>
  );
};
