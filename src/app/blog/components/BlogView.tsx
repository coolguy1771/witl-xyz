"use client";

import React, { useState, useEffect } from "react";
import { Container, Typography, Box, useTheme, useMediaQuery, alpha, Button, Tooltip, TextField, InputAdornment } from "@mui/material";
import Link from "next/link";
import { motion } from "framer-motion";
import { Rss as RssIcon, Search as SearchIcon, X as XIcon } from "lucide-react";
import { PostGrid } from "./listing/PostGrid";
import { PostList } from "./listing/PostList";
import { PostFilterBar } from "./listing/PostFilterBar";
import { BlogPost } from "@/app/types/blog";

interface BlogViewProps {
  posts: BlogPost[];
  initialSelectedTag?: string;
  showRssLink?: boolean;
}

/** Simple fuzzy matcher: each term must appear somewhere (case-insensitive). */
function matchesSearch(text: string, query: string): boolean {
  if (!query || !query.trim()) return true;
  const terms = query.toLowerCase().trim().split(/\s+/);
  return terms.every((term) => text.includes(term));
}

export function BlogView({ posts, initialSelectedTag, showRssLink = false }: BlogViewProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialSelectedTag ? [initialSelectedTag] : []
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Apply tag filter (OR) + search filter (AND), client-side from loaded posts.
  const filteredPosts = React.useMemo(() => {
    let result = posts;

    if (selectedTags.length > 0) {
      result = result.filter((p) => p.tags?.some((t) => selectedTags.includes(t)));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((post) => {
        const searchable = [
          post.title || "",
          post.excerpt || "",
          ...(post.tags || []),
          (post.content || "").replace(/<[^>]+>/g, " "),
        ].join(" ");
        return q.split(/\s+/).every((term) => term && searchable.includes(term));
      });
    }

    return result;
  }, [posts, selectedTags, searchQuery]);

  const handleClearAll = () => {
    setSelectedTags([]);
    setSearchQuery("");
  };

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

  // Filter posts when selected tags change
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
          {/* Search input */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={16} color="#94a3b8" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button onClick={() => setSearchQuery("")} sx={{ minWidth: 24, p: 0.5 }} size="small">
                      <XIcon size={16} color="#94a3b8" />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { fontFamily: "'Geist Mono', monospace", fontSize: "0.85rem" } }}
            />

            {(selectedTags.length > 0 || searchQuery.trim()) && (
              <Button onClick={handleClearAll} size="small" variant="outlined" sx={{ fontFamily: "'Geist Mono', monospace", borderRadius: "999px", px: 2 }}>
                Clear all
              </Button>
            )}
          </Box>

          {/* Results count */}
          {(searchQuery.trim() || selectedTags.length > 0) && (
            <Typography variant="caption" sx={{ fontFamily: "'Geist Mono', monospace", color: theme.palette.text.secondary, mb: 2, display: "block" }}>
              Showing {filteredPosts.length} of {posts.length} posts
              {searchQuery.trim() && ` matching "${searchQuery}"`}
              {selectedTags.length > 0 && ` with tags ${selectedTags.map((t) => `'${t}'`).join(", ")}`}
            </Typography>
          )}

          <PostFilterBar
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
