"use client";

import React, { Suspense } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { AboutSection } from "./components/About";
import { Footer } from "./components/Footer";
import { ContactSection } from "./components/Contact";
import { HeroSection } from "./components/Hero";
import { ProjectsSection } from "./components/Projects";
import { ProjectsSkeleton } from "./components/skeletons";

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

        {/* About Section */}
        <Box id="about" component="section">
          <AboutSection />
        </Box>

        {/* Work Section */}
        <Box id="projects" component="section">
          <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsSection />
          </Suspense>
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
