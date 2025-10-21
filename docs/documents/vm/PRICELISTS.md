# Pricelists Submodule

## Table of Contents

1. [Overview](#overview)
2. [Pricelists List Page](#pricelists-list-page)
3. [Edit Pricelist Pages](#edit-pricelist-pages)

---

## Overview

**Submodule Name**: Pricelists
**Route**: `/vendor-management/pricelists`
**Status**: 🚧 Prototype
**Purpose**: Vendor pricelist management, approval workflows, and price comparison

**Key Features**:
- Pricelist creation and editing
- Approval workflow (Draft → Pending Review → Active)
- Bulk price updates
- Excel import/export
- Price comparison across vendors
- Tier pricing and MOQ management

---

## Pricelists List Page

**Path**: `/vendor-management/pricelists`
**File**: `app/(main)/vendor-management/pricelists/page.tsx`

![Pricelists List](screenshots/vm-pricelists-list.png)
*Pricelists Management - Price list viewing and editing*

**Status**: 🚧 Prototype

### Table Columns
- Pricelist Number
- Vendor Name
- Effective Date
- Expiry Date
- Currency
- Item Count
- Status
- Actions

### Status Options
- Draft
- Pending Review
- Active
- Expired
- Rejected

### Filters
- Status dropdown
- Vendor filter
- Date range picker
- Currency filter

### Actions
- Create Pricelist
- Edit Pricelist
- Review Pricelist
- Approve/Reject
- Download
- Delete

### Action Flows

**Create Pricelist**:
```mermaid
flowchart LR
    Click["Click Create Pricelist"] --> Navigate["Navigate to New Pricelist Form"]
    Navigate --> Display["Display Pricelist Form"]
```

**Edit Pricelist**:
```mermaid
flowchart LR
    Click["Click Edit Pricelist"] --> Navigate["Navigate to Edit Pricelist Page"]
    Navigate --> Display["Display Pre-populated Form"]
```

**Review Pricelist**:
```mermaid
flowchart LR
    Click["Click Review Pricelist"] --> Open["Open Review Modal"]
    Open --> Display["Display Pricelist Details"]
```

**Approve Pricelist**:
```mermaid
flowchart LR
    Click["Click Approve"] --> Modal["Show Approval Confirmation"]
    Modal --> Update["Update Status to Active"]
```

**Reject Pricelist**:
```mermaid
flowchart LR
    Click["Click Reject"] --> Modal["Show Rejection Reason Modal"]
    Modal --> Update["Update Status to Rejected"]
```

**Download Pricelist**:
```mermaid
flowchart LR
    Click["Click Download"] --> Generate["Generate Excel File"]
    Generate --> Download["Download Pricelist File"]
```

**Delete Pricelist**:
```mermaid
flowchart LR
    Click["Click Delete"] --> Modal["Show Delete Confirmation Modal"]
    Modal --> Delete["Delete Pricelist Record"]
```

**Filter by Status**:
```mermaid
flowchart LR
    Click["Click Status Filter"] --> Open["Open Status Options"]
    Open --> Filter["Apply Status Filter"]
```

**Filter by Vendor**:
```mermaid
flowchart LR
    Click["Click Vendor Filter"] --> Open["Open Vendor Selection"]
    Open --> Filter["Apply Vendor Filter"]
```

---

## Edit Pricelist Pages

**Path**: `/vendor-management/pricelists/:id/edit` or `/vendor-management/pricelists/:id/edit-new`
**Files**:
- `app/(main)/vendor-management/pricelists/[id]/edit/page.tsx`
- `app/(main)/vendor-management/pricelists/[id]/edit-new/page.tsx`

![New Pricelist](screenshots/vm-pricelist-new.png)
*New Pricelist Creation - Product pricing configuration*

![Add Pricelist](screenshots/vm-pricelist-add.png)
*Add Pricelist Form - Alternative creation interface*

### Components
- `StaffPricelistForm` - Staff editing interface
- `PricelistProductEditingComponent` - Product-level editing

### Pricelist Header
- Vendor (readonly)
- Effective Date
- Expiry Date
- Currency
- Payment Terms
- Notes

### Product Line Items

Each item has:
- Product Name/Code
- Description
- Unit of Measure
- MOQ (Minimum Order Quantity)
- Base Price
- Tier Pricing (multiple tiers)
- Discount Percentage
- Final Price (calculated)
- Status (Active/Inactive)

### Bulk Actions
- Apply percentage increase/decrease
- Copy pricing from another pricelist
- Delete selected items
- Set MOQ for selected

### Validation
- Price > 0
- Effective date < Expiry date
- All required fields filled
- No duplicate products

### Actions
- Save Draft
- Submit for Review
- Save and Publish
- Cancel
- Export to Excel
- Import from Excel

### Action Flows

**Save Draft**:
```mermaid
flowchart LR
    Click["Click Save Draft"] --> Validate["Validate Basic Fields"]
    Validate --> Save["Save Pricelist as Draft"]
```

**Submit for Review**:
```mermaid
flowchart LR
    Click["Click Submit for Review"] --> Validate["Validate All Fields"]
    Validate --> Update["Update Status to Pending Review"]
```

**Save and Publish**:
```mermaid
flowchart LR
    Click["Click Save and Publish"] --> Validate["Validate All Fields"]
    Validate --> Publish["Update Status to Active"]
```

**Add Product Line**:
```mermaid
flowchart LR
    Click["Click Add Product"] --> Open["Open Product Selection"]
    Open --> Add["Add Product to Pricelist"]
```

**Delete Product Line**:
```mermaid
flowchart LR
    Click["Click Delete Product"] --> Modal["Show Delete Confirmation"]
    Modal --> Remove["Remove Product from Pricelist"]
```

**Apply Percentage Change**:
```mermaid
flowchart LR
    Click["Click Apply Percentage"] --> Modal["Show Percentage Input Modal"]
    Modal --> Update["Update All Selected Product Prices"]
```

**Copy Pricing**:
```mermaid
flowchart LR
    Click["Click Copy Pricing"] --> Modal["Show Pricelist Selection Modal"]
    Modal --> Copy["Copy Prices from Selected Pricelist"]
```

**Export to Excel**:
```mermaid
flowchart LR
    Click["Click Export"] --> Generate["Generate Excel File"]
    Generate --> Download["Download Pricelist Excel"]
```

**Import from Excel**:
```mermaid
flowchart LR
    Click["Click Import"] --> Upload["Open File Upload Dialog"]
    Upload --> Validate["Validate Excel Data"]
    Validate --> Import["Import Products and Prices"]
```

---

**Last Updated**: 2025-10-02
**Status**: Complete
**Module**: Vendor Management
**Submodule**: Pricelists
