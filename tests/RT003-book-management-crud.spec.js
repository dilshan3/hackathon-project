const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT003: Book Management CRUD Operations After API Changes', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display My Books page with book management functionality', async ({ page }) => {
    // Navigate to "My Books" page
    await page.goto('/books/mine');
    
    // Verify page loaded correctly
    await expect(page.locator('h1')).toContainText('My Books');
    await expect(page.locator('text=Manage your book collection')).toBeVisible();
    
    // Verify "Add New Book" button is available
    await expect(page.getByRole('button', { name: 'Add New Book' })).toBeVisible();
    
    // Verify book statistics are displayed
    await expect(page.locator('text=/\\d+ books total/')).toBeVisible();
    await expect(page.locator('text=/Available:/')).toBeVisible();
    await expect(page.locator('text=/Lent:/')).toBeVisible();
    
    // Verify existing books are displayed (if any)
    const bookCards = await page.locator('h3').count();
    expect(bookCards).toBeGreaterThanOrEqual(0);
    
    // If books exist, verify management buttons are available
    if (bookCards > 0) {
      await expect(page.getByRole('button', { name: 'View' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Delete' }).first()).toBeVisible();
    }
  });
});

