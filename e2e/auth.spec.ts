import { test, expect } from '@playwright/test';

test.describe('TaskFlow public pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible();
  });

  test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('can navigate from login to register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /create a new account/i }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
