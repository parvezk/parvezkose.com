import { test, expect } from "@playwright/test";

test.describe("Immersive landing (/)", () => {
  test("renders brand hero and primary controls", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Parvez Kose/i);
    await expect(
      page.getByRole("heading", { name: "Parvez Kose", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("Designing interfaces for intelligence"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Design Philosophy/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Menu/i })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Site and social links" }),
    ).toBeVisible();
  });

  test("opens Design Philosophy panel", async ({ page }) => {
    await page.goto("/");

    const toggle = page.getByRole("button", { name: /Design Philosophy/i });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});
