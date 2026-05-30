"use client";

import React from "react";
import { Button, Container, Typography, Paper, useTheme } from "@mui/material";
import { fadeIn, popIn } from "../lib/animations";
import { MotionBox } from "./motion-ui";

export const ContactSection: React.FC = () => {
  const theme = useTheme();

  return (
    <MotionBox
      sx={{
        py: { xs: 6, md: 12 },
        backgroundColor: theme.palette.background.default,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          opacity: 0.4,
          zIndex: -1,
        },
      }}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeIn}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: "center",
            backgroundColor: theme.palette.background.paper,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
            boxShadow: `0 20px 40px rgba(0,0,0,0.1)`,
            border: `1px solid ${theme.palette.divider}`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "4px",
              height: "100%",
              background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
              color: theme.palette.text.primary,
              position: "relative",
              display: "inline-block",
              "&::after": {
                content: '""',
                position: "absolute",
                width: "60%",
                height: "4px",
                borderRadius: "2px",
                bottom: "-10px",
                left: "20%",
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            Get In Touch
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 6,
              mx: "auto",
              maxWidth: "36rem",
              color: theme.palette.text.secondary,
              fontSize: { xs: "1rem", md: "1.125rem" },
              lineHeight: 1.7,
            }}
          >
            Open to DevOps and SRE roles. I&apos;ve spent most of my career in air-gapped
            environments and I&apos;m not scared off by compliance requirements.
          </Typography>

          <MotionBox variants={popIn}>
            <Button
              href="mailto:twitlin@witl.xyz"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.mode === "dark" ? "#0a0e14" : "#ffffff",
                px: 5,
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: "'Geist Mono', monospace",
                borderRadius: "4px",
                transition: "all 0.2s ease",
                boxShadow: theme.palette.mode === "dark"
                  ? "0 0 20px rgba(0, 212, 255, 0.15)"
                  : "0 4px 10px rgba(0,0,0,0.15)",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: theme.palette.mode === "dark"
                    ? "0 0 30px rgba(0, 212, 255, 0.3)"
                    : "0 8px 20px rgba(0,0,0,0.2)",
                },
              }}
            >
              ./say-hello
            </Button>
          </MotionBox>
        </Paper>
      </Container>
    </MotionBox>
  );
};
