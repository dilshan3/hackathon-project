const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT006: User Profile and Authentication State After Security Updates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display user profile and authentication functionality correctly', async ({ page }) => {
    // Verify user avatar is displayed
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
    
    // Click on user avatar to open dropdown
    await page.getByRole('button', { name: 'J' }).click();
    
    // Verify dropdown shows correct user information
    await expect(page.locator('text=johndoe')).toBeVisible();
    await expect(page.locator('text=johndoe@email.com')).toBeVisible();
    
    // Verify dropdown options are present
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
    
    // Test profile navigation
    await page.getByRole('menuitem', { name: 'Profile' }).click();
    await expect(page).toHaveURL(/.*\/profile/);
    
    // Verify authentication state is maintained across navigation
    await page.goto('/dashboard');
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
    
    await page.goto('/books/mine');
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
    
    await page.goto('/requests');
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
  });
});

