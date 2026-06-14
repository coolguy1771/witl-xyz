"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Link as MuiLink, alpha, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { BLOG_SCROLL_OFFSET } from "@/app/lib/blog-layout";
import { Heading } from "@/app/types/blog";

interface TableOfContentsProps {
  headings: Heading[];
  isMobile?: boolean;
}

export function TableOfContents({ headings, isMobile = false }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const router = useRouter();
  const lenis = useLenis();
  const theme = useTheme();
  const primaryHover = alpha(theme.palette.primary.main, 0.1);
  const primaryActive = alpha(theme.palette.primary.main, 0.15);

  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      const intersectingEntry = entries.find((entry) => entry.isIntersecting);

      if (intersectingEntry) {
        setActiveId(intersectingEntry.target.id);
      } else if (entries.length > 0) {
        const closestEntry = entries.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top)
            ? curr
            : prev;
        });
        setActiveId(closestEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: `-${BLOG_SCROLL_OFFSET}px 0px -80% 0px`,
      threshold: 0.1,
    });

    const headingMap = new Map(headings.map((h) => [h.id, true]));
    const headingElements = document.querySelectorAll("h2, h3");
    headingElements.forEach((element) => {
      if (element.id && headingMap.has(element.id)) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const linkStyles = (headingId: string) => ({
    fontSize: isMobile ? "0.85rem" : "0.9rem",
    fontWeight: activeId === headingId ? 600 : 400,
    color: activeId === headingId ? "primary.main" : "text.secondary",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    borderRadius: 1,
    p: isMobile ? 0.5 : 0.75,
    backgroundColor: activeId === headingId ? primaryActive : "transparent",
    "&:hover": {
      color: "primary.main",
      backgroundColor: primaryHover,
    },
    ...(activeId === headingId && {
      position: "relative" as const,
      "&::before": {
        content: '""',
        position: "absolute",
        left: isMobile ? "-10px" : "-12px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "3px",
        height: "60%",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "2px",
      },
    }),
  });

  const handleClick = (headingId: string) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const element = document.getElementById(headingId);
    if (element) {
      lenis?.scrollTo(element, { offset: -BLOG_SCROLL_OFFSET });
      router.push(`#${headingId}`, { scroll: false });
    }
  };

  const list = (
    <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
      {headings.map((heading) => (
        <Box
          component="li"
          key={heading.id}
          sx={{
            mb: isMobile ? 1 : 1.5,
            pl: (heading.level - 2) * (isMobile ? 1 : 1.5),
          }}
        >
          <MuiLink
            href={`#${heading.id}`}
            underline="none"
            component="a"
            onClick={handleClick(heading.id)}
            sx={linkStyles(heading.id)}
          >
            {heading.text}
          </MuiLink>
        </Box>
      ))}
    </Box>
  );

  if (isMobile) return list;

  return (
    <Box
      component="nav"
      sx={{
        position: "sticky",
        top: BLOG_SCROLL_OFFSET + 10,
        p: 3,
        borderRadius: "6px",
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        maxHeight: `calc(100vh - ${BLOG_SCROLL_OFFSET + 20}px)`,
        overflowY: "auto",
        mb: 4,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 2.5,
          color: "text.primary",
          fontFamily: "'Geist Mono', monospace",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          "&::before": {
            content: '""',
            width: 4,
            height: 16,
            backgroundColor: "primary.main",
            display: "inline-block",
            marginRight: 1.5,
            borderRadius: 1,
          },
        }}
      >
        {"// table-of-contents"}
      </Typography>
      {list}
    </Box>
  );
}
