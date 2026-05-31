import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders main portfolio sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Tyler Witlin")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Skills & Tools/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Certifications/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /About Me/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Projects/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Get In Touch/i })).toBeVisible();
  });

  test("nav links reach key pages", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "blog" }).click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("link", { name: "now" }).click();
    await expect(page).toHaveURL(/\/now$/);

    await page.getByRole("link", { name: "status" }).click();
    await expect(page).toHaveURL(/\/status$/);
  });
});

test.describe("Contact form", () => {
  test("shows validation when submitting empty form", async ({ page }) => {
    await page.goto("/#contact");

    await page.getByRole("button", { name: /\.\/send-message/i }).click();

    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Message/i)).toBeVisible();
  });

  test("renders contact fields and turnstile container", async ({ page }) => {
    await page.goto("/#contact");

    await expect(page.getByLabel(/Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email/i)).toBeVisible();
    await expect(page.getByLabel(/Message/i)).toBeVisible();
    await expect(page.locator("#contact-turnstile")).toBeAttached();
  });
});
