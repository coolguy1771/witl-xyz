"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Container, Typography, Box, useTheme, useMediaQuery, alpha, Button, Tooltip } from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Rss as RssIcon } from "lucide-react";
import { PostGrid } from "./listing/PostGrid";
import { PostList } from "./listing/PostList";
import { PostFilterBar } from "./listing/PostFilterBar";
import { BlogPost } from "@/app/types/blog";

interface BlogViewProps {
  posts: BlogPost[];
  initialSelectedTag?: string;
  showRssLink?: boolean;
}

export function BlogView({ posts, initialSelectedTag, showRssLink = false }: BlogViewProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const searchParams = useSearchParams();

  // Derive selected tag from URL; fall back to server-provided initialSelectedTag on mount
  const urlTag = searchParams.get("tag") || "";
  const [selectedTags, setSelectedTags] = useState<string[]>(
    () => (initialSelectedTag ? [initialSelectedTag] : [])
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Keep local state synced with URL changes (e.g. direct navigation to ?tag=X)
  useEffect(() => {
    setSelectedTags(urlTag ? [urlTag] : []);
  }, [urlTag]);

  const updateUrlTag = useCallback(
    (tag: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }
      const query = params.toString();
      router.replace(`/blog${query ? `?${query}` : ""}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle tag selection/deselection — single tag mode via URL
  const handleTagToggle = useCallback(
    (tag: string) => {
      if (!tag) return;

      // Toggle: if already selected, clear it
      if (selectedTags.includes(tag)) {
        setSelectedTags([]);
        updateUrlTag(null);
      } else {
        // Select new tag — only one at a time via URL
        setSelectedTags([tag]);
        updateUrlTag(tag);
      }
    },
    [selectedTags, updateUrlTag]
  );

  // Clear filter / go back to all posts
  const handleClearFilter = useCallback(() => {
    setSelectedTags([]);
    updateUrlTag(null);
  }, [updateUrlTag]);

  // Filter posts when selected tags change
  const filteredPosts = React.useMemo(() => {
    if (selectedTags.length === 0) return posts;
    return posts.filter((post) => post.tags?.some((tag) => selectedTags.includes(tag)));
  }, [posts, selectedTags]);

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

          {showRssLink && (
            <Box sx={{ mt: 3 }}>
              <Tooltip title="Subscribe via RSS">
                <Button
                  component={Link}
                  href="/api/blog/rss"
                  startIcon={<RssIcon size={18} />}
                  variant="outlined"
                  size="small"
                  target="_blank"
                  sx={{
                    fontFamily: "'Geist Mono', monospace",
                    borderRadius: "999px",
                    px: 2.5,
                  }}
                >
                  RSS Feed
                </Button>
              </Tooltip>
            </Box>
          )}
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
            posts={posts}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearFilter={handleClearFilter}
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
