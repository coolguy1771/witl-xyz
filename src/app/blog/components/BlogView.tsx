"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Box, useTheme, useMediaQuery, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { PostGrid } from "./listing/PostGrid";
import { PostList } from "./listing/PostList";
import { PostFilterBar } from "./listing/PostFilterBar";
import { BlogPost } from "@/app/types/blog";
import { CODE_FONT_FAMILY } from "@/app/lib/code-font";

interface BlogViewProps {
  posts: BlogPost[];
  tags: string[];
  initialSelectedTag?: string;
}

export function BlogView({ posts, tags, initialSelectedTag }: BlogViewProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSelectedTag ? [initialSelectedTag] : []
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);

  const handleTagToggle = (tag: string) => {
    if (tag === "all") {
      setSelectedTags([]);
      return;
    }

    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(
        posts.filter((post) => post.tags?.some((tag) => selectedTags.includes(tag)))
      );
    }
  }, [selectedTags, posts]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
        width: "100%",
        overflowX: "clip",
        py: { xs: 6, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          component="header"
          sx={{
            mb: { xs: 4, md: 6 },
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -80,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(100vw, 900px)",
              height: 260,
              background: `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 70%)`,
              zIndex: 0,
              pointerEvents: "none",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: CODE_FONT_FAMILY,
              color: theme.palette.text.secondary,
              fontSize: "0.85rem",
              mb: 1,
              position: "relative",
            }}
          >
            $ ls ~/blog
          </Typography>

          <Typography
            variant={isSmallScreen ? "h3" : "h2"}
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              letterSpacing: "-0.02em",
              mb: 2,
              position: "relative",
            }}
          >
            Blog
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "650px",
              fontSize: { xs: "1rem", sm: "1.1rem" },
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Thoughts, stories, and ideas about technology, development, and productivity.
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: "6px",
            border: `1px solid ${theme.palette.divider}`,
            p: { xs: 2, md: 4 },
            mb: 4,
          }}
        >
          <PostFilterBar
            tags={tags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onViewChange={setViewMode}
            currentView={viewMode}
          />

          {viewMode === "grid" ? (
            <PostGrid posts={filteredPosts} />
          ) : (
            <PostList posts={filteredPosts} />
          )}
        </Box>
      </Container>
    </Box>
  );
}
