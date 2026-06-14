"use client";

import React from "react";
import Link from "next/link";
import { Box, Typography, Button, Divider, Chip, alpha, useTheme } from "@mui/material";
import { TagIcon } from "lucide-react";
import { Post } from "@/app/types/blog";
import { BlogCard } from "../listing/BlogCard";

interface PostFooterProps {
  post: Post;
  relatedPosts?: Post[];
}

export function PostFooter({ post, relatedPosts = [] }: PostFooterProps) {
  const theme = useTheme();

  return (
    <Box component="footer" sx={{ mt: 6 }}>
      {post.tags && post.tags.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <TagIcon size={20} style={{ color: "var(--mui-palette-text-secondary)" }} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {post.tags.map((tag) => (
              <Link href={`/blog?tag=${tag}`} key={tag} style={{ textDecoration: "none" }}>
                <Chip
                  label={tag}
                  size="small"
                  clickable
                  sx={(theme) => ({
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.common.white,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  })}
                />
              </Link>
            ))}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {relatedPosts.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" sx={{ mb: 3, color: "text.secondary" }}>
            Related Posts
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
            }}
          >
            {relatedPosts.map((relatedPost, index) => (
              <Box key={relatedPost.slug} sx={{ display: "flex" }}>
                <BlogCard post={relatedPost} index={index} />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
          Enjoyed this post?
        </Typography>
        <Link href="/blog" style={{ textDecoration: "none" }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{
              fontFamily: "'Geist Mono', monospace",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Read more articles
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
