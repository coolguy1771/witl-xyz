"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Box,
  CardContent,
  Typography,
  Stack,
  Button,
  useTheme,
  Collapse,
} from "@mui/material";
import { Project } from "../types";
import { TechBadge } from "./TechBadge";
import { AnimatedBorderCard } from "./ui/AnimatedBorderCard";
import { MagneticButton } from "./ui/MagneticButton";
import { GlowButton } from "./ui/GlowButton";
import { scaleUp, cardHover } from "../lib/animations";

interface ProjectCardProps {
  project: Project;
  maxVisibleTags?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  maxVisibleTags = 4,
}) => {
  const theme = useTheme();
  const [showAllTags, setShowAllTags] = useState(false);

  const visibleTags = showAllTags
    ? project.tech
    : project.tech.slice(0, maxVisibleTags);
  const hasMoreTags = project.tech.length > maxVisibleTags;

  return (
    <AnimatedBorderCard glowColor={theme.palette.primary.main}>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography
            variant="h5"
            component="h3"
            fontWeight="bold"
            gutterBottom
          >
            {project.title}
          </Typography>

          <Stack direction="row" spacing={1}>
            {project.githubUrl && (
              <MagneticButton
                component="a"
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                strength={0.5}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": {
                    color: theme.palette.text.primary,
                  },
                }}
              >
                <FaGithub size={20} />
              </MagneticButton>
            )}
            <MagneticButton
              component="a"
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              strength={0.5}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.text.primary,
                },
              }}
            >
              <FaExternalLinkAlt size={18} />
            </MagneticButton>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
            minHeight: "2.5rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project.description}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          {/* Visible Tags */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: hasMoreTags ? 1 : 0 }}
          >
            {visibleTags.map((tech, index) => (
              <TechBadge key={index} tech={tech} index={index} />
            ))}
          </Stack>

          {/* Hidden Tags with Collapse Animation */}
          {hasMoreTags && (
            <AnimatePresence>
              <Collapse in={showAllTags}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mb: 1 }}
                  component={motion.div}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {project.tech.slice(maxVisibleTags).map((tech, index) => (
                    <TechBadge
                      key={index + maxVisibleTags}
                      tech={tech}
                      index={index + maxVisibleTags}
                    />
                  ))}
                </Stack>
              </Collapse>
            </AnimatePresence>
          )}

          {/* Show More/Less Button */}
          {hasMoreTags && (
            <GlowButton
              size="small"
              onClick={() => setShowAllTags(!showAllTags)}
              startIcon={
                showAllTags ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )
              }
              intensity={0.3}
              sx={{
                minHeight: "auto",
                padding: "4px 12px",
                fontSize: "0.75rem",
                background: `linear-gradient(45deg, ${theme.palette.primary.main}22, ${theme.palette.secondary.main}22)`,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.primary.main}44`,
                "&:hover": {
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}33, ${theme.palette.secondary.main}33)`,
                },
              }}
            >
              {showAllTags
                ? "Show Less"
                : `+${project.tech.length - maxVisibleTags} More`}
            </GlowButton>
          )}
        </Box>
      </CardContent>
    </AnimatedBorderCard>
  );
};
