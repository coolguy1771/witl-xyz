"use client";

import React from "react";
import { Box, Typography, Grid, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { staggerContainer } from "@/app/lib/animations";
import { Post } from "@/app/types/blog";
import { BlogCard } from "./BlogCard";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  const theme = useTheme();

  if (posts.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          py: 8,
          px: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.4),
          borderRadius: "6px",
          border: `1px dashed ${theme.palette.divider}`,
          color: theme.palette.text.secondary,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          No posts found matching your criteria.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Try selecting different tags or view all posts.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={3}
      component={motion.div}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {posts.map((post, index) => (
        <Grid size={{ xs: 12, md: 6 }} key={post.slug} sx={{ display: "flex" }}>
          <BlogCard post={post} index={index} />
        </Grid>
      ))}
    </Grid>
  );
}
