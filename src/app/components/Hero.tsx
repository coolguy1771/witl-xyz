"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button, Container, Typography, Box, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { slideInFromRight, popIn } from "../lib/animations";

export const HeroSection: React.FC = () => {
  const theme = useTheme();
  
  // Modern staggered animation for title
  const titleAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.2
      }
    }
  };

  const letterAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };

  const renderAnimatedText = (text: string, color: string) => {
    return text.split("").map((char, i) => (
      <motion.span
        key={i}
        variants={letterAnimation}
        style={{
          color,
          display: char === " " ? "inline-block" : "inline-block",
          width: char === " " ? "0.5em" : "auto",
          marginRight: char === " " ? "0" : "0"
        }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <Box 
      component="section"
      sx={{ 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: 8,
        pb: 10,
        position: "relative",
        backgroundColor: theme.palette.background.default,
        overflow: "hidden",
        // Add a subtle gradient background
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          background: `radial-gradient(circle at 30% 20%, ${theme.palette.primary.dark}05, transparent 20%), 
                       radial-gradient(circle at 70% 60%, ${theme.palette.secondary.dark}05, transparent 20%)`,
          opacity: 0.4,
          zIndex: 0
        }
      }}
    >
      {/* Decorative elements */}
      <Box 
        sx={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.palette.primary.main}10, transparent 70%)`,
          filter: "blur(60px)",
          opacity: 0.5,
          zIndex: 0
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4} maxWidth="800px">
          {/* Main title with animated letters */}
          <motion.div 
            variants={titleAnimation}
            initial="hidden"
            animate="visible"
            style={{ 
              fontWeight: 800,
              lineHeight: 1.2,
              fontSize: "clamp(2.5rem, 7vw, 4rem)",
              marginBottom: "1rem"
            }}
          >
            <div style={{ display: "block", whiteSpace: "nowrap" }}>
              {renderAnimatedText("Software Engineer", theme.palette.text.primary)}
            </div>
            <div style={{ display: "block", whiteSpace: "nowrap" }}>
              {renderAnimatedText("& Kubernetes Administrator", theme.palette.text.secondary)}
            </div>
          </motion.div>

          {/* Description */}
          <Box component={motion.div} variants={slideInFromRight} initial="initial" animate="animate">
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                maxWidth: "600px",
                fontWeight: 400,
                lineHeight: 1.7,
                mb: 4
              }}
            >
              I bring ideas to life with code and a touch of creativity. Whether
              it&apos;s scaling apps or crafting user-friendly designs, I&apos;m
              here to build solutions that matter.
            </Typography>
          </Box>

          {/* CTA Button */}
          <Box component={motion.div} variants={popIn} initial="initial" animate="animate">
            <Button 
              href="#projects"
              variant="contained"
              size="large"
              sx={{ 
                backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: theme.palette.common.white,
                fontWeight: 500,
                py: 1.5,
                px: 4,
                fontSize: "1.125rem",
                borderRadius: 2,
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                  transform: "translateY(-2px)"
                }
              }}
            >
              View My Work
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};