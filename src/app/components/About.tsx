"use client";
import React from "react";
import { Container, Typography, Box, useTheme } from "@mui/material";
import { fadeIn, slideInFromLeft } from "../lib/animations";
import { MotionBox } from "./motion-ui";

export const AboutSection: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <MotionBox
      sx={{
        py: { xs: 6, md: 12 },
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <Container maxWidth="lg">
        <Box sx={{ maxWidth: theme.breakpoints.values.md, mx: "auto", width: "100%" }}>
          {/* Terminal label above heading */}
          <MotionBox
            variants={slideInFromLeft}
            sx={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.85rem",
              color: theme.palette.secondary.main,
              mb: 1,
              letterSpacing: "0.02em",
            }}
          >
            $ cat about.md
          </MotionBox>

          <Typography
            id="about-heading"
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem" },
              fontWeight: 700,
              mb: 5,
              letterSpacing: "-0.02em",
              color: theme.palette.primary.main,
              transition: "color 0.3s ease",
            }}
          >
            About Me
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              lineHeight: 1.8,
              borderLeft: `3px solid ${theme.palette.secondary.main}`,
              pl: 3,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 400,
                transition: "color 0.3s ease",
              }}
            >
              I run{" "}
              <Box
                component="span"
                sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
              >
                Kubernetes
              </Box>{" "}
              for a living. Right now that means CI/CD infrastructure at Cisco on OpenShift; before
              that it was{" "}
              <Box
                component="span"
                sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
              >
                air-gapped clusters
              </Box>{" "}
              at General Dynamics for three years, which is exactly as fun as it sounds.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 400,
                transition: "color 0.3s ease",
              }}
            >
              I have a homelab (
              <Box
                component="span"
                sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}
              >
                home-ops
              </Box>{" "}
              on GitHub) where I run FluxCD, Prometheus, and Grafana. Mostly an excuse to break
              things without anyone noticing.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 400,
                transition: "color 0.3s ease",
              }}
            >
              I write Go when I need something that doesn&apos;t already exist.{" "}
              <Box
                component="span"
                sx={{
                  fontFamily: "'Geist Mono', monospace",
                  fontWeight: 700,
                  color: isDark ? theme.palette.warning.light : theme.palette.warning.main,
                  fontSize: "0.95em",
                }}
              >
                Guardrail
              </Box>{" "}
              is an RBAC analyzer I built for Kubernetes, finds over-permissive roles before they
              become someone else&apos;s incident. CKA since March 2024.
            </Typography>
          </Box>
        </Box>
      </Container>
    </MotionBox>
  );
};
