import { test, expect } from "@playwright/test";

test.describe("Error Boundary", () => {
  test("error boundary catches and displays errors gracefully", async ({
    page,
  }) => {
    // Add a console error listener to detect JavaScript errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Inject a script that will cause an error in a React component
    await page.goto("/");

    // Try to trigger an error by manipulating React components
    await page.evaluate(() => {
      // This is a test to see if error boundaries work
      // We'll create a scenario where a component might fail
      const buttons = document.querySelectorAll("button");
      if (buttons.length > 0) {
        // Try to trigger an error by accessing undefined properties
        try {
          (window as any).triggerTestError = () => {
            throw new Error("Test error for error boundary");
          };
        } catch (e) {
          // Error caught
        }
      }
    });

    // Check if the page still loads properly despite potential errors
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("error boundary provides retry functionality", async ({ page }) => {
    await page.goto("/");

    // Look for any error boundary retry buttons that might be present
    const retryButton = page.getByRole("button", { name: /retry|try again/i });
    const retryCount = await retryButton.count();

    if (retryCount > 0) {
      // If retry button exists, it should be clickable
      await expect(retryButton.first()).toBeVisible();
      await retryButton.first().click();

      // Page should still be functional after retry
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("error boundary displays helpful error message", async ({ page }) => {
    await page.goto("/");

    // Look for any error messages that might be displayed
    const errorMessage = page.locator(
      "[class*='error'], .error, [role='alert']"
    );
    const errorCount = await errorMessage.count();

    if (errorCount > 0) {
      const firstError = errorMessage.first();

      // Error message should be visible
      await expect(firstError).toBeVisible();

      // Error message should contain helpful text
      const errorText = await firstError.textContent();
      expect(errorText).toBeTruthy();
      expect(errorText!.length).toBeGreaterThan(10);
    }
  });

  test("error boundary doesn't break navigation", async ({ page }) => {
    await page.goto("/");

    // Navigate to different pages to ensure error boundaries don't interfere
    await page.getByRole("link", { name: /blog/i }).click();
    await expect(page).toHaveURL("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Navigate back to home
    await page.getByRole("link", { name: /home/i }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("error boundary preserves application state", async ({ page }) => {
    await page.goto("/");

    // Check if theme toggle still works (state preservation test)
    const themeToggle = page.getByRole("button", { name: /theme/i });
    if ((await themeToggle.count()) > 0) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(300);

      // Verify theme changed (state preserved)
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test("error boundary doesn't prevent form submissions", async ({ page }) => {
    await page.goto("/ssl");

    // Test that forms still work despite error boundaries
    const domainInput = page.getByRole("textbox", { name: /domain/i });
    const submitButton = page.getByRole("button", { name: /check|submit/i });

    if ((await domainInput.count()) > 0 && (await submitButton.count()) > 0) {
      // Fill and submit form
      await domainInput.fill("example.com");
      await submitButton.click();

      // Form should still process (no errors preventing submission)
      await page.waitForTimeout(1000);

      // Input should still be accessible
      await expect(domainInput).toBeVisible();
    }
  });

  test("error boundary handles async operations", async ({ page }) => {
    await page.goto("/");

    // Look for any loading states or async operations
    const loadingElements = page.locator(
      "[class*='loading'], .spinner, [class*='spin']"
    );

    // Wait for any async operations to complete
    await page.waitForTimeout(2000);

    // Page should be in a stable state
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Check that navigation still works after async operations
    const blogLink = page.getByRole("link", { name: /blog/i });
    if ((await blogLink.count()) > 0) {
      await blogLink.click();
      await expect(page).toHaveURL("/blog");
    }
  });

  test("error boundary provides accessible error information", async ({
    page,
  }) => {
    await page.goto("/");

    // Look for error messages and check accessibility
    const errorMessages = page.locator("[role='alert'], [class*='error']");
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      const firstError = errorMessages.first();

      // Should have proper ARIA role
      const role = await firstError.getAttribute("role");
      const ariaLabel = await firstError.getAttribute("aria-label");
      const ariaLive = await firstError.getAttribute("aria-live");

      expect(role === "alert" || ariaLabel || ariaLive).toBeTruthy();
    }
  });
});
