import { describe, expect, test } from "bun:test";
import {
  applyHeadingIds,
  HastNode,
  markdownToHtml,
  normalizeAuthor,
  slugify,
  uniqueSlug,
} from "./blog-markdown";

describe("markdownToHtml", () => {
  test("preserves markdown headings and strips script elements", async () => {
    const html = await markdownToHtml(
      "# Title\n\n<script>alert(1)</script>\n\nBody"
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Title");
    expect(html).toContain("Body");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(1)");
  });

  test("uses uniqueSlug for missing heading ids", async () => {
    const html = await markdownToHtml("## Usage\n\n## Usage\n\n## Café\n\n## !!!");

    expect(html).toContain('id="usage"');
    expect(html).toContain('id="usage-2"');
    expect(html).toContain('id="cafe"');
    expect(html).toContain('id="section"');
  });

  test("preserves existing heading ids", () => {
    const tree: HastNode = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: { id: "custom-id" },
          children: [{ type: "text", value: "Hello" }],
        },
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [{ type: "text", value: "Hello" }],
        },
      ],
    };

    applyHeadingIds(tree);

    expect(tree.children?.[0].properties?.id).toBe("custom-id");
    expect(tree.children?.[1].properties?.id).toBe("hello");
  });

  test("adds highlight.js classes to fenced code", async () => {
    const html = await markdownToHtml("```js\nconst x = 1;\n```");

    expect(html).toContain("hljs");
  });
});

describe("slugify", () => {
  test("preserves unicode letters and falls back for symbols", () => {
    expect(slugify("你好")).toBe("你好");
    expect(slugify("!!!")).toBe("section");
  });
});

describe("uniqueSlug", () => {
  test("suffixes repeated headings", () => {
    const used = new Set<string>();
    expect(uniqueSlug("Usage", used)).toBe("usage");
    expect(uniqueSlug("Usage", used)).toBe("usage-2");
  });
});

describe("normalizeAuthor", () => {
  test("accepts a scalar name or object", () => {
    expect(normalizeAuthor("Tyler Witlin")).toEqual({ name: "Tyler Witlin" });
    expect(normalizeAuthor({ name: "Tyler", avatar: "/a.jpg" })).toEqual({
      name: "Tyler",
      avatar: "/a.jpg",
    });
  });
});
