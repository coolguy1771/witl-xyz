import { describe, expect, test } from "bun:test";
import {
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
