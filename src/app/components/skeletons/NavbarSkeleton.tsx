import React from "react";
import { AppBar, Toolbar, Box, Skeleton } from "@mui/material";

export const NavbarSkeleton: React.FC = () => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Logo skeleton */}
        <Skeleton variant="text" width={120} height={32} />

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation links skeleton - desktop */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} variant="text" width={80} height={24} />
          ))}
        </Box>

        {/* Theme toggle skeleton */}
        <Box sx={{ ml: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>

        {/* Mobile menu button skeleton */}
        <Box sx={{ display: { xs: "block", md: "none" }, ml: 1 }}>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
