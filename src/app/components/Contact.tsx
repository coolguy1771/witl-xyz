"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button, Container, Typography, Box, Paper, useTheme } from "@mui/material";
import { fadeIn, slideInFromLeft, popIn } from "../lib/animations";

export const ContactSection: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component={motion.section}
      id="contact"
      sx={{
        py: 12,
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
            component={motion.h2}
            variant="h3"
            fontWeight={700}
            mb={3}
            sx={{
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
            variants={slideInFromLeft}
          >
            Get In Touch
          </Typography>

          <Typography
            component={motion.p}
            variant="body1"
            mb={6}
            mx="auto"
            maxWidth="36rem"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "1.125rem",
              lineHeight: 1.7,
            }}
            variants={fadeIn}
          >
            Whether you have a project in mind or just want to chat, feel free to reach out.
            I&apos;m always open to discussing new opportunities.
          </Typography>

          <motion.div variants={popIn}>
            <Button
              href="mailto:twitlin@witl.xyz"
              variant="contained"
              size="large"
              sx={{
                backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: theme.palette.common.white,
                px: 5,
                py: 1.5,
                fontSize: "1.125rem",
                fontWeight: 500,
                borderRadius: 2,
                transition: "all 0.3s ease",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                },
              }}
            >
              Say Hello
            </Button>
          </motion.div>
        </Paper>
      </Container>
    </Box>
  );
};
