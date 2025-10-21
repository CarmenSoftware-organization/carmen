# Screenshot Capture Guide - Inventory Management Module

## Overview
This guide outlines the systematic process for capturing screenshots of all Inventory Management module pages and components.

## Prerequisites
1. Development server running (`npm run dev`)
2. Navigate to `http://localhost:3000`
3. Login with appropriate user credentials
4. Browser DevTools open (F12)

## Screenshot Naming Convention
Format: `{module}-{page}-{component}-{state}.png`

Example: `inv-stock-overview-summary-cards.png`

## Pages to Capture

### 1. Main Dashboard
**Route:** `/inventory-management`

**Screenshots needed:**
1. `inv-dashboard-full-view.png` - Full page view
2. `inv-dashboard-inventory-levels-widget.png` - Inventory levels bar chart
3. `inv-dashboard-value-trend-widget.png` - Value trend line chart
4. `inv-dashboard-turnover-widget.png` - Turnover pie chart
5. `inv-dashboard-alerts-widgets.png` - Low stock, upcoming counts, recent transfers cards
6. `inv-dashboard-drag-drop-demo.png` - During widget drag operation

**Browser console commands:**
```javascript
// Capture full page
await page.screenshot({ path: 'inv-dashboard-full-view.png', fullPage: true });

// Capture specific widget (use selector)
const widget = await page.$('.inventory-levels-widget');
await widget.screenshot({ path: 'inv-dashboard-inventory-levels-widget.png' });
```

---

### 2. Stock Overview
**Route:** `/inventory-management/stock-overview`

#### 2.1 Main Overview Page
**Screenshots needed:**
1. `inv-stock-overview-header.png` - Header with location selector
2. `inv-stock-overview-summary-cards.png` - All 4 summary cards
3. `inv-stock-overview-tab-overview.png` - Overview tab with charts
4. `inv-stock-overview-stock-distribution-chart.png` - Stock distribution bar chart
5. `inv-stock-overview-value-distribution-chart.png` - Value distribution pie chart
6. `inv-stock-overview-quick-actions.png` - Quick actions grid
7. `inv-stock-overview-tab-performance.png` - Performance tab
8. `inv-stock-overview-performance-chart.png` - Location performance bar chart
9. `inv-stock-overview-performance-table.png` - Performance details table
10. `inv-stock-overview-tab-transfers.png` - Transfer suggestions tab
11. `inv-stock-overview-transfer-suggestions.png` - Transfer suggestion cards
12. `inv-stock-overview-location-filter.png` - With location filter applied

---

#### 2.2 Inventory Balance
**Route:** `/inventory-management/stock-overview/inventory-balance`

**Screenshots needed:**
1. `inv-balance-full-page.png` - Full report view
2. `inv-balance-filter-panel-expanded.png` - Filter panel open
3. `inv-balance-filter-panel-collapsed.png` - Filter panel collapsed
4. `inv-balance-table-category-view.png` - Grouped by category
5. `inv-balance-table-product-view.png` - Product level detail
6. `inv-balance-table-lot-view.png` - With lots expanded
7. `inv-balance-movement-history-panel.png` - Movement history side panel
8. `inv-balance-export-options.png` - Export dropdown menu

**Capture steps:**
```
1. Navigate to page
2. Apply filters (date range, location)
3. Capture full page
4. Expand filter panel → Capture
5. Collapse filter panel → Capture
6. Click on product to show movement history → Capture
7. Click export button → Capture dropdown
```

---

#### 2.3 Stock Cards
**Route:** `/inventory-management/stock-overview/stock-cards`

**Screenshots needed:**
1. `inv-stock-cards-grid-view.png` - Grid layout of cards
2. `inv-stock-cards-search-filter.png` - With filters applied
3. `inv-stock-cards-single-card.png` - Close-up of one card

---

#### 2.4 Stock Card Detail
**Route:** `/inventory-management/stock-overview/stock-card`

**Screenshots needed:**
1. `inv-stock-card-detail-full.png` - Full page view
2. `inv-stock-card-general-info.png` - General information panel
3. `inv-stock-card-lot-info.png` - Lot information table
4. `inv-stock-card-movement-history.png` - Movement history table
5. `inv-stock-card-valuation.png` - Valuation panel
6. `inv-stock-card-quick-filters.png` - Quick filter buttons
7. `inv-stock-card-filtered-movements.png` - After applying filter

