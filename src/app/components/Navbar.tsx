"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navAnimation } from "../lib/animations";
import { Menu, X, Sun, Moon, ArrowUp } from "lucide-react";
import {
  AppBar,
  Container,
  Toolbar,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  Button,
  Slide,
  useScrollTrigger,
  Fab,
  Tooltip,
  alpha,
  Zoom,
} from "@mui/material";
import { useThemeMode } from "./ThemeRegistry";

// Hide on scroll functionality
function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navItems = [
    { label: "~/", href: "/" },
    { label: "skills", href: "/#skills" },
    { label: "certs", href: "/#certs" },
    { label: "projects", href: "/#projects" },
    { label: "blog", href: "/blog" },
    { label: "about", href: "/#about" },
    { label: "contact", href: "/#contact" },
  ];

  const NavLink = ({ item }: { item: { label: string; href: string } }) => {
    const isActive =
      pathname === item.href ||
      (pathname === "/" && item.href.startsWith("/#")) ||
      (item.href === "/ssl" && pathname.startsWith("/ssl")) ||
      (item.href === "/blog" && pathname.startsWith("/blog"));

    return (
      <Box
        component={Link}
        href={item.href}
        sx={{
          position: "relative",
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          textDecoration: "none",
          fontWeight: isActive ? 600 : 400,
          fontFamily: "'Geist Mono', monospace",
          fontSize: "0.85rem",
          transition: "color 0.2s ease",
          "&:hover": {
            color: theme.palette.primary.main,
            "&::after": {
              width: "100%",
            },
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -4,
            left: 0,
            width: isActive ? "100%" : 0,
            height: "1px",
            backgroundColor: theme.palette.primary.main,
            transition: "width 0.2s ease",
          },
        }}
        onClick={() => isMobile && setIsOpen(false)}
      >
        {item.label}
      </Box>
    );
  };

  // Import theme context to allow theme toggling
  const { mode, toggleTheme } = useThemeMode();

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          width: "100%",
        }}
      >
        <HideOnScroll>
          <AppBar
            component={motion.nav}
            position="static"
            elevation={scrolled ? 4 : 0}
            initial="initial"
            animate="animate"
            variants={navAnimation}
            sx={(theme) => ({
              backgroundColor:
                theme.palette.mode === "dark" ? "#0a0e14" : "#f0f4f8",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backdropFilter: "none",
              transition: "all 0.3s ease",
              zIndex: theme.zIndex.drawer + 1,
              height: { xs: "64px", md: "72px" },
              borderRadius: 0,
              boxSizing: "border-box",
              width: "100%",
              left: 0,
              right: 0,
              boxShadow: "none",
            })}
          >
            <Container maxWidth="lg">
              <Toolbar
                disableGutters
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1.5, md: 2 },
                  minHeight: { xs: "64px", md: "72px" },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Logo */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    component={Link}
                    href="/"
                    variant="h6"
                    sx={(theme) => ({
                      color: theme.palette.secondary.main,
                      textDecoration: "none",
                      transition: "color 0.2s ease",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      letterSpacing: "0.01em",
                      fontFamily: "'Geist Mono', monospace",
                      fontWeight: "bold",
                      "&:hover": {
                        color: theme.palette.primary.main,
                      },
                    })}
                  >
                    witl@xyz:~$
                  </Typography>
                </Box>

                {/* Desktop Navigation */}
                <Box
                  sx={{
                    display: { xs: "none", md: "flex" },
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {navItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                  ))}

                  {/* Theme toggle button with animation */}
                  <Tooltip
                    title={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <span>Switch to {mode === "dark" ? "light" : "dark"} mode</span>
                        {mode === "dark" ? (
                          <Sun size={14} style={{ animation: "spin 1.5s ease infinite" }} />
                        ) : (
                          <Moon size={14} style={{ animation: "pulse 1.5s ease infinite" }} />
                        )}
                      </Box>
                    }
                    arrow
                  >
                    <IconButton
                      onClick={toggleTheme}
                      sx={{
                        ml: 1,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                          transform: "rotate(12deg)",
                        },
                        height: 36,
                        width: 36,
                        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", // Bouncy transition
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          borderRadius: "50%",
                          top: 0,
                          left: 0,
                          transform: "scale(0)",
                          transition: "transform 0.4s ease",
                        },
                        "&:active::before": {
                          transform: "scale(2)",
                          opacity: 0,
                          transition: "transform 0.3s ease, opacity 0.3s ease",
                        },
                      }}
                    >
                      {mode === "dark" ? (
                        <Sun
                          size={18}
                          style={{
                            animation: "fadeIn 0.3s ease",
                          }}
                        />
                      ) : (
                        <Moon
                          size={18}
                          style={{
                            animation: "fadeIn 0.3s ease",
                          }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Mobile Menu Button */}
                <IconButton
                  sx={{
                    ml: "auto",
                    display: { md: "none" },
                    color: theme.palette.text.primary,
                  }}
                  onClick={() => setIsOpen(!isOpen)}
                  edge="end"
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </IconButton>
              </Toolbar>
            </Container>

            {/* Mobile Navigation */}
            <Drawer
              anchor="top"
              open={isOpen && isMobile}
              onClose={() => setIsOpen(false)}
              transitionDuration={200}
              slotProps={{
                backdrop: {
                  sx: {
                    backdropFilter: "blur(8px)",
                    backgroundColor: theme.palette.background.default + "A6",
                  },
                },
                paper: {
                  sx: {
                    mt: { xs: "64px", md: "72px" },
                    boxShadow: "none",
                    backgroundColor: theme.palette.background.paper,
                    transition: "background-color 0.3s ease",
                  },
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
                {navItems.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}

                {/* Theme toggle in mobile menu */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mt: 2,
                    pt: 2,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Button
                    onClick={() => {
                      toggleTheme();
                      setIsOpen(false);
                    }}
                    startIcon={
                      mode === "dark" ? (
                        <Sun
                          size={16}
                          style={{
                            animation: "fadeIn 0.3s ease",
                            transform: "rotate(0deg)",
                            transformOrigin: "center",
                          }}
                        />
                      ) : (
                        <Moon
                          size={16}
                          style={{
                            animation: "fadeIn 0.3s ease",
                            transform: "rotate(0deg)",
                            transformOrigin: "center",
                          }}
                        />
                      )
                    }
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{
                      mt: 1,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: (theme) =>
                          `0 4px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        background: (theme) => `linear-gradient(90deg,
                        ${alpha(theme.palette.primary.main, 0)},
                        ${alpha(theme.palette.primary.main, 0.1)},
                        ${alpha(theme.palette.primary.main, 0)})`,
                        top: 0,
                        left: "-100%",
                        transition: "left 0.5s ease",
                      },
                      "&:hover::after": {
                        left: "100%",
                      },
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        animation: "fadeIn 0.5s ease",
                      }}
                    >
                      Switch to {mode === "dark" ? "light" : "dark"} mode
                    </span>
                  </Button>
                </Box>
              </Box>
            </Drawer>
          </AppBar>
        </HideOnScroll>
      </Box>

      {/* Scroll to top button */}
      <Zoom in={scrolled}>
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: theme.zIndex.drawer - 1,
            boxShadow: theme.shadows[3],
          }}
        >
          <ArrowUp size={20} />
        </Fab>
      </Zoom>
    </>
  );
}
