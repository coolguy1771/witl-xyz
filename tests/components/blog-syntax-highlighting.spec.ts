import { test, expect } from "@playwright/test";

test.describe("Blog Post Syntax Highlighting", () => {
  test("code blocks are properly highlighted", async ({ page }) => {
    // Navigate to a blog post with code blocks
    await page.goto("/blog/software-supply-chain");

    // Check that the page loaded correctly
    await expect(page.getByRole("heading", { name: /The Hidden Threat/ })).toBeVisible();

    // Find code blocks
    const codeBlocks = page.locator("pre");

    // Verify there are code blocks on the page
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const codeBlock = codeBlocks.nth(i);

      // Check that syntax highlighting elements exist
      // hljs adds span elements with classes for syntax highlighting
      const highlightedElements = await codeBlock.locator('code span[class^="hljs-"]').count();
      expect(highlightedElements).toBeGreaterThan(0);

      // Check that the code block has copy button
      const copyButton = await codeBlock.locator("button.code-copy-button");
      await expect(copyButton).toBeVisible({ visible: "hover" });

      // Test the copy button functionality by clicking it
      await copyButton.click();

      // Check that the UI shows it was copied (button changes to checkmark)
      const copiedIcon = await codeBlock.locator("button svg polyline");
      await expect(copiedIcon).toBeVisible();
    }
  });

  test("language is displayed for code blocks", async ({ page }) => {
    // Navigate to a blog post with code blocks
    await page.goto("/blog/software-supply-chain");

    // Find code blocks with language attribute
    const codeBlocks = page.locator("pre[data-language]");

    // Verify there are code blocks with language attributes
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);

    // Check at least one Java code block exists (from the example in the post)
    const javaBlocks = page.locator('pre[data-language="java"]');
    await expect(javaBlocks).toBeVisible();

    // Check at least one XML code block exists (from the example in the post)
    const xmlBlocks = page.locator('pre[data-language="xml"]');
    await expect(xmlBlocks).toBeVisible();
  });
});
