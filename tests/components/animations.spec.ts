import { test, expect } from "@playwright/test";
import { BLOG_CODE_FIXTURE_PATH, stubClipboard } from "../fixtures/blog-posts";

test.describe("Animations and Interactive Elements", () => {
  // Test for blog post cards animation
  test("blog post cards have staggered animation entrance", async ({ page }) => {
    // Navigate to the blog page
    await page.goto("/blog");

    // Wait for the page to load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Cards are motion.div elements, so the transform style lives on the card itself
    const blogCards = page.getByTestId("blog-card");

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
    const blogCard = page.getByTestId("blog-card").first();
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
    await stubClipboard(page);
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    const codeBlock = page.locator("pre").first();
    await expect(codeBlock).toBeVisible();

    const copyButton = codeBlock.locator("button.code-copy-button");
    await expect(copyButton).toHaveCSS("opacity", "0.7");

    await codeBlock.hover();
    await expect(copyButton).toHaveCSS("opacity", "1");

    await copyButton.click();

    await expect(async () => {
      const checkmarkIcon = await page.locator("svg polyline").count();
      expect(checkmarkIcon).toBeGreaterThan(0);
    }).toPass();
  });

  // Test for back button animation
  test("back to posts button has animation", async ({ page }) => {
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    const backButton = page.getByRole("button", { name: /Back to posts/i });
    await expect(backButton).toBeVisible();

    // The hover transform is applied by the motion.div wrapping the button
    const motionWrapper = backButton.locator("xpath=..");
    const initialTransform = await motionWrapper.getAttribute("style");

    await backButton.hover();
    await page.waitForTimeout(200);

    const hoverTransform = await motionWrapper.getAttribute("style");

    // Transform should change
    expect(initialTransform).not.toEqual(hoverTransform);
  });
});
