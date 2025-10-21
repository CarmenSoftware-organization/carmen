# Carmen ERP - Data Dictionary

> **Document Type:** Data Model Reference
> **Audience:** Developers, Database Administrators, Technical Teams
> **Last Updated:** October 20, 2025
> **Version:** 1.0

---

## Overview

This data dictionary provides comprehensive documentation of all database tables, columns, data types, and relationships in the Carmen ERP system. The database follows a normalized design with proper foreign key constraints and indexes for optimal performance.

---

## Core Entities

### User Management

#### Table: `User`
**Purpose:** Stores user accounts and authentication information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique user identifier |
| name | String | NOT NULL | User's full name |
| email | String | UNIQUE, NOT NULL | User's email address (login) |
| password | String | NOT NULL | Hashed password |
| role | Enum | NOT NULL | User role (staff, manager, admin, etc.) |
| departmentId | String | FK → Department | Associated department |
| locationId | String | FK → Location | Primary location |
| isActive | Boolean | DEFAULT true | Account status |
| createdAt | DateTime | DEFAULT now() | Account creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `departmentId`
- INDEX on `locationId`
- INDEX on `role`

---

#### Table: `Department`
**Purpose:** Organizational departments and cost centers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique department identifier |
| code | String | UNIQUE, NOT NULL | Department code (e.g., "F&B", "KITCHEN") |
| name | String | NOT NULL | Department name |
| description | String | NULLABLE | Department description |
| costCenter | String | NULLABLE | Accounting cost center code |
| managerId | String | FK → User | Department manager |
| isActive | Boolean | DEFAULT true | Department status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

---

#### Table: `Location`
**Purpose:** Physical locations (outlets, warehouses, kitchens)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique location identifier |
| code | String | UNIQUE, NOT NULL | Location code |
| name | String | NOT NULL | Location name |
| type | Enum | NOT NULL | Location type (outlet, warehouse, kitchen, office) |
| address | String | NULLABLE | Physical address |
| city | String | NULLABLE | City |
| country | String | NULLABLE | Country |
| isActive | Boolean | DEFAULT true | Location status |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

---

### Procurement Module

#### Table: `PurchaseRequest`
**Purpose:** Purchase request documents initiated by departments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique PR identifier |
| prNumber | String | UNIQUE, NOT NULL | PR document number (auto-generated) |
| requestorId | String | FK → User, NOT NULL | User who created the request |
| departmentId | String | FK → Department, NOT NULL | Requesting department |
| locationId | String | FK → Location, NOT NULL | Delivery location |
| status | Enum | NOT NULL | PR status (draft, submitted, approved, rejected, converted) |
| priority | Enum | NOT NULL | Priority level (low, normal, high, urgent) |
| requestedDate | DateTime | NOT NULL | Date when items are needed |
| description | String | NULLABLE | PR description/notes |
| totalAmount | Decimal | NULLABLE | Total estimated amount |
| approvedBy | String | FK → User, NULLABLE | Approving user |
| approvedDate | DateTime | NULLABLE | Approval timestamp |
| rejectionReason | String | NULLABLE | Rejection reason if rejected |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Related Tables:**
- `PurchaseRequestItem` - Line items for the purchase request
- `PurchaseRequestApproval` - Approval workflow history

---

#### Table: `PurchaseRequestItem`
**Purpose:** Line items within purchase requests

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique item identifier |
| purchaseRequestId | String | FK → PurchaseRequest, NOT NULL | Parent PR |
| productId | String | FK → Product, NOT NULL | Requested product |
| quantity | Decimal | NOT NULL | Requested quantity |
| unitId | String | FK → Unit, NOT NULL | Unit of measure |
| estimatedUnitPrice | Decimal | NULLABLE | Estimated unit price |
| estimatedTotal | Decimal | NULLABLE | Estimated line total |
| notes | String | NULLABLE | Item-specific notes |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

---

