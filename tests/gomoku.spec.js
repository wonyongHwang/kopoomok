
const { test, expect } = require('@playwright/test');

test.describe('Gomoku Game', () => {
  // Navigate to the local HTML file before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/index.html');
  });

  test('should start the game and place a black stone in the center', async ({ page }) => {
    // 1. Start the game
    await page.click('#start-game');

    // Wait for difficulty selection to be visible and click Easy
    await expect(page.locator('#difficulty-selection')).toBeVisible();
    await page.click('button.difficulty-btn[data-depth="1"]');

    // Wait for player selection to be visible and click Play First
    await expect(page.locator('#player-selection')).toBeVisible();
    await page.click('#select-first');

    // Wait for the player selection to disappear
    await expect(page.locator('#player-selection')).not.toBeVisible();

    // The player selection should disappear
    await expect(page.locator('#player-selection')).not.toBeVisible();

    // 3. Click the center cell of the board
    const centerCell = page.locator('div.cell[data-row="9"][data-col="9"]');
    await centerCell.click();

    // 4. Verify that a black stone is placed in the center cell
    const stone = centerCell.locator('div.stone.black');
    await expect(stone).toBeVisible();

    // 5. Verify that the last move indicator is present
    await expect(stone).toHaveClass(/last-move/);
  });
});
