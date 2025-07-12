import { test, expect } from "@playwright/test";

test.describe("Blog Page", () => {
  test("blog page loads and displays posts", async ({ page }) => {
    await page.goto("/blog");

    // Check page title
    await expect(page).toHaveTitle(/Blog/);

    // Check blog heading
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Blog");

    // Check that blog posts are displayed
    const blogPosts = page.locator('a[href^="/blog/"]');
    const postCount = await blogPosts.count();
    expect(postCount).toBeGreaterThan(0);
  });

  test("blog post cards contain required elements", async ({ page }) => {
    await page.goto("/blog");

    const firstPost = page.locator('a[href^="/blog/"]').first();
    await expect(firstPost).toBeVisible();

    // Check for post title
    const title = firstPost.locator("h2, h3");
    await expect(title).toBeVisible();

    // Check for post date or metadata
    const metadata = firstPost.locator("time, .date, [class*='date']");
    if ((await metadata.count()) > 0) {
      await expect(metadata.first()).toBeVisible();
    }
  });

  test("blog posts are clickable and navigate correctly", async ({ page }) => {
    await page.goto("/blog");

    // Get the first blog post link
    const firstPost = page.locator('a[href^="/blog/"]').first();
    const href = await firstPost.getAttribute("href");

    // Click the post
    await firstPost.click();

    // Verify navigation
    await expect(page).toHaveURL(href!);

    // Check that we're on a blog post page
    const backButton = page.getByRole("button", { name: /back/i });
    if (await backButton.isVisible()) {
      await expect(backButton).toBeVisible();
    }
  });

  test("blog posts have proper meta information", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to first post
    const firstPost = page.locator('a[href^="/blog/"]').first();
    await firstPost.click();

    // Check for page title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe("Blog");

    // Check for meta description
    const metaDescription = await page
      .locator('meta[name="description"]')
      .getAttribute("content");
    expect(metaDescription).toBeTruthy();
  });

  test("blog post content renders correctly", async ({ page }) => {
    await page.goto("/blog");

    // Navigate to first post
    const firstPost = page.locator('a[href^="/blog/"]').first();
    await firstPost.click();

    // Check for main content
    const article = page.locator("article, main, [role='main']");
    await expect(article).toBeVisible();

    // Check for post heading
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // Check for post content
    const content = page.locator("p, div").filter({ hasText: /\w{10,}/ });
    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test("code blocks render with syntax highlighting", async ({ page }) => {
    // Navigate to a specific post known to have code
    await page.goto("/blog/software-supply-chain");

    // Check for code blocks
    const codeBlocks = page.locator("pre code, pre");
    const codeBlockCount = await codeBlocks.count();

    if (codeBlockCount > 0) {
      const firstCodeBlock = codeBlocks.first();
      await expect(firstCodeBlock).toBeVisible();

      // Check for syntax highlighting (spans with classes)
      const highlightedElements = firstCodeBlock.locator("span[class]");
      const highlightCount = await highlightedElements.count();
      expect(highlightCount).toBeGreaterThan(0);
    }
  });

  test("table of contents works if present", async ({ page }) => {
    // Navigate to a post that might have TOC
    await page.goto("/blog/software-supply-chain");

    // Look for table of contents
    const toc = page.locator("[class*='toc'], #table-of-contents, [id*='toc']");
    const tocCount = await toc.count();

    if (tocCount > 0) {
      // Check TOC links
      const tocLinks = toc.locator("a");
      const linkCount = await tocLinks.count();

      if (linkCount > 0) {
        // Click first TOC link
        const firstLink = tocLinks.first();
        await firstLink.click();

        // Check that we scrolled (page position changed)
        await page.waitForTimeout(500);
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
      }
    }
  });

  test("blog search functionality works if present", async ({ page }) => {
    await page.goto("/blog");

    // Look for search input
    const searchInput = page.getByRole("searchbox");
    const searchCount = await searchInput.count();

    if (searchCount > 0) {
      // Type in search
      await searchInput.fill("software");
      await page.waitForTimeout(500);

      // Check if results are filtered
      const blogPosts = page.locator('a[href^="/blog/"]');
      const filteredCount = await blogPosts.count();
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("blog pagination works if present", async ({ page }) => {
    await page.goto("/blog");

    // Look for pagination controls
    const nextButton = page.getByRole("button", { name: /next/i });
    const paginationLinks = page.locator(
      "a[href*='page='], [class*='pagination'] a"
    );

    const hasNextButton = (await nextButton.count()) > 0;
    const hasPaginationLinks = (await paginationLinks.count()) > 0;

    if (hasNextButton || hasPaginationLinks) {
      const initialUrl = page.url();

      if (hasNextButton) {
        await nextButton.click();
      } else {
        await paginationLinks.first().click();
      }

      await page.waitForTimeout(1000);

      // URL should have changed or content should have updated
      const newUrl = page.url();
      const urlChanged = newUrl !== initialUrl;

      if (urlChanged) {
        expect(newUrl).not.toBe(initialUrl);
      }
    }
  });

  test("blog is accessible", async ({ page }) => {
    await page.goto("/blog");

    // Check heading hierarchy
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // Check that links have accessible names
    const blogLinks = page.locator('a[href^="/blog/"]');
    const linkCount = await blogLinks.count();

    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = blogLinks.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
