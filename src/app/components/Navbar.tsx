"use client";

import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
} from "@mui/material";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useThemeMode } from "./ThemeRegistry";

// Import components from the index file
import { ThemeToggle, ScrollToTop } from ".";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/#projects" },
  { label: "About", path: "/#about" },
  { label: "Blog", path: "/blog" },
  { label: "You", path: "/you" },
  { label: "SSL Tools", path: "/ssl" },
  { label: "Contact", path: "/#contact" },
];

export const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 60);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    // For hash links, check if we're on the home page and the hash matches
    if (path.includes("#")) {
      const [basePath, hash] = path.split("#");
      return pathname === basePath && window.location.hash === `#${hash}`;
    }
    return pathname.startsWith(path);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={scrolled ? 4 : 0}
        sx={{
          backdropFilter: "blur(8px)",
          backgroundColor: scrolled
            ? theme.palette.mode === "dark"
              ? "rgba(18, 18, 18, 0.95)"
              : "rgba(255, 255, 255, 0.95)"
            : theme.palette.mode === "dark"
              ? "rgba(18, 18, 18, 0.8)"
              : "rgba(255, 255, 255, 0.8)",
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: "all 0.3s ease",
          [theme.breakpoints.down("sm")]: {
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(18, 18, 18, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
          },
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            maxWidth: "1200px",
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 4 },
          }}
        >
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Box
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  fontWeight: 700,
                  background: "linear-gradient(45deg, #0070f3, #7928ca)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                witl.xyz
              </Box>
            </Box>
          </Link>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 2,
              alignItems: "center",
            }}
          >
            {navItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                passHref
                style={{ textDecoration: "none" }}
              >
                <Button
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  sx={{
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    fontWeight: isActive(item.path) ? 600 : 500,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    position: "relative",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: "50%",
                      transform: isActive(item.path)
                        ? "translateX(-50%)"
                        : "translateX(-50%) scaleX(0)",
                      width: "100%",
                      height: "2px",
                      backgroundColor: theme.palette.primary.main,
                      transition: "transform 0.3s ease",
                    },
                    "&:hover::after": {
                      transform: "translateX(-50%) scaleX(1)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <ThemeToggle />
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{
              display: { md: "none" },
              color: theme.palette.text.primary,
            }}
            onClick={() => setIsOpen(!isOpen)}
            edge="end"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </IconButton>
        </Toolbar>

        {/* Mobile Navigation */}
        <Drawer
          anchor="top"
          open={isOpen && isMobile}
          onClose={() => setIsOpen(false)}
          transitionDuration={200}
          sx={{
            "& .MuiDrawer-paper": {
              mt: "72px",
              boxShadow: "none",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "rgba(18, 18, 18, 0.95)"
                  : "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(8px)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              py: 4,
              px: 2,
            }}
          >
            {navItems.map(item => (
              <Link
                key={item.path}
                href={item.path}
                passHref
                style={{ textDecoration: "none" }}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  fullWidth
                  sx={{
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    fontWeight: isActive(item.path) ? 600 : 500,
                    justifyContent: "flex-start",
                    px: 2,
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <ThemeToggle />
            </Box>
          </Box>
        </Drawer>
      </AppBar>

      {/* Scroll to top button */}
      <ScrollToTop show={scrolled} />
    </>
  );
};
