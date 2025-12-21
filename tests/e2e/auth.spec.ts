import { test, expect } from '@playwright/test';

test('staff login -> dashboard loads (protected)', async ({ page }) => {
  // Login page
  await page.goto('/login');

  // Fill credentials
  await page.getByLabel(/email/i).fill(process.env.E2E_EMAIL || 'admin@example.com');
  await page.getByLabel(/password/i).fill(process.env.E2E_PASSWORD || 'password');

  // Submit
  await page.getByRole('button', { name: /login/i }).click();

  // Expect redirect to dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Verify protected content loads
  await expect(page.getByText(/applications/i)).toBeVisible();
});
