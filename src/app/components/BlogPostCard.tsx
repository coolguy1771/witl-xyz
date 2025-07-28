import NextLink from "next/link";
import { motion } from "framer-motion";
import { BlogPost } from "../types/blog";
import { fadeIn } from "../lib/animations";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { ArrowRight } from "lucide-react";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <motion.div variants={fadeIn} whileHover={{ y: -5 }}>
      <Card
        elevation={1}
        sx={(theme) => ({
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
          transition: theme.transitions.create(["transform", "box-shadow"]),
          position: "relative",
          "&:hover": {
            boxShadow: theme.shadows[4],
            "& .title": {
              color: theme.palette.primary.main,
            },
            "& .readMore": {
              color: theme.palette.primary.main,
            },
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
          },
        })}
      >
        <NextLink href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h5"
                className="title"
                sx={(theme) => ({
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  transition: theme.transitions.create("color"),
                  mb: 1,
                })}
              >
                {post.title}
              </Typography>

              <Box
                sx={(theme) => ({
                  display: "flex",
                  gap: 2,
                  color: theme.palette.text.secondary,
                })}
              >
                <Typography variant="body2" color="text.secondary">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </Typography>
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
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
              }}
            >
              {post.excerpt}
            </Typography>

            <Box
              className="readMore"
              sx={(theme) => ({
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: theme.palette.text.secondary,
                transition: theme.transitions.create("color"),
              })}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                sx={{
                  transition: (theme) => theme.transitions.create("all"),
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                Read more
                <ArrowRight size={16} />
              </Typography>
            </Box>
          </CardContent>
        </NextLink>
      </Card>
    </motion.div>
  );
}
