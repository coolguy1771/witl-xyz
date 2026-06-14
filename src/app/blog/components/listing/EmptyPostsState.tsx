"use client";

import React from "react";
import { Box, Typography, useTheme, alpha } from "@mui/material";

export function EmptyPostsState() {
  const theme = useTheme();

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
