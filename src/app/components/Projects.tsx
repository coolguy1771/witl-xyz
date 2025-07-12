"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  useTheme,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { Carousel } from "./ui/Carousel";
import { FloatingParticles } from "./ui/FloatingParticles";
import { TypewriterText } from "./ui/TypewriterText";
import { Project } from "../types";
import { fetchGithubProjects } from "../lib/github";
import { ProjectCard } from "./ProjectCard";
import { Loading } from "./ui/Loading";
import { fadeIn, slideInFromLeft, revealFromBottom } from "../lib/animations";

// Fallback data for testing
const fallbackProjectsData: Project[] = [
  {
    title: "Sample Project 1",
    description: "A sample project for testing",
    tech: ["React", "TypeScript"],
    link: "https://github.com",
    githubUrl: "https://github.com",
  },
  {
    title: "Sample Project 2", 
    description: "Another sample project",
    tech: ["Next.js", "Node.js"],
    link: "https://github.com",
    githubUrl: "https://github.com",
  },
  {
    title: "Sample Project 3",
    description: "Third sample project",
    tech: ["JavaScript", "CSS"],
    link: "https://github.com",
    githubUrl: "https://github.com",
  },
];

interface ProjectsSectionProps {
  fallbackProjects?: Project[];
  useCarousel?: boolean;
  maxVisibleTags?: number;
  use3DCarousel?: boolean;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  fallbackProjects,
  useCarousel = true,
  maxVisibleTags = 4,
  use3DCarousel = false,
}) => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>(fallbackProjects || []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselEnabled, setCarouselEnabled] = useState(useCarousel);
  const [use3D, setUse3D] = useState(use3DCarousel);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchGithubProjects("coolguy1771");
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(fallbackProjects || fallbackProjectsData);
          setError("No projects found. Showing fallback content.");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects(fallbackProjects || fallbackProjectsData);
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
          overflow: "hidden",
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

  const renderProjects = () => {
    const projectCards = projects.map((project, index) => (
      <motion.div
        key={index}
        variants={fadeIn}
        initial="initial"
        animate="animate"
        transition={{ delay: index * 0.1 }}
      >
        <ProjectCard project={project} maxVisibleTags={maxVisibleTags} />
      </motion.div>
    ));

    // Convert projects to WebGL gallery items
    const webglItems = projects.map((project, index) => ({
      image: `https://picsum.photos/seed/${project.title}${index}/800/600?grayscale`,
      text: project.title,
    }));

    console.log("Debug: Projects data", {
      projectsLength: projects.length,
      webglItemsLength: webglItems.length,
      sampleProject: projects[0],
      sampleWebglItem: webglItems[0],
      use3D,
      carouselEnabled
    });

    if (carouselEnabled) {
      return (
        <motion.div variants={fadeIn} initial="initial" animate="animate">
          <Carousel
            use3D={use3D}
            webglItems={use3D ? webglItems : undefined}
            itemsPerView={{
              xs: 1,
              sm: 1,
              md: 2,
              lg: 2,
              xl: 3,
            }}
            spacing={24}
            autoPlay={!use3D} // Disable autoplay for 3D mode
            autoPlayInterval={4000}
            showArrows={!use3D} // Hide arrows for 3D mode
            showDots={!use3D} // Hide dots for 3D mode
            infinite={true}
            dragEnabled={true}
            pauseOnHover={true}
            bend={3}
            borderRadius={0.05}
            scrollSpeed={2}
            scrollEase={0.05}
          >
            {use3D ? [] : projectCards}
          </Carousel>
        </motion.div>
      );
    }

    // Grid layout for non-carousel view
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
        component={motion.div}
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="initial"
        animate="animate"
      >
        {projectCards}
      </Box>
    );
  };

  return (
    <Box
      component={motion.section}
      id="work"
      sx={{
        py: 12,
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
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
      <FloatingParticles
        count={15}
        color={theme.palette.primary.main}
        speed={0.8}
        minSize={3}
        maxSize={8}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box component={motion.div} variants={slideInFromLeft} mb={6}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
              mb: 6,
            }}
          >
            <Box>
              <TypewriterText
                texts={["Featured Projects", "My Latest Work", "Code Showcase"]}
                speed={100}
                deleteSpeed={50}
                pauseDuration={3000}
                variant="h3"
                component="h2"
                fontWeight="bold"
                gutterBottom
                sx={{
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
                cursorColor={theme.palette.primary.main}
              />
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
            </Box>

            <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={carouselEnabled}
                    onChange={e => setCarouselEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Carousel View
                  </Typography>
                }
              />
              {carouselEnabled && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={use3D}
                      onChange={e => setUse3D(e.target.checked)}
                      color="secondary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="caption" color="text.secondary">
                      3D WebGL Mode
                    </Typography>
                  }
                  sx={{ ml: 2 }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {renderProjects()}
      </Container>
    </Box>
  );
};
