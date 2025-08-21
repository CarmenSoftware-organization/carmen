# Carmen ERP Screenshots Index

This directory contains comprehensive screenshots for all Carmen ERP screens, including base states, modal interactions, and responsive variants.

## Generated: 2025-08-14T11:29:56.211Z

## Screen Coverage

### Fractional Sales Screens (Priority)

- **purchase-requests**: /procurement/purchase-requests
  - Base states: default, loading, error
  - Modals: create-pr-modal, filter-modal, bulk-actions-modal
  - Documentation: [docs/prd/output/screens/purchase-requests-screen.md](../purchase-requests-screen.md)

- **purchase-request-details**: /procurement/purchase-requests/[id]
  - Base states: default, loading, error
  - Modals: item-details-modal, vendor-comparison-modal, approval-modal, comment-modal
  - Documentation: [docs/prd/output/screens/purchase-request-details-screen.md](../purchase-request-details-screen.md)

- **purchase-orders**: /procurement/purchase-orders
  - Base states: default, loading, error
  - Modals: create-po-modal, filter-modal
  - Documentation: [docs/prd/output/screens/purchase-orders-screen.md](../purchase-orders-screen.md)

- **purchase-order-details**: /procurement/purchase-orders/[id]
  - Base states: default, loading, error
  - Modals: item-details-modal, receipt-modal, comment-modal
  - Documentation: [docs/prd/output/screens/purchase-order-details-screen.md](../purchase-order-details-screen.md)

- **goods-received-note**: /procurement/goods-received-note
  - Base states: default, loading, error
  - Modals: create-grn-modal, filter-modal
  - Documentation: [docs/prd/output/screens/goods-received-note-screen.md](../goods-received-note-screen.md)

- **goods-received-note-details**: /procurement/goods-received-note/[id]
  - Base states: default, loading, error
  - Modals: item-details-modal, discrepancy-modal, comment-modal
  - Documentation: [docs/prd/output/screens/goods-received-note-details-screen.md](../goods-received-note-details-screen.md)

- **vendor-details**: /vendor-management/manage-vendors/[id]
  - Base states: default, loading, error
  - Modals: edit-vendor-modal, price-list-modal, contact-modal
  - Documentation: [docs/prd/output/screens/vendor-details-screen.md](../vendor-details-screen.md)

- **vendor-pricelists**: /vendor-management/pricelists
  - Base states: default, loading, error
  - Modals: upload-pricelist-modal, edit-price-modal
  - Documentation: [docs/prd/output/screens/vendor-pricelists-screen.md](../vendor-pricelists-screen.md)

- **inventory-overview**: /inventory-management/stock-overview
  - Base states: default, loading, error
  - Modals: adjustment-modal, filter-modal
  - Documentation: [docs/prd/output/screens/inventory-overview-screen.md](../inventory-overview-screen.md)

- **inventory-adjustments**: /inventory-management/inventory-adjustments
  - Base states: default, loading, error
  - Modals: create-adjustment-modal, approval-modal
  - Documentation: [docs/prd/output/screens/inventory-adjustments-screen.md](../inventory-adjustments-screen.md)

- **store-requisitions**: /store-operations/store-requisitions
  - Base states: default, loading, error
  - Modals: create-requisition-modal, approval-modal
  - Documentation: [docs/prd/output/screens/store-requisitions-screen.md](../store-requisitions-screen.md)

- **store-requisition-details**: /store-operations/store-requisitions/[id]
  - Base states: default, loading, error
  - Modals: item-details-modal, approval-log-modal
  - Documentation: [docs/prd/output/screens/store-requisition-details-screen.md](../store-requisition-details-screen.md)

- **pos-integration-fractional**: /system-administration/system-integrations/pos
  - Base states: default, loading, error
  - Modals: settings-modal, mapping-modal, sync-status-modal
  - Documentation: [docs/prd/output/screens/pos-integration-fractional-screen.md](../pos-integration-fractional-screen.md)

- **pos-recipe-mapping**: /system-administration/system-integrations/pos/mapping/recipes
  - Base states: default, loading, error
  - Modals: create-mapping-modal, fractional-sales-modal, validation-modal
  - Documentation: [docs/prd/output/screens/pos-recipe-mapping-screen.md](../pos-recipe-mapping-screen.md)

