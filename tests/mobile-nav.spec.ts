import { test, expect } from '@playwright/test';

test('Mobile profile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // Emulate a mobile device
  // Go to the page to have a context for localStorage
  await page.goto('http://localhost:5173');

  // Set mock authentication state in localStorage
  await page.evaluate(() => {
    const user = {
      id: 1,
      email: 'test.user@example.com',
      firstName: 'Test',
      lastName: 'User',
      profileImageUrl: 'https://ui-avatars.com/api/?name=Test+User'
    };
    localStorage.setItem('authToken', 'mock-auth-token-for-testing');
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('mockAuth', JSON.stringify({ user }));
  });

  // Now, with the user authenticated, click the profile link
  await page.locator('nav.mobile-nav').getByRole('link', { name: 'Perfil' }).click();
  await expect(page).toHaveURL(/cuenta/);
  await expect(page.getByText('Cuenta')).toBeVisible();
});
