"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { TagIcon } from "lucide-react";
import { Post } from "@/app/types/blog";

interface PostFooterProps {
  post: Post;
  relatedPosts?: Post[];
}

export function PostFooter({ post, relatedPosts = [] }: PostFooterProps) {
  return (
    <Box component="footer" sx={{ mt: 6 }}>
      {post.tags && post.tags.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <TagIcon
            size={20}
            style={{ color: "var(--mui-palette-text-secondary)" }}
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {post.tags.map(tag => (
              <Link
                href={`/blog?tag=${tag}`}
                key={tag}
                style={{ textDecoration: "none" }}
              >
                <Chip
                  label={tag}
                  size="small"
                  clickable
                  sx={theme => ({
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
            {relatedPosts.map(relatedPost => (
              <Link
                key={relatedPost.slug}
                href={`/blog/${relatedPost.slug}`}
                style={{ textDecoration: "none" }}
              >
                <Card
                  sx={theme => ({
                    height: "100%",
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    borderWidth: 1,
                    borderStyle: "solid",
                    transition: theme.transitions.create([
                      "transform",
                      "box-shadow",
                    ]),
                    "&:hover": {
                      boxShadow:
                        theme.palette.mode === "dark"
                          ? "0 8px 24px rgba(0,0,0,0.25)"
                          : "0 8px 24px rgba(0,0,0,0.12)",
                      transform: "translateY(-4px)",
                    },
                  })}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        mb: 1,
                      }}
                    >
                      {relatedPost.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {relatedPost.excerpt}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
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
              "&:hover": {
                backgroundColor: "rgba(59, 130, 246, 0.08)",
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