---

#### 2.5 Slow Moving
**Route:** `/inventory-management/stock-overview/slow-moving`

**Screenshots needed:**
1. `inv-slow-moving-full-page.png` - Complete page (when implemented)
2. `inv-slow-moving-filters.png` - Filter section
3. `inv-slow-moving-table.png` - Items table with aging data

---

#### 2.6 Inventory Aging
**Route:** `/inventory-management/stock-overview/inventory-aging`

**Screenshots needed:**
1. `inv-aging-full-page.png` - Complete page (when implemented)
2. `inv-aging-summary-cards.png` - Aging summary metrics
3. `inv-aging-buckets-table.png` - Aging buckets table
4. `inv-aging-chart.png` - Visual representation of aging

---

### 3. Stock In
**Route:** `/inventory-management/stock-in`

**Screenshots needed:**
1. `inv-stock-in-list.png` - List of receipts
2. `inv-stock-in-filters.png` - Filter bar active
3. `inv-stock-in-detail.png` - Receipt detail view
4. `inv-stock-in-header-info.png` - Header information section
5. `inv-stock-in-items-table.png` - Items table
6. `inv-stock-in-add-item-modal.png` - Item lookup modal
7. `inv-stock-in-journal-entry.png` - Auto-generated journal entry
8. `inv-stock-in-post-receipt.png` - Post action confirmation

---

### 4. Inventory Adjustments
**Route:** `/inventory-management/inventory-adjustments`

**Screenshots needed:**
1. `inv-adjustments-list.png` - Adjustments list page
2. `inv-adjustments-filters.png` - Filter bar
3. `inv-adjustments-detail-header.png` - Adjustment detail header
4. `inv-adjustments-info-panel.png` - Information panel
5. `inv-adjustments-stock-movement-table.png` - Stock movement items
6. `inv-adjustments-lot-details.png` - Lot details expanded
7. `inv-adjustments-summary-panel.png` - Totals summary
8. `inv-adjustments-journal-tab.png` - Journal entries tab
9. `inv-adjustments-journal-header.png` - Journal header details
10. `inv-adjustments-journal-table.png` - Journal entry lines
11. `inv-adjustments-stock-movement-tab.png` - Stock movement tab
12. `inv-adjustments-create-new.png` - New adjustment form (when implemented)

---

### 5. Physical Count
**Route:** `/inventory-management/physical-count`

#### 5.1 Wizard Steps
**Screenshots needed:**
1. `inv-physical-count-step-1-setup.png` - Setup step
2. `inv-physical-count-step-2-location.png` - Location selection
3. `inv-physical-count-step-3-items.png` - Item review
4. `inv-physical-count-step-4-review.png` - Final review
5. `inv-physical-count-step-indicator.png` - Step indicator close-up
6. `inv-physical-count-wizard-full.png` - Full wizard view

#### 5.2 Active Count
**Route:** `/inventory-management/physical-count/active/[id]`

**Screenshots needed:**
1. `inv-physical-count-active-full.png` - Active count page
2. `inv-physical-count-progress.png` - Progress indicator
3. `inv-physical-count-item-entry.png` - Item entry form
4. `inv-physical-count-variance-highlight.png` - Items with variance

#### 5.3 Dashboard
**Route:** `/inventory-management/physical-count/dashboard`

**Screenshots needed:**
1. `inv-physical-count-dashboard-full.png` - Full dashboard
2. `inv-physical-count-summary-cards.png` - Summary metrics
3. `inv-physical-count-counts-table.png` - Counts table
4. `inv-physical-count-charts.png` - Trend charts

---

### 6. Spot Check
**Route:** `/inventory-management/spot-check`

#### 6.1 Main Page
**Screenshots needed:**
1. `inv-spot-check-list-view.png` - List view
2. `inv-spot-check-grid-view.png` - Grid view
3. `inv-spot-check-filters.png` - Filter bar
4. `inv-spot-check-location-filter-panel.png` - Location filter expanded
5. `inv-spot-check-list-item.png` - Single list item detail
6. `inv-spot-check-grid-card.png` - Single grid card

#### 6.2 New Spot Check
**Route:** `/inventory-management/spot-check/new`