#### Table: `PurchaseOrder`
**Purpose:** Purchase orders sent to vendors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique PO identifier |
| poNumber | String | UNIQUE, NOT NULL | PO document number (auto-generated) |
| vendorId | String | FK → Vendor, NOT NULL | Supplier |
| locationId | String | FK → Location, NOT NULL | Delivery location |
| status | Enum | NOT NULL | PO status (draft, sent, acknowledged, delivered, cancelled) |
| orderDate | DateTime | NOT NULL | Order date |
| expectedDate | DateTime | NULLABLE | Expected delivery date |
| subtotal | Decimal | NOT NULL | Subtotal before tax |
| taxAmount | Decimal | NOT NULL | Tax amount |
| totalAmount | Decimal | NOT NULL | Total amount |
| paymentTerms | String | NULLABLE | Payment terms |
| deliveryTerms | String | NULLABLE | Delivery terms |
| notes | String | NULLABLE | PO notes |
| createdBy | String | FK → User, NOT NULL | Creating user |
| approvedBy | String | FK → User, NULLABLE | Approving user |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Related Tables:**
- `PurchaseOrderItem` - Line items for the purchase order
- `GoodsReceivedNote` - Receipts against this PO

---

#### Table: `GoodsReceivedNote`
**Purpose:** Receipt documents for delivered goods

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique GRN identifier |
| grnNumber | String | UNIQUE, NOT NULL | GRN document number (auto-generated) |
| purchaseOrderId | String | FK → PurchaseOrder, NULLABLE | Related PO (if any) |
| vendorId | String | FK → Vendor, NOT NULL | Supplier |
| locationId | String | FK → Location, NOT NULL | Receiving location |
| status | Enum | NOT NULL | GRN status (draft, posted, cancelled) |
| receiptDate | DateTime | NOT NULL | Receipt date |
| invoiceNumber | String | NULLABLE | Vendor invoice number |
| totalAmount | Decimal | NOT NULL | Total received amount |
| notes | String | NULLABLE | Receipt notes |
| receivedBy | String | FK → User, NOT NULL | Receiving user |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

---

### Inventory Module

#### Table: `Product`
**Purpose:** Master product catalog

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique product identifier |
| sku | String | UNIQUE, NOT NULL | Stock keeping unit |
| name | String | NOT NULL | Product name |
| description | String | NULLABLE | Product description |
| categoryId | String | FK → Category, NULLABLE | Product category |
| baseUnitId | String | FK → Unit, NOT NULL | Base unit of measure |
| isActive | Boolean | DEFAULT true | Product status |
| trackInventory | Boolean | DEFAULT true | Whether to track inventory |
| minStockLevel | Decimal | NULLABLE | Minimum stock level alert |
| maxStockLevel | Decimal | NULLABLE | Maximum stock level |
| reorderPoint | Decimal | NULLABLE | Reorder point |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

---

#### Table: `Stock`
**Purpose:** Current inventory levels by location

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique stock record identifier |
| productId | String | FK → Product, NOT NULL | Product |
| locationId | String | FK → Location, NOT NULL | Storage location |
| quantity | Decimal | NOT NULL | Current quantity |
| unitId | String | FK → Unit, NOT NULL | Unit of measure |
| lastCountDate | DateTime | NULLABLE | Last physical count date |
| lastTransactionDate | DateTime | NULLABLE | Last movement date |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Unique Constraint:** `(productId, locationId, unitId)`

---

#### Table: `PhysicalCount`
**Purpose:** Physical inventory count sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique count identifier |
| countNumber | String | UNIQUE, NOT NULL | Count document number |
| locationId | String | FK → Location, NOT NULL | Location being counted |
| countDate | DateTime | NOT NULL | Count date |
| status | Enum | NOT NULL | Count status (active, completed, cancelled) |
| countType | Enum | NOT NULL | Count type (full, partial, cycle) |
| notes | String | NULLABLE | Count notes |
| createdBy | String | FK → User, NOT NULL | Creating user |
| completedBy | String | FK → User, NULLABLE | Completing user |
| completedDate | DateTime | NULLABLE | Completion timestamp |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

