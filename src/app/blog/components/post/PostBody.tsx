"use client";

import React, { useEffect } from "react";
import { Box, Grid, Typography, useTheme, alpha } from "@mui/material";
import { TableOfContents } from "../shared/TableOfContents";
import { Post } from "@/app/types/blog";
import { CODE_FONT_FAMILY } from "@/app/lib/code-font";
import { BLOG_SCROLL_OFFSET } from "@/app/lib/blog-layout";

interface PostBodyProps {
  post: Post;
  content: string;
}

export function PostBody({ post, content }: PostBodyProps) {
  const theme = useTheme();
  const headings = post.headings ?? [];

  useEffect(() => {
    const codeBlocks = document.querySelectorAll(".blog-prose pre code");
    codeBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre || pre.querySelector(".code-copy-button")) return;

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-copy-button";
      copyButton.setAttribute("aria-label", "Copy code");
      copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(block.textContent || "");
          copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          setTimeout(() => {
            copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 2000);
        } catch (err) {
          console.error("Failed to copy text:", err);
        }
      });

      pre.appendChild(copyButton);
    });
  }, [content]);

  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Box
          className="blog-prose"
          sx={{
            typography: "body1",
            color: theme.palette.text.secondary,
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              color: theme.palette.text.primary,
              fontWeight: 600,
              mt: 4,
              mb: 2,
              scrollMarginTop: `${BLOG_SCROLL_OFFSET}px`,
            },
            "& a": {
              color: theme.palette.primary.main,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
                color: theme.palette.primary.light,
              },
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              display: "block",
              margin: "2rem auto",
              boxShadow: theme.shadows[1],
            },
            "& pre": {
              fontFamily: CODE_FONT_FAMILY,
              backgroundColor: theme.palette.background.paper,
              p: { xs: 2, sm: 3 },
              pt: { xs: 3.5, sm: 4 },
              borderRadius: "6px",
              overflowX: "auto",
              maxWidth: "100%",
              border: `1px solid ${theme.palette.divider}`,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "3px",
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: "6px 6px 0 0",
              },
              '&[data-language]:not([data-language=""])::after': {
                content: "attr(data-language)",
                position: "absolute",
                top: "10px",
                left: "12px",
                fontSize: "0.7rem",
                fontWeight: 500,
                color: theme.palette.secondary.main,
                textTransform: "uppercase",
                fontFamily: CODE_FONT_FAMILY,
                letterSpacing: "0.05em",
              },
              "& .code-copy-button": {
                position: "absolute",
                right: "12px",
                top: "12px",
                padding: "6px",
                background: alpha(theme.palette.background.default, 0.8),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "4px",
                cursor: "pointer",
                color: theme.palette.text.primary,
                opacity: 0.7,
                transition: "opacity 0.2s ease",
                zIndex: 10,
                "&:hover": {
                  opacity: 1,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                },
              },
              "&:hover .code-copy-button": {
                opacity: 1,
              },
            },
            "& code": {
              fontFamily: CODE_FONT_FAMILY,
            },
            "& :not(pre) > code": {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              px: 0.75,
              py: 0.25,
              fontSize: "0.9em",
              borderRadius: "4px",
            },
            "& .hljs": {
              fontFamily: CODE_FONT_FAMILY,
              background: "transparent",
              padding: 0,
              color: theme.palette.text.primary,
            },
            "& .hljs-comment, & .hljs-quote": {
              color: theme.palette.text.secondary,
              fontStyle: "italic",
            },
            "& .hljs-keyword, & .hljs-selector-tag, & .hljs-built_in": {
              color: theme.palette.primary.main,
            },
            "& .hljs-string, & .hljs-attr, & .hljs-symbol": {
              color: theme.palette.secondary.main,
            },
            "& .hljs-number, & .hljs-literal": {
              color: theme.palette.warning.main,
            },
            "& blockquote": {
              borderLeft: "4px solid",
              borderColor: theme.palette.secondary.main,
              pl: 3,
              py: 1,
              ml: 0,
              mr: 0,
              my: 3,
              fontStyle: "italic",
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              borderRadius: "0 4px 4px 0",
            },
            "& ul, & ol": {
              paddingLeft: 3,
              marginTop: 0,
              marginBottom: 3,
              listStylePosition: "outside",
            },
            "& ul": { listStyleType: "disc" },
            "& ol": { listStyleType: "decimal" },
            "& li": { marginBottom: 1, display: "list-item" },
            "& li > ul, & li > ol": { marginTop: 1, marginBottom: 1 },
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: 3,
              display: "block",
              overflowX: "auto",
            },
            "& th, & td": {
              border: `1px solid ${theme.palette.divider}`,
              padding: 1.5,
            },
            "& th": {
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
            },
          }}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }} sx={{ display: { xs: "none", lg: "block" } }}>
        <TableOfContents headings={headings} />
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: { xs: "block", lg: "none" }, mt: 4, mb: 2 }}>
        <Box
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "6px",
            backgroundColor: theme.palette.background.paper,
            p: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: "text.primary",
              fontFamily: CODE_FONT_FAMILY,
              fontSize: "0.85rem",
            }}
          >
            {"// table-of-contents"}
          </Typography>
          <TableOfContents headings={headings} isMobile={true} />
        </Box>
      </Grid>
    </Grid>
  );
}
