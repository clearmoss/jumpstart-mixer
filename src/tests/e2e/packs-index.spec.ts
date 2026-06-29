import { expect, type Page, test } from "@playwright/test";
import { BASEPATH } from "@/lib/utils.ts";

test.describe("Packs Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASEPATH}/packs/`);
    await expect(page.getByTestId("pack-list")).toBeVisible();
  });

  // helper function to parse the pack count
  const getPackCount = async (page: Page): Promise<number> => {
    const countLocator = page
      .getByTestId("pack-count")
      .filter({ visible: true });
    await expect(countLocator).toBeVisible();
    const textContent = await countLocator.textContent();
    return parseInt(textContent?.match(/^\d+/)?.[0] || "0");
  };

  test("should load the packs page correctly", async ({ page }) => {
    await expect(page).toHaveTitle("Packs");
    await expect(
      page.getByTestId("packs-content").filter({ visible: true }),
    ).toBeVisible();
    await expect(
      page.getByTestId("sidebar").filter({ visible: true }),
    ).toBeVisible();
  });

  test("should display packs and count", async ({ page }) => {
    const packEntries = page
      .getByTestId("pack-entry")
      .filter({ visible: true });
    await expect(packEntries.first()).toBeVisible();

    const displayedCount = await getPackCount(page);
    const actualCount = await packEntries.count();

    expect(displayedCount).toBeGreaterThan(0);
    expect(displayedCount).toBe(actualCount);
  });

  test("should filter packs by color", async ({ page }) => {
    const isMobile = await page
      .getByTestId("mobile-settings-trigger")
      .isVisible();
    if (isMobile) {
      await page.getByTestId("mobile-settings-trigger").click();
    }

    const initialCount = await getPackCount(page);

    // open the dropdown menu
    const colorSelector = page
      .getByTestId("color-selector-button")
      .filter({ visible: true });
    await colorSelector.click();
    await expect(page.getByTestId("color-selector-item-W")).toBeVisible();

    // click the W filter to disable White packs
    await page.getByTestId("color-selector-item-W").click();
    await expect(
      page.getByTestId("pack-count").filter({ visible: true }),
    ).not.toHaveText(`${initialCount} Packs`);

    const newCount = await getPackCount(page);
    expect(newCount).toBeLessThan(initialCount);
  });

  test("should search for packs by name", async ({ page }) => {
    const initialCount = await getPackCount(page);
    const searchInput = page
      .getByTestId("pack-search")
      .filter({ visible: true });

    await searchInput.fill("Goblins");

    await expect(
      page.getByTestId("pack-count").filter({ visible: true }),
    ).not.toHaveText(`${initialCount} packs`);

    const newCount = await getPackCount(page);
    expect(newCount).toBeLessThan(initialCount);

    for (const pack of await page
      .getByTestId("pack-entry")
      .filter({ visible: true })
      .all()) {
      await expect(pack.getByTestId("pack-name")).toContainText("Goblins");
    }
  });

  test("should filter packs by set", async ({ page }) => {
    const isMobile = await page
      .getByTestId("mobile-settings-trigger")
      .isVisible();
    if (isMobile) {
      await page.getByTestId("mobile-settings-trigger").click();
    }

    const initialCount = await getPackCount(page);

    // open the dropdown menu
    const setSelector = page
      .getByTestId("set-selector-button")
      .filter({ visible: true });
    await setSelector.click();
    await expect(page.getByTestId("set-selector-item-JMP")).toBeVisible();

    // click the JMP filter to disable Jumpstart packs
    await page.getByTestId("set-selector-item-JMP").click();
    await expect(
      page.getByTestId("pack-count").filter({ visible: true }),
    ).not.toHaveText(`${initialCount} Packs`);

    const newCount = await getPackCount(page);
    expect(newCount).toBeLessThan(initialCount);

    for (const pack of await page
      .getByTestId("pack-entry")
      .filter({ visible: true })
      .all()) {
      await expect(pack.getByTestId("pack-set")).not.toContainText("JMP");
    }
  });

  test("should show 'No packs found' when no packs match filters", async ({
    page,
  }) => {
    await page
      .getByTestId("pack-search")
      .filter({ visible: true })
      .fill("foobar pack");

    await expect(page.getByText("No packs found")).toBeVisible();
    await expect(
      page.getByTestId("pack-count").filter({ visible: true }),
    ).toHaveText("0 packs");
  });
});
