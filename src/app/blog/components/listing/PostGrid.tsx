"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Post } from "@/app/types/blog";

interface PostGridProps {
  posts: Post[];
}

export function PostGrid({ posts }: PostGridProps) {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {posts.length > 0 ? (
        posts.map((post, index) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={post.slug}>
            <BlogCard post={post} index={index} />
          </Grid>
        ))
      ) : (
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              width: "100%",
              textAlign: "center",
              py: 8,
              px: 3,
              backgroundColor: alpha(theme.palette.background.paper, 0.4),
              borderRadius: 2,
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
        </Grid>
      )}
    </Grid>
  );
}

interface BlogCardProps {
  post: Post;
  index: number;
}

function BlogCard({ post, index }: BlogCardProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  const formattedDate = format(new Date(post.date), "MMMM d, yyyy");

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={variants}
      whileHover={{
        scale: 1.03,
        boxShadow: theme.shadows[10],
        transition: { duration: 0.2, type: "spring", stiffness: 400 },
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
        <Card
          elevation={1}
          sx={(theme) => ({
            height: "100%",
            display: "flex",
            flexDirection: "column",
            cursor: "pointer",
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            borderWidth: 1,
            borderStyle: "solid",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
            transition: theme.transitions.create(
              ["transform", "box-shadow", "border-color"],
              {
                duration: theme.transitions.duration.standard,
              }
            ),
            "&:hover": {
              boxShadow: theme.shadows[8],
              borderColor: theme.palette.primary.main,
              "&::before": {
                width: "100%",
              },
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "30%",
              height: "3px",
              backgroundColor: theme.palette.primary.main,
              transition: "width 0.3s ease",
              zIndex: 1,
            },
          })}
        >
          {post.coverImage && (
            <Box
              sx={{
                position: "relative",
                height: 200,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          )}

          <CardContent
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              p: 3,
              "&:last-child": {
                paddingBottom: 3, // Override MUI default
              },
            }}
          >
            <Typography
              variant={isSmallScreen ? "h6" : "h5"}
              component="h2"
              color="text.primary"
              sx={{
                fontWeight: 700,
                mb: 2,
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
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
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <CalendarIcon size={16} />
                <Typography variant="body2" color="text.secondary">
                  {formattedDate}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                }}
              >
                <ClockIcon size={16} />
                <Typography variant="body2" color="text.secondary">
                  {post.readingTime}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mb: 3,
                flexGrow: 1,
                lineHeight: 1.6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {post.excerpt}
            </Typography>

            {post.tags && post.tags.length > 0 && (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: "auto" }}
              >
                {post.tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    clickable
                    color="primary"
                    variant="outlined"
                    sx={(theme) => ({
                      fontWeight: 500,
                      borderRadius: "6px",
                      transition: theme.transitions.create([
                        "background-color",
                        "box-shadow",
                        "transform",
                      ]),
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.08
                        ),
                        transform: "translateY(-1px)",
                      },
                    })}
                  />
                ))}
                {post.tags.length > 3 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    +{post.tags.length - 3} more
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
