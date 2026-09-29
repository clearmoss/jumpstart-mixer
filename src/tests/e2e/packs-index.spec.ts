import { expect, type Page, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

// helper functions to reduce duplication and keep scope clean
const getPackCount = async (page: Page): Promise<number> => {
  const countLocator = page.getByTestId("pack-count").filter({ visible: true });
  await expect(countLocator).toBeVisible();
  const textContent = await countLocator.textContent();
  return Math.trunc(Number(textContent?.match(/^\d+/u)?.[0] || "0"));
};

const openMobileSettingsIfNeeded = async (page: Page): Promise<void> => {
  const isMobile = await page.getByTestId("mobile-settings-trigger").isVisible();
  if (isMobile) {
    await page.getByTestId("mobile-settings-trigger").click();
  }
};

const verifyCountDecreased = async (page: Page, initialCount: number): Promise<number> => {
  await expect(page.getByTestId("pack-count").filter({ visible: true })).not.toHaveText(
    `${initialCount} packs`
  );
  const newCount = await getPackCount(page);
  expect(newCount).toBeLessThan(initialCount);
  return newCount;
};

test.describe("Packs Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/packs/`);
    await expect(page.getByTestId("pack-list")).toBeVisible();
  });

  test("should load the packs page correctly", async ({ page }) => {
    await expect(page).toHaveTitle("Packs");
    await expect(page.getByTestId("packs-content").filter({ visible: true })).toBeVisible();
    await expect(page.getByTestId("sidebar").filter({ visible: true })).toBeVisible();
  });

  test("should display packs and count", async ({ page }) => {
    const packEntries = page.getByTestId("pack-entry").filter({ visible: true });
    await expect(packEntries.first()).toBeVisible();

    const displayedCount = await getPackCount(page);
    const actualCount = await packEntries.count();

    expect(displayedCount).toBeGreaterThan(0);
    expect(displayedCount).toBe(actualCount);
  });

  test("should display the count in the mobile settings header", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();

    const settingsTrigger = page.getByTestId("mobile-settings-trigger");
    await expect(settingsTrigger).toBeVisible();
    await expect(settingsTrigger.getByTestId("pack-count")).toBeVisible();
  });

  test("should filter packs by color", async ({ page }) => {
    await openMobileSettingsIfNeeded(page);

    const initialCount = await getPackCount(page);

    // open the dropdown menu
    const colorSelector = page
      .getByRole("combobox", { name: "Allowed Colors" })
      .filter({ visible: true });
    await colorSelector.click();
    await expect(page.getByTestId("color-selector-item-W")).toBeVisible();

    // click the W filter to disable White packs
    await page.getByTestId("color-selector-item-W").click();
    await verifyCountDecreased(page, initialCount);
  });

  test("should search for packs by name", async ({ page }) => {
    const initialCount = await getPackCount(page);
    const searchInput = page.getByTestId("pack-search").filter({ visible: true });

    await searchInput.fill("Goblins");
    await verifyCountDecreased(page, initialCount);

    const packs = await page.getByTestId("pack-entry").filter({ visible: true }).all();
    await Promise.all(
      packs.map((pack) => expect(pack.getByTestId("pack-name")).toContainText("Goblins"))
    );
  });

  test("should filter packs by set", async ({ page }) => {
    await openMobileSettingsIfNeeded(page);

    const initialCount = await getPackCount(page);

    // open the dropdown menu
    const setSelector = page
      .getByRole("combobox", { name: "Allowed Sets" })
      .filter({ visible: true });
    await setSelector.click();
    await expect(page.getByTestId("set-selector-item-JMP")).toBeVisible();

    // click the JMP filter to disable Jumpstart packs
    await page.getByTestId("set-selector-item-JMP").click();
    await verifyCountDecreased(page, initialCount);

    const packs = await page.getByTestId("pack-entry").filter({ visible: true }).all();
    await Promise.all(
      packs.map((pack) => expect(pack.getByTestId("pack-set")).not.toContainText("JMP"))
    );
  });

  test("should show 'No packs found' when no packs match filters", async ({ page }) => {
    await page.getByTestId("pack-search").filter({ visible: true }).fill("foobar pack");

    await expect(page.getByText("No packs found")).toBeVisible();
    await expect(page.getByTestId("pack-count").filter({ visible: true })).toHaveText("0 packs");
  });
});

test.describe("New set filter preferences", () => {
  test.use({ serviceWorkers: "block" });

  test("keeps new sets unchecked until the user enables them", async ({ page }) => {
    await page.route("**/pack_index.json", async (route) => {
      const indexPath = path.join(process.cwd(), "public", "pack_index.json");
      const packIndex = JSON.parse(await readFile(indexPath, "utf8")) as {
        packs: { publicId: string; url: string }[];
        sets: string[];
      };
      packIndex.packs.push({
        publicId: "future-set-pack",
        url: "packs/J26/Example/Example_J26.json",
      });
      packIndex.sets.push("J26");
      await route.fulfill({ json: packIndex });
    });
    await page.route("**/packs/J26/set.json", async (route) => {
      await route.fulfill({
        json: {
          code: "J26",
          name: "Jumpstart 2026",
          releaseDate: "2026-11-13",
        },
      });
    });
    await page.route("**/packs/J26/Example/Example_J26.json", async (route) => {
      await route.fulfill({
        json: {
          meta: { publicId: "future-set-pack" },
          data: {
            code: "J26",
            name: "Example 1",
            mainBoard: [{ name: "Example", colorIdentity: ["W"], count: 1 }],
          },
        },
      });
    });
    await page.addInitScript(() => {
      localStorage.setItem("setFilter", JSON.stringify(["JMP"]));
    });

    await page.goto("/packs/");

    const setSelector = page
      .getByRole("combobox", { name: "Allowed Sets" })
      .filter({ visible: true });
    await setSelector.click();
    const newSetOption = page.getByTestId("set-selector-item-J26");
    await expect(newSetOption).toContainText("Jumpstart 2026");
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("setFilter")))
      .toBe(JSON.stringify(["JMP"]));

    await newSetOption.click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("setFilter")))
      .toBe(JSON.stringify(["JMP", "J26"]));
  });
});
