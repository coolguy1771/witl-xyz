"use client";

import React, { useMemo } from "react";
import { Box, Chip, Typography, IconButton, useTheme } from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import { BlogPost } from "@/app/types/blog";

interface PostFilterBarProps {
  posts: BlogPost[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilter?: () => void;
  onViewChange: (view: "grid" | "list") => void;
  currentView: "grid" | "list";
}

export function PostFilterBar({
  posts,
  selectedTags,
  onTagToggle,
  onClearFilter,
  onViewChange,
  currentView,
}: PostFilterBarProps) {
  const theme = useTheme();

  // Derive tags with counts from loaded posts (no API call needed)
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        mb: 4,
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: { xs: 2, md: 0 } }}>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          Filter by tags:
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Chip
            label={selectedTags.length === 0 ? `All Posts` : `${posts.length} posts`}
            onClick={() => onClearFilter?.()}
            color={selectedTags.length === 0 ? "primary" : "default"}
            sx={{
              backgroundColor:
                selectedTags.length === 0
                  ? theme.palette.primary.main
                  : theme.palette.action.selected,
              color:
                selectedTags.length === 0
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
              "&:hover": {
                backgroundColor:
                  selectedTags.length === 0
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
              },
            }}
          />

          {tagCounts.map(({ tag, count }) => (
            <Chip
              key={tag}
              label={`${tag} (${count})`}
              onClick={() => onTagToggle(tag)}
              color={selectedTags.includes(tag) ? "primary" : "default"}
              sx={{
                backgroundColor: selectedTags.includes(tag)
                  ? theme.palette.primary.main
                  : theme.palette.action.selected,
                color: selectedTags.includes(tag)
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: selectedTags.includes(tag)
                    ? theme.palette.primary.dark
                    : theme.palette.action.hover,
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignSelf: { xs: "flex-end", md: "auto" } }}>
        <IconButton
          onClick={() => onViewChange("grid")}
          color={currentView === "grid" ? "primary" : "default"}
          sx={{
            color:
              currentView === "grid" ? theme.palette.primary.main : theme.palette.text.secondary,
          }}
        >
          <GridViewIcon />
        </IconButton>

        <IconButton
          onClick={() => onViewChange("list")}
          color={currentView === "list" ? "primary" : "default"}
          sx={{
            color:
              currentView === "list" ? theme.palette.primary.main : theme.palette.text.secondary,
          }}
        >
          <ViewListIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
