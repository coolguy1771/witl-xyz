"use client";

import React from "react";
import { Box, Container, Typography, Chip, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { fadeIn, slideInFromLeft, staggerContainer } from "../lib/animations";
import { MotionBox } from "./motion-ui";

const CERTIFICATIONS = [
  {
    code: "CKA",
    name: "Certified Kubernetes Administrator",
    issuer: "CNCF / Linux Foundation",
    date: "March 2024",
    status: "Active",
    color: "#00d4ff",
  },
];

export const CertificationsSection: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <MotionBox
      sx={{
        py: 10,
        bgcolor: theme.palette.background.default,
        transition: "background-color 0.3s ease",
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <Container maxWidth="lg">
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
            $ ls ./certifications/
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
            Certifications
          </Typography>
        </Box>

        <Grid
          container
          spacing={3}
          component={MotionBox}
          variants={staggerContainer}
        >
          {CERTIFICATIONS.map((cert) => (
            <Grid key={cert.code} size={{ xs: 12, sm: 6, md: 4 }}>
              <MotionBox
                variants={fadeIn}
                sx={{
                  backgroundColor: isDark ? "#141c27" : "#ffffff",
                  border: `1px solid ${isDark ? "#1e293b" : "#d1d5db"}`,
                  borderRadius: "6px",
                  p: 3,
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    borderColor: cert.color,
                    boxShadow: isDark
                      ? `0 0 24px ${cert.color}15`
                      : "0 4px 20px rgba(0,0,0,0.08)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    backgroundColor: cert.color,
                  },
                }}
              >
                {/* Cert code badge */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: "6px",
                    backgroundColor: isDark ? "#0a0e14" : "#f0f4f8",
                    border: `1px solid ${isDark ? "#1e293b" : "#d1d5db"}`,
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: cert.color,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {cert.code}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: theme.palette.text.primary,
                    mb: 0.5,
                    lineHeight: 1.3,
                  }}
                >
                  {cert.name}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.78rem",
                    color: theme.palette.text.secondary,
                    mb: 0.5,
                  }}
                >
                  {cert.issuer}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.75rem",
                    color: theme.palette.text.disabled,
                    mb: 2,
                  }}
                >
                  {cert.date}
                </Typography>

                <Chip
                  label={cert.status}
                  size="small"
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: "0.72rem",
                    backgroundColor: isDark ? "rgba(61, 214, 140, 0.1)" : "rgba(45, 140, 96, 0.1)",
                    color: theme.palette.secondary.main,
                    border: `1px solid ${theme.palette.secondary.main}`,
                    borderRadius: "3px",
                    height: "22px",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>
    </MotionBox>
  );
};
