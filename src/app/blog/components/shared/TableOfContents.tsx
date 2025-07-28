"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Link as MuiLink } from "@mui/material";
import { useRouter } from "next/navigation";

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({
  content,
  isMobile = false,
}: {
  content: string;
  isMobile?: boolean;
}) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const headingElements = doc.querySelectorAll("h2, h3");

    const extractedHeadings = Array.from(headingElements).map((heading, index) => ({
      id: heading.id || `generated-heading-${index}`,
      text: heading.textContent || "",
      level: parseInt(heading.tagName[1]),
    }));

    setHeadings(extractedHeadings);
  }, [content]);

  useEffect(() => {
    const callback: IntersectionObserverCallback = (entries) => {
      // Find the first heading that is intersecting
      const intersectingEntry = entries.find((entry) => entry.isIntersecting);

      if (intersectingEntry) {
        setActiveId(intersectingEntry.target.id);
      } else if (entries.length > 0) {
        // If no heading is intersecting but we have entries,
        // find the heading that's closest to the viewport top
        const closestEntry = entries.reduce((prev, curr) => {
          return Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top)
            ? curr
            : prev;
        });
        setActiveId(closestEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-104px 0px -80% 0px",
      threshold: 0.1,
    });

    // Create a map of heading IDs to make lookup faster
    const headingMap = new Map(headings.map((h) => [h.id, true]));

    const headingElements = document.querySelectorAll("h2, h3");
    headingElements.forEach((element) => {
      // Only observe elements that have IDs and those IDs are in our headings array
      if (element.id && headingMap.has(element.id)) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]); // Depend on headings so observer is recreated when headings change

  if (headings.length === 0) return null;

  // Mobile version has simpler styling since it's already inside a container
  if (isMobile) {
    return (
      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {headings.map((heading) => (
          <Box
            component="li"
            key={heading.id}
            sx={{
              mb: 1,
              pl: (heading.level - 2) * 1,
            }}
          >
            <MuiLink
              href={heading.id.startsWith("generated-heading") ? "#" : `#${heading.id}`}
              underline="none"
              component={!heading.id.startsWith("generated-heading") ? "a" : "span"}
              onClick={(e: { preventDefault: () => void }) => {
                if (heading.id.startsWith("generated-heading")) {
                  e.preventDefault();
                  return;
                }

                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                  const yOffset = -104; // Adjust offset to account for taller sticky header
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  router.push(`#${heading.id}`, { scroll: false });
                }
              }}
              sx={(theme) => ({
                fontSize: "0.85rem",
                fontWeight: activeId === heading.id ? 600 : 400,
                color: activeId === heading.id ? "primary.main" : "text.secondary",
                transition: "color 0.2s ease",
                display: "flex",
                alignItems: "center",
                position: "relative",
                p: 0.5,
                borderRadius: 1,
                "&:hover": {
                  color: "primary.light",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(59, 130, 246, 0.05)",
                },
                ...(heading.id.startsWith("generated-heading") && {
                  cursor: "default",
                  pointerEvents: "none",
                  opacity: 0.7,
                }),
                // Highlight active item
                ...(activeId === heading.id &&
                  !heading.id.startsWith("generated-heading") && {
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(59, 130, 246, 0.15)"
                        : "rgba(59, 130, 246, 0.08)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "-10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "3px",
                      height: "60%",
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: "2px",
                    },
                  }),
              })}
            >
              {heading.text}
            </MuiLink>
          </Box>
        ))}
      </Box>
    );
  }

  // Desktop sidebar version
  return (
    <Box
      component="nav"
      sx={(theme) => ({
        position: "sticky",
        top: 114, // Adjusted for taller navbar height + some padding
        p: 3,
        borderRadius: 2,
        backgroundColor:
          theme.palette.mode === "dark" ? "rgba(24, 24, 27, 0.7)" : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[1],
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        mb: 4,
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: theme.palette.primary.dark,
          borderRadius: "3px",
        },
      })}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 2.5,
          color: "text.primary",
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
        Table of Contents
      </Typography>

      <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
        {headings.map((heading) => (
          <Box
            component="li"
            key={heading.id}
            sx={{
              mb: 1.5,
              pl: (heading.level - 2) * 1.5,
            }}
          >
            <MuiLink
              href={heading.id.startsWith("generated-heading") ? "#" : `#${heading.id}`}
              underline="none"
              component={!heading.id.startsWith("generated-heading") ? "a" : "span"}
              onClick={(e: { preventDefault: () => void }) => {
                if (heading.id.startsWith("generated-heading")) {
                  e.preventDefault();
                  return;
                }

                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (element) {
                  const yOffset = -104; // Adjust offset to account for taller sticky header
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  router.push(`#${heading.id}`, { scroll: false });
                }
              }}
              sx={(theme) => ({
                fontSize: "0.9rem",
                fontWeight: activeId === heading.id ? 600 : 400,
                color: activeId === heading.id ? "primary.main" : "text.secondary",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                borderRadius: 1,
                p: 0.75,
                backgroundColor:
                  activeId === heading.id
                    ? theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.15)"
                      : "rgba(59, 130, 246, 0.08)"
                    : "transparent",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? "rgba(59, 130, 246, 0.1)"
                      : "rgba(59, 130, 246, 0.05)",
                },
                ...(heading.id.startsWith("generated-heading") && {
                  cursor: "default",
                  pointerEvents: "none",
                  opacity: 0.7,
                }),
                // Add special active styling
                ...(activeId === heading.id &&
                  !heading.id.startsWith("generated-heading") && {
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "-12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "60%",
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: "2px",
                      animation: `${
                        theme.palette.mode === "dark"
                          ? "pulseGlow 2s infinite"
                          : "pulseWidth 2s infinite"
                      }`,
                    },
                    "@keyframes pulseGlow": {
                      "0%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.4)" },
                      "50%": { boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.2)" },
                      "100%": { boxShadow: "0 0 0 0 rgba(59, 130, 246, 0.0)" },
                    },
                    "@keyframes pulseWidth": {
                      "0%": { width: "4px" },
                      "50%": { width: "6px" },
                      "100%": { width: "4px" },
                    },
                  }),
              })}
            >
              {heading.text}
            </MuiLink>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
