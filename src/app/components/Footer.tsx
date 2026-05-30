"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { Box, Container, Typography, Link, useTheme } from "@mui/material";

export const Footer: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      component={motion.footer}
      sx={{
        py: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: isDark ? "#0d1117" : "#e8edf3",
        fontFamily: "'Geist Mono', monospace",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5 } }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.secondary.main,
                fontFamily: "'Geist Mono', monospace",
                fontSize: "0.8rem",
                mb: 0.25,
              }}
            >
              $ echo &quot;© {new Date().getFullYear()} Tyler Witlin&quot;
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontFamily: "'Geist Mono', monospace",
                fontSize: "0.8rem",
                pl: 2,
              }}
            >
              © {new Date().getFullYear()} Tyler Witlin
            </Typography>
          </Box>

          <Link
            href="https://github.com/coolguy1771"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            sx={{
              color: theme.palette.text.secondary,
              transition: "color 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 1,
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
          >
            <FaGithub size={20} />
            <Typography
              sx={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: "0.8rem",
                color: "inherit",
              }}
            >
              coolguy1771
            </Typography>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};
