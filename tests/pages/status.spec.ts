import { test, expect } from "@playwright/test";

test.describe("Status page", () => {
  test("loads dashboard and status API", async ({ page, request }) => {
    await page.goto("/status");

    await expect(page.getByRole("heading", { name: /System Status/i })).toBeVisible();

    const response = await request.get("/api/status");
    expect(response.ok() || response.status() === 503).toBeTruthy();

    const report = (await response.json()) as {
      status: string;
      checks: Array<{ name: string; status: string }>;
    };

    expect(report.checks.length).toBeGreaterThan(0);
    expect(report.checks.some((check) => check.name === "Resend")).toBeTruthy();
    expect(report.checks.some((check) => check.name === "Turnstile")).toBeTruthy();
    expect(report.checks.some((check) => check.name.includes("witl.xyz"))).toBeTruthy();
  });
});
