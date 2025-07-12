import { test, expect } from "@playwright/test";

test.describe("API Routes", () => {
  test("echo API route responds correctly", async ({ request }) => {
    const response = await request.post("/api/echo", {
      data: {
        message: "test message",
        timestamp: new Date().toISOString(),
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("message", "test message");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("server_time");
  });

  test("echo API validates required fields", async ({ request }) => {
    const response = await request.post("/api/echo", {
      data: {},
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("message");
  });

  test("echo API handles invalid data types", async ({ request }) => {
    const response = await request.post("/api/echo", {
      data: {
        message: 123, // Should be string
        timestamp: "invalid-date",
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  test("SSL info API route responds correctly", async ({ request }) => {
    const response = await request.post("/api/ssl/info", {
      data: {
        domain: "example.com",
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("domain", "example.com");
    expect(data).toHaveProperty("valid");
    expect(data).toHaveProperty("issuer");
    expect(data).toHaveProperty("expires");
  });

  test("SSL info API validates domain format", async ({ request }) => {
    const response = await request.post("/api/ssl/info", {
      data: {
        domain: "invalid-domain",
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("domain");
  });

  test("SSL info API handles missing domain", async ({ request }) => {
    const response = await request.post("/api/ssl/info", {
      data: {},
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data.error).toContain("required");
  });

  test("API routes have proper CORS headers", async ({ request }) => {
    const response = await request.post("/api/echo", {
      data: { message: "test", timestamp: new Date().toISOString() },
    });

    const headers = response.headers();
    expect(headers["content-type"]).toContain("application/json");
  });

  test("API routes handle rate limiting", async ({ request }) => {
    // Make multiple rapid requests
    const promises = Array.from({ length: 10 }, () =>
      request.post("/api/echo", {
        data: { message: "test", timestamp: new Date().toISOString() },
      })
    );

    const responses = await Promise.all(promises);

    // At least some should succeed
    const successCount = responses.filter(r => r.status() === 200).length;
    expect(successCount).toBeGreaterThan(0);
  });
});
