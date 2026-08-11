"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Container,
  Toolbar,
  Box,
  Typography,
  IconButton,
  useTheme,
  Theme,
  useMediaQuery,
  Drawer,
  Button,
  Fab,
  Tooltip,
  alpha,
  Zoom,
  SxProps,
} from "@mui/material";
import { Menu, X, Sun, Moon, ArrowUp } from "lucide-react";
import { useThemeMode } from "./ThemeRegistry";
import { useLenis } from "lenis/react";

/** Scroll-direction tracking hook. Hides navbar on scroll down, shows on scroll up. */
function useNavbarVisibility(isOpen: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"), {
    noSsr: true,
  });

  useLenis((instance) => {
    setScrolled(instance.scroll > 60);

    if (isOpen || isMobile || instance.scroll <= 0) {
      setNavVisible(true);
      return;
    }

    if (instance.direction === 1) {
      setNavVisible(false);
    } else if (instance.direction === -1) {
      setNavVisible(true);
    }
  });

  return { scrolled, navVisible };
}

/** Hash sync hook: keeps local hash in line with window.location.hash. */
function useHash() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  return { hash, setHash };
}

const NAV_ITEMS = [
  { label: "~/", href: "/" },
  { label: "skills", href: "/#skills" },
  { label: "certs", href: "/#certs" },
  { label: "projects", href: "/#projects" },
  { label: "blog", href: "/blog" },
  { label: "about", href: "/#about" },
  { label: "contact", href: "/#contact" },
] as const;

/** Desktop/mobile navigation link with underline and active-state logic. */
function NavLink({
  item,
  hash,
  onNavigate,
  onHashChange,
}: {
  item: (typeof NAV_ITEMS)[number];
  hash: string;
  onNavigate?: () => void;
  onHashChange: (nextHash: string) => void;
}) {
  const pathname = usePathname();
  const theme = useTheme();

  const linkHash = item.href.includes("#")
    ? item.href.slice(item.href.indexOf("#"))
    : "";
  const isActive =
    (item.href === "/" && pathname === "/" && !hash) ||
    (pathname === "/" && linkHash !== "" && hash === linkHash) ||
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
      onClick={() => {
        onHashChange(linkHash);
        onNavigate?.();
      }}
    >
      {item.label}
    </Box>
  );
}

/** Theme toggle button used in desktop navbar and mobile drawer. */
function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode();
  const icon = mode === "dark" ? <Sun size={18} /> : <Moon size={18} />;
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <Tooltip title={`Switch to ${nextMode} mode`} arrow>
      <IconButton
        onClick={toggleTheme}
        aria-label={`Switch to ${nextMode} mode`}
        sx={{
          ml: 1,
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: "primary.main",
          "&:hover": {
            bgcolor: (t) => alpha(t.palette.primary.main, 0.2),
            transform: "rotate(12deg)",
          },
          height: 36,
          width: 36,
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

/** Mobile drawer with nav links and theme toggle. */
function MobileNavDrawer({
  open,
  onClose,
  hash,
  onHashChange,
}: {
  open: boolean;
  onClose: () => void;
  hash: string;
  onHashChange: (nextHash: string) => void;
}) {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Drawer
      anchor="top"
      open={open}
      onClose={onClose}
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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            hash={hash}
            onNavigate={onClose}
            onHashChange={onHashChange}
          />
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
              onClose();
            }}
            startIcon={mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            variant="outlined"
            color="primary"
            size="small"
          >
            Switch to {mode === "dark" ? "light" : "dark"} mode
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}

/**
 * Top navigation bar component with responsive links, theme toggle, mobile drawer, and a scroll-to-top control.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });
  const { hash, setHash } = useHash();
  const lenis = useLenis();

  const { scrolled, navVisible } = useNavbarVisibility(isOpen);

  const drawerOpen = isOpen && isMobile;

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!lenis) return;
    if (drawerOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [drawerOpen, lenis]);

  const appBarSx: SxProps<Theme> = {
    backgroundColor: theme.palette.mode === "dark" ? "#0a0e14" : "#f0f4f8",
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
  };

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
          transform: isOpen || navVisible ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        <AppBar position="static" elevation={scrolled ? 4 : 0} sx={appBarSx}>
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
                  "&:hover": { color: theme.palette.primary.main },
                })}
              >
                witl@xyz:~$
              </Typography>

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4, alignItems: "center" }}>
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    hash={hash}
                    onHashChange={setHash}
                  />
                ))}

                <ThemeToggleButton />
              </Box>

              {/* Mobile Menu Button */}
              <IconButton
                sx={{
                  ml: "auto",
                  display: { md: "none" },
                  color: theme.palette.text.primary,
                  width: 44,
                  height: 44,
                }}
                onClick={() => setIsOpen((v) => !v)}
                edge="end"
                aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={drawerOpen}
              >
                {drawerOpen ? <X size={24} /> : <Menu size={24} />}
              </IconButton>
            </Toolbar>
          </Container>

          {/* Mobile Navigation */}
          <MobileNavDrawer
            open={drawerOpen}
            onClose={() => setIsOpen(false)}
            hash={hash}
            onHashChange={setHash}
          />
        </AppBar>
      </Box>

      {/* Scroll to top button */}
      <Zoom in={scrolled}>
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          onClick={() => lenis?.scrollTo(0)}
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
