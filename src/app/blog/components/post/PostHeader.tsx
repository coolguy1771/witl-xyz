"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Typography, Box, Chip, useTheme, useMediaQuery } from "@mui/material";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Post } from "@/app/types/blog";

interface PostHeaderProps {
  post: Post;
}

export function PostHeader({ post }: PostHeaderProps) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const formattedDate = format(new Date(post.date), "MMMM d, yyyy");

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant={isSmallScreen ? "h3" : "h2"}
        component="h1"
        sx={{
          fontWeight: 700,
          color: "text.primary",
          mb: 3,
        }}
      >
        {post.title}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          alignItems: "center",
          mb: 4,
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
          <CalendarIcon size={18} />
          <Typography variant="body1">{formattedDate}</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "text.secondary",
          }}
        >
          <ClockIcon size={18} />
          <Typography variant="body1">{post.readingTime}</Typography>
        </Box>
      </Box>

      {post.coverImage && (
        <Box
          sx={{
            position: "relative",
            height: isSmallScreen ? 240 : 400,
            width: "100%",
            mb: 4,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>
      )}

      {post.tags && post.tags.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              clickable
              sx={{
                backgroundColor: (theme) => theme.palette.primary.dark,
                color: "#ffffff",
                fontWeight: 500,
                px: 1,
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                "&:hover": {
                  backgroundColor: (theme) => theme.palette.primary.main,
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                },
                "&:active": {
                  transform: "translateY(0)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
