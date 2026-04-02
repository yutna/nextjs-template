import { expect, test } from "./fixtures";

test.describe("Smoke test", () => {
  test("home page loads in English", async ({ localePath, page }) => {
    await page.goto(localePath("/"));
    await expect(page).toHaveURL(/\/en/);
  });

  test("home page loads in Thai", async ({ localePath, page }) => {
    await page.goto(localePath("/", "th"));
    await expect(page).toHaveURL(/\/th/);
  });
});
