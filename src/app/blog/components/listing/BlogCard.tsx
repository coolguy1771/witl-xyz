"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Post } from "@/app/types/blog";
import { scaleUp, cardHover } from "@/app/lib/animations";

/** Fixed content zones so every card is the same height in the grid. */
const CARD_MIN_HEIGHT = 280;
const TITLE_LINE_CLAMP = 2;
const EXCERPT_LINE_CLAMP = 2;

interface BlogCardProps {
  post: Post;
  index?: number;
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const theme = useTheme();
  const formattedDate = format(new Date(post.date), "MMM d, yyyy");

  return (
    <Card
      component={motion.div}
      custom={index}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={{
        ...scaleUp,
        hover: cardHover.hover,
      }}
      sx={{
        height: "100%",
        minHeight: CARD_MIN_HEIGHT,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: "all 0.3s ease",
        overflow: "hidden",
        "&:hover": {
          borderColor: theme.palette.primary.main,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      <Link
        href={`/blog/${post.slug}`}
        style={{ textDecoration: "none", display: "flex", flex: 1 }}
      >
        <CardContent
          sx={{
            p: 3,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            "&:last-child": { pb: 3 },
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              color: theme.palette.text.primary,
              mb: 1.5,
              lineHeight: 1.3,
              minHeight: `calc(1.3em * ${TITLE_LINE_CLAMP})`,
              display: "-webkit-box",
              WebkitLineClamp: TITLE_LINE_CLAMP,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.title}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              mb: 2,
              flexWrap: "wrap",
              fontFamily: "'Geist Mono', monospace",
              fontSize: "0.75rem",
              color: theme.palette.text.secondary,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarIcon size={14} />
              <Typography variant="caption" component="span">
                {formattedDate}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <ClockIcon size={14} />
              <Typography variant="caption" component="span">
                {post.readingTime}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              flexGrow: 1,
              lineHeight: 1.6,
              minHeight: "2.5rem",
              display: "-webkit-box",
              WebkitLineClamp: EXCERPT_LINE_CLAMP,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {post.excerpt}
          </Typography>

          <Stack
            direction="row"
            sx={{ mt: "auto", flexWrap: "wrap", gap: 1, minHeight: 28 }}
          >
            {(post.tags ?? []).slice(0, 4).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.secondary,
                  border: `1px solid ${theme.palette.divider}`,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Link>
    </Card>
  );
}