**Related Tables:**
- `PhysicalCountItem` - Products being counted

---

### Vendor Management

#### Table: `Vendor`
**Purpose:** Supplier master data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | String | PK, UUID | Unique vendor identifier |
| vendorCode | String | UNIQUE, NOT NULL | Vendor code |
| companyName | String | NOT NULL | Company name |
| contactPerson | String | NULLABLE | Primary contact person |
| email | String | NULLABLE | Contact email |
| phone | String | NULLABLE | Contact phone |
| address | String | NULLABLE | Vendor address |
| city | String | NULLABLE | City |
| country | String | NULLABLE | Country |
| taxId | String | NULLABLE | Tax identification number |
| paymentTerms | String | NULLABLE | Standard payment terms |
| isActive | Boolean | DEFAULT true | Vendor status |
| rating | Int | NULLABLE | Vendor rating (1-5) |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | Auto-updated | Last modification timestamp |

---

## Enumerations

### User Roles
- `staff` - Regular staff member
- `department-manager` - Department manager with approval authority
- `financial-manager` - Finance department manager
- `purchasing-staff` - Procurement specialist
- `counter` - Inventory counter
- `chef` - Kitchen chef/manager

### Document Statuses

**Purchase Request:**
- `draft` - Being edited
- `submitted` - Awaiting approval
- `approved` - Approved for PO creation
- `rejected` - Rejected
- `converted` - Converted to PO

**Purchase Order:**
- `draft` - Being edited
- `sent` - Sent to vendor
- `acknowledged` - Vendor confirmed
- `partially_received` - Partially delivered
- `received` - Fully delivered
- `cancelled` - Cancelled

**GRN:**
- `draft` - Being edited
- `posted` - Posted to inventory
- `cancelled` - Cancelled

---

## Relationships

### One-to-Many
- `Department` → `User` (departmentId)
- `Location` → `User` (locationId)
- `User` → `PurchaseRequest` (requestorId)
- `Vendor` → `PurchaseOrder` (vendorId)
- `PurchaseOrder` → `GoodsReceivedNote` (purchaseOrderId)
- `Product` → `Stock` (productId)
- `Location` → `Stock` (locationId)

### Many-to-Many (through junction tables)
- `PurchaseRequest` ↔ `Product` (through `PurchaseRequestItem`)
- `PurchaseOrder` ↔ `Product` (through `PurchaseOrderItem`)
- `GoodsReceivedNote` ↔ `Product` (through `GoodsReceivedNoteItem`)

---

## Indexes and Performance

### Primary Indexes
- All tables have a UUID primary key with B-tree index
- Unique constraints on document numbers (PRNumber, PONumber, GRNNumber, etc.)

### Foreign Key Indexes
- All foreign key relationships have indexes for join performance
- Composite indexes on frequently queried combinations

### Query Optimization
- Document number searches: UNIQUE index
- Date range queries: B-tree indexes on date columns
- Status filters: Index on status enum columns
- User/Department lookups: Index on user and department IDs

---

## Data Integrity

### Constraints
1. **Foreign Keys:** All relationships enforced with ON DELETE CASCADE or ON DELETE SET NULL as appropriate
2. **Unique Constraints:** Document numbers, SKUs, vendor codes
3. **Check Constraints:** Status values, quantity > 0, amounts >= 0

### Triggers and Validations
- Document number auto-generation
- Stock level updates on inventory transactions
- Audit trail for critical changes
- Workflow state transitions

---

## Related Documentation

- [Schema File](./schema.prisma) - Prisma schema definition
- [System Architecture](../02-architecture/system-architecture.md) - Database architecture
- [API Reference](../06-api-reference/) - Database access patterns
