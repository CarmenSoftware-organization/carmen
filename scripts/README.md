# Carmen ERP Screenshot Automation System

Comprehensive screenshot capture and documentation enhancement system for the Carmen hospitality ERP system.

## 🎯 Overview

This system provides automated visual documentation for all Carmen ERP screens, including:
- **Base screen states** (default, loading, error, empty)
- **Modal interactions** (20+ modal types across all screens)  
- **Responsive design** (desktop, tablet, mobile viewports)
- **Fractional sales features** (pizza slices, cake portions, specialized UI)
- **Automatic documentation integration** (enhances .md files with images)

## 📁 System Components

### Core Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `capture-screenshots.js` | Main Playwright test suite | `npx playwright test` |
| `run-screenshots.js` | CLI runner with options | `node run-screenshots.js --help` |
| `enhance-docs-with-images.js` | Documentation integration | `node enhance-docs-with-images.js` |
| `screen-route-mapping.json` | Screen/modal configuration | Data reference |

### Configuration Files

| File | Purpose |
|------|---------|
| `../playwright.config.js` | Playwright configuration |
| `screen-route-mapping.json` | Complete screen/modal mapping |

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Ensure Playwright is installed
npm install

# Start development server
npm run dev
```

### 2. Capture All Screenshots

```bash
# Desktop screenshots (recommended first run)
node scripts/run-screenshots.js

# All devices and modals
node scripts/run-screenshots.js -d all -v

# Specific screens only
node scripts/run-screenshots.js -s dashboard,purchase-requests,pos-integration
```

### 3. Enhance Documentation

```bash
# Integrate all screenshots into documentation
node scripts/enhance-docs-with-images.js

# Generate image index
node scripts/enhance-docs-with-images.js --generate-index
```

## 📸 Screenshot Coverage

### Priority Screens (Fractional Sales)
These screens receive priority for comprehensive screenshot coverage:

- `purchase-requests` - PR creation with fractional sales support
- `purchase-request-detail` - Item editing with portion variants  
- `pos-integration` - POS dashboard with fractional sales monitoring
- `pos-mapping` - Recipe mapping with fractional variants (pizza/cake)
- `vendor-pricelists` - Vendor pricing with portion-based pricing
- `inventory-overview` - Stock management with fractional deductions

### All Supported Screens (20 total)

| Screen | Route | Modals | Fractional Support |
|--------|-------|---------|-------------------|
| dashboard | `/dashboard` | 2 | ❌ |
| purchase-requests | `/procurement/purchase-requests` | 3 | ✅ |  
| purchase-request-detail | `/procurement/purchase-requests/[id]` | 4 | ✅ |
| purchase-orders | `/procurement/purchase-orders` | 2 | ✅ |
| purchase-order-detail | `/procurement/purchase-orders/[id]` | 3 | ✅ |
| goods-received-note | `/procurement/goods-received-note` | 2 | ✅ |
| goods-received-note-detail | `/procurement/goods-received-note/[id]` | 3 | ✅ |
| vendor-management | `/vendor-management/manage-vendors` | 2 | ❌ |
| vendor-detail | `/vendor-management/manage-vendors/[id]` | 3 | ✅ |
| vendor-pricelists | `/vendor-management/pricelists` | 2 | ✅ |
| inventory-overview | `/inventory-management/stock-overview` | 2 | ✅ |
| inventory-adjustments | `/inventory-management/inventory-adjustments` | 2 | ✅ |
| store-requisitions | `/store-operations/store-requisitions` | 2 | ✅ |
| store-requisition-detail | `/store-operations/store-requisitions/[id]` | 2 | ✅ |
| pos-integration | `/system-administration/system-integrations/pos` | 3 | ✅ |
| pos-mapping | `/system-administration/system-integrations/pos/mapping/recipes` | 3 | ✅ |
| help-support | `/help-support` | 2 | ❌ |
| user-manuals | `/help-support/user-manuals` | 2 | ❌ |
| video-tutorials | `/help-support/video-tutorials` | 2 | ❌ |
| faqs | `/help-support/faqs` | 2 | ❌ |

**Total Coverage: 49+ modals across 20 screens**

## 🛠 Advanced Usage

### Device-Specific Capture

```bash
# Desktop only (1920x1080)
node scripts/run-screenshots.js -d desktop

# Tablet only (1366x768)  
node scripts/run-screenshots.js -d tablet

# Mobile only (390x844)
node scripts/run-screenshots.js -d mobile

# All devices
node scripts/run-screenshots.js -d all
```

### Selective Screen Capture

```bash
# Fractional sales screens only
node scripts/run-screenshots.js -s purchase-requests,purchase-request-detail,pos-integration,pos-mapping

# Help system screens
node scripts/run-screenshots.js -s help-support,user-manuals,video-tutorials,faqs

# Procurement module
node scripts/run-screenshots.js -s purchase-requests,purchase-orders,goods-received-note
```

### Performance Options

```bash
# Fast parallel capture (less reliable)
node scripts/run-screenshots.js -p

# Clean previous screenshots
node scripts/run-screenshots.js -c

# Skip modal capture
node scripts/run-screenshots.js --no-modals

# Dry run (show commands without executing)
node scripts/run-screenshots.js --dry-run
```

### Documentation Enhancement

```bash
# Enhance specific screen
node scripts/enhance-docs-with-images.js --screen purchase-request-detail

# Generate image index only
node scripts/enhance-docs-with-images.js --generate-index

