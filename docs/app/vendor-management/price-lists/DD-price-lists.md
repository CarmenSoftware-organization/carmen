# Data Definition: Price Lists

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Price Lists
- **Version**: 1.0.0
- **Status**: Active
- **Last Updated**: 2025-11-15

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-15 | Documentation Team | Initial DD document created from schema.prisma |

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT.
It does NOT contain executable SQL code, database scripts, or implementation code.
For database implementation details, refer to the Technical Specification document.

**✅ SCHEMA COVERAGE**: All tables exist in `data-struc/schema.prisma`

---

## Overview

The Price Lists module manages vendor pricing information including product prices, validity periods, multi-currency support, and tiered pricing structures. Price lists are created by vendors and used during procurement processes to determine product costs.

### Key Features
- Vendor-specific pricing management
- Multi-currency support
- Validity period tracking
- Tax profile integration
- Tiered pricing via JSONB info field
- Price version control
- Soft delete support

---

## Entity Relationship Overview

```
tb_vendor (1) ──── (N) tb_pricelist
tb_currency (1) ──── (N) tb_pricelist
tb_pricelist (1) ──── (N) tb_pricelist_detail
tb_product (1) ──── (N) tb_pricelist_detail
tb_unit (1) ──── (N) tb_pricelist_detail
```

---

## Core Entities

### 1. Price List Header (tb_pricelist)

**Source**: `schema.prisma` lines 2255-2294

**Purpose**: Stores price list header information including vendor, currency, and validity period.

**Table Name**: `tb_pricelist`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `pricelist_no` | VARCHAR | UNIQUE, NOT NULL | Price list document number |
| `name` | VARCHAR | UNIQUE | Price list name/description |
| `url_token` | VARCHAR | | Secure token for vendor portal access |
| `vendor_id` | UUID | FOREIGN KEY → tb_vendor.id | Associated vendor |
| `vendor_name` | VARCHAR | DENORMALIZED | Vendor name for quick reference |
| `from_date` | TIMESTAMPTZ | | Price list start date |
| `to_date` | TIMESTAMPTZ | | Price list end date |
| `currency_id` | UUID | FOREIGN KEY → tb_currency.id | Price list currency |
| `currency_name` | VARCHAR | DENORMALIZED | Currency name for quick reference |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status flag |
| `description` | VARCHAR | | Additional description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Additional metadata (tiered pricing, special terms) |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Document version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created the record |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_vendor**: Many-to-One (multiple price lists per vendor)
- **tb_currency**: Many-to-One (price list in specific currency)
- **tb_pricelist_detail**: One-to-Many (price list contains multiple line items)

#### Business Rules
1. **Uniqueness**: `pricelist_no` must be unique across all price lists
2. **Validity Period**: `to_date` must be greater than or equal to `from_date`
3. **Active Status**: Only one active price list per vendor-currency combination at any time
4. **Denormalization**: `vendor_name` and `currency_name` cached for performance
5. **Soft Delete**: Records marked as deleted via `deleted_at` instead of physical deletion

#### Indexes
```
INDEX pricelist_name_u ON tb_pricelist(name)
```

#### JSON Field Structures

**info field** - Tiered pricing and special terms:
```json
{
  "tiered_pricing": {
    "enabled": true,
    "tiers": [
      {
        "min_quantity": 1,
        "max_quantity": 99,
        "discount_percentage": 0
      },
      {
        "min_quantity": 100,
        "max_quantity": 499,
        "discount_percentage": 5
      },
      {
        "min_quantity": 500,
        "max_quantity": null,
        "discount_percentage": 10
      }
    ]
  },
  "payment_terms": {
    "net_days": 30,
    "discount_percentage": 2,
    "discount_days": 10
  },
  "special_terms": "Free shipping on orders over $1000"
}
```

**dimension field** - Multi-dimensional attributes:
```json
{
  "department_id": "uuid",
  "location_id": "uuid",
  "cost_center_id": "uuid",
  "project_id": "uuid"
}
```

---

### 2. Price List Line Items (tb_pricelist_detail)

**Source**: `schema.prisma` lines 2296-2330

**Purpose**: Stores individual product pricing information within a price list.

