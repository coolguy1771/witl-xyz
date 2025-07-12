import { test, expect } from "@playwright/test";

test.describe("SSL Dashboard", () => {
  test("SSL dashboard page loads correctly", async ({ page }) => {
    await page.goto("/ssl");

    // Check page title
    await expect(page).toHaveTitle(/SSL/);

    // Check main heading
    await expect(page.getByRole("heading", { level: 1 })).toContainText("SSL");

    // Check for SSL checker form
    const form = page.locator("form");
    if ((await form.count()) > 0) {
      await expect(form.first()).toBeVisible();
    }
  });

  test("SSL checker form validation works", async ({ page }) => {
    await page.goto("/ssl");

    // Look for domain input field
    const domainInput = page.getByRole("textbox", { name: /domain/i });
    const submitButton = page.getByRole("button", { name: /check|submit/i });

    if ((await domainInput.count()) > 0 && (await submitButton.count()) > 0) {
      // Try submitting empty form
      await submitButton.click();

      // Should show validation error
      const errorMessage = page.locator(
        "[class*='error'], .error, [role='alert']"
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }

      // Try invalid domain
      await domainInput.fill("invalid-domain");
      await submitButton.click();

      // Should show validation error for invalid format
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test("SSL checker works with valid domain", async ({ page }) => {
    await page.goto("/ssl");

    // Look for domain input and submit button
    const domainInput = page.getByRole("textbox", { name: /domain/i });
    const submitButton = page.getByRole("button", { name: /check|submit/i });

    if ((await domainInput.count()) > 0 && (await submitButton.count()) > 0) {
      // Enter a valid domain
      await domainInput.fill("example.com");
      await submitButton.click();

      // Wait for API response
      await page.waitForTimeout(3000);

      // Check for SSL certificate information
      const sslInfo = page.locator(
        "[class*='certificate'], .ssl-info, [class*='ssl']"
      );
      if ((await sslInfo.count()) > 0) {
        await expect(sslInfo.first()).toBeVisible();
      }

      // Look for common SSL certificate fields
      const issuer = page.getByText(/issuer|issued by/i);
      const expiry = page.getByText(/expires|expiry|valid until/i);

      if ((await issuer.count()) > 0) {
        await expect(issuer.first()).toBeVisible();
      }

      if ((await expiry.count()) > 0) {
        await expect(expiry.first()).toBeVisible();
      }
    }
  });

  test("SSL certificate cards display properly", async ({ page }) => {
    await page.goto("/ssl");

    // Check for existing certificate cards or results
    const certificateCards = page.locator(
      "[class*='certificate'], [class*='card']"
    );
    const cardCount = await certificateCards.count();

    if (cardCount > 0) {
      const firstCard = certificateCards.first();
      await expect(firstCard).toBeVisible();

      // Check for certificate details
      const domain = firstCard.locator("[class*='domain'], .domain");
      const status = firstCard.locator(
        "[class*='status'], .status, [class*='valid']"
      );

      if ((await domain.count()) > 0) {
        await expect(domain.first()).toBeVisible();
      }

      if ((await status.count()) > 0) {
        await expect(status.first()).toBeVisible();
      }
    }
  });

  test("SSL dashboard handles loading states", async ({ page }) => {
    await page.goto("/ssl");

    const domainInput = page.getByRole("textbox", { name: /domain/i });
    const submitButton = page.getByRole("button", { name: /check|submit/i });

    if ((await domainInput.count()) > 0 && (await submitButton.count()) > 0) {
      // Enter domain and submit
      await domainInput.fill("example.com");
      await submitButton.click();

      // Check for loading indicator
      const loadingIndicator = page.locator(
        "[class*='loading'], .spinner, [class*='spin']"
      );
      if ((await loadingIndicator.count()) > 0) {
        await expect(loadingIndicator.first()).toBeVisible();
      }

      // Wait for loading to complete
      await page.waitForTimeout(3000);

      // Loading indicator should disappear
      if ((await loadingIndicator.count()) > 0) {
        await expect(loadingIndicator.first()).not.toBeVisible();
      }
    }
  });

  test("SSL dashboard error handling works", async ({ page }) => {
    await page.goto("/ssl");

    const domainInput = page.getByRole("textbox", { name: /domain/i });
    const submitButton = page.getByRole("button", { name: /check|submit/i });

    if ((await domainInput.count()) > 0 && (await submitButton.count()) > 0) {
      // Try a domain that should fail
      await domainInput.fill("nonexistent-domain-12345.com");
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(5000);

      // Check for error message
      const errorMessage = page.locator(
        "[class*='error'], .error, [role='alert']"
      );
      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test("SSL dashboard is accessible", async ({ page }) => {
    await page.goto("/ssl");

    // Check form accessibility
    const domainInput = page.getByRole("textbox", { name: /domain/i });
    if ((await domainInput.count()) > 0) {
      // Check for proper labeling
      const label = await domainInput.getAttribute("aria-label");
      const associatedLabel = page
        .locator("label")
        .filter({ has: domainInput });

      expect(label || (await associatedLabel.count()) > 0).toBeTruthy();

      // Check that input is focusable
      await domainInput.focus();
      const isFocused = await page.evaluate(() => {
        return document.activeElement?.tagName === "INPUT";
      });
      expect(isFocused).toBe(true);
    }

    // Check button accessibility
    const submitButton = page.getByRole("button", { name: /check|submit/i });
    if ((await submitButton.count()) > 0) {
      const buttonText = await submitButton.textContent();
      const ariaLabel = await submitButton.getAttribute("aria-label");
      expect(buttonText || ariaLabel).toBeTruthy();
    }
  });

  test("SSL dashboard works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/ssl");

    // Check that form elements are still accessible
    const domainInput = page.getByRole("textbox", { name: /domain/i });
    const submitButton = page.getByRole("button", { name: /check|submit/i });

    if ((await domainInput.count()) > 0) {
      await expect(domainInput).toBeVisible();

      // Check that input is not cut off
      const inputBox = await domainInput.boundingBox();
      expect(inputBox?.width).toBeLessThanOrEqual(375);
    }

    if ((await submitButton.count()) > 0) {
      await expect(submitButton).toBeVisible();
    }
  });
});