# Full enhancement with verbose output
node scripts/enhance-docs-with-images.js -v
```

## 🎨 Modal Interactions

The system supports comprehensive modal capture across categories:

### Creation Modals
- `create-pr-modal` - Purchase request creation
- `create-po-modal` - Purchase order creation  
- `create-grn-modal` - Goods received note creation
- `create-vendor-modal` - New vendor creation
- `create-requisition-modal` - Store requisition creation

### Fractional Sales Modals  
- `fractional-sales-modal` - Pizza/cake portion configuration
- `item-details-modal` - Item editing with fractional variants
- `price-list-modal` - Vendor pricing with portion pricing

### System Modals
- `settings-modal` - Configuration interfaces
- `mapping-modal` - POS recipe mapping
- `sync-status-modal` - Integration status
- `validation-modal` - Data validation interfaces

### Workflow Modals
- `approval-modal` - Approval workflows
- `approval-log-modal` - Approval history
- `comment-modal` - Comments and notes

## 📂 Output Structure

```
docs/prd/output/screens/images/
├── dashboard/
│   ├── dashboard-default.png
│   ├── dashboard-settings-modal.png
│   └── dashboard-notification-modal.png
├── purchase-requests/
│   ├── purchase-requests-default.png
│   ├── purchase-requests-create-pr-modal.png
│   ├── purchase-requests-filter-modal.png
│   └── purchase-requests-bulk-actions-modal.png
├── purchase-request-detail/
│   ├── purchase-request-detail-default.png
│   ├── purchase-request-detail-item-details-modal.png
│   ├── purchase-request-detail-vendor-comparison-modal.png
│   └── purchase-request-detail-approval-modal.png
├── pos-integration/
│   ├── pos-integration-default.png
│   ├── pos-integration-connected.png
│   ├── pos-integration-settings-modal.png
│   └── pos-integration-sync-status-modal.png
├── pos-mapping/
│   ├── pos-mapping-default.png
│   ├── pos-mapping-fractional-sales-modal.png
│   └── pos-mapping-validation-modal.png
└── README.md (Generated index)
```

### Responsive Variants

```
├── purchase-requests-tablet/
│   └── purchase-requests-tablet-default.png
├── purchase-requests-mobile/  
│   └── purchase-requests-mobile-default.png
```

## 🔧 Configuration

### Adding New Screens

1. **Update `screen-route-mapping.json`**:
```json
{
  "new-screen": {
    "route": "/new-module/new-screen",
    "component": "app/(main)/new-module/new-screen/page.tsx",
    "documentationFile": "docs/prd/output/screens/new-screen-screen.md",
    "modals": {
      "new-modal": {
        "trigger": "[data-testid='new-button']",
        "description": "New modal functionality"
      }
    },
    "states": ["default", "loading"],
    "fractionalSalesSupport": true
  }
}
```

2. **Update `SCREEN_CONFIG` in `capture-screenshots.js`**
3. **Add modal triggers to `MODAL_TRIGGERS`**

### Modal Trigger Configuration

```javascript
const MODAL_TRIGGERS = {
  'new-modal': { 
    selector: '[data-testid="new-button"]', 
    wait: 1000 
  }
};
```

## 🚨 Troubleshooting

### Common Issues

**Development server not running**
```bash
# Start server first
npm run dev
# Then run screenshots
node scripts/run-screenshots.js
```

**Modal triggers not found**
- Ensure test IDs exist in components: `data-testid="create-pr-button"`
- Check selector syntax in `MODAL_TRIGGERS`
- Verify modal is visible when trigger is clicked

**Screenshots not captured**
- Check Playwright installation: `npx playwright install chromium`
- Verify file permissions in `docs/prd/output/screens/images/`
- Run with verbose flag: `node scripts/run-screenshots.js -v`

**Documentation not enhanced**
- Ensure screenshots exist before enhancement
- Check file paths in `screen-route-mapping.json`
- Verify markdown file exists and is writable

### Debug Mode

```bash
# Verbose Playwright output
DEBUG=pw:api node scripts/run-screenshots.js -v

# Dry run to check configuration
node scripts/run-screenshots.js --dry-run

# Single screen debug
node scripts/run-screenshots.js -s dashboard -v
```

## 🎯 Fractional Sales Focus

This system was specifically designed to support Carmen ERP's fractional sales management features:

### Pizza Slice Management
- Visual documentation of slice-based inventory tracking
- POS integration screenshots showing fractional deductions
- Recipe mapping interfaces for multiple yield variants

### Cake Portion Management  
- Portion-based pricing configuration screenshots
- Multi-yield recipe management interfaces
- Inventory impact visualization for fractional sales

### Integration Screenshots
- POS dashboard showing fractional sales monitoring
- Recipe mapping screens with fractional variants
- Inventory management with automatic deductions

## 📈 System Benefits

- **Complete Visual Documentation**: 20+ screens with full modal coverage
- **Responsive Design Validation**: Multi-device screenshot verification
- **Fractional Sales Focus**: Specialized coverage for pizza/cake management
- **Automated Integration**: Screenshots automatically enhance documentation
- **Developer Efficiency**: Comprehensive CLI tools with flexible options
- **Quality Assurance**: Visual regression testing capabilities

## 🔄 Maintenance

### Regular Updates

```bash
# Update screenshots after UI changes
node scripts/run-screenshots.js -c -v

# Re-enhance documentation
node scripts/enhance-docs-with-images.js

# Generate updated index
node scripts/enhance-docs-with-images.js --generate-index
```

### Version Control
- Screenshots are stored in `docs/prd/output/screens/images/`
- Configuration files track screen mappings and modal interactions
- Documentation files automatically updated with image references

This comprehensive system ensures Carmen ERP maintains up-to-date visual documentation that supports both technical teams and end-users in understanding the system's capabilities, especially its innovative fractional sales management features.