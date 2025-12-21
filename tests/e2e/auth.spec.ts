import { test, expect } from '@playwright/test';

test('login and reach dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type="email"]', 'todd.w@boreal.financial');
  await page.fill('input[type="password"]', '1Sucker1!');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
