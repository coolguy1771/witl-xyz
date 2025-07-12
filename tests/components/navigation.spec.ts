import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("main navigation is accessible and functional", async ({ page }) => {
    await page.goto("/");

    // Check that navbar is visible
    const navbar = page.getByRole("navigation");
    await expect(navbar).toBeVisible();

    // Check home link
    const homeLink = page.getByRole("link", { name: /home/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");

    // Check blog link
    const blogLink = page.getByRole("link", { name: /blog/i });
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute("href", "/blog");

    // Check SSL dashboard link
    const sslLink = page.getByRole("link", { name: /ssl/i });
    await expect(sslLink).toBeVisible();
    await expect(sslLink).toHaveAttribute("href", "/ssl");
  });

  test("navigation links work correctly", async ({ page }) => {
    await page.goto("/");

    // Test blog navigation
    await page.getByRole("link", { name: /blog/i }).click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Blog");

    // Test SSL navigation
    await page.getByRole("link", { name: /ssl/i }).click();
    await expect(page).toHaveURL("/ssl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("SSL");

    // Test home navigation
    await page.getByRole("link", { name: /home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("mobile navigation works correctly", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check if mobile menu button is visible
    const mobileMenuButton = page.getByRole("button", { name: /menu/i });
    if (await mobileMenuButton.isVisible()) {
      // Click to open mobile menu
      await mobileMenuButton.click();

      // Check that mobile navigation links are visible
      await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /blog/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /ssl/i })).toBeVisible();
    }
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/");

    // Tab through navigation elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check that focus is on a navigation element
    const focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(["A", "BUTTON"]).toContain(focusedElement);
  });
});
