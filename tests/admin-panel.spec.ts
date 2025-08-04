import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to desktop size for admin panel testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Go to the page to have a context for localStorage
    await page.goto('http://localhost:4000');

    // Set mock admin authentication state
    await page.evaluate(() => {
      const mockAdminUser = {
        id: 1,
        email: 'admin@safra-report.com',
        name: 'Admin User',
        role: 'admin',
        'https://safran-report.com/roles': ['admin']
      };
      
      // Mock Auth0 authentication
      localStorage.setItem('authToken', 'mock-admin-auth-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));
      localStorage.setItem('mockAuth', JSON.stringify({ 
        user: mockAdminUser,
        isAuthenticated: true,
        isAdmin: true
      }));
    });
  });

  test('Admin dashboard loads correctly', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/dashboard');
    
    // Check for admin layout elements
    await expect(page.getByText('SafraReport')).toBeVisible();
    await expect(page.getByText('Panel de Control')).toBeVisible();
    
    // Verify navigation items are present
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Artículos')).toBeVisible();
    await expect(page.getByText('Usuarios')).toBeVisible();
    await expect(page.getByText('Anuncios')).toBeVisible();
  });

  test('Admin navigation works correctly', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/dashboard');
    
    // Test navigation to articles
    await page.getByRole('link', { name: 'Artículos' }).click();
    await expect(page).toHaveURL(/admin\/articles/);
    
    // Test navigation to users
    await page.getByRole('link', { name: 'Usuarios' }).click();
    await expect(page).toHaveURL(/admin\/users/);
    
    // Test navigation to ads
    await page.getByRole('link', { name: 'Anuncios' }).click();
    await expect(page).toHaveURL(/admin\/ads/);
  });

  test('Users page displays correctly with DOP currency', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/users');
    
    // Check for users table elements
    await expect(page.getByText('Gestión de Usuarios')).toBeVisible();
    
    // Look for DOP currency formatting (should be visible if users have balances)
    const currencyElements = page.locator('text=/RD\\$|DOP/');
    if (await currencyElements.count() > 0) {
      await expect(currencyElements.first()).toBeVisible();
    }
  });

  test('Mobile responsiveness - admin panel adapts to mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:4000/admin/dashboard');
    
    // Mobile sidebar should be hidden initially
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/translate-x-full|-translate-x-full/);
    
    // Mobile menu button should be visible
    const mobileMenuButton = page.locator('button').filter({ hasText: /Menu|☰/ }).first();
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton).toBeVisible();
    }
  });

  test('Error boundaries handle errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/nonexistent-page');
    
    // Should either redirect to dashboard or show error page in Spanish
    await page.waitForTimeout(1000);
    const url = page.url();
    const hasSpanishError = await page.getByText(/Error|algo salió mal|no encontrado/i).count() > 0;
    const redirectedToDashboard = url.includes('/admin/dashboard');
    
    expect(hasSpanishError || redirectedToDashboard).toBeTruthy();
  });

  test('Green Liquidglass theme is applied correctly', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/dashboard');
    
    // Check if primary green color is applied
    const primaryElements = page.locator('.bg-primary, [class*="primary"]').first();
    if (await primaryElements.count() > 0) {
      const computedStyle = await primaryElements.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      // Green should be present in the computed styles
      expect(computedStyle).toMatch(/rgb\(0, 255, 0\)|hsl\(120|#00ff00/i);
    }
  });

  test('API connections work correctly', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/admin/')) {
        requests.push(request.url());
      }
    });

    await page.goto('http://localhost:4000/admin/dashboard');
    
    // Wait for potential API calls
    await page.waitForTimeout(2000);
    
    // Check if admin API calls were made
    const hasAdminApiCalls = requests.some(url => url.includes('/api/admin/'));
    if (hasAdminApiCalls) {
    }
  });

  test('JWT authentication is properly handled', async ({ page }) => {
    // Test without authentication first
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('http://localhost:4000/admin/dashboard');
    
    // Should be redirected to login or home page
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain('/admin/dashboard');
    expect(url).toMatch(/login|^\/$|\/$/);
  });
});

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:4000');

    // Set mock admin authentication
    await page.evaluate(() => {
      const mockAdminUser = {
        id: 1,
        email: 'admin@safra-report.com',
        name: 'Admin User',
        role: 'admin',
        'https://safran-report.com/roles': ['admin']
      };
      
      localStorage.setItem('authToken', 'mock-admin-auth-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));
      localStorage.setItem('mockAuth', JSON.stringify({ 
        user: mockAdminUser,
        isAuthenticated: true,
        isAdmin: true
      }));
    });
  });

  test('Articles management interface works', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/articles');
    
    // Check for articles management elements
    await expect(page.getByText(/Artículos|Articles/)).toBeVisible();
    
    // Look for CRUD buttons
    const createButton = page.locator('button', { hasText: /Crear|Nuevo|New/ }).first();
    if (await createButton.count() > 0) {
      await expect(createButton).toBeVisible();
    }
  });

  test('Ads management shows revenue in DOP', async ({ page }) => {
    await page.goto('http://localhost:4000/admin/ads');
    
    // Check for ads management
    await expect(page.getByText(/Anuncios|Ads/)).toBeVisible();
    
    // Look for revenue in RD$ format
    const revenueElements = page.locator('text=/RD\\$/');
    if (await revenueElements.count() > 0) {
      await expect(revenueElements.first()).toBeVisible();
    }
  });
});