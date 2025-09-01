const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT004: Dashboard Statistics and Data Aggregation After Backend Updates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard with statistics and functionality correctly', async ({ page }) => {
    // Navigate to Dashboard page
    await page.goto('/dashboard');
    
    // Verify page loaded correctly
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome back! Here\'s what\'s happening with your books.')).toBeVisible();
    
    // Verify main dashboard cards are present
    await expect(page.locator('h3').filter({ hasText: 'My Books' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Incoming Requests' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'My Requests' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Discover Books' })).toBeVisible();
    
    // Verify statistics show numbers
    const bookCount = await page.locator('p').filter({ hasText: /^\d+$/ }).first();
    await expect(bookCount).toBeVisible();
    
    // Verify quick action buttons are present
    await expect(page.getByRole('button', { name: 'View All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Book' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'View Requests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Browse Books' })).toBeVisible();
    
    // Verify "Recently Added Books" section
    await expect(page.locator('h2').filter({ hasText: 'Recently Added Books' })).toBeVisible();
    
    // Verify "Recent Activity" section
    await expect(page.locator('h2').filter({ hasText: 'Recent Activity' })).toBeVisible();
  });
});

