"use client";

import React from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AboutSection } from "./components/About";
import { CertificationsSection } from "./components/Certifications";
import { Footer } from "./components/Footer";
import { ContactSection } from "./components/Contact";
import { HeroSection } from "./components/Hero";
import { ProjectsSection } from "./components/Projects";
import { SkillsGrid } from "./components/SkillsGrid";

/**
 * Renders the main single-page layout composed of the site's sections and footer.
 *
 * The layout uses the current MUI theme for background and text colors and contains
 * Hero, Skills, Certifications, About, Projects, and Contact sections inside a
 * main container with a Footer placed outside the main content.
 *
 * @returns The page's root React element with themed background and text color.
 */
export default function Home() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Box component="main">
        {/* Hero Section */}
        <HeroSection />

        {/* Skills Section */}
        <Box id="skills" component="section">
          <SkillsGrid />
        </Box>

        {/* Certifications Section */}
        <Box id="certs" component="section">
          <CertificationsSection />
        </Box>

        {/* About Section */}
        <Box id="about" component="section">
          <AboutSection />
        </Box>

        {/* Projects Section */}
        <Box id="projects" component="section">
          <ProjectsSection />
        </Box>

        {/* Contact Section */}
        <Box id="contact" component="section">
          <ContactSection />
        </Box>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
}
