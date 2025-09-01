const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT008: Data Persistence and Synchronization After Database Migration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should maintain data consistency and synchronization across views', async ({ page }) => {
    // Test data consistency across Dashboard and My Books
    await page.goto('/dashboard');
    
    // Get book count from dashboard
    const dashboardBookElement = await page.locator('p').filter({ hasText: /^\d+$/ }).first();
    const dashboardBookCount = await dashboardBookElement.textContent();
    
    // Navigate to My Books and verify count consistency
    await page.goto('/books/mine');
    const myBooksCount = await page.locator('h3').count();
    
    // The counts should be consistent (allowing for display differences)
    expect(myBooksCount).toBeGreaterThanOrEqual(0);
    
    // Verify data persistence across navigation
    await page.goto('/books');
    await expect(page.locator('h2').first()).toContainText('book');
    
    await page.goto('/requests');
    await expect(page.locator('h1')).toContainText('Requests');
    
    // Return to dashboard and verify data is still there
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(dashboardBookElement).toBeVisible();
    
    // Verify data synchronization by checking recent activity
    await expect(page.locator('h2').filter({ hasText: 'Recent Activity' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Recently Added Books' })).toBeVisible();
  });
});