"use client";
import React from "react";
import { motion } from "framer-motion";
import { Container, Typography, Box, useTheme } from "@mui/material";
import { fadeIn, slideInFromLeft } from "../lib/animations";

export const AboutSection: React.FC = () => {
  const theme = useTheme(); // Get the theme context

  return (
    <Box
      component={motion.section}
      id="about"
      py={12}
      sx={{ 
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: "background-color 0.3s ease, color 0.3s ease"
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <Container maxWidth="lg">
        <Box maxWidth="md" mx="auto">
          <Typography
            component={motion.h2}
            id="about-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3rem' },
              fontWeight: 700,
              mb: 4,
              letterSpacing: '-0.02em',
              color: theme.palette.primary.main,
              transition: "color 0.3s ease"
            }}
            variants={slideInFromLeft}
          >
            About Me
          </Typography>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            fontSize: { xs: '1.125rem', sm: '1.25rem' },
            lineHeight: 1.75
          }}>
            <Typography
              component={motion.p}
              variant="body1"
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                transition: "color 0.3s ease"
              }}
              variants={fadeIn}
            >
              I'm experienced in building{" "}
              <Box component="span" sx={{ 
                color: theme.palette.primary.light,
                fontWeight: 500,
                transition: "color 0.3s ease"
              }}>
                CI/CD pipelines
              </Box>, deploying{" "}
              <Box component="span" sx={{ 
                color: theme.palette.primary.light,
                fontWeight: 500,
                transition: "color 0.3s ease"
              }}>
                Kubernetes clusters
              </Box>, and setting up developer-friendly infrastructures to make workflows smoother.
              I also specialize in{" "}
              <Box component="span" sx={{ 
                color: theme.palette.primary.light,
                fontWeight: 500,
                transition: "color 0.3s ease"
              }}>
                network systems
              </Box>, handling everything from planning and troubleshooting
              to delivering reliable solutions—even in tricky setups like air-gapped networks.
            </Typography>
            <Typography
              component={motion.p}
              variant="body1"
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                transition: "color 0.3s ease"
              }}
              variants={fadeIn}
            >
              My focus is on blending tech know-how with design thinking to create{" "}
              <Box component="span" sx={{ 
                color: theme.palette.secondary.main,
                fontWeight: 600,
                transition: "color 0.3s ease"
              }}>
                practical, impactful results
              </Box>. Right now, I'm diving into open-source projects and staying up-to-date with the latest
              in web development.
            </Typography>
            <Typography
              component={motion.p}
              variant="body1"
              sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                transition: "color 0.3s ease"
              }}
              variants={fadeIn}
            >
              I'm also a{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.secondary.dark,
                  transition: "color 0.3s ease"
                }}
              >
                Certified Kubernetes Administrator
              </Box>, always learning and growing to keep up with the fast-paced tech world.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
