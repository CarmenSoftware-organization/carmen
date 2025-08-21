# Procurement Feature Crosswalk

## Purchase Requests (PR)

### 1) Code-only (not in docs)
- **Vendor comparison read-only view**
  - Code refs: `app/(main)/procurement/purchase-requests/components/vendor-comparison-view.tsx`
- **PR list RBAC “widget” filtering (My Pending vs All Documents)**
  - Code refs: `app/(main)/procurement/purchase-requests/components/purchase-request-list.tsx`
- **Role-gated price visibility on item cards**
  - Code refs: `app/(main)/procurement/purchase-requests/components/tabs/ItemsTab.tsx`

### 2) Doc-only (not in code)
- **PR→PO generation pipeline, budget APIs, reporting endpoints**
  - Doc refs: `prd/modules/procurement/purchase-requests/module-prd.md`, `prd/modules/procurement/module-prd.md`
- **PR analytics/dashboards/KPIs**
  - Doc refs: `prd/modules/procurement/module-prd.md` (Reporting & Analytics)

### 3) Matches (code ↔ docs)
- **Tabs: Items/Budgets/Workflow**
  - Code: `app/(main)/procurement/purchase-requests/components/PRDetailPage.tsx`
  - Docs: `prd/modules/procurement/purchase-requests/module-prd.md`
- **Vendor comparison & selection**
  - Code: `app/(main)/procurement/purchase-requests/components/vendor-comparison.tsx`, `VendorComparisonModal.tsx`
  - Docs: `prd/modules/procurement/purchase-requests/module-prd.md` (PR-004)
- **Advanced filtering for PR list**
  - Code: `app/(main)/procurement/purchase-requests/components/pr-filter-builder.tsx`
  - Docs: `prd/modules/procurement/purchase-requests/module-prd.md` (Advanced filtering sidebar)
- **Inventory On Hand/On Order with detail dialogs**
  - Code: `app/(main)/procurement/purchase-requests/components/tabs/ItemsTab.tsx`, `ItemDetailCards.tsx`
  - Docs: `docs/pages/pr/pr-details-spec.md`
# Procurement Feature Crosswalk

## Purchase Orders (PO)

### 1) Code-only (not in docs)
- **Column selection / export / print sidepanels**
  - Code refs: `components/purchase-orders/ColumnSelectionScreen.tsx`, `ExportSidepanel.tsx`, `PrintOptionsSidepanel.tsx`
- **Enhanced items tab with split/cancel scaffolding**
  - Code refs: `app/(main)/procurement/purchase-orders/components/tabs/EnhancedItemsTab.tsx`

### 2) Doc-only (not in code)
- **Three-way matching engine and tolerances**
  - Doc refs: `prd/modules/procurement/purchase-orders/module-prd.md` (PO-006)
- **Formal vendor communication flows (Email/Portal) & PO send endpoints**
  - Doc refs: `prd/modules/procurement/purchase-orders/module-prd.md` (PO-002, API Endpoints)
- **Contract pricing integration logic**
  - Doc refs: `prd/modules/procurement/purchase-orders/module-prd.md` (PO-003)

### 3) Matches (code ↔ docs)
- **Tabs: Items, Documents**
  - Code: `app/(main)/procurement/purchase-orders/components/PODetailPage.tsx`
  - Docs: `prd/modules/procurement/purchase-orders/module-prd.md` (UI specs)
- **Item details modal with On Hand/On Order popups and GRN quick action**
  - Code: `app/(main)/procurement/purchase-orders/components/tabs/item-details.tsx`
  - Docs: `prd/modules/procurement/purchase-orders/module-prd.md` (operational aspects)
- **Advanced filter and PO list management**
  - Code: `app/(main)/procurement/purchase-orders/components/advanced-filter.tsx`, `PurchaseOrderList.tsx`
  - Docs: `prd/modules/procurement/purchase-orders/module-prd.md` (list/filter expectations)
## Goods Received Notes (GRN)

### 1) Code-only (not in docs)
- **Modern transaction summary widget in GRN UI**
  - Code refs: `app/(main)/procurement/goods-received-note/components/goods-receive-note.tsx`

### 2) Doc-only (not in code)
- **Discrepancy→credit automation, QC policy engines, ERP posting endpoints**
  - Doc refs: `prd/modules/procurement/goods-received-notes/module-prd.md`, `prd/modules/procurement/module-prd.md`

### 3) Matches (code ↔ docs)
- **Tabs: Items, Stock Movements, Extra Costs, Financials, Related POs**
  - Code: `app/(main)/procurement/goods-received-note/components/goods-receive-note.tsx`, `GoodsReceiveNoteDetail.tsx`
  - Docs: `prd/modules/procurement/goods-received-notes/module-prd.md`
- **Bulk item actions, stock movement visualization**
  - Code: `app/(main)/procurement/goods-received-note/components/tabs/GoodsReceiveNoteItems.tsx`, `StockMovementTab.tsx`
  - Docs: `prd/modules/procurement/goods-received-notes/module-prd.md`
## Credit Notes (CN)

### 1) Code-only (not in docs)
- **Lot application UI and multi-step vendor selection wizard with confirmation**
  - Code refs: `app/(main)/procurement/credit-note/components/cn-lot-application.tsx`, `vendor-selection.tsx`

### 2) Doc-only (not in code)
- **Automated CN generation from discrepancies, reconciliation engine, analytics**
  - Doc refs: `prd/modules/procurement/credit-notes/module-prd.md` (CN-001, CN-004, Analytics)
- **Email/Portal communication endpoints and acknowledgment flows**
  - Doc refs: `prd/modules/procurement/credit-notes/module-prd.md` (CN-005)

### 3) Matches (code ↔ docs)
- **Tabs: Item Details, Stock Movement, Journal Entries, Tax Entries**
  - Code: `app/(main)/procurement/credit-note/components/credit-note.tsx`, `journal-entries.tsx`, `tax-entries.tsx`, `StockMovementTab.tsx`
  - Docs: `prd/modules/procurement/credit-notes/module-prd.md`
- **Comments/attachments and activity/audit representation**
  - Code: `app/(main)/procurement/credit-note/components/credit-note.tsx`
  - Docs: `prd/modules/procurement/credit-notes/module-prd.md`
