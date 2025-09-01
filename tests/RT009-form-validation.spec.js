const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT009: Form Validation and Submission After Validation Rule Changes', () => {
  test('should validate login form functionality', async ({ page }) => {
    // Navigate to login page (test without beforeEach to test full flow)
    await page.goto('/');
    
    // Click "Log In" button
    await page.locator('mat-toolbar').getByRole('link', { name: 'Log In' }).click();
    
    // Verify form elements are present
    await expect(page.getByRole('textbox', { name: 'Email address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    
    // Test password visibility toggle
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await passwordField.fill('testpassword');
    
    // Click password visibility toggle
    await page.locator('button').filter({ hasText: 'visibility_off' }).click();
    
    // Enter valid credentials and submit
    await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_CONFIG.credentials.email);
    await passwordField.fill(TEST_CONFIG.credentials.password);
    
    // Submit form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Verify successful login
    await page.waitForURL('**/books');
    await expect(page).toHaveURL(/.*\/books/);
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
  });
});