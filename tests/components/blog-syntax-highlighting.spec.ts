import { test, expect } from "@playwright/test";
import {
  BLOG_CODE_FIXTURE_PATH,
  BLOG_CODE_FIXTURE_TITLE,
} from "../fixtures/blog-posts";

test.describe("Blog Post Syntax Highlighting", () => {
  test("code blocks are properly highlighted", async ({ page }) => {
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    await expect(page.getByRole("heading", { name: BLOG_CODE_FIXTURE_TITLE })).toBeVisible();

    const codeBlocks = page.locator("pre");
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const codeBlock = codeBlocks.nth(i);
      const highlightedElements = await codeBlock.locator('code span[class^="hljs-"]').count();
      expect(highlightedElements).toBeGreaterThan(0);

      const copyButton = codeBlock.locator("button.code-copy-button");
      await expect(copyButton).toBeVisible();
      await copyButton.click();

      const copiedIcon = codeBlock.locator("button svg polyline");
      await expect(copiedIcon).toBeVisible();
    }
  });

  test("language is displayed for code blocks", async ({ page }) => {
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    const codeBlocks = page.locator("pre[data-language]");
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);

    await expect(page.locator('pre[data-language="java"]')).toBeVisible();
    await expect(page.locator('pre[data-language="xml"]')).toBeVisible();
  });
});
