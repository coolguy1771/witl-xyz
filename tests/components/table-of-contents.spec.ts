import { test, expect } from "@playwright/test";
import {
  BLOG_CODE_FIXTURE_PATH,
  BLOG_CODE_FIXTURE_TITLE,
} from "../fixtures/blog-posts";

function tocNav(page: import("@playwright/test").Page) {
  return page.locator("nav").filter({ hasText: "// table-of-contents" });
}

test.describe("Table of Contents", () => {
  test("TOC lists all headings from the blog post", async ({ page }) => {
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    await expect(page.getByRole("heading", { name: BLOG_CODE_FIXTURE_TITLE })).toBeVisible();

    const tocContainer = tocNav(page);
    await expect(tocContainer).toBeVisible();

    const tocLinks = tocContainer.locator("a");
    const linkCount = await tocLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    const h2Count = await page.locator("h2").count();
    expect(linkCount).toBeGreaterThanOrEqual(h2Count);

    const firstHeadingText = await page.locator("h2").first().innerText();
    const firstTocLinkText = await tocLinks.first().innerText();
    expect(firstTocLinkText).toEqual(firstHeadingText);
  });

  test("TOC links navigate to correct sections", async ({ page }) => {
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    const tocContainer = tocNav(page);
    await expect(tocContainer).toBeVisible();

    const tocLinks = tocContainer.locator("a");
    const firstLinkText = await tocLinks.first().innerText();
    await tocLinks.first().click();

    await expect(page).toHaveURL(/#.+/);

    const targetHeading = page.getByRole("heading", { name: firstLinkText }).first();
    await expect(targetHeading).toBeInViewport();
  });

  test("TOC active state changes when scrolling", async ({ page }) => {
    await page.goto(BLOG_CODE_FIXTURE_PATH);

    await expect(page.getByRole("heading", { name: BLOG_CODE_FIXTURE_TITLE })).toBeVisible();

    const tocContainer = tocNav(page);
    await expect(tocContainer).toBeVisible();

    const thirdHeading = page.locator("h2").nth(2);
    await thirdHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await expect(async () => {
      const activeLink = tocContainer
        .locator("a")
        .filter({ hasText: await thirdHeading.innerText() });
      await expect(activeLink).toHaveCSS("font-weight", "600");
    }).toPass({ timeout: 5000 });
  });
});
