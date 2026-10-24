"use client";

import React from "react";
import { Grid } from "@mui/material";
import { motion } from "framer-motion";
import { staggerContainer } from "@/app/lib/animations";
import { Post } from "@/app/types/blog";
import { BlogCard } from "./BlogCard";
import { EmptyPostsState } from "./EmptyPostsState";

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return <EmptyPostsState />;
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
        <Grid
          size={{ xs: 12, md: 6, lg: 4 }}
          key={post.slug}
          sx={{ display: "flex" }}
        >
          <BlogCard post={post} index={index} />
        </Grid>
      ))}
    </Grid>
  );
}
