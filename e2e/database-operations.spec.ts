import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe.serial('KeeWeb Database Operations', () => {
    test('should create a new KeePass database', async ({ page }) => {
        await page.goto('http://localhost:8086');

        // Wait for the open screen to fully load
        await page.waitForSelector('#open__icon-new', { state: 'visible', timeout: 30000 });

        // Verify the "New" button is present
        const newButton = page.locator('#open__icon-new');
        await expect(newButton).toBeVisible();
        await expect(newButton.locator('.open__icon-text')).toHaveText('New');

        // Click the "New" button to create a new database
        await newButton.click();

        // The open screen should disappear and the main app should show
        await page.waitForSelector('.open', { state: 'hidden', timeout: 15000 });

        // Verify the main app UI is now visible (menu, list, details)
        const appBody = page.locator('.app__body');
        await expect(appBody).toBeVisible();

        // The database was created - verify the "Empty" heading is shown for the newly created empty database
        await expect(page.getByRole('heading', { name: 'Empty' })).toBeVisible();
    });

    test('should open an existing KeePass database', async ({ page }) => {
        await page.goto('http://localhost:8086');

        // Wait for the open screen to fully load
        await page.waitForSelector('#open__icon-new', { state: 'visible', timeout: 30000 });

        // Click the Open icon to trigger file selection mode
        const openIcon = page.locator('#open__icon-open');
        await openIcon.click();

        // Upload the test database file via the file input
        const fileInput = page.locator('.open__file-ctrl');
        await fileInput.setInputFiles(
            path.join(__dirname, 'fixtures', 'test-database.kdbx')
        );

        // Wait for the file to be processed - the open view gets class 'open--file'
        await expect(page.locator('.open--file')).toBeVisible({ timeout: 10000 });

        // Dismiss the "Local file" warning modal if it appears
        const okButton = page.locator('.modal__buttons button[data-result="ok"]');
        if (await okButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await okButton.click();
        }

        // The password input should now be editable
        const passInput = page.locator('.open__pass-input');
        await expect(passInput).toBeEditable({ timeout: 5000 });

        // Enter the password for the test database
        await passInput.fill('test123');

        // Click the enter button to open the database
        const enterBtn = page.locator('.open__pass-enter-btn');
        await enterBtn.click();

        // The open screen should disappear and the main app should show
        await page.waitForSelector('.open', { state: 'hidden', timeout: 15000 });

        // Verify the main app UI is now visible
        const appBody = page.locator('.app__body');
        await expect(appBody).toBeVisible();

        // The database should contain the test entry we created
        await expect(page.getByRole('heading', { name: 'TestEntry' })).toBeVisible({ timeout: 10000 });
    });
});
