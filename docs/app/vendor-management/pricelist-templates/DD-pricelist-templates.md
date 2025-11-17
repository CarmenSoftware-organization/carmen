# Data Definition: Pricelist Templates

## Module Information
- **Module**: Vendor Management
- **Sub-module**: Pricelist Templates
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

The Pricelist Templates module manages reusable templates for creating Requests for Pricing (RFP). Templates define the structure, products, and settings that vendors should follow when submitting their price lists. This streamlines the RFP process and ensures consistency across vendor responses.

### Key Features
- Reusable RFP templates
- Product selection and grouping
- Multi-unit support per product
- Currency and validity period settings
- Vendor instructions and guidelines
- Automated reminder notifications
- Escalation management
- Template versioning and status workflow

---

## Entity Relationship Overview

```
tb_currency (1) ──── (N) tb_pricelist_template
tb_pricelist_template (1) ──── (N) tb_pricelist_template_detail
tb_product (1) ──── (N) tb_pricelist_template_detail
tb_pricelist_template (1) ──── (N) tb_request_for_pricing
```

---

## Core Entities

### 1. Pricelist Template Header (tb_pricelist_template)

**Source**: `schema.prisma` lines 2122-2162

**Purpose**: Stores template header information including currency, validity settings, vendor instructions, and notification configuration.

**Table Name**: `tb_pricelist_template`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR | UNIQUE, NOT NULL | Template name/description |
| `description` | VARCHAR | | Additional description |
| `note` | VARCHAR | | Internal notes |
| `status` | ENUM | DEFAULT 'draft' | Template status (draft, active, archived) |
| `currency_id` | UUID | FOREIGN KEY → tb_currency.id | Default currency for pricing |
| `currency_name` | VARCHAR | DENORMALIZED | Currency name for quick reference |
| `validity_period` | INTEGER | | Number of days price list remains valid |
| `vendor_instructions` | TEXT | | Instructions and guidelines for vendors |
| `send_reminders` | BOOLEAN | DEFAULT FALSE | Enable automated reminder emails |
| `reminder_days` | JSON | | Array of days before deadline for reminders |
| `escalation_after_days` | INTEGER | | Days after which to escalate non-responses |
| `info` | JSON | | Additional metadata and configuration |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Document version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created the record |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_currency**: Many-to-One (template specifies default currency)
- **tb_pricelist_template_detail**: One-to-Many (template contains multiple product lines)
- **tb_request_for_pricing**: One-to-Many (template used to create multiple RFPs)

#### Business Rules
1. **Uniqueness**: Template `name` must be unique across all templates
2. **Status Workflow**: draft → active → archived (one-way progression)
3. **Active Template**: Only active templates can be used for new RFPs
4. **Validity Period**: Must be > 0 if specified
5. **Reminders**: `send_reminders = TRUE` requires `reminder_days` to be populated
6. **Escalation**: `escalation_after_days` must be greater than maximum reminder day

#### Enums

**enum_pricelist_template_status**:
- `draft`: Template being created/edited
- `active`: Template ready for use in RFPs
- `archived`: Template no longer active but preserved for history

#### Indexes
```
INDEX pricelist_template_name_u ON tb_pricelist_template(name)
INDEX pricelist_template_currency_id_idx ON tb_pricelist_template(currency_id)
```

#### JSON Field Structures

**reminder_days field** - Notification schedule:
```json
[14, 7, 3, 1]
```
*Interpretation: Send reminders 14, 7, 3, and 1 days before deadline*

**info field** - Additional configuration:
```json
{
  "submission_format": ["excel", "pdf", "portal"],
  "approval_required": true,
  "auto_create_po": false,
  "minimum_vendors": 3,
  "evaluation_criteria": {
    "price_weight": 60,
    "quality_weight": 25,
    "delivery_weight": 15
  },
  "contact_person": {
    "name": "John Smith",
    "email": "john.smith@company.com",
    "phone": "+1-555-0100"
  }
}
```

**dimension field** - Multi-dimensional attributes:
```json
{
  "department_id": "uuid",
  "location_id": "uuid",
  "cost_center_id": "uuid",
  "project_id": "uuid",
  "category": "food-beverage"
}
```

---

### 2. Pricelist Template Line Items (tb_pricelist_template_detail)

**Source**: `schema.prisma` lines 2164-2194

**Purpose**: Stores product selections and unit options for the template.

**Table Name**: `tb_pricelist_template_detail`

**Primary Key**: `id` (UUID)

#### Fields

| Field Name | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `pricelist_template_id` | UUID | FOREIGN KEY → tb_pricelist_template.id, NOT NULL | Parent template |
| `sequence_no` | INTEGER | DEFAULT 1 | Display order/sequence |
| `product_id` | UUID | FOREIGN KEY → tb_product.id, NOT NULL | Product to be priced |
| `product_name` | VARCHAR | DENORMALIZED | Product name for quick reference |
| `array_order_unit` | JSON | | Array of unit options for this product |
| `info` | JSON | | Additional metadata |
| `dimension` | JSON | | Multi-dimensional attributes |
| `doc_version` | DECIMAL | DEFAULT 0 | Version for optimistic locking |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `created_by_id` | UUID | | User who created |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |
| `updated_by_id` | UUID | | User who last updated |
| `deleted_at` | TIMESTAMPTZ | | Soft delete timestamp |
| `deleted_by_id` | UUID | | User who deleted |

#### Relationships
- **tb_pricelist_template**: Many-to-One (line items belong to one template)
- **tb_product**: Many-to-One (multiple line items can reference same product)

#### Business Rules
1. **Product Uniqueness**: Same product cannot appear twice in same template
2. **Sequencing**: `sequence_no` determines display order in RFP
3. **Unit Options**: `array_order_unit` must contain at least one valid unit
4. **Unit Compatibility**: All units in `array_order_unit` must be valid for the product

#### Indexes
```
INDEX pricelist_template_detail_pricelist_template_id_product_id_u
  ON tb_pricelist_template_detail(pricelist_template_id, product_id)
```

#### JSON Field Structures

**array_order_unit field** - Multiple unit options:
```json
[
  {
    "unit_id": "00000000-0000-0000-0000-000000000001",
    "unit_name": "pcs"
  },
  {
    "unit_id": "00000000-0000-0000-0000-000000000002",
    "unit_name": "Box/12"
  },
  {
    "unit_id": "00000000-0000-0000-0000-000000000003",
    "unit_name": "Case/144"
  }
]
```
*Vendors must provide prices for all specified units*

**info field** - Product-specific instructions:
```json
{
  "required_certifications": ["ISO 9001", "HACCP"],
  "preferred_brands": ["Brand A", "Brand B"],
  "quality_specifications": "Premium grade only",
  "packaging_requirements": "Individual wrapped",
  "minimum_shelf_life_days": 90,
  "special_instructions": "Organic certification required"
}
```

---

## Data Validation Rules

### Template Header Validation

1. **VAL-PLT-001**: Template name format
   - Rule: `name` must be unique and non-empty
   - Length: 3-200 characters
   - Error: "Template name is required and must be unique"

2. **VAL-PLT-002**: Status transition validation
   - Rule: Status can only progress: draft → active → archived
   - Error: "Invalid status transition"

3. **VAL-PLT-003**: Validity period constraint
   - Rule: `validity_period > 0` if specified
   - Range: 1-365 days
   - Error: "Validity period must be between 1 and 365 days"

4. **VAL-PLT-004**: Reminder configuration consistency
   - Rule: If `send_reminders = TRUE`, `reminder_days` cannot be empty
   - Error: "Reminder days must be specified when reminders are enabled"

5. **VAL-PLT-005**: Reminder days validation
   - Rule: All values in `reminder_days` array must be positive integers
   - Rule: Values must be in descending order
   - Error: "Reminder days must be positive and in descending order"

6. **VAL-PLT-006**: Escalation timing
   - Rule: `escalation_after_days > MAX(reminder_days)`
   - Error: "Escalation must occur after all reminders"

### Template Detail Validation

7. **VAL-PLT-101**: Product uniqueness
   - Rule: Same `product_id` cannot appear twice in same template
   - Error: "Product already exists in this template"

