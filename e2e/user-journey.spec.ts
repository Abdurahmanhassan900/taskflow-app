import { test, expect } from '@playwright/test';

test.describe('TaskFlow public pages', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('TaskFlow user journey', () => {
  test('register, create task, delete task, and logout', async ({ page }) => {
    const email = `e2e-${Date.now()}@taskflow.test`;
    const password = 'Password1!';
    const taskTitle = `E2E task ${Date.now()}`;

    await page.goto('/register');
    await page.getByLabel(/full name/i).fill('E2E User');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText(/welcome back, e2e user/i)).toBeVisible();

    await page.getByRole('link', { name: /^tasks$/i }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByRole('heading', { name: /^tasks$/i })).toBeVisible();
    await page.getByRole('button', { name: /create task/i }).click();
    await page.getByLabel(/^title$/i).fill(taskTitle);
    await page.getByLabel(/^description$/i).fill('Created by Playwright');
    await page.getByRole('button', { name: /save task/i }).click();

    await expect(page.getByText(taskTitle)).toBeVisible();

    await page.getByRole('button', { name: /^delete$/i }).first().click();
    await expect(page.getByText(taskTitle)).not.toBeVisible();

    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });
});
