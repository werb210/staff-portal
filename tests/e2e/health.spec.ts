import { test, expect } from '@playwright/test';

test('portal loads and server health responds', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Boreal/i);

  const res = await fetch('http://localhost:8080/api/health');
  expect(res.ok).toBeTruthy();
});
