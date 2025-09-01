import { Page, Locator } from 'playwright';
import { BasePage } from './BasePage';

export abstract class BaseTable extends BasePage {
  protected tableSelector: string;
  protected rowSelector: string;
  protected headerSelector: string;
  protected cellSelector: string;

  constructor(page: Page, tableSelector: string) {
    super(page);
    this.tableSelector = tableSelector;
    this.rowSelector = `${tableSelector} tbody tr`;
    this.headerSelector = `${tableSelector} thead th`;
    this.cellSelector = `${tableSelector} tbody td`;
  }

  // Basic table information
  async getRowCount(): Promise<number> {
    await this.waitForSelector(this.tableSelector);
    return await this.page.locator(this.rowSelector).count();
  }

  async getColumnCount(): Promise<number> {
    await this.waitForSelector(this.tableSelector);
    return await this.page.locator(this.headerSelector).count();
  }

  async getHeaderTexts(): Promise<string[]> {
    const headers = this.page.locator(this.headerSelector);
    const count = await headers.count();
    
    const headerTexts: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      headerTexts.push(text || '');
    }
    
    return headerTexts;
  }

  // Row operations
  async getRowData(rowIndex: number): Promise<string[]> {
    const row = this.page.locator(this.rowSelector).nth(rowIndex);
    const cells = row.locator('td');
    const cellCount = await cells.count();
    
    const data: string[] = [];
    for (let i = 0; i < cellCount; i++) {
      const text = await cells.nth(i).textContent();
      data.push(text?.trim() || '');
    }
    
    return data;
  }

  async getAllRowsData(): Promise<string[][]> {
    const rowCount = await this.getRowCount();
    const allData: string[][] = [];
    
    for (let i = 0; i < rowCount; i++) {
      const rowData = await this.getRowData(i);
      allData.push(rowData);
    }
    
    return allData;
  }

  async getCellData(rowIndex: number, columnIndex: number): Promise<string> {
    const cell = this.page.locator(this.rowSelector).nth(rowIndex).locator('td').nth(columnIndex);
    const text = await cell.textContent();
    return text?.trim() || '';
  }

  async getCellDataByHeader(rowIndex: number, headerName: string): Promise<string> {
    const headers = await this.getHeaderTexts();
    const columnIndex = headers.indexOf(headerName);
    
    if (columnIndex === -1) {
      throw new Error(`Header "${headerName}" not found in table`);
    }
    
    return await this.getCellData(rowIndex, columnIndex);
  }

  // Row selection
  async selectRow(rowIndex: number): Promise<void> {
    const checkbox = this.page.locator(`${this.rowSelector}:nth-child(${rowIndex + 1}) input[type="checkbox"]`);
    await checkbox.check();
  }

  async unselectRow(rowIndex: number): Promise<void> {
    const checkbox = this.page.locator(`${this.rowSelector}:nth-child(${rowIndex + 1}) input[type="checkbox"]`);
    await checkbox.uncheck();
  }

  async selectAllRows(): Promise<void> {
    const selectAllCheckbox = this.page.locator('[data-testid="select-all-rows"]');
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.check();
    } else {
      // Fallback: select each row individually
      const rowCount = await this.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        await this.selectRow(i);
      }
    }
  }

  async unselectAllRows(): Promise<void> {
    const selectAllCheckbox = this.page.locator('[data-testid="select-all-rows"]');
    if (await selectAllCheckbox.isVisible()) {
      await selectAllCheckbox.uncheck();
    } else {
      // Fallback: unselect each row individually
      const rowCount = await this.getRowCount();
      for (let i = 0; i < rowCount; i++) {
        await this.unselectRow(i);
      }
    }
  }

  async getSelectedRowCount(): Promise<number> {
    const selectedCheckboxes = this.page.locator(`${this.rowSelector} input[type="checkbox"]:checked`);
    return await selectedCheckboxes.count();
  }

  async getSelectedRowIndices(): Promise<number[]> {
    const allRows = this.page.locator(this.rowSelector);
    const rowCount = await allRows.count();
    const selectedIndices: number[] = [];
    
    for (let i = 0; i < rowCount; i++) {
      const checkbox = allRows.nth(i).locator('input[type="checkbox"]');
      if (await checkbox.isChecked()) {
        selectedIndices.push(i);
      }
    }
    
    return selectedIndices;
  }

  // Search and filtering
  async searchTable(query: string): Promise<void> {
    const searchInput = this.page.locator('[data-testid="table-search"]');
    await searchInput.fill(query);
    
    // Wait for search results to update
    await this.page.waitForTimeout(500);
    await this.waitForTableUpdate();
  }

  async clearSearch(): Promise<void> {
    const searchInput = this.page.locator('[data-testid="table-search"]');
    await searchInput.clear();
    await this.page.waitForTimeout(500);
    await this.waitForTableUpdate();
  }

  async filterByStatus(status: string): Promise<void> {
    const statusFilter = this.page.locator('[data-testid="status-filter"]');
    await statusFilter.selectOption(status);
    await this.waitForTableUpdate();
  }

  async applyFilter(filterType: string, value: string): Promise<void> {
    const filterElement = this.page.locator(`[data-testid="${filterType}-filter"]`);
    
    if (await filterElement.getAttribute('type') === 'select-one') {
      await filterElement.selectOption(value);
    } else {
      await filterElement.fill(value);
    }
    
    await this.waitForTableUpdate();
  }

  async clearAllFilters(): Promise<void> {
    const clearButton = this.page.locator('[data-testid="clear-filters"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    } else {
      // Fallback: clear individual filters
      const searchInput = this.page.locator('[data-testid="table-search"]');
      if (await searchInput.isVisible()) {
        await searchInput.clear();
      }
      
      const statusFilter = this.page.locator('[data-testid="status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption('all');
      }
    }
    
    await this.waitForTableUpdate();
  }

  // Sorting
  async sortByColumn(columnIndex: number): Promise<void> {
    const header = this.page.locator(this.headerSelector).nth(columnIndex);
    await header.click();
    await this.waitForTableUpdate();
  }

  async sortByColumnName(columnName: string): Promise<void> {
    const headers = await this.getHeaderTexts();
    const columnIndex = headers.indexOf(columnName);
    
    if (columnIndex === -1) {
      throw new Error(`Column "${columnName}" not found in table`);
    }
    
    await this.sortByColumn(columnIndex);
  }

  async getSortDirection(columnIndex: number): Promise<'asc' | 'desc' | 'none'> {
    const header = this.page.locator(this.headerSelector).nth(columnIndex);
    const sortAttribute = await header.getAttribute('aria-sort');
    
    switch (sortAttribute) {
      case 'ascending':
        return 'asc';
      case 'descending':
        return 'desc';
      default:
        return 'none';
    }
  }

  // Pagination
  async goToNextPage(): Promise<void> {
    const nextButton = this.page.locator('[data-testid="pagination-next"]');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await this.waitForTableUpdate();
    }
  }

  async goToPreviousPage(): Promise<void> {
    const prevButton = this.page.locator('[data-testid="pagination-prev"]');
    if (await prevButton.isEnabled()) {
      await prevButton.click();
      await this.waitForTableUpdate();
    }
  }

  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.page.locator(`[data-testid="pagination-page-${pageNumber}"]`);
    if (await pageButton.isVisible()) {
      await pageButton.click();
      await this.waitForTableUpdate();
    }
  }

  async getCurrentPage(): Promise<number> {
    const currentPageElement = this.page.locator('[data-testid="pagination-current-page"]');
    if (await currentPageElement.isVisible()) {
      const pageText = await currentPageElement.textContent();
      return parseInt(pageText || '1');
    }
    return 1;
  }

  async getTotalPages(): Promise<number> {
    const totalPagesElement = this.page.locator('[data-testid="pagination-total-pages"]');
    if (await totalPagesElement.isVisible()) {
      const totalText = await totalPagesElement.textContent();
      return parseInt(totalText || '1');
    }
    return 1;
  }

  async changePageSize(size: number): Promise<void> {
    const pageSizeSelect = this.page.locator('[data-testid="page-size-select"]');
    if (await pageSizeSelect.isVisible()) {
      await pageSizeSelect.selectOption(size.toString());
      await this.waitForTableUpdate();
    }
  }

  // Row actions
  async clickRowAction(rowIndex: number, actionName: string): Promise<void> {
    const actionButton = this.page.locator(`${this.rowSelector}:nth-child(${rowIndex + 1}) [data-testid="action-${actionName}"]`);
    await actionButton.click();
  }

  async openRowMenu(rowIndex: number): Promise<void> {
    const menuButton = this.page.locator(`${this.rowSelector}:nth-child(${rowIndex + 1}) [data-testid="row-menu"]`);
    await menuButton.click();
  }

  async clickRowMenuItem(rowIndex: number, menuItem: string): Promise<void> {
    await this.openRowMenu(rowIndex);
    const menuItemElement = this.page.locator(`[data-testid="menu-item-${menuItem}"]`);
    await menuItemElement.click();
  }

  // Table state management
  async waitForTableUpdate(timeout: number = 5000): Promise<void> {
    // Wait for loading indicator to disappear
    try {
      await this.page.waitForSelector('[data-testid="table-loading"]', { 
        state: 'hidden', 
        timeout: timeout 
      });
    } catch (error) {
      // No loading indicator found, continue
    }
    
    // Additional wait for table content to stabilize
    await this.page.waitForTimeout(300);
  }

  async refreshTable(): Promise<void> {
    const refreshButton = this.page.locator('[data-testid="refresh-table"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await this.waitForTableUpdate();
    }
  }

  // Validation methods
  async expectRowCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getRowCount();
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} rows, but found ${actualCount}`);
    }
  }

  async expectCellText(rowIndex: number, columnIndex: number, expectedText: string): Promise<void> {
    const actualText = await this.getCellData(rowIndex, columnIndex);
    if (actualText !== expectedText) {
      throw new Error(`Expected cell text "${expectedText}", but found "${actualText}"`);
    }
  }

  async expectRowData(rowIndex: number, expectedData: string[]): Promise<void> {
    const actualData = await this.getRowData(rowIndex);
    
    if (actualData.length !== expectedData.length) {
      throw new Error(`Expected ${expectedData.length} columns, but found ${actualData.length}`);
    }
    
    for (let i = 0; i < expectedData.length; i++) {
      if (actualData[i] !== expectedData[i]) {
        throw new Error(`Expected column ${i} to be "${expectedData[i]}", but found "${actualData[i]}"`);
      }
    }
  }

  // Performance testing
  async measureTableLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForTableUpdate();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measureSearchTime(query: string): Promise<number> {
    const startTime = Date.now();
    await this.searchTable(query);
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measureSortTime(columnIndex: number): Promise<number> {
    const startTime = Date.now();
    await this.sortByColumn(columnIndex);
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Utility methods
  async isTableEmpty(): Promise<boolean> {
    const rowCount = await this.getRowCount();
    return rowCount === 0;
  }

  async hasNoResultsMessage(): Promise<boolean> {
    const noResultsElement = this.page.locator('[data-testid="no-results"]');
    return await noResultsElement.isVisible();
  }

  async takeTableScreenshot(name: string): Promise<string> {
    return await this.takeElementScreenshot(this.tableSelector, `table-${name}`);
  }

  async exportTable(format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<void> {
    const exportButton = this.page.locator(`[data-testid="export-${format}"]`);
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Wait for download to start
      await this.page.waitForTimeout(2000);
    } else {
      throw new Error(`Export button for format "${format}" not found`);
    }
  }
}