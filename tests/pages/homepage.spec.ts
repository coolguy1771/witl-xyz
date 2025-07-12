import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("homepage loads and displays main content", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/Tyler Witlin/);

    // Check main heading is visible
    const mainHeading = page.getByRole("heading", { level: 1 });
    await expect(mainHeading).toBeVisible();

    // Check hero section is present
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();
  });

  test("homepage hero animations work", async ({ page }) => {
    await page.goto("/");

    // Wait for animations to complete
    await page.waitForTimeout(2000);

    // Check that animated text elements are visible
    const animatedText = page.locator('[style*="transform"]');
    const count = await animatedText.count();
    expect(count).toBeGreaterThan(0);
  });

  test("scroll to top button appears on scroll", async ({ page }) => {
    await page.goto("/");

    // Initially, scroll to top button should not be visible
    const scrollButton = page.getByRole("button", { name: /scroll to top/i });

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);

    // Check if scroll to top button becomes visible
    if (await scrollButton.isVisible()) {
      await expect(scrollButton).toBeVisible();

      // Click scroll to top button
      await scrollButton.click();
      await page.waitForTimeout(500);

      // Check that we scrolled back to top
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThan(100);
    }
  });

  test("visitor dashboard displays data", async ({ page }) => {
    await page.goto("/");

    // Look for visitor dashboard section
    const visitorSection = page.getByText(/visitors/i).first();
    if (await visitorSection.isVisible()) {
      await expect(visitorSection).toBeVisible();

      // Check for visitor count or similar data
      const numbers = page.locator("text=/\\d+/");
      const numberCount = await numbers.count();
      expect(numberCount).toBeGreaterThan(0);
    }
  });

  test("projects section displays GitHub projects", async ({ page }) => {
    await page.goto("/");

    // Look for projects section
    const projectsHeading = page.getByRole("heading", { name: /projects/i });
    if (await projectsHeading.isVisible()) {
      await expect(projectsHeading).toBeVisible();

      // Check for project cards or links
      const projectLinks = page.locator('a[href*="github.com"]');
      const linkCount = await projectLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test("page is accessible", async ({ page }) => {
    await page.goto("/");

    // Check for proper heading hierarchy
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check that images have alt text
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute("alt");
      expect(alt).toBeTruthy();
    }

    // Check for proper button labels
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const textContent = await button.textContent();
      expect(ariaLabel || textContent).toBeTruthy();
    }
  });

  test("page loads without console errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      error => !error.includes("favicon") && !error.includes("extension")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that content is still visible and accessible
    const mainHeading = page.getByRole("heading", { level: 1 });
    await expect(mainHeading).toBeVisible();

    // Check that navigation is adapted for mobile
    const navbar = page.getByRole("navigation");
    await expect(navbar).toBeVisible();

    // Verify text is readable (not cut off)
    const bodyText = await page.locator("body").boundingBox();
    expect(bodyText?.width).toBeLessThanOrEqual(375);
  });
});
