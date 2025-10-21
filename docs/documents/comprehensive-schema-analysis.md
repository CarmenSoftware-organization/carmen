# Carmen ERP System - Comprehensive Schema Analysis

## Overview

This document provides a comprehensive analysis of all schema structures found across the Carmen ERP system documentation. The schemas are organized by module and include field definitions, types, formats, default values, and data source derivations.

*Generated: September 25, 2025*
*Source: Complete analysis of docs/documents/ directory*

---

## Table of Contents

1. [Product Management Schemas](#product-management-schemas)
2. [Purchase Request Template Schemas](#purchase-request-template-schemas)
3. [Credit Note Schemas](#credit-note-schemas)
4. [Goods Received Note (GRN) Schemas](#goods-received-note-grn-schemas)
5. [Purchase Order Schemas](#purchase-order-schemas)
6. [Inventory Management Schemas](#inventory-management-schemas)
7. [User Management Schemas](#user-management-schemas)
8. [Common/Shared Schemas](#commonshared-schemas)

---

## Product Management Schemas

### 1. Product Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| productCode | string | Custom format | Yes | Auto-generated | System generated unique code |
| name | string | Text (255) | Yes | - | User input |
| description | string | Text | Yes | - | User input |
| categoryName | string | Text | No | null | Selected from category list |
| subCategoryName | string | Text | No | null | Selected from subcategory list |
| isActive | boolean | true/false | Yes | true | User selection |
| basePrice | number | Decimal(10,2) | Yes | - | User input |
| costPrice | number | Decimal(10,2) | No | null | User input or calculated |
| margin | number | Percentage | No | null | Calculated from basePrice - costPrice |
| supplierName | string | Text | No | null | Selected from vendor list |
| unitName | string | Text | No | null | Selected from unit list |
| taxRate | number | Percentage | No | null | User input or from tax configuration |
| allergens | string[] | Array of strings | No | [] | User selection from predefined list |
| isVegetarian | boolean | true/false | No | false | User selection |
| isVegan | boolean | true/false | No | false | User selection |
| isGlutenFree | boolean | true/false | No | false | User selection |
| shelfLife | number | Integer (days) | No | null | User input |
| storageConditions | string | Text | No | null | User input |
| minOrderQty | number | Decimal(10,3) | No | null | User input |
| maxOrderQty | number | Decimal(10,3) | No | null | User input |
| leadTimeDays | number | Integer | No | null | User input or from supplier data |
| supplierProductCode | string | Text | No | null | From supplier catalog |
| barcode | string | Barcode format | No | null | User input or scanner |
| images | string[] | Array of URLs | No | [] | File upload paths |
| nutritionalInfo | object | NutritionalInfo | No | null | User input |
| createdAt | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updatedAt | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |
| createdBy | string | User ID | Yes | Current user ID | From authentication context |

### 2. CategoryItem Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| name | string | Text (100) | Yes | - | User input |
| type | enum | 'CATEGORY', 'SUBCATEGORY', 'ITEM_GROUP' | Yes | - | User selection |
| itemCount | number | Integer | Yes | 0 | Calculated from associated products |
| children | CategoryItem[] | Array | No | [] | Hierarchical relationships |
| parentId | string | UUID | No | null | Parent category reference |
| sortOrder | number | Integer | Yes | 0 | User defined or auto-increment |
| isExpanded | boolean | true/false | No | false | UI state |
| isSelected | boolean | true/false | No | false | UI state |
| isHighlighted | boolean | true/false | No | false | UI state |

### 3. Unit Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| name | string | Text (50) | Yes | - | User input |
| symbol | string | Text (10) | Yes | - | User input |
| type | enum | 'inventory', 'order', 'recipe' | Yes | - | User selection |
| isActive | boolean | true/false | Yes | true | User selection |
| baseUnit | string | Unit ID | No | null | Reference to base unit |
| conversionFactor | number | Decimal(10,6) | No | null | User input for conversions |
| description | string | Text | No | null | User input |
| usageCount | number | Integer | Yes | 0 | Calculated from product usage |
| createdAt | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |

### 4. FilterType Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| field | keyof T | Property name | Yes | - | User selection |
| operator | enum | FilterOperator | Yes | - | User selection |
| value | string or string[] | Mixed | Yes | - | User input |
| logicalOperator | enum | 'AND', 'OR' | No | 'AND' | User selection |

---

## Purchase Request Template Schemas

### 1. PurchaseRequestTemplate Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| name | string | Text (255) | Yes | - | User input |
| description | string | Text | No | null | User input |
| reference_number | string | Auto-generated format | Yes | Generated | System pattern: PRT-YYYY-NNN |
| type | enum | 'general', 'asset', 'service', 'recurring' | Yes | 'general' | User selection |
| department | string | Department code | Yes | - | User's department or selection |
| requestor_id | string | User ID | Yes | - | Current user or selection |
| status | enum | 'draft', 'active', 'inactive', 'archived' | Yes | 'draft' | System managed |
| is_active | boolean | true/false | Yes | true | User selection |
| is_default | boolean | true/false | Yes | false | User selection |
| total_amount | number | Decimal(15,2) | Yes | 0 | Calculated from items |
| currency | enum | CurrencyCode | Yes | 'MYR' | User selection or system default |
| item_count | number | Integer | Yes | 0 | Calculated from items array |
| budget_codes | string[] | Array of codes | No | [] | User selection |
| account_codes | string[] | Array of codes | No | [] | User selection |
| approval_workflow | string | Workflow ID | No | null | System or user selection |
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |
| created_by | string | User ID | Yes | Current user ID | From authentication context |
| updated_by | string | User ID | Yes | Current user ID | From authentication context |
| version | number | Integer | Yes | 1 | Auto-increment on updates |

### 2. TemplateItem Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| template_id | string | UUID | Yes | - | Parent template reference |
| item_code | string | Product code | Yes | - | User input or product selection |
| description | string | Text | Yes | - | User input or from product |
| uom | string | Unit code | Yes | - | User selection or from product |
| quantity | number | Decimal(10,3) | Yes | - | User input |
| unit_price | number | Decimal(10,2) | Yes | - | User input or from product |
| total_amount | number | Decimal(15,2) | Yes | Calculated | quantity * unit_price |
| currency | enum | CurrencyCode | Yes | Template currency | Inherited from template |
| exchange_rate | number | Decimal(10,6) | Yes | 1.0 | From currency service |
| budget_code | string | Budget code | Yes | - | User selection |
| account_code | string | Account code | Yes | - | User selection |
| department | string | Department code | Yes | Template department | Inherited from template |
| tax_code | string | Tax code | No | null | User selection or default |
| tax_rate | number | Percentage | Yes | 0 | From tax configuration |
| tax_amount | number | Decimal(15,2) | Yes | Calculated | total_amount * tax_rate |
| sort_order | number | Integer | Yes | 0 | User defined or auto-increment |
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |

---

## Credit Note Schemas

### 1. CreditNote Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| ref_number | string | Auto-generated format | Yes | Generated | System pattern: CN-YYYY-NNN |
| vendor_id | string | UUID | Yes | - | User selection |
| type | enum | 'quantity_return', 'amount_discount' | Yes | - | User selection |
| status | enum | 'draft', 'pending_approval', 'approved', 'processed' | Yes | 'draft' | System managed |
| date | string | ISO 8601 Date | Yes | Current date | User input or current date |
| currency | enum | CurrencyCode | Yes | - | User selection or vendor default |
| exchange_rate | number | Decimal(10,6) | Yes | 1.0 | From currency service |
| reason | string | Text | Yes | - | User input |
| description | string | Text | No | null | User input |
| subtotal | number | Decimal(15,2) | Yes | 0 | Calculated from items |
| tax_amount | number | Decimal(15,2) | Yes | 0 | Calculated from items |
| total_amount | number | Decimal(15,2) | Yes | 0 | subtotal + tax_amount |
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |
| created_by | string | User ID | Yes | Current user ID | From authentication context |
| approved_by | string | User ID | No | null | Approver user ID |
| approval_date | string | ISO 8601 DateTime | No | null | System set on approval |
| processed_by | string | User ID | No | null | Processor user ID |
| processing_date | string | ISO 8601 DateTime | No | null | System set on processing |

### 2. CreditNoteItem Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| credit_note_id | string | UUID | Yes | - | Parent credit note reference |
| product_id | string | UUID | Yes | - | Product reference |
| quantity | number | Decimal(10,3) | Yes | - | User input |
| unit_price | number | Decimal(10,2) | Yes | - | User input or from GRN |
| total_amount | number | Decimal(15,2) | Yes | Calculated | quantity * unit_price |
| reason_code | enum | Various reason codes | Yes | - | User selection |
| lot_number | string | Text | No | null | From GRN or user input |
| expiry_date | string | ISO 8601 Date | No | null | From GRN or user input |
| grn_reference | string | GRN number | No | null | Source GRN reference |
| notes | string | Text | No | null | User input |

---

## Goods Received Note (GRN) Schemas

### 1. GoodsReceiveNote Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| ref | string | Auto-generated format | Yes | Generated | System pattern: GRN-YYYY-NNN |
| vendor_id | string | UUID | Yes | - | User selection or from PO |
| purchase_order_id | string | UUID | No | null | Source PO reference |
| status | enum | GRNStatus | Yes | 'Draft' | System managed |
| received_date | string | ISO 8601 Date | Yes | Current date | User input or current date |
| delivery_note_ref | string | Text | No | null | User input |
| invoice_ref | string | Text | No | null | User input |
| received_by | string | User ID | Yes | Current user ID | From authentication context |
| currency | enum | CurrencyCode | Yes | - | From PO or user selection |
| exchange_rate | number | Decimal(10,6) | Yes | 1.0 | From currency service |
| notes | string | Text | No | null | User input |
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |

### 2. GRNItem Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| grn_id | string | UUID | Yes | - | Parent GRN reference |
| product_id | string | UUID | Yes | - | Product reference |
| po_item_id | string | UUID | No | null | Source PO item reference |
| ordered_quantity | number | Decimal(10,3) | No | null | From PO item |
| received_quantity | number | Decimal(10,3) | Yes | - | User input |
| unit_cost | number | Decimal(10,2) | Yes | - | User input or from PO |
| total_cost | number | Decimal(15,2) | Yes | Calculated | received_quantity * unit_cost |
| batch_number | string | Text | No | null | User input |
| expiry_date | string | ISO 8601 Date | No | null | User input |
| location_id | string | UUID | Yes | - | User selection |
| condition | enum | ItemCondition | Yes | 'Good' | User selection |
| notes | string | Text | No | null | User input |

---

## Purchase Order Schemas

### 1. PurchaseOrder Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| po_id | string | Auto-generated format | Yes | Generated | System pattern: PO-YYYY-NNN |
| number | string | Same as po_id | Yes | Generated | System generated |
| vendor_id | number | Integer | Yes | - | User selection |
| vendor_name | string | Text | Yes | - | From vendor record |
| vendor_email | string | Email format | No | null | From vendor record |
| order_date | string | ISO 8601 Date | Yes | Current date | User input or current date |
| delivery_date | string | ISO 8601 Date | Yes | - | User input |
| status | enum | POStatus | Yes | 'Draft' | System managed |
| currency_code | enum | CurrencyCode | Yes | - | User selection or vendor default |
| base_currency_code | enum | CurrencyCode | Yes | System currency | System configuration |
| exchange_rate | number | Decimal(10,6) | Yes | 1.0 | From currency service |
| credit_terms | string | Text | No | null | User input or vendor default |
| description | string | Text | No | null | User input |
| remarks | string | Text | No | null | User input |
| sub_total_price | number | Decimal(15,2) | Yes | 0 | Calculated from items |
| discount_amount | number | Decimal(15,2) | Yes | 0 | User input |
| net_amount | number | Decimal(15,2) | Yes | Calculated | sub_total - discount |
| tax_amount | number | Decimal(15,2) | Yes | 0 | Calculated from items |
| total_amount | number | Decimal(15,2) | Yes | Calculated | net_amount + tax_amount |
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |

### 2. PurchaseOrderItem Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| po_id | string | PO reference | Yes | - | Parent PO reference |
| name | string | Text | Yes | - | User input or from product |
| description | string | Text | No | null | User input or from product |
| ordered_quantity | number | Decimal(10,3) | Yes | - | User input |
| received_quantity | number | Decimal(10,3) | Yes | 0 | Updated from GRN |
| remaining_quantity | number | Decimal(10,3) | Yes | Calculated | ordered - received |
| order_unit | string | Unit code | Yes | - | User selection |
| unit_price | number | Decimal(10,2) | Yes | - | User input |
| tax_rate | number | Percentage | Yes | 0 | From tax configuration |
| discount_rate | number | Percentage | Yes | 0 | User input |
| sub_total_price | number | Decimal(15,2) | Yes | Calculated | quantity * unit_price |
| tax_amount | number | Decimal(15,2) | Yes | Calculated | sub_total * tax_rate |
| total_amount | number | Decimal(15,2) | Yes | Calculated | sub_total + tax - discount |
| status | enum | ItemStatus | Yes | 'Open' | System managed |

---

## Inventory Management Schemas

### 1. InventoryItem Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| product_id | string | UUID | Yes | - | Product reference |
| location_id | string | UUID | Yes | - | Location reference |
| current_stock | number | Decimal(10,3) | Yes | 0 | System calculated |
| reserved_stock | number | Decimal(10,3) | Yes | 0 | System calculated |
| available_stock | number | Decimal(10,3) | Yes | Calculated | current - reserved |
| reorder_point | number | Decimal(10,3) | No | null | User configuration |
| max_stock_level | number | Decimal(10,3) | No | null | User configuration |
| min_stock_level | number | Decimal(10,3) | No | null | User configuration |
| average_cost | number | Decimal(10,2) | Yes | 0 | System calculated |
| last_movement_date | string | ISO 8601 DateTime | No | null | System updated |
| last_count_date | string | ISO 8601 Date | No | null | From physical counts |
| valuation_method | enum | 'FIFO', 'LIFO', 'WEIGHTED_AVERAGE' | Yes | 'WEIGHTED_AVERAGE' | System configuration |

### 2. StockMovement Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| inventory_item_id | string | UUID | Yes | - | Inventory reference |
| transaction_type | enum | MovementType | Yes | - | System determined |
| reference_type | enum | ReferenceType | Yes | - | Source document type |
| reference_id | string | UUID | Yes | - | Source document ID |
| quantity | number | Decimal(10,3) | Yes | - | System or user input |
| unit_cost | number | Decimal(10,2) | No | null | From source transaction |
| movement_date | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| batch_number | string | Text | No | null | From source or user input |
| expiry_date | string | ISO 8601 Date | No | null | From source or user input |
| notes | string | Text | No | null | User input |

---

## User Management Schemas

### 1. User Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| name | string | Text (100) | Yes | - | User input |
| email | string | Email format | Yes | - | User input (unique) |
| department | string | Department code | Yes | - | User selection |
| role | enum | UserRole | Yes | - | Admin assignment |
| permissions | string[] | Permission codes | Yes | [] | Derived from role |
| is_active | boolean | true/false | Yes | true | Admin control |
| last_login | string | ISO 8601 DateTime | No | null | System updated |
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated on change |

### 2. Department Interface

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| id | string | UUID | Yes | Generated | System generated UUID |
| name | string | Text (100) | Yes | - | Admin input |
| code | string | Text (20) | Yes | - | Admin input (unique) |
| budget_codes | string[] | Budget codes | No | [] | Admin configuration |
| default_template_id | string | UUID | No | null | Admin selection |
| parent_department_id | string | UUID | No | null | Hierarchical structure |

---

## Common/Shared Schemas

### 1. Currency and Money Types

| Field/Type | Type | Format | Values | Default |
|------------|------|--------|---------|---------|
| CurrencyCode | enum | ISO 4217 | 'MYR', 'USD', 'EUR', 'SGD', 'GBP' | 'MYR' |
| Money | object | {amount: number, currency: CurrencyCode} | - | - |

### 2. Status Types

| Type | Values | Default |
|------|--------|---------|
| DocumentStatus | 'draft', 'pending', 'approved', 'rejected', 'cancelled' | 'draft' |
| WorkflowStatus | 'not_started', 'in_progress', 'completed', 'on_hold' | 'not_started' |
| ItemStatus | 'active', 'inactive', 'discontinued', 'pending' | 'active' |

### 3. Audit Fields (Common to all entities)

| Field | Type | Format | Required | Default | Derived From |
|-------|------|--------|----------|---------|--------------|
| created_at | string | ISO 8601 DateTime | Yes | Current timestamp | System generated |
| updated_at | string | ISO 8601 DateTime | Yes | Current timestamp | System updated |
| created_by | string | User ID | Yes | Current user ID | Authentication context |
| updated_by | string | User ID | Yes | Current user ID | Authentication context |
| version | number | Integer | No | 1 | Auto-increment on updates |

---

## Default Value Sources

### System Generated Defaults
- **UUIDs**: All entity IDs are system-generated UUIDs
- **Reference Numbers**: Auto-generated with patterns (PO-YYYY-NNN, GRN-YYYY-NNN, etc.)
- **Timestamps**: Current timestamp for created_at/updated_at
- **User Context**: Current user ID from authentication

### Configuration Defaults
- **Currency**: System default currency (MYR)
- **Tax Rates**: From tax configuration tables
- **Exchange Rates**: From currency service
- **Approval Workflows**: From workflow configuration

### Calculated Defaults
- **Total Amounts**: Sum of item amounts
- **Remaining Quantities**: Ordered minus received quantities
- **Available Stock**: Current minus reserved stock
- **Margins**: Base price minus cost price

### User Context Defaults
- **Department**: User's assigned department
- **Location**: User's default location
- **Permissions**: Derived from user role

---

## Data Validation Rules

### Format Validations
- **Email**: Standard email format validation
- **Dates**: ISO 8601 date/datetime format
- **Currency**: Valid ISO 4217 currency codes
- **Decimals**: Appropriate precision for monetary and quantity fields

### Business Rule Validations
- **Quantities**: Must be positive for most operations
- **Prices**: Must be positive and within reasonable ranges
- **References**: Foreign key constraints maintained
- **Status Transitions**: Follow defined workflow states

### Unique Constraints
- **Reference Numbers**: Unique within entity type
- **Email Addresses**: Unique across users
- **Product Codes**: Unique within organization
- **Department Codes**: Unique within organization

---

*End of Comprehensive Schema Analysis*