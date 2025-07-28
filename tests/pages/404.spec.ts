import { test, expect } from "@playwright/test";

test.describe("404 Page", () => {
  test("global 404 page renders correctly", async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto("/this-page-doesnt-exist");

    // Verify we got redirected to the 404 page
    await expect(page).toHaveTitle(/Page Not Found/);

    // Check important elements of the 404 page
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(
      page.getByText("The page you're looking for doesn't exist or has been moved.")
    ).toBeVisible();

    // Verify navigation links
    await expect(page.getByRole("link", { name: "Go Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse Blog" })).toBeVisible();

    // Check the animated background is present
    const backgroundElements = await page.locator('[style*="border-radius: 50%"]').count();
    expect(backgroundElements).toBeGreaterThan(0);
  });

  test("blog 404 page renders correctly", async ({ page }) => {
    // Navigate to a non-existent blog post
    await page.goto("/blog/this-post-doesnt-exist");

    // Verify we got redirected to the blog 404 page
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Post Not Found" })).toBeVisible();

    // Test the content
    await expect(
      page.getByText("The blog post you're looking for doesn't exist or has been moved.")
    ).toBeVisible();

    // Verify navigation links
    await expect(page.getByRole("link", { name: "Go Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse Blog" })).toBeVisible();

    // Check the animated background elements
    const animatedElements = await page.locator('[style*="rotate"]').count();
    expect(animatedElements).toBeGreaterThan(0);
  });
});
