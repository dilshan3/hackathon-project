const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'https://frontend-ten-topaz-ykmk7ren3l.vercel.app',
  credentials: {
    email: 'johndoe@email.com',
    password: 'Test@1234'
  },
  testData: {
    newBook: {
      title: 'Regression Test Book',
      author: 'Test Author',
      genre: 'Test Genre',
      condition: 'Good',
      status: 'Available'
    }
  }
};

// Helper functions
async function login(page) {
  await page.goto('/');
  await page.locator('mat-toolbar').getByRole('link', { name: 'Log In' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(TEST_CONFIG.credentials.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(TEST_CONFIG.credentials.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('**/books');
}

async function logout(page) {
  await page.getByRole('button', { name: 'J' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
}

module.exports = { test, expect, TEST_CONFIG, login, logout };