8. **VAL-PLT-102**: Unit options validation
   - Rule: `array_order_unit` must contain at least one unit
   - Rule: All unit_ids must be valid UUIDs
   - Error: "At least one unit must be specified"

9. **VAL-PLT-103**: Unit-product compatibility
   - Rule: All units in `array_order_unit` must be valid for the product
   - Error: "Unit not valid for this product"

10. **VAL-PLT-104**: Sequence ordering
    - Rule: `sequence_no` must be unique within template
    - Error: "Duplicate sequence number"

---

## Integration Points

### 1. Currency Management
- **Direction**: Inbound
- **Purpose**: Templates specify default currency for vendor pricing
- **Key Fields**: `currency_id`, `currency_name`

### 2. Product Management
- **Direction**: Inbound
- **Purpose**: Template line items reference products to be priced
- **Key Fields**: `product_id`, `product_name`, `array_order_unit`

### 3. Request for Pricing (RFP) Creation
- **Direction**: Outbound
- **Purpose**: Templates used to generate RFPs sent to vendors
- **Process**: Active template copied to create new RFP instance
- **Key Fields**: `pricelist_template_id` in tb_request_for_pricing

### 4. Notification System
- **Direction**: Outbound
- **Purpose**: Automated reminders and escalations
- **Triggers**: Based on `reminder_days` and `escalation_after_days`
- **Recipients**: Vendors (from RFP), purchasing staff (escalations)

### 5. Vendor Portal
- **Direction**: Outbound
- **Purpose**: Vendor instructions displayed in portal
- **Key Fields**: `vendor_instructions`, `info.submission_format`

---

## Workflow & State Management

### Template Lifecycle

```
┌──────┐    activate    ┌────────┐    archive    ┌──────────┐
│ DRAFT├───────────────►│ ACTIVE ├──────────────►│ ARCHIVED │
└──────┘                └────────┘               └──────────┘
   │                        │
   │  edit                  │  clone
   │  ◄──────────┘          └──────────► NEW DRAFT
```

### Status Descriptions

**DRAFT**:
- Template being created or edited
- Can be modified freely
- Cannot be used for RFPs
- Can be deleted

**ACTIVE**:
- Template ready for use
- Can be used to create RFPs
- Cannot be edited (must clone to modify)
- Cannot be deleted (must archive)

**ARCHIVED**:
- Template no longer active
- Preserved for historical RFPs
- Cannot be used for new RFPs
- Cannot be edited or deleted

---

## Performance Considerations

### Indexing Strategy
1. **Primary Access**: `name` (unique lookup for template selection)
2. **Currency Filter**: `currency_id` (filter templates by currency)
3. **Status Filter**: `status` (find active templates) - **NEEDS INDEX**
4. **Product Lookup**: `product_id` in detail table - composite index exists

### Denormalization
- `currency_name`, `product_name` cached to avoid joins
- Trade-off: Faster reads in template listing, updates needed on currency/product renames

### Query Optimization
1. **Active Templates List**:
   ```
   WHERE status = 'active'
     AND deleted_at IS NULL
   ORDER BY name
   ```
2. **Template with Products**:
   ```
   Single query with LEFT JOIN to detail table
   Order by sequence_no
   ```

### Recommended Additional Indexes
```
CREATE INDEX idx_pricelist_template_status
  ON tb_pricelist_template(status)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_pricelist_template_detail_sequence
  ON tb_pricelist_template_detail(pricelist_template_id, sequence_no);
```

---

## Security & Access Control

### Field-Level Security
- **Public Fields**: `name`, `description`, `currency_name`
- **Internal Fields**: `vendor_instructions` (visible to vendors), `note` (internal only)
- **Sensitive Fields**: `escalation_after_days`, `info.evaluation_criteria`

### Row-Level Security
- **Department Access**: Filtered by `dimension.department_id`
- **Template Creators**: Users can edit their own draft templates
- **Active Templates**: Read-only except for authorized users
- **Role-Based**:
  - Purchasing Staff: Create/edit draft templates
  - Purchasing Manager: Activate/archive templates
  - Vendors: View via RFP only (no direct template access)

---

## Audit & Compliance

### Change Tracking
- **Version Control**: `doc_version` incremented on each update
- **User Tracking**: Full audit trail of creator and editor
- **Timestamp Tracking**: Creation, modification, and deletion timestamps
- **Status History**: Track status transitions (may require separate audit table)

### Compliance Requirements
- **Template Retention**: Maintain archived templates for audit purposes
- **RFP Traceability**: Link templates to all generated RFPs
- **Vendor Communication**: Preserve vendor instructions for compliance

---

## Sample Data Scenarios

### Scenario 1: Simple Food & Beverage Template

```
Template Header:
- name: "F&B Monthly RFP - Dry Goods"
- status: "active"
- currency: "USD"
- validity_period: 30 days
- vendor_instructions: "Please provide prices for all items.
    Minimum shelf life of 90 days required."
- send_reminders: true
- reminder_days: [7, 3, 1]
- escalation_after_days: 10

Template Details:
1. Product: "Rice 25kg", Units: ["bag", "pallet/40"]
2. Product: "Flour 25kg", Units: ["bag", "pallet/50"]
3. Product: "Sugar 50kg", Units: ["bag", "pallet/25"]
```

### Scenario 2: Multi-Unit Beverage Template

```
Template Header:
- name: "Beverage RFP - Q1 2025"
- status: "active"
- currency: "USD"
- validity_period: 90 days
- info.evaluation_criteria: {
    price_weight: 50,
    quality_weight: 30,
    delivery_weight: 20
  }

Template Detail:
- Product: "Orange Juice 1L"
- array_order_unit: [
    {unit_id: "uuid1", unit_name: "bottle"},
    {unit_id: "uuid2", unit_name: "case/12"},
    {unit_id: "uuid3", unit_name: "pallet/72"}
  ]
- info: {
    required_certifications: ["HACCP", "FDA Approved"],
    minimum_shelf_life_days: 120,
    refrigeration_required: true
  }
```

### Scenario 3: Template with Automated Reminders

```
Template:
- send_reminders: true
- reminder_days: [14, 7, 3, 1]
- escalation_after_days: 15

Timeline (assuming 2025-01-01 RFP creation with 2025-01-20 deadline):
- 2025-01-06: First reminder (14 days before)
- 2025-01-13: Second reminder (7 days before)
- 2025-01-17: Third reminder (3 days before)
- 2025-01-19: Final reminder (1 day before)
- 2025-01-20: Deadline
- 2025-02-04: Escalation if no response (15 days after deadline)
```

---

## Business Process Integration

### Template Creation Process
1. Purchasing staff creates draft template
2. Add products and configure units
3. Set currency, validity, and notification settings
4. Add vendor instructions
5. Submit for approval (if required)
6. Purchasing manager activates template
7. Template available for RFP creation

### RFP Generation from Template
1. User selects active template
2. System copies template structure
3. User selects target vendors
4. System creates RFP instance linked to template
5. Notifications sent to vendors
6. Reminders automated based on template settings

### Template Modification
1. **Active Template**: Cannot be edited directly
2. **Clone Process**: Create draft copy of active template
3. **Edit Clone**: Make changes to draft
4. **Activate Clone**: New version becomes active
5. **Archive Original**: Old version archived for history

---

## Migration Notes

### From DS to DD
- **Date**: 2025-11-15
- **Schema Source**: `data-struc/schema.prisma` lines 2122-2194
- **Coverage**: ✅ 100% - All required tables exist in schema
- **Changes**: None - DD document describes existing schema structure

### Future Enhancements
1. **Template Versioning**: Consider adding version tracking table
2. **Template Categories**: Add categorization/tagging for easier discovery
3. **Template Analytics**: Track usage statistics and success rates
4. **Template Sharing**: Enable template sharing across departments
5. **Auto-fill Rules**: Define rules for auto-populating certain fields

---

## Document Metadata

**Created**: 2025-11-15
**Schema Version**: As of schema.prisma commit 9fbc771
**Coverage**: 2 entities from schema.prisma
**Status**: Active - Ready for use

---

**End of Data Definition Document**