**Screenshots needed:**
1. `inv-spot-check-new-step-1.png` - Setup step
2. `inv-spot-check-new-step-2.png` - Item selection
3. `inv-spot-check-new-random-picker.png` - Random item selection UI
4. `inv-spot-check-new-step-3.png` - Review step

#### 6.3 Active Spot Check
**Route:** `/inventory-management/spot-check/active/[id]`

**Screenshots needed:**
1. `inv-spot-check-active-full.png` - Active check page
2. `inv-spot-check-count-items-form.png` - Item counting form
3. `inv-spot-check-variance-flagged.png` - Variance highlighted

#### 6.4 Completed
**Route:** `/inventory-management/spot-check/completed`

**Screenshots needed:**
1. `inv-spot-check-completed-list.png` - Completed checks list
2. `inv-spot-check-completed-detail.png` - Completed check detail

#### 6.5 Dashboard
**Route:** `/inventory-management/spot-check/dashboard`

**Screenshots needed:**
1. `inv-spot-check-dashboard-full.png` - Full dashboard
2. `inv-spot-check-summary-cards.png` - Summary metrics
3. `inv-spot-check-charts.png` - Accuracy and variance charts
4. `inv-spot-check-recent-table.png` - Recent checks table

---

### 7. Fractional Inventory
**Route:** `/inventory-management/fractional-inventory`

#### 7.1 Inventory Dashboard Tab
**Screenshots needed:**
1. `inv-fractional-dashboard-full.png` - Full dashboard
2. `inv-fractional-summary-cards.png` - Summary cards
3. `inv-fractional-stock-table.png` - Fractional stock table
4. `inv-fractional-filters.png` - Filter options
5. `inv-fractional-quality-grades.png` - Quality grade indicators
6. `inv-fractional-expiry-warning.png` - Expiring items highlighted

#### 7.2 Conversion Modal
**Screenshots needed:**
1. `inv-fractional-conversion-modal-split.png` - Split operation form
2. `inv-fractional-conversion-modal-combine.png` - Combine operation form
3. `inv-fractional-conversion-confirmation.png` - Confirmation screen

#### 7.3 Conversion Tracking Tab
**Screenshots needed:**
1. `inv-fractional-tracking-full.png` - Tracking tab
2. `inv-fractional-tracking-table.png` - Conversions history table
3. `inv-fractional-tracking-filters.png` - Filter options
4. `inv-fractional-tracking-charts.png` - Conversion and waste charts

---

### 8. Period End
**Route:** `/inventory-management/period-end`

**Screenshots needed:**
1. `inv-period-end-list.png` - Period records table
2. `inv-period-end-header.png` - Header with date picker
3. `inv-period-end-status-badges.png` - Different status indicators
4. `inv-period-end-detail.png` - Period detail page (when clicking row)
5. `inv-period-end-checklist.png` - Period end checklist
6. `inv-period-end-reports.png` - Reports section

---

### 9. Physical Count Management
**Route:** `/inventory-management/physical-count-management`

**Screenshots needed:**
1. `inv-count-mgmt-full.png` - Full page view
2. `inv-count-mgmt-list.png` - Counts list
3. `inv-count-mgmt-filters.png` - Filter bar
4. `inv-count-mgmt-count-card.png` - Single count card
5. `inv-count-mgmt-detail-form.png` - Count detail form modal
6. `inv-count-mgmt-progress.png` - Progress indicator

---

## Common Components Screenshots

### Modals and Dialogs
1. `component-location-selection-modal.png`
2. `component-item-lookup-modal.png`
3. `component-lot-entry-modal.png`
4. `component-confirmation-dialog.png`

### Dropdowns
1. `component-department-dropdown.png`
2. `component-location-dropdown.png`
3. `component-reason-dropdown.png`
4. `component-status-dropdown.png`

### Tables
1. `component-grouped-table-collapsed.png`
2. `component-grouped-table-expanded.png`
3. `component-sortable-table.png`
4. `component-paginated-table.png`

### Cards
1. `component-metric-card.png`
2. `component-status-card.png`
3. `component-chart-card.png`

### Charts
1. `component-bar-chart.png`
2. `component-line-chart.png`
3. `component-pie-chart.png`

### Other
1. `component-step-indicator.png`
2. `component-export-button.png`
3. `component-filter-panel.png`
4. `component-search-box.png`

