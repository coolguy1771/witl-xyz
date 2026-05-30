import { test, expect } from "@playwright/test";

test.describe("mobile layout", () => {
  test("home page avoids horizontal overflow and exposes mobile nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /navigation menu/i })).toBeVisible();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });

  test("mobile menu opens with navigation links", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /open navigation menu/i }).click();
    await expect(page.getByRole("link", { name: "blog" })).toBeVisible();
    await expect(page.getByRole("link", { name: "contact" })).toBeVisible();
  });

  test("blog page avoids horizontal overflow", async ({ page }) => {
    await page.goto("/blog");

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
});
