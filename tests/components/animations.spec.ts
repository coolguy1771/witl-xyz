import { test, expect } from "@playwright/test";

test.describe("Animations and Interactive Elements", () => {
  // Test for blog post cards animation
  test("blog post cards have staggered animation entrance", async ({
    page,
  }) => {
    // Navigate to the blog page
    await page.goto("/blog");

    // Wait for the page to load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Find blog post cards (they are wrapped in motion.div in our implementation)
    const blogCards = page
      .locator('a[href^="/blog/"]')
      .filter({ hasText: /^(?!Table of Contents).+/ });

    // There should be at least one blog post
    const cardCount = await blogCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Check that the cards have a transform style (from Framer Motion)
    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = blogCards.nth(i);

      // Cards should have some transform style, indicating animation is applied
      await expect(card).toHaveAttribute("style", /transform:/);
    }
  });

  // Test hover effects on blog post cards
  test("blog post cards have hover animations", async ({ page }) => {
    // Navigate to the blog page
    await page.goto("/blog");

    // Find a blog post card
    const blogCard = page.locator('a[href^="/blog/"]').first();
    await expect(blogCard).toBeVisible();

    // Get initial transform value
    const initialTransform = await blogCard.getAttribute("style");

    // Hover over the card
    await blogCard.hover();

    // Wait for hover animation to complete
    await page.waitForTimeout(300);

    // Get post-hover transform
    const hoverTransform = await blogCard.getAttribute("style");

    // The transform style should change on hover
    expect(initialTransform).not.toEqual(hoverTransform);
  });

  // Test for the copy code button in blog posts
  test("code blocks have interactive copy button", async ({ page }) => {
    // Navigate to a blog post with code
    await page.goto("/blog/software-supply-chain");

    // Find code blocks
    const codeBlock = page.locator("pre").first();
    await expect(codeBlock).toBeVisible();

    // Initially, the copy button should not be visible or have 0 opacity
    const copyButton = codeBlock.locator("button.code-copy-button");
    await expect(copyButton).toHaveCSS("opacity", "0");

    // Hover over the code block
    await codeBlock.hover();

    // The copy button should become visible
    await expect(copyButton).toHaveCSS("opacity", "1");

    // Click the copy button
    await copyButton.click();

    // There should be a visual indication that copying succeeded
    // This could be the appearance of a tooltip or a change in button state
    await expect(async () => {
      const checkmarkIcon = await page.locator("svg polyline").count();
      expect(checkmarkIcon).toBeGreaterThan(0);
    }).toPass();
  });

  // Test for back button animation
  test("back to posts button has animation", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog/software-supply-chain");

    // Find the back button
    const backButton = page.getByRole("button", { name: /Back to posts/i });
    await expect(backButton).toBeVisible();

    // Get initial transform
    const initialTransform = await backButton.getAttribute("style");

    // Hover over the button
    await backButton.hover();

    // Wait for hover animation
    await page.waitForTimeout(200);

    // Get hover transform
    const hoverTransform = await backButton.getAttribute("style");

    // Transform should change
    expect(initialTransform).not.toEqual(hoverTransform);
  });
});
