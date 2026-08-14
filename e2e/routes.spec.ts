import { test, expect } from "@playwright/test";

test.describe("Key routes", () => {
  test("blog index lists posts", async ({ page }) => {
    await page.goto("/blog");

    await expect(page).toHaveTitle(/Blog/i);
    await expect(
      page.getByRole("heading", { name: "My Blog", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("link").first()).toBeVisible();
  });

  test("classic landing renders", async ({ page }) => {
    await page.goto("/classic");

    await expect(page).toHaveTitle(/Classic layout/i);
    await expect(page.getByText("Parvez Kose").first()).toBeVisible();
  });

  test("/immersive redirects to /", async ({ page }) => {
    await page.goto("/immersive");

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Parvez Kose", level: 1 }),
    ).toBeVisible();
  });

  test("/design-system redirects to trailing slash, preserves search, and loads CSS", async ({
    page,
  }) => {
    const cssResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/design-system/colors_and_type.css") &&
        response.ok(),
    );

    await page.goto("/design-system?utm_source=newsletter&variant=a");

    const currentUrl = new URL(page.url());
    expect(currentUrl.pathname).toBe("/design-system/");
    expect(currentUrl.search).toBe("?utm_source=newsletter&variant=a");
    await cssResponsePromise;
    await expect(
      page.getByRole("heading", { name: /Poetry in the shell/i }),
    ).toBeVisible();
  });
});
