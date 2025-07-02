import { test, expect } from '@playwright/test';

test.describe('Purchase Request Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the PR details page before each test
    await page.goto('/(main)/procurement/purchase-requests/123');
  });

  test('should display the PR details page', async ({ page }) => {
    // Check that the main heading is visible
    await expect(page.getByRole('heading', { name: /Purchase Request Details/i })).toBeVisible();

    // Check that the tabs are visible
    await expect(page.getByRole('tab', { name: /Items/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Budgets/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Workflow/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Attachments/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Activity/i })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on the 'Budgets' tab and verify that the content is displayed
    await page.getByRole('tab', { name: /Budgets/i }).click();
    await expect(page.getByText(/Budget Information/i)).toBeVisible();

    // Click on the 'Workflow' tab and verify that the content is displayed
    await page.getByRole('tab', { name: /Workflow/i }).click();
    await expect(page.getByText(/Workflow Status/i)).toBeVisible();
  });

  test('should open the item details dialog', async ({ page }) => {
    // Click the 'Details' button on the first item card
    await page.getByRole('button', { name: /Details/i }).first().click();

    // Check that the dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Item Details/i })).toBeVisible();
  });

  test('should expand and collapse the item details', async ({ page }) => {
    // Click the chevron button to expand the first item card
    await page.getByRole('button', { name: /ChevronDown/i }).first().click();

    // Check that the additional details are visible
    await expect(page.getByText(/Additional Details/i)).toBeVisible();

    // Click the chevron button again to collapse the card
    await page.getByRole('button', { name: /ChevronUp/i }).first().click();

    // Check that the additional details are hidden
    await expect(page.getByText(/Additional Details/i)).not.toBeVisible();
  });

  test('should open the add item dialog', async ({ page }) => {
    // Click the 'Add Item' button
    await page.getByRole('button', { name: /Add Item/i }).click();

    // Check that the dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Add New Item/i })).toBeVisible();
  });
});
