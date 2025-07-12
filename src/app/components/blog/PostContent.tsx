"use client";

import { useEffect } from "react";
import "highlight.js/styles/github-dark.css";
import katex from "katex";
import "katex/dist/katex.min.css";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  useEffect(() => {
    // Initialize syntax highlighting
    import("highlight.js").then(hljs => {
      hljs.default.highlightAll();
    });

    // Initialize math rendering if needed
    if (content.includes("math-inline") || content.includes("math-block")) {
      document.querySelectorAll(".math-inline").forEach(el => {
        if (el.textContent) {
          el.innerHTML = katex.renderToString(el.textContent, {
            displayMode: false,
          });
        }
      });

      document.querySelectorAll(".math-block").forEach(el => {
        if (el.textContent) {
          el.innerHTML = katex.renderToString(el.textContent, {
            displayMode: true,
          });
        }
      });
    }
  }, [content]);

  return (
    <div
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
