"use client";

import React from "react";
import { Box, Container, Typography, Chip, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { fadeIn, slideInFromLeft, staggerContainer } from "../lib/animations";
import { MotionBox } from "./motion-ui";

const SKILL_CATEGORIES = [
  {
    label: "// orchestration",
    skills: ["Kubernetes", "OpenShift", "Helm", "Docker", "Kustomize"],
  },
  {
    label: "// iac & config",
    skills: ["Terraform", "Ansible", "Pulumi"],
  },
  {
    label: "// ci/cd",
    skills: ["GitHub Actions", "GitLab CI", "ArgoCD", "FluxCD"],
  },
  {
    label: "// cloud",
    skills: ["AWS", "GCP", "Azure", "Cloudflare"],
  },
  {
    label: "// observability",
    skills: ["Prometheus", "Grafana", "OpenTelemetry", "Loki", "Alertmanager"],
  },
  {
    label: "// programming",
    skills: ["Go", "Python", "Bash", "TypeScript"],
  },
];

export const SkillsGrid: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <MotionBox
      id="skills"
      
      sx={{
        py: 10,
        bgcolor: isDark ? "#0d1117" : "#e8edf3",
        transition: "background-color 0.3s ease",
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <Container maxWidth="lg">
        {/* Section header */}
        <Box sx={{ mb: 6 }}>
          <MotionBox
            variants={slideInFromLeft}
            sx={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.85rem",
              color: theme.palette.secondary.main,
              mb: 1,
            }}
          >
            $ kubectl get skills --all-namespaces
          </MotionBox>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2rem", sm: "2.5rem" },
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: theme.palette.primary.main,
            }}
          >
            Skills & Tools
          </Typography>
        </Box>

        <Grid
          container
          spacing={3}
          component={MotionBox}
          variants={staggerContainer}
        >
          {SKILL_CATEGORIES.map((category) => (
            <Grid key={category.label} size={{ xs: 12, sm: 6, md: 4 }}>
              <MotionBox
                variants={fadeIn}
                sx={{
                  backgroundColor: isDark ? "#141c27" : "#ffffff",
                  border: `1px solid ${isDark ? "#1e293b" : "#d1d5db"}`,
                  borderRadius: "6px",
                  p: 2.5,
                  height: "100%",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: isDark
                      ? `0 0 20px rgba(0, 212, 255, 0.08)`
                      : "0 4px 20px rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                {/* Category label */}
                <Typography
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.78rem",
                    color: theme.palette.text.secondary,
                    mb: 2,
                    letterSpacing: "0.04em",
                  }}
                >
                  {category.label}
                </Typography>

                {/* Skills chips */}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {category.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      sx={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: "0.78rem",
                        backgroundColor: isDark ? "#0a0e14" : "#f0f4f8",
                        color: theme.palette.text.primary,
                        border: `1px solid ${isDark ? "#1e293b" : "#d1d5db"}`,
                        borderRadius: "3px",
                        height: "26px",
                        cursor: "default",
                        transition: "border-color 0.15s ease, color 0.15s ease",
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          color: theme.palette.primary.main,
                          backgroundColor: isDark ? "#0a0e14" : "#f0f4f8",
                        },
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  ))}
                </Box>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>
    </MotionBox>
  );
};
