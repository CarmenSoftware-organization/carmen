# Finance Module - Complete Sitemap

> **Module:** Finance
> **Total Pages:** 7
> **Last Updated:** 2025-01-17

---

## Navigation Hierarchy

```
Finance
├── Dashboard (Landing Page)
│   └── /finance
│
├── Account Code Mapping
│   └── /finance/account-code-mapping
│
├── Currency Management
│   └── /finance/currency-management
│
├── Exchange Rates
│   └── /finance/exchange-rates
│
└── Department List
    └── /finance/department-list
```

---

## Page Count by Sub-Module

| Sub-Module | Page Count | Status |
|------------|------------|--------|
| Dashboard | 1 | ✅ Complete |
| Account Code Mapping | 1 | ✅ Complete |
| Currency Management | 2 | ✅ Complete |
| Exchange Rates | 2 | ✅ Complete |
| Department List | 1 | ✅ Complete |
| **TOTAL** | **7** | **✅ Complete** |

---

## Detailed Page Descriptions

### Dashboard (1 page)

**Route:** `/finance`

**Features:**
- Financial overview
- Quick access to sub-modules
- Key metrics display

---

### Account Code Mapping (1 page)

**Route:** `/finance/account-code-mapping`

**Features:**
- Store/location to GL account mapping
- Category hierarchical mapping
- Subcategory assignments
- Item group mappings
- Department code linking
- Search and filter
- Bulk import/export
- Print functionality

**Data Fields:**
- Store/Location
- Category
- Sub-Category
- Item Group
- Department
- Account Code

**Actions:**
- Scan
- Import/Export
- Edit mappings
- Print reports
- Search

---

### Currency Management (2 pages)

#### Page 1: Currency List
**Route:** `/finance/currency-management`

**Features:**
- Active currency listing
- Currency activation/deactivation
- Search currencies
- Filter active currencies
- CRUD operations

**Data Fields:**
- Currency Code (ISO 4217)
- Currency Description
- Active Status

**Actions:**
- Create new currency
- Delete currency
- Print currency list
- Toggle active status
- Bulk selection

#### Page 2: Currency Detail/Edit
**Route:** `/finance/currency-management/[code]` (implicit)

**Features:**
- Currency code configuration
- Description management
- Activation control
- Audit information

---

### Exchange Rates (2 pages)

#### Page 1: Exchange Rate Viewer
**Route:** `/finance/exchange-rates`

**Features:**
- Current exchange rates display
- Base currency selection (implied USD)
- Rate to 6 decimal precision
- Last updated timestamp
- Search currencies
- CSV import for bulk rates
- Manual rate entry

**Data Fields:**
- Currency Code
- Currency Name
- Exchange Rate (6 decimal places)
- Last Updated Date

**Actions:**
- Add new rate
- Print rate sheet
- Import from CSV
- Edit individual rates
- View rate history

#### Page 2: Exchange Rate History (implied)
**Features:**
- Historical rate tracking
- Rate change trends
- Audit trail

---

### Department List (1 page)

**Route:** `/finance/department-list`

**Features:**
- Department listing
- Cost center organization
- Department hierarchy
- Budget allocation integration

**Data Fields:**
- Department Code
- Department Name
- Cost Center
- Parent Department
- Budget

**Actions:**
- Create department
- Edit department
- Assign cost centers
- View hierarchy

---

## User Flows

### Common User Journeys

#### 1. Set Up GL Account Mapping
```
/finance
  → Account Code Mapping
    → /finance/account-code-mapping
      → Search for store/category
        → Edit mapping
          → Assign account code
            → Save
```

#### 2. Add New Currency
```
/finance
  → Currency Management
    → /finance/currency-management
      → Click "Create"
        → Enter currency code
          → Enter description
            → Activate
              → Save
```

#### 3. Update Exchange Rates
```
/finance
  → Exchange Rates
    → /finance/exchange-rates
      → Option A: Import CSV
        → Upload file
          → Validate rates
            → Confirm import
      → Option B: Manual Entry
        → Click "Add Rate"
          → Enter currency and rate
            → Save
```

---

## Access Control

### Role-Based Access

| Feature | Finance Manager | Accountant | Manager | Staff |
|---------|----------------|------------|---------|-------|
| Account Mapping | Full | Full | View | None |
| Currency Management | Full | Edit | View | None |
| Exchange Rates | Full | Full | View | None |
| Departments | Full | Edit | View | None |
| GL Integration | Full | Full | None | None |

---

## Technical Notes

### Components

**Account Code Mapping**:
- AccountCodeMapping - Main table view
- Mapping filters and search
- Import/export functionality

**Currency Management**:
- CurrencyManagement - List view
- Currency CRUD operations
- Active status toggle

**Exchange Rates**:
- ExchangeRateViewer - Rate display
- CSV import handler
- Rate calculation engine

**Departments**:
- DepartmentList - Department view
- Hierarchy display
- Cost center management

### Data Structures

```typescript
interface AccountMapping {
  store: string;
  category: string;
  subCategory: string;
  itemGroup: string;
  department: string;
  accountCode: string;
}

interface Currency {
  code: string; // ISO 4217
  description: string;
  active: boolean;
}

interface ExchangeRate {
  code: string;
  name: string;
  rate: number; // 6 decimal precision
  lastUpdated: string; // ISO date
}

interface Department {
  code: string;
  name: string;
  costCenter?: string;
  parentDepartment?: string;
  budget?: number;
}
```

---

## Integration Patterns

### General Ledger Integration

**Account Code Posting:**
```
Transaction → Category/Department → Account Mapping → GL Account Code
```

**Multi-Currency Transactions:**
```
Transaction (Foreign Currency) → Exchange Rate → Base Currency Amount → GL Posting
```

### Data Synchronization

**Exchange Rate Updates:**
- Manual entry in UI
- CSV bulk import
- API integration (external rate provider)
- Scheduled automatic updates

**Account Code Management:**
- Maintain in Carmen ERP
- Export to GL system
- Reconciliation reports
- Mapping validation

---

## Related Documentation

- [Account Code Mapping Feature Specification](./features/account-code-mapping/README.md)
- [Currency Management Feature Specification](./features/currency-management/README.md)
- [Exchange Rates Feature Specification](./features/exchange-rates/README.md)
- [Departments Feature Specification](./features/departments/README.md)

---

**Last Updated:** 2025-01-17
**Module Version:** 1.0.0
