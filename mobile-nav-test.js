const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://dealradarus.com');
  });

  test('Mobile menu initial state', async ({ page }) => {
    // Hamburger should be visible
    const hamburger = page.locator('.hamburger');
    await expect(hamburger).toBeVisible();
    
    // Menu should be hidden initially
    const nav = page.locator('.nav-menu');
    await expect(nav).not.toHaveClass(/active/);
    
    // aria-expanded should be false
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    
    // Body overflow should be normal
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('visible');
    
    await page.screenshot({ path: 'mobile-nav-closed.png' });
  });

  test('Mobile menu opens correctly', async ({ page }) => {
    const hamburger = page.locator('.hamburger');
    const nav = page.locator('.nav-menu');
    
    // Click hamburger
    await hamburger.click();
    
    // Menu should be active
    await expect(nav).toHaveClass(/active/);
    await expect(hamburger).toHaveClass(/active/);
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    
    // Menu should be visible (display: flex)
    const menuDisplay = await nav.evaluate(el => getComputedStyle(el).display);
    expect(menuDisplay).toBe('flex');
    
    // Body overflow should be hidden (scroll lock)
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('hidden');
    
    // First nav link should be focused
    const firstLink = nav.locator('.nav-link').first();
    await expect(firstLink).toBeFocused();
    
    // Menu items should be visible
    const menuItems = ['Home', 'Deals', 'Blog', 'About', 'Contact'];
    for (const item of menuItems) {
      await expect(page.locator('.nav-link', { hasText: item })).toBeVisible();
    }
    
    await page.screenshot({ path: 'mobile-nav-open.png' });
  });

  test('Mobile menu closes on ESC key', async ({ page }) => {
    const hamburger = page.locator('.hamburger');
    const nav = page.locator('.nav-menu');
    
    // Open menu
    await hamburger.click();
    await expect(nav).toHaveClass(/active/);
    
    // Press ESC
    await page.keyboard.press('Escape');
    
    // Menu should close
    await expect(nav).not.toHaveClass(/active/);
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    
    // Focus should return to hamburger
    await expect(hamburger).toBeFocused();
    
    // Body overflow should be restored
    const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow);
    expect(bodyOverflow).toBe('visible');
  });

  test('Mobile menu closes on outside click', async ({ page }) => {
    const hamburger = page.locator('.hamburger');
    const nav = page.locator('.nav-menu');
    
    // Open menu
    await hamburger.click();
    await expect(nav).toHaveClass(/active/);
    
    // Click outside menu (on main content)
    await page.locator('main').click();
    
    // Menu should close
    await expect(nav).not.toHaveClass(/active/);
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    
    // Focus should return to hamburger
    await expect(hamburger).toBeFocused();
  });

  test('Mobile menu closes on menu item click', async ({ page }) => {
    const hamburger = page.locator('.hamburger');
    const nav = page.locator('.nav-menu');
    
    // Open menu
    await hamburger.click();
    await expect(nav).toHaveClass(/active/);
    
    // Click on About menu item (should close menu but prevent navigation for test)
    await page.locator('.nav-link[href*="about"]').click();
    
    // Menu should close
    await expect(nav).not.toHaveClass(/active/);
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('Hamburger button has proper touch target', async ({ page }) => {
    const hamburger = page.locator('.hamburger');
    
    // Check minimum 44x44px touch target
    const box = await hamburger.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('GA4 events are tracked', async ({ page }) => {
    let gtagCalls = [];
    
    // Intercept gtag calls
    await page.addInitScript(() => {
      window.gtagCalls = [];
      const originalGtag = window.gtag;
      window.gtag = function(...args) {
        window.gtagCalls.push(args);
        if (originalGtag) originalGtag.apply(this, args);
      };
    });
    
    const hamburger = page.locator('.hamburger');
    
    // Open menu
    await hamburger.click();
    
    // Check GA4 event was fired
    const openEvent = await page.evaluate(() => 
      window.gtagCalls.find(call => call[0] === 'event' && call[1] === 'nav_menu_open')
    );
    expect(openEvent).toBeTruthy();
    
    // Close menu
    await page.keyboard.press('Escape');
    
    // Check GA4 close event was fired
    const closeEvent = await page.evaluate(() => 
      window.gtagCalls.find(call => call[0] === 'event' && call[1] === 'nav_menu_close')
    );
    expect(closeEvent).toBeTruthy();
  });

  test('No JavaScript errors in console', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with menu
    const hamburger = page.locator('.hamburger');
    await hamburger.click();
    await page.keyboard.press('Escape');
    
    // Should have no console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('CSS computed styles verification', async ({ page }) => {
    const hamburger = page.locator('.hamburger');
    const nav = page.locator('.nav-menu');
    
    // Initial state - menu hidden
    let navDisplay = await nav.evaluate(el => getComputedStyle(el).display);
    expect(navDisplay).toBe('none');
    
    // Open menu
    await hamburger.click();
    
    // Active state - menu visible
    navDisplay = await nav.evaluate(el => getComputedStyle(el).display);
    expect(navDisplay).toBe('flex');
    
    const navPosition = await nav.evaluate(el => getComputedStyle(el).position);
    expect(navPosition).toBe('absolute');
    
    const navZIndex = await nav.evaluate(el => getComputedStyle(el).zIndex);
    expect(parseInt(navZIndex)).toBeGreaterThanOrEqual(1000);
  });

  test('Desktop menu not affected', async ({ page }) => {
    // Change to desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.reload();
    
    // Hamburger should be hidden on desktop
    const hamburger = page.locator('.hamburger');
    const hamburgerDisplay = await hamburger.evaluate(el => getComputedStyle(el).display);
    expect(hamburgerDisplay).toBe('none');
    
    // Desktop nav should be visible
    const nav = page.locator('.nav-menu');
    const navDisplay = await nav.evaluate(el => getComputedStyle(el).display);
    expect(navDisplay).not.toBe('none');
  });

});