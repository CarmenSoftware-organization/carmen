# Account Code Mapping

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

The Account Code Mapping screen is used for setting up and managing mappings between account codes used internally and codes used for external reporting, compliance, or integration with other systems. This module ensures that all financial transactions are correctly categorized and accounted for in financial statements.

## Screen Header

**Title**: Account Code Mapping

### Action Buttons

#### Scan for New Codes
- **Purpose**: Scans the system for new account codes that have been added but not yet mapped
- **Functionality**:
  - Search system for new Location codes
  - Identify new Item Groups
  - Discover new transaction combinations
  - Allow options to scan for existing transactions
- **Benefit**: Ensures all financial transactions are correctly categorized and accounted for in financial statements

#### Import/Export
- **Purpose**: Import/export account mappings
- **Functionality**:
  - Import mappings from external sources (CSV format)
  - Export current mappings for backup or use in other systems
- **Use Cases**:
  - Maintaining consistency across multiple platforms
  - System migrations or updates
  - Backup and disaster recovery

#### Print
- **Purpose**: Print the mapping setup
- **Use Cases**:
  - Review purposes
  - Audit requirements
  - Manual verification of mappings

#### Create
- **Purpose**: Create new account code mappings
- **Functionality**: Opens dialog to add new mapping configurations

## View Options

### View Name Dropdown
Allows users to switch between different preset views to adjust the display according to accounting needs.

## Posting to AP (Accounts Payable)

### Overview
This view handles postings directly related to Accounts Payable. It manages invoices from suppliers and vendors for inventory purchased, linking inventory procurement transactions directly with payable invoices.

### Data Table Columns

| Column | Description | Notes |
|--------|-------------|-------|
| **Business Unit** | Division or department within the organization | Required |
| **Store/Location** | Specific store or location where items are used/stored | Required |
| **Category** | Broad classification of inventory items (e.g., Food, Beverage) | Required |
| **Sub-Category** | Detailed classification within a category | Required |
| **Item Group** | Exact types of items within a sub-category | Required |
| **Department** | Department responsible for the items | Required |
| **Account Code** | Specific GL account code for accounting purposes | **Debit Account Only** |
| **Actions** | View, Edit, Duplicate, Delete | CRUD operations |

### Business Rules

1. **Account Restrictions**: Only Debit Accounts are allowed
2. **Tax Accounts**: Default from Vendor Profile in Carmen
3. **Mapping**: Links inventory procurement transactions with payable invoices

## Posting to GL (General Ledger)

### Overview
This view focuses on posting transactions into the General Ledger. It ensures that all financial data related to inventory—whether purchases, adjustments, or disposals—are accurately reflected in the company's main accounting records.

### Data Table Columns

| Column | Description | Notes |
|--------|-------------|-------|
| **Business Unit** | Division or department within the organization | Required |
| **Store/Location** | Specific store or location | Required |
| **Category** | Higher-level classification of inventory or expense | Required |
| **Item Group** | Further breakdown within the category | Required |
| **Movement Type** | Type of transaction (sale, purchase, transfer) | Required |
| **Dr. Department** | Department to be debited | Using "To" Location |
| **Cr. Department** | Department to be credited | Using "To" Location |
| **Dr. Account** | GL account to be debited | Using "To" Location Account |
| **Cr. Account** | GL account to be credited | Using "To" Location Account |
| **Actions** | View, Edit, Duplicate, Delete | CRUD operations |

### Business Rules

1. **Location Usage**: Uses the "To" Location for department assignments
2. **Account Assignment**: Uses the "To" Location Account for GL postings
3. **Internal Cost Allocation**: Tracks which departments are debited and credited
4. **Accuracy**: Crucial for accurate financial accounting

## CRUD Operations

### View Mapping
- **Action**: Click three-dot menu → View
- **Functionality**: Display read-only details of the selected mapping
- **Information Shown**: All mapped fields for the selected record

### Create Mapping
- **Action**: Click "Create" button
- **Functionality**: Opens dialog with form fields for new mapping
- **Required Fields**: Depends on view (AP or GL)
- **Validation**: All required fields must be completed

### Edit Mapping
- **Action**: Click three-dot menu → Edit
- **Functionality**: Opens dialog with pre-populated form fields
- **Validation**: All required fields must be completed
- **Save**: Updates existing mapping record

### Duplicate Mapping
- **Action**: Click three-dot menu → Duplicate
- **Functionality**: Creates a copy of the selected mapping
- **Use Case**: Quickly create similar mappings with minor variations

### Delete Mapping
- **Action**: Click three-dot menu → Delete
- **Functionality**: Removes mapping from system
- **Confirmation**: Requires user confirmation before deletion

## Search and Filter

### Search Functionality
- **Location**: Top of screen
- **Scope**: Searches across all visible columns
- **Real-time**: Filters results as you type

## Implementation Notes

### Dialog Fix
The component includes a comprehensive fix for the Radix UI Dialog pointer-events issue:
- Fixed at the shadcn/ui Dialog component level
- Dual protection mechanism (useEffect cleanup + onCloseAutoFocus)
- Ensures all dialogs work correctly without blocking application interactions
- No per-component workarounds needed

### Component Location
- **File**: `components/account-code-mapping.tsx`
- **Route**: `/finance/account-code-mapping`
- **Framework**: Next.js 14 App Router with React Server Components

## Notes and Considerations

1. **Mapping Procedure**: Review the mapping procedure to determine whether to map only used transactions or all transactions
2. **Data Integrity**: Ensure mappings are kept up-to-date as operations evolve
3. **Audit Trail**: All changes to mappings should be tracked for audit purposes
4. **Compliance**: Mappings must comply with accounting standards and regulations
