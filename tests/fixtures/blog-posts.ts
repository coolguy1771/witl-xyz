/** Stable blog slugs used by Playwright component tests. */
export const BLOG_CODE_FIXTURE_PATH = "/blog/e2e-code-fixtures";
export const BLOG_CODE_FIXTURE_TITLE = /E2E Blog Code Fixtures/;

/**
 * Replace the async clipboard API so copy-button tests work in every browser
 * (headless browsers deny clipboard permissions).
 */
export async function stubClipboard(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => undefined },
      configurable: true,
    });
  });
}
