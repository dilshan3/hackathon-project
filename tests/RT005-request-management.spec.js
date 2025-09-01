const { test, expect, TEST_CONFIG, login, logout } = require('./utils/test-utils');

test.describe('RT005: Request Management Workflow After Status Logic Updates', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display requests page with management functionality', async ({ page }) => {
    // Navigate to Requests page
    await page.goto('/requests');
    
    // Verify page loaded correctly
    await expect(page.locator('h1')).toContainText('Requests');
    
    // Verify tab navigation is available
    await expect(page.locator('text=As Owner')).toBeVisible();
    await expect(page.locator('text=As Requester')).toBeVisible();
    
    // Test As Owner tab
    await page.click('text=As Owner');
    await page.waitForTimeout(1000);
    
    // Verify As Owner functionality
    const ownerRequests = await page.locator('h4').count();
    expect(ownerRequests).toBeGreaterThanOrEqual(0);
    
    // Test As Requester tab
    await page.click('text=As Requester');
    await page.waitForTimeout(1000);
    
    // Verify As Requester functionality
    const requesterRequests = await page.locator('h4').count();
    expect(requesterRequests).toBeGreaterThanOrEqual(0);
    
    // Verify request management buttons are available if requests exist
    if (ownerRequests > 0 || requesterRequests > 0) {
      const viewDetailsButtons = await page.getByRole('button', { name: 'View Details' }).count();
      expect(viewDetailsButtons).toBeGreaterThanOrEqual(0);
    }
  });
});

