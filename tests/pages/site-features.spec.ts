import { test, expect } from "@playwright/test";

test.describe("You page", () => {
  test("renders visitor dashboard and privacy explainer", async ({ page }) => {
    await page.goto("/you");

    await expect(page.getByRole("heading", { name: /Your Digital Profile/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /What this page knows about you/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Refresh Data/i })).toBeVisible();
  });

  test("visitor API returns geo payload", async ({ request }) => {
    const response = await request.get("/api/visitor");
    expect(response.ok()).toBeTruthy();

    const data = (await response.json()) as {
      geo?: { country?: string | null; city?: string | null };
      weather?: { temp?: number } | null;
    };

    expect(data.geo).toBeDefined();
  });
});

test.describe("Now page", () => {
  test("renders now snapshot content", async ({ page }) => {
    await page.goto("/now");

    await expect(page.getByRole("heading", { name: "Now" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Work" })).toBeVisible();
    await expect(page.getByText(/Last updated/i)).toBeVisible();
  });
});

test.describe("SEO routes", () => {
  test("sitemap and robots are available", async ({ request }) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain("<urlset");

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain("Sitemap:");
  });

  test("blog post exposes opengraph image route", async ({ request }) => {
    const response = await request.get("/blog/hello-world/opengraph-image");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image");
  });
});
