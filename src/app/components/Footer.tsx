"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { Box, Container, Typography, Link, useTheme } from "@mui/material";

export const Footer: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box
      component={motion.footer}
      sx={{
        py: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          ease: "easeOut"
        }
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center" 
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
          >
            © {new Date().getFullYear()} Tyler Witlin
          </Typography>

          <Link
            href="https://github.com/coolguy1771"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: theme.palette.text.secondary,
              transition: "transform 0.2s ease",
              display: "flex",
              '&:hover': {
                color: theme.palette.text.primary,
                transform: "scale(1.1) rotate(5deg)"
              }
            }}
          >
            <FaGithub size={24} />
          </Link>
        </Box>
      </Container>
    </Box>
  );
};