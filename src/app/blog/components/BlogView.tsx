"use client";

import React, { useState, useMemo } from "react";
import { Container, Typography, Box, useTheme, useMediaQuery, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { PostGrid } from "./listing/PostGrid";
import { PostList } from "./listing/PostList";
import { PostFilterBar } from "./listing/PostFilterBar";
import { BlogPost } from "@/app/types/blog";
import { postMatchesQuery } from "@/app/lib/blog-search";

interface BlogViewProps {
  posts: BlogPost[];
  initialSelectedTag?: string;
  initialSearchQuery?: string;
}

export function BlogView({ posts, initialSelectedTag, initialSearchQuery = "" }: BlogViewProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSelectedTag ? [initialSelectedTag] : []
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Handle tag selection/deselection
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

  const filteredPosts = useMemo(() => {
    const tagFiltered =
      selectedTags.length === 0
        ? posts
        : posts.filter((post) => post.tags?.some((tag) => selectedTags.includes(tag)));

    return tagFiltered.filter((post) => postMatchesQuery(post, searchQuery));
  }, [posts, selectedTags, searchQuery]);

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
        pt: { xs: 10, md: 14 },
        pb: { xs: 8, md: 12 },
      }}
    >
      <Container maxWidth="lg">
        {/* Blog Header - Made this more prominent and header-like */}
        <Box
          component="header"
          sx={{
            textAlign: "center",
            mb: { xs: 6, md: 8 },
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -120,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(100vw, 900px)",
              height: 300,
              background: `radial-gradient(circle at 30% 50%, ${alpha(theme.palette.primary.main, 0.08)}, transparent 70%)`,
              zIndex: 0,
              pointerEvents: "none",
            },
          }}
        >
          <Typography
            variant={isSmallScreen ? "h3" : "h1"}
            component="h1"
            sx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
              mb: 3,
              position: "relative",
              display: "inline-block",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              "&::after": {
                content: '""',
                position: "absolute",
                width: "60%",
                height: "5px",
                borderRadius: "4px",
                bottom: "-12px",
                left: "20%",
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              },
            }}
          >
            Blog
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "650px",
              mx: "auto",
              mt: 4,
              fontSize: { xs: "1rem", sm: "1.15rem" },
              fontWeight: 400,
              lineHeight: 1.6,
              position: "relative",
            }}
          >
            Thoughts, stories, and ideas about technology, development, and productivity.
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 2,
            p: { xs: 2, md: 4 },
            mb: 4,
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            backdropFilter: "blur(8px)",
          }}
        >
          <PostFilterBar
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onViewChange={setViewMode}
            currentView={viewMode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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
