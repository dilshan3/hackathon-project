const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT007: Navigation and UI State Management After Frontend Updates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate through all main pages and display UI correctly', async ({ page }) => {
    // Test navigation to all main pages
    // Test Discover navigation
    await page.getByRole('link', { name: 'Discover' }).click();
    await expect(page).toHaveURL(/.*\/books/);
    await expect(page.locator('text=Discover Books')).toBeVisible();
    
    // Test My Books navigation
    await page.getByRole('link', { name: 'My Books' }).click();
    await expect(page).toHaveURL(/.*\/books\/mine/);
    await expect(page.locator('h1')).toContainText('My Books');
    
    // Test Dashboard navigation
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Test Requests navigation
    await page.getByRole('link', { name: 'Requests' }).click();
    await expect(page).toHaveURL(/.*\/requests/);
    await expect(page.locator('h1')).toContainText('Requests');
    
    // Verify user avatar and navigation are consistently visible
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
    
    // Test user dropdown functionality
    await page.getByRole('button', { name: 'J' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    
    // Close dropdown by clicking elsewhere
    await page.locator('h1').click();
    
    // Verify all navigation links are consistently available
    await expect(page.getByRole('link', { name: 'Discover' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Books' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Requests' })).toBeVisible();
  });
});