### All Screens

#### dashboard
- **Route**: /dashboard
- **Component**: app/(main)/dashboard/page.tsx
- **Fractional Sales**: ❌
- **Modals**: settings-modal, notification-modal
- **Documentation**: [dashboard-screen.md](../dashboard-screen.md)

#### purchase-requests
- **Route**: /procurement/purchase-requests
- **Component**: app/(main)/procurement/purchase-requests/page.tsx
- **Fractional Sales**: ✅
- **Modals**: create-pr-modal, filter-modal, bulk-actions-modal
- **Documentation**: [purchase-requests-screen.md](../purchase-requests-screen.md)

#### purchase-request-details
- **Route**: /procurement/purchase-requests/[id]
- **Component**: app/(main)/procurement/purchase-requests/[id]/page.tsx
- **Fractional Sales**: ✅
- **Modals**: item-details-modal, vendor-comparison-modal, approval-modal, comment-modal
- **Documentation**: [purchase-request-details-screen.md](../purchase-request-details-screen.md)

#### purchase-orders
- **Route**: /procurement/purchase-orders
- **Component**: app/(main)/procurement/purchase-orders/page.tsx
- **Fractional Sales**: ✅
- **Modals**: create-po-modal, filter-modal
- **Documentation**: [purchase-orders-screen.md](../purchase-orders-screen.md)

#### purchase-order-details
- **Route**: /procurement/purchase-orders/[id]
- **Component**: app/(main)/procurement/purchase-orders/components/PODetailPage.tsx
- **Fractional Sales**: ✅
- **Modals**: item-details-modal, receipt-modal, comment-modal
- **Documentation**: [purchase-order-details-screen.md](../purchase-order-details-screen.md)

#### goods-received-note
- **Route**: /procurement/goods-received-note
- **Component**: app/(main)/procurement/goods-received-note/page.tsx
- **Fractional Sales**: ✅
- **Modals**: create-grn-modal, filter-modal
- **Documentation**: [goods-received-note-screen.md](../goods-received-note-screen.md)

#### goods-received-note-details
- **Route**: /procurement/goods-received-note/[id]
- **Component**: app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail.tsx
- **Fractional Sales**: ✅
- **Modals**: item-details-modal, discrepancy-modal, comment-modal
- **Documentation**: [goods-received-note-details-screen.md](../goods-received-note-details-screen.md)

#### vendor-management
- **Route**: /vendor-management/manage-vendors
- **Component**: app/(main)/vendor-management/manage-vendors/page.tsx
- **Fractional Sales**: ❌
- **Modals**: create-vendor-modal, import-modal
- **Documentation**: [vendor-management-screen.md](../vendor-management-screen.md)

#### vendor-details
- **Route**: /vendor-management/manage-vendors/[id]
- **Component**: app/(main)/vendor-management/manage-vendors/[id]/page.tsx
- **Fractional Sales**: ✅
- **Modals**: edit-vendor-modal, price-list-modal, contact-modal
- **Documentation**: [vendor-details-screen.md](../vendor-details-screen.md)

#### vendor-pricelists
- **Route**: /vendor-management/pricelists
- **Component**: app/(main)/vendor-management/pricelists/page.tsx
- **Fractional Sales**: ✅
- **Modals**: upload-pricelist-modal, edit-price-modal
- **Documentation**: [vendor-pricelists-screen.md](../vendor-pricelists-screen.md)

#### inventory-overview
- **Route**: /inventory-management/stock-overview
- **Component**: app/(main)/inventory-management/stock-overview/page.tsx
- **Fractional Sales**: ✅
- **Modals**: adjustment-modal, filter-modal
- **Documentation**: [inventory-overview-screen.md](../inventory-overview-screen.md)

#### inventory-adjustments
- **Route**: /inventory-management/inventory-adjustments
- **Component**: app/(main)/inventory-management/inventory-adjustments/page.tsx
- **Fractional Sales**: ✅
- **Modals**: create-adjustment-modal, approval-modal
- **Documentation**: [inventory-adjustments-screen.md](../inventory-adjustments-screen.md)

