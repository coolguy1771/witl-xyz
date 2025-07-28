import { test, expect } from "@playwright/test";

test.describe("Table of Contents", () => {
  test("TOC lists all headings from the blog post", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog/software-supply-chain");

    // Check that the page loaded correctly
    await expect(page.getByRole("heading", { name: /The Hidden Threat/ })).toBeVisible();

    // Find TOC container
    const tocContainer = page.locator("nav").filter({ hasText: "Table of Contents" });
    await expect(tocContainer).toBeVisible();

    // Get all TOC links
    const tocLinks = tocContainer.locator("a");

    // Verify there are links in the TOC
    const linkCount = await tocLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Get all headings in the document
    const h2Headings = page.locator("h2");
    const h3Headings = page.locator("h3");

    // Check that the number of TOC links matches the number of headings
    const h2Count = await h2Headings.count();
    const h3Count = await h3Headings.count();

    // This test might need adjustment based on your TOC implementation
    // Some TOCs only show h2s, some show both h2s and h3s
    expect(linkCount).toBeGreaterThanOrEqual(h2Count);

    // Check that first heading matches first TOC link
    const firstHeadingText = await h2Headings.first().innerText();
    const firstTocLinkText = await tocLinks.first().innerText();
    expect(firstTocLinkText).toEqual(firstHeadingText);
  });

  test("TOC links navigate to correct sections", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog/software-supply-chain");

    // Find TOC container
    const tocContainer = page.locator("nav").filter({ hasText: "Table of Contents" });
    await expect(tocContainer).toBeVisible();

    // Get all TOC links
    const tocLinks = tocContainer.locator("a");

    // Click the first link
    const firstLinkText = await tocLinks.first().innerText();
    await tocLinks.first().click();

    // Check that the URL now contains a hash
    await expect(page).toHaveURL(/#.+/);

    // Check that the heading is now visible in the viewport
    // Find the heading in the document that matches the TOC link text
    const targetHeading = page.getByRole("heading", { name: firstLinkText }).first();

    // Check that the heading is in view
    await expect(targetHeading).toBeInViewport();
  });

  test("TOC active state changes when scrolling", async ({ page }) => {
    // This test requires some careful timing to simulate scrolling

    // Navigate to a blog post
    await page.goto("/blog/software-supply-chain");

    // Ensure page loaded
    await expect(page.getByRole("heading", { name: /The Hidden Threat/ })).toBeVisible();

    // Find TOC container
    const tocContainer = page.locator("nav").filter({ hasText: "Table of Contents" });
    await expect(tocContainer).toBeVisible();

    // Scroll down to a specific heading
    const thirdHeading = page.locator("h2").nth(2);
    await thirdHeading.scrollIntoViewIfNeeded();

    // Wait a bit for the intersection observer to trigger
    await page.waitForTimeout(500);

    // Find the active TOC link (the one with primary color or special styling)
    // We'll test for the data-attribute on the active link
    await expect(async () => {
      // The following check needs to be repeatedly tried until it passes
      const activeLink = tocContainer
        .locator("a")
        .filter({ hasText: await thirdHeading.innerText() });
      // Check that it has the active styling
      await expect(activeLink).toHaveCSS("color", /rgb\(59, 130, 246\)/);
    }).toPass({ timeout: 5000 });
  });
});
