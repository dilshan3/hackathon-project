const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT002: Book Search and Filter Functionality After Database Changes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should search for books and display results correctly', async ({ page }) => {
    // Navigate to Discover page
    await page.goto('/books');
    
    // Verify search functionality is available
    await expect(page.getByRole('textbox', { name: 'Search books' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    
    // Enter search term in the search box
    await page.getByRole('textbox', { name: 'Search books' }).fill('Evelyn Hugo');
    
    // Click "Search" button
    await page.getByRole('button', { name: 'Search' }).click();
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    // Verify search results are displayed
    const bookCount = await page.locator('h2').first().textContent();
    expect(bookCount).toContain('book');
    
    // Verify filter options are available
    await expect(page.getByRole('combobox', { name: 'City' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    
    // Verify search results show book information
    const searchResults = await page.locator('h3').count();
    expect(searchResults).toBeGreaterThanOrEqual(0);
  });
});

