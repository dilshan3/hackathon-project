const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT010: End-to-End Book Sharing Workflow After Integration Updates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should complete end-to-end book sharing workflow successfully', async ({ page }) => {
    // Step 1: Navigate to Discover page and verify functionality
    await page.goto('/books');
    await expect(page).toHaveURL(/.*\/books/);
    await expect(page.locator('text=Discover Books')).toBeVisible();
    
    // Verify search functionality is available
    await expect(page.getByRole('textbox', { name: 'Search books' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    
    // Step 2: Navigate to My Books page and verify management functionality
    await page.goto('/books/mine');
    await expect(page).toHaveURL(/.*\/books\/mine/);
    await expect(page.locator('h1')).toContainText('My Books');
    await expect(page.getByRole('button', { name: 'Add New Book' })).toBeVisible();
    
    // Verify book statistics are displayed
    await expect(page.locator('text=/\\d+ books total/')).toBeVisible();
    
    // Step 3: Navigate to Dashboard and verify statistics consistency
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify dashboard cards are present
    await expect(page.locator('h3').filter({ hasText: 'My Books' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Incoming Requests' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'My Requests' })).toBeVisible();
    
    // Step 4: Navigate to Requests page and verify functionality
    await page.goto('/requests');
    await expect(page).toHaveURL(/.*\/requests/);
    await expect(page.locator('h1')).toContainText('Requests');
    await expect(page.locator('text=As Owner')).toBeVisible();
    await expect(page.locator('text=As Requester')).toBeVisible();
    
    // Step 5: Verify complete workflow navigation works smoothly
    await page.goto('/books');
    await page.getByRole('link', { name: 'My Books' }).click();
    await expect(page).toHaveURL(/.*\/books\/mine/);
    
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    await page.getByRole('link', { name: 'Requests' }).click();
    await expect(page).toHaveURL(/.*\/requests/);
    
    // Verify user authentication is maintained throughout
    await expect(page.getByRole('button', { name: 'J' })).toBeVisible();
    
    // Test user dropdown functionality
    await page.getByRole('button', { name: 'J' }).click();
    await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible();
  });
});