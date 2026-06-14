"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Container, Box, Button, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import { PostHeader } from "./post/PostHeader";
import { PostBody } from "./post/PostBody";
import { PostFooter } from "./post/PostFooter";
import { BlogPost } from "@/app/types/blog";
import { CODE_FONT_FAMILY } from "@/app/lib/code-font";

interface BlogPostViewProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

export function BlogPostView({ post, relatedPosts = [] }: BlogPostViewProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Box
        sx={{
          position: "relative",
          py: { xs: 6, md: 8 },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 200,
            background: `radial-gradient(ellipse at 50% 0%, ${alpha(theme.palette.primary.main, 0.06)}, transparent 70%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ mb: 3, py: 2, position: "relative" }}>
            <motion.div whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => router.back()}
                sx={{
                  color: "primary.main",
                  fontFamily: CODE_FONT_FAMILY,
                  fontSize: "0.85rem",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    width: "10px",
                    height: "10px",
                    borderLeft: `2px solid ${theme.palette.primary.main}`,
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    transform: "rotate(45deg)",
                    left: "6px",
                    top: "calc(50% - 5px)",
                  },
                  pl: 4,
                }}
              >
                cd ../blog
              </Button>
            </motion.div>
          </Box>

          <PostHeader post={post} />
          <PostBody post={post} content={post.content} />
          <PostFooter post={post} relatedPosts={relatedPosts} />
        </Container>
      </Box>
    </motion.div>
  );
}
