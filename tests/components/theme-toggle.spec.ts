import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test("theme toggle button is visible and functional", async ({ page }) => {
    await page.goto("/");

    // Find the theme toggle button
    const themeToggle = page.getByRole("button", { name: /theme/i });
    await expect(themeToggle).toBeVisible();

    // Get initial theme state
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Click the theme toggle
    await themeToggle.click();

    // Wait for theme transition
    await page.waitForTimeout(300);

    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    expect(newTheme).not.toBe(initialTheme);
  });

  test("theme preference persists across page loads", async ({ page }) => {
    await page.goto("/");

    // Toggle to dark theme
    const themeToggle = page.getByRole("button", { name: /theme/i });
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Verify dark theme is applied
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark");
    });
    expect(isDark).toBe(true);

    // Reload the page
    await page.reload();

    // Wait for theme to load
    await page.waitForTimeout(500);

    // Verify dark theme persisted
    const isDarkAfterReload = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark");
    });
    expect(isDarkAfterReload).toBe(true);
  });

  test("theme toggle has proper accessibility attributes", async ({ page }) => {
    await page.goto("/");

    const themeToggle = page.getByRole("button", { name: /theme/i });

    // Check for aria-label or accessible name
    const accessibleName = await themeToggle.getAttribute("aria-label");
    expect(accessibleName).toBeTruthy();

    // Check that button is focusable
    await themeToggle.focus();
    const isFocused = await page.evaluate(() => {
      return document.activeElement
        ?.getAttribute("aria-label")
        ?.includes("theme");
    });
    expect(isFocused).toBe(true);
  });

  test("theme toggle works with keyboard", async ({ page }) => {
    await page.goto("/");

    // Focus the theme toggle
    const themeToggle = page.getByRole("button", { name: /theme/i });
    await themeToggle.focus();

    // Get initial theme
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    // Press Enter to toggle theme
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    // Verify theme changed
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    });

    expect(newTheme).not.toBe(initialTheme);
  });

  test("theme affects visual styling", async ({ page }) => {
    await page.goto("/");

    // Get background color in light theme
    const lightBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Toggle to dark theme
    const themeToggle = page.getByRole("button", { name: /theme/i });
    await themeToggle.click();
    await page.waitForTimeout(300);

    // Get background color in dark theme
    const darkBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Colors should be different
    expect(lightBg).not.toBe(darkBg);
  });
});
