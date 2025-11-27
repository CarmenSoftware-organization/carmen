# Screenshot Index

This document provides an index of all captured screenshots in the `screenshots/` folder with descriptions and usage context.

## Inventory Management Core Screenshots

### Dashboard and Overview
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `inventory-management-dashboard.png` | Main dashboard with 6 draggable widgets, inventory charts, and quick navigation | ✅ Landing Page |
| `inventory-balance-report.png` | Comprehensive balance report with tabs, filters, and valuation metrics | ✅ Inventory Balance page |
| `inventory-adjustments-list.png` | Adjustments list with search, filtering, sorting, and status indicators | ✅ Adjustments List page |

### Physical Count Screenshots
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `physical-count-setup.png` | Physical count wizard Step 1 with form validation and setup options | ✅ Physical Count Wizard |

### Spot Check Screenshots
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `spot-check-dashboard.png` | Spot check dashboard with card-based layout and progress metrics | ✅ Spot Check Dashboard |
| `spot-check-main.png` | Spot check main list view with search and filters | ✅ Spot Check Main |
| `spot-check-new.png` | New spot check creation form | ✅ New Spot Check |
| `spot-check-active.png` | Active spot check interface for conducting counts | ✅ Active Spot Checks |

### Stock Overview Screenshots
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `stock-overview-main.png` | Stock overview landing page with metrics and charts | ✅ Stock Overview Landing |
| `stock-cards-list.png` | Stock cards list view with product information | ✅ Stock Cards |
| `stock-card-detail.png` | Individual stock card with transaction history | ✅ Stock Card Detail |
| `slow-moving-report.png` | Slow moving inventory analysis report | ✅ Slow Moving Report |
| `inventory-aging-report.png` | Inventory aging analysis with age categories | ✅ Inventory Aging |

### Stock In and Adjustments Screenshots
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `stock-in-list.png` | Stock in list with receipt records | ✅ Stock In List |
| `inventory-adjustment-detail.png` | Inventory adjustment detail page with items and journal entry | ✅ Adjustment Detail |

### Physical Count Screenshots
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `physical-count-dashboard.png` | Physical count management dashboard | ✅ Count Dashboard |

### Other Module Screenshots
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `fractional-inventory.png` | Fractional inventory management interface | ✅ Fractional Inventory |
| `period-end.png` | Period end closing interface | ✅ Period End |

## Procurement Module Screenshots

### Purchase Requests
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `purchase-request-list-view.png` | Purchase requests list with status badges and filtering | Referenced in integration sections |
| `purchase-request-detail-view.png` | Detailed view of individual purchase request with item breakdown | Referenced in integration sections |
| `purchase-request-creation-form.png` | Multi-step form for creating new purchase requests | Referenced in integration sections |

### Purchase Orders
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `purchase-orders-list-page.png` | Purchase orders list with status tracking | Referenced in Stock In integration |
| `purchase-order-detail-page.png` | Detailed PO view with item lines and approval workflow | Referenced in Stock In integration |
| `purchase-order-documents-tab.png` | Document attachment interface for purchase orders | Referenced in modals section |
| `purchase-order-new-po-menu.png` | PO creation menu with options (from PR, bulk, manual) | Referenced in actions section |

## UI Component Screenshots

### Action Menus and Dropdowns
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `action-menu-popup.png` | Context menu showing available actions for items | Referenced in Actions section |
| `filter-dropdown-all-stage.png` | Stage filter dropdown with all workflow stages | Referenced in Dropdown Fields |
| `filter-dropdown-all-requester.png` | Requester filter dropdown with user selection | Referenced in Dropdown Fields |
| `bulk-operations-menu-pr-detail.png` | Bulk operations menu on PR detail page | Referenced in Actions section |

### Workflow Components
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `workflow-review-required-button.png` | Review required workflow button state | Referenced in Actions section |
| `my-approvals-workflow-buttons.png` | Approval action buttons (Approve/Reject) | Referenced in Actions section |
| `flagged-review-workflow-buttons.png` | Flagged item review workflow controls | Referenced in Actions section |

### Interactive Components
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `item-detail-hover-expanded.png` | Expanded item detail on hover showing additional information | Referenced in Data Display section |
| `role-based-purchasing-staff-view.png` | Role-specific view for purchasing staff users | Referenced in Permissions section |

## Store Operations Screenshots

### Store Requisitions
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `store-operations-dashboard.png` | Store operations landing page with metrics and navigation | Referenced in integration sections |
| `store-requisition-list.png` | List of store requisitions with status and priority | Referenced in integration sections |
| `store-requisition-detail-items.png` | Store requisition detail showing requested items | Referenced in integration sections |
| `store-requisition-detail-stock.png` | Stock availability view for requisition fulfillment | Referenced in integration sections |

### Store Operations
| Screenshot | Description | Used In Spec |
|------------|-------------|--------------|
| `store-replenishment-page.png` | Store replenishment interface with stock suggestions | Referenced in integration sections |
| `wastage-reporting-page.png` | Wastage reporting and tracking interface | Referenced in integration sections |

## Screenshot Usage Summary

- **Total Screenshots**: 40
- **Inventory Management Core**: 18 screenshots
- **Procurement Integration**: 7 screenshots
- **UI Components**: 8 screenshots
- **Store Operations**: 7 screenshots

## Screenshot Naming Convention

All screenshots follow the naming convention: `{module}-{page/component}-{variant}.png`

Examples:
- `inventory-management-dashboard.png` - Main module dashboard
- `purchase-request-list-view.png` - List view of purchase requests
- `filter-dropdown-all-stage.png` - Dropdown filter for stage selection

## Missing Screenshots (Placeholders in Spec)

The following pages are referenced in the specification but don't have corresponding screenshots yet:

### Stock In Section
- `stock-in-detail.png` - Stock in receipt detail page (dynamic route, needs specific ID)

### Physical Count Section
- `physical-count-active.png` - Active count interface (dynamic route, needs active count ID)

## Capturing Additional Screenshots

To capture additional screenshots for the missing pages:

1. Run the development server: `npm run dev`
2. Navigate to each page in the browser
3. Use browser DevTools or Puppeteer script to capture full-page screenshots
4. Save with appropriate naming convention in `screenshots/` folder
5. Update the spec document image references

For automated capture, refer to the Puppeteer script in the earlier analysis documentation.

---

**Last Updated**: October 2, 2025
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Screenshot Count**: 40 captured, 2 placeholders remaining (dynamic routes)