---

## Capture Process

### Using Browser DevTools

```javascript
// Open Console (F12)

// 1. Full page screenshot
document.querySelector('html').requestFullscreen();
// Then use browser screenshot tool (Ctrl+Shift+S in Firefox, Cmd+Shift+P > "screenshot" in Chrome)

// 2. Specific element screenshot (Chrome DevTools)
// Right-click element in Elements tab > "Capture node screenshot"

// 3. Programmatic capture (using Puppeteer or Playwright - see script below)
```

### Using Provided Script

Create and run: `capture-inv-screenshots.js`

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const baseUrl = 'http://localhost:3000';
const outputDir = 'docs/documents/inv/screenshots';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const screenshots = [
  // Dashboard
  { url: '/inventory-management', name: 'inv-dashboard-full-view', fullPage: true },

  // Stock Overview
  { url: '/inventory-management/stock-overview', name: 'inv-stock-overview-full', fullPage: true },

  // ... add all routes
];

async function captureScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  for (const shot of screenshots) {
    try {
      await page.goto(baseUrl + shot.url, { waitUntil: 'networkidle0' });

      // Wait for content to load
      await page.waitForTimeout(2000);

      const screenshotPath = path.join(outputDir, `${shot.name}.png`);

      if (shot.selector) {
        const element = await page.$(shot.selector);
        await element.screenshot({ path: screenshotPath });
      } else {
        await page.screenshot({
          path: screenshotPath,
          fullPage: shot.fullPage || false
        });
      }

      console.log(`✓ Captured: ${shot.name}.png`);
    } catch (error) {
      console.error(`✗ Failed to capture ${shot.name}:`, error.message);
    }
  }

  await browser.close();
  console.log('Screenshot capture complete!');
}

captureScreenshots();
```

---

## Manual Capture Checklist

For each page:
- [ ] Full page view (scrolled to top)
- [ ] With filters applied
- [ ] With modals/dropdowns open
- [ ] Mobile view (375px width)
- [ ] Tablet view (768px width)
- [ ] Error states (if applicable)
- [ ] Empty states (if applicable)
- [ ] Loading states

---

## Image Specifications

- **Format:** PNG
- **Quality:** High (lossless)
- **Desktop Resolution:** 1920x1080
- **Mobile Resolution:** 375x667
- **Tablet Resolution:** 768x1024
- **DPI:** 72 (screen) or 150 (documentation)

---

## File Organization

```
docs/documents/inv/screenshots/
├── dashboard/
│   ├── inv-dashboard-full-view.png
│   ├── inv-dashboard-inventory-levels-widget.png
│   └── ...
├── stock-overview/
│   ├── inv-stock-overview-full.png
│   ├── inv-stock-overview-summary-cards.png
│   └── ...
├── stock-in/
├── inventory-adjustments/
├── physical-count/
├── spot-check/
├── fractional-inventory/
├── period-end/
├── count-management/
└── components/
    ├── modals/
    ├── dropdowns/
    ├── tables/
    └── charts/
```

---

## Post-Capture Tasks

1. Review all screenshots for clarity
2. Crop unnecessary white space
3. Annotate key features (using tool like Snagit or Preview)
4. Add captions/labels if needed
5. Compress images (using TinyPNG or similar)
6. Insert into pages-and-components-spec.md
7. Update README with screenshot locations

---

## Integration with Documentation

Add screenshots to spec document using:

```markdown
### Screenshot: Dashboard Full View
![Dashboard](./screenshots/dashboard/inv-dashboard-full-view.png)
*Figure 1: Main Inventory Management Dashboard with draggable widgets*
```

---

## Notes

- Capture in light mode (default theme)
- Use consistent test data for all screenshots
- Highlight interactive elements where helpful
- Show realistic but not sensitive data
- Include both desktop and mobile views for responsive components
- Document any special states (errors, warnings, empty states)

---

## Estimated Time

- **Setup:** 30 minutes
- **Main pages:** 2-3 hours
- **Sub-pages:** 2-3 hours
- **Components:** 1-2 hours
- **Review & annotation:** 1-2 hours
- **Total:** 6-10 hours

---

This systematic approach ensures comprehensive visual documentation of the entire Inventory Management module.