**Table Name**: `tb_pricelist_detail`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `pricelist_id` | UUID | FOREIGN KEY → tb_pricelist.id, NOT NULL | Parent price list |
| `sequence_no` | INTEGER | DEFAULT 1 | Line item order/sequence |
| `product_id` | UUID | FOREIGN KEY → tb_product.id, NOT NULL | Product being priced |
| `product_name` | VARCHAR | DENORMALIZED | Product name for quick reference |
| `unit_id` | UUID | FOREIGN KEY → tb_unit.id | Pricing unit of measure |
| `unit_name` | VARCHAR | DENORMALIZED | Unit name for quick reference |
| `tax_profile_id` | UUID | | Tax profile for this line item |
| `tax_profile_name` | VARCHAR | DENORMALIZED | Tax profile name |
| `tax_rate` | DECIMAL(15,5) | | Tax rate percentage |
| `price` | DECIMAL(20,5) | | Base price amount |
| `price_without_vat` | DECIMAL(20,5) | | Price excluding tax |
| `price_with_vat` | DECIMAL(20,5) | | Price including tax |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status flag |
| `description` | VARCHAR | | Line item description |
| `note` | VARCHAR | | Internal notes |
| `info` | JSON | | Additional metadata (quantity breaks, special pricing) |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_pricelist**: Many-to-One (line items belong to one price list)
- **tb_product**: Many-to-One (multiple line items can reference same product)
- **tb_unit**: Many-to-One (pricing in specific unit)
- **tb_purchase_request_detail**: One-to-Many (price list used in purchase requests)

#### Business Rules
1. **Price Calculation**: `price_with_vat = price_without_vat * (1 + tax_rate / 100)`
2. **Unit Consistency**: `unit_id` must be valid for the referenced product
3. **Sequencing**: `sequence_no` determines display order within price list
4. **Tax Handling**: If `tax_profile_id` is null, use vendor's default tax profile
5. **Denormalization**: Product and unit names cached for performance

#### JSON Field Structures

**info field** - Quantity breaks and special pricing:
```json
{
  "quantity_breaks": [
    {
      "min_quantity": 1,
      "max_quantity": 49,
      "unit_price": 10.00
    },
    {
      "min_quantity": 50,
      "max_quantity": 199,
      "unit_price": 9.50
    },
    {
      "min_quantity": 200,
      "max_quantity": null,
      "unit_price": 9.00
    }
  ],
  "lead_time_days": 7,
  "minimum_order_quantity": 10,
  "packaging_type": "case",
  "items_per_package": 12
}
```

---

## Data Validation Rules

### Price List Header Validation

1. **VAL-PL-001**: Price list number format
   - Rule: `pricelist_no` must follow format "PL-YYYY-NNNNNN"
   - Example: "PL-2025-000001"

2. **VAL-PL-002**: Validity period consistency
   - Rule: `to_date >= from_date`
   - Error: "End date must be on or after start date"

3. **VAL-PL-003**: Active price list uniqueness
   - Rule: Only one active price list per vendor-currency at any time
   - Error: "Active price list already exists for this vendor and currency"

4. **VAL-PL-004**: Currency consistency
   - Rule: All line items must use price list's currency
   - Error: "Line item currency must match price list currency"

### Price List Detail Validation

5. **VAL-PL-101**: Price amount constraints
   - Rule: `price > 0 AND price_without_vat >= 0 AND price_with_vat >= 0`
   - Error: "Price amounts must be positive"

6. **VAL-PL-102**: Tax calculation accuracy
   - Rule: `price_with_vat = price_without_vat * (1 + tax_rate / 100)`
   - Tolerance: ±0.01 for rounding
   - Error: "Tax calculation mismatch"

7. **VAL-PL-103**: Product-unit compatibility
   - Rule: `unit_id` must be in product's allowed units list
   - Error: "Unit not valid for this product"

8. **VAL-PL-104**: Duplicate product prevention
   - Rule: Same product-unit combination cannot appear twice in same price list
   - Error: "Product-unit combination already exists in this price list"

---

## Integration Points

### 1. Vendor Management
- **Direction**: Inbound
- **Purpose**: Price lists are created for specific vendors
- **Key Fields**: `vendor_id`, `vendor_name`

