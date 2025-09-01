const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT001: Login and Session Persistence After System Updates', () => {
  test('should complete login process successfully and redirect to Discover page', async ({ page }) => {
    // Navigate to the application homepage
    await page.goto('/');
    
    // Click "Log In" button
    await page.locator('mat-toolbar').getByRole('link', { name: 'Log In' }).click();
    
    // Enter valid credentials
    await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_CONFIG.credentials.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.credentials.password);
    
    // Click "Login" button
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify user is redirected to Discover page
    await page.waitForURL('**/books');
    await expect(page).toHaveURL(/.*\/books/);
    
    // Verify user is logged in by checking for user avatar
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
    
    // Verify navigation elements are present
    await expect(page.getByRole('link', { name: 'Discover' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My Books' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Requests' })).toBeVisible();
  });
});