#### store-requisitions
- **Route**: /store-operations/store-requisitions
- **Component**: app/(main)/store-operations/store-requisitions/page.tsx
- **Fractional Sales**: ✅
- **Modals**: create-requisition-modal, approval-modal
- **Documentation**: [store-requisitions-screen.md](../store-requisitions-screen.md)

#### store-requisition-details
- **Route**: /store-operations/store-requisitions/[id]
- **Component**: app/(main)/store-operations/store-requisitions/components/store-requisition-detail.tsx
- **Fractional Sales**: ✅
- **Modals**: item-details-modal, approval-log-modal
- **Documentation**: [store-requisition-details-screen.md](../store-requisition-details-screen.md)

#### pos-integration-fractional
- **Route**: /system-administration/system-integrations/pos
- **Component**: app/(main)/system-administration/system-integrations/pos/page.tsx
- **Fractional Sales**: ✅
- **Modals**: settings-modal, mapping-modal, sync-status-modal
- **Documentation**: [pos-integration-fractional-screen.md](../pos-integration-fractional-screen.md)

#### pos-recipe-mapping
- **Route**: /system-administration/system-integrations/pos/mapping/recipes
- **Component**: app/(main)/system-administration/system-integrations/pos/mapping/recipes/page.tsx
- **Fractional Sales**: ✅
- **Modals**: create-mapping-modal, fractional-sales-modal, validation-modal
- **Documentation**: [pos-recipe-mapping-screen.md](../pos-recipe-mapping-screen.md)

#### help-support-main
- **Route**: /help-support
- **Component**: app/(main)/help-support/page.tsx
- **Fractional Sales**: ❌
- **Modals**: search-modal, feedback-modal
- **Documentation**: [help-support-main-screen.md](../help-support-main-screen.md)

#### user-manuals
- **Route**: /help-support/user-manuals
- **Component**: app/(main)/help-support/user-manuals/page.tsx
- **Fractional Sales**: ❌
- **Modals**: search-modal, download-modal
- **Documentation**: [user-manuals-screen.md](../user-manuals-screen.md)

#### video-tutorials
- **Route**: /help-support/video-tutorials
- **Component**: app/(main)/help-support/video-tutorials/page.tsx
- **Fractional Sales**: ❌
- **Modals**: video-player-modal, playlist-modal
- **Documentation**: [video-tutorials-screen.md](../video-tutorials-screen.md)

#### faqs
- **Route**: /help-support/faqs
- **Component**: app/(main)/help-support/faqs/page.tsx
- **Fractional Sales**: ❌
- **Modals**: search-modal, feedback-modal
- **Documentation**: [faqs-screen.md](../faqs-screen.md)

#### support-ticket-system
- **Route**: /help-support/support-ticket-system
- **Component**: app/(main)/help-support/support-ticket-system/page.tsx
- **Fractional Sales**: ❌
- **Modals**: create-ticket-modal, ticket-detail-modal
- **Documentation**: [support-ticket-system-screen.md](../support-ticket-system-screen.md)


## Image Naming Convention

### Base Screenshots
- `{screen-name}-default.png`: Default screen state
- `{screen-name}-loading.png`: Loading state
- `{screen-name}-error.png`: Error state
- `{screen-name}-empty.png`: Empty state

### Modal Screenshots  
- `{screen-name}-{modal-name}.png`: Modal dialog captures
- Example: `purchase-request-detail-item-details-modal.png`

### Responsive Variants
- `{screen-name}-tablet/`: Tablet viewport (1366x768)
- `{screen-name}-mobile/`: Mobile viewport (390x844)

## Fractional Sales Priority

These screens receive priority for screenshot capture and documentation:
- purchase-requests
- purchase-request-detail
- purchase-orders
- purchase-order-detail
- goods-received-note
- goods-received-note-detail
- vendor-detail
- vendor-pricelists
- inventory-overview
- inventory-adjustments
- store-requisitions
- store-requisition-detail
- pos-integration
- pos-mapping

## Usage in Documentation

Screenshots are automatically integrated into documentation using the enhancement script:

```bash
node scripts/enhance-docs-with-images.js
```

This updates all `.md` files in the screens directory with appropriate image references.