### 2. Currency Management
- **Direction**: Inbound
- **Purpose**: Price lists denominated in specific currencies
- **Key Fields**: `currency_id`, `currency_name`

### 3. Product Management
- **Direction**: Inbound
- **Purpose**: Price list line items reference products
- **Key Fields**: `product_id`, `product_name`, `unit_id`

### 4. Purchase Request Process
- **Direction**: Outbound
- **Purpose**: Price lists used to auto-populate purchase request pricing
- **Key Fields**: `pricelist_id` in purchase_request_detail

### 5. Purchase Order Creation
- **Direction**: Outbound
- **Purpose**: Active price lists provide default pricing for PO creation
- **Process**: System suggests prices from active price lists

---

## Performance Considerations

### Indexing Strategy
1. **Primary Access**: `pricelist_no` (unique lookup)
2. **Vendor Search**: `vendor_id` + `is_active` (composite index needed)
3. **Validity Search**: `from_date`, `to_date` (range queries)
4. **Product Lookup**: `product_id` in tb_pricelist_detail

### Denormalization
- `vendor_name`, `currency_name`, `product_name`, `unit_name` cached to avoid joins
- Trade-off: Faster reads, slower writes, potential staleness
- Update Strategy: Cascade updates via triggers or application logic

### Query Optimization
1. **Active Price Lists**: Filter on `is_active = TRUE AND deleted_at IS NULL`
2. **Valid Price Lists**: Additional filter on date ranges
3. **Vendor Price Lists**: Use vendor_id index for fast filtering

---

## Security & Access Control

### Field-Level Security
- **Sensitive Fields**: `price`, `price_without_vat`, `price_with_vat`
- **Access Control**: ABAC policies for viewing/editing prices
- **Audit Trail**: All price changes logged via `updated_at`, `updated_by_id`

### Row-Level Security
- **Vendor Portal**: Vendors can only view their own price lists via `url_token`
- **Department Access**: Filtered by `dimension.department_id` if applicable
- **Role-Based**: Purchasing staff can view all, managers can approve

---

## Audit & Compliance

### Change Tracking
- **Version Control**: `doc_version` incremented on each update
- **User Tracking**: `created_by_id`, `updated_by_id`, `deleted_by_id`
- **Timestamp Tracking**: `created_at`, `updated_at`, `deleted_at`

### Compliance Requirements
- **Price History**: Maintain all historical prices via soft delete
- **Tax Records**: Preserve tax rates and calculations
- **Audit Trail**: Complete history of price changes for financial audits

---

## Sample Data Scenarios

### Scenario 1: Simple Price List
```
Price List Header:
- pricelist_no: "PL-2025-000001"
- vendor_name: "ABC Suppliers Ltd"
- currency: "USD"
- from_date: 2025-01-01
- to_date: 2025-12-31

Line Items:
- Product: "Coffee Beans 1kg", Unit: "kg", Price: $15.00 (ex VAT)
- Product: "Tea Leaves 500g", Unit: "pack", Price: $8.50 (ex VAT)
```

### Scenario 2: Tiered Pricing
```
Price List Header:
- info.tiered_pricing: {
    tiers: [
      {min: 1, max: 99, discount: 0%},
      {min: 100, max: 499, discount: 5%},
      {min: 500, max: null, discount: 10%}
    ]
  }

Line Item:
- Product: "Flour 25kg", Base Price: $20.00
- Effective Prices:
  * Qty 1-99: $20.00 each
  * Qty 100-499: $19.00 each (5% off)
  * Qty 500+: $18.00 each (10% off)
```

---

## Migration Notes

### From DS to DD
- **Date**: 2025-11-15
- **Schema Source**: `data-struc/schema.prisma` lines 2255-2330
- **Coverage**: ✅ 100% - All required tables exist in schema
- **Changes**: None - DD document describes existing schema structure

### Future Enhancements
- Consider separate table for tiered pricing rules (currently in JSONB)
- Add price approval workflow tables
- Add price comparison/analytics tables

---

## Document Metadata

**Created**: 2025-11-15
**Schema Version**: As of schema.prisma commit 9fbc771
**Coverage**: 2 entities from schema.prisma
**Status**: Active - Ready for use

---

**End of Data Definition Document**
