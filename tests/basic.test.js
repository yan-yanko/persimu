const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');
    
    // Check if the page loaded successfully
    expect(await page.title()).toBe('Persimu - Dashboard');
    
    // Check if main elements are present
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.main-content')).toBeVisible();
    
    // Try to start a simulation
    const startButton = page.locator('.simulation-type-card:first-child .start-btn');
    await startButton.click();
    
    // Wait for navigation
    await page.waitForURL(/.*simulation.html/);
    
    // Wait for simulation type to be set in URL
    await page.waitForFunction(() => {
        const params = new URLSearchParams(window.location.search);
        return params.has('type');
    });
    
    // Wait for loading to complete
    await page.waitForFunction(() => {
        const title = document.getElementById('simulationTitle');
        const description = document.getElementById('simulationDescription');
        return title && description && 
               title.textContent !== 'Loading...' && 
               description.textContent !== 'Preparing simulation environment...';
    }, { timeout: 15000 });
    
    // Try to send a message
    await page.fill('#messageInput', 'Hello');
    await page.click('#sendButton');
    
    // Check if the message appears in the chat
    await expect(page.locator('.user-message')).toContainText('Hello');
}); 