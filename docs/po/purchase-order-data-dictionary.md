# Purchase Order Module - Data Dictionary

This document provides a comprehensive data dictionary for the Purchase Order module in the Carmen F&B Management System. It defines all entities, attributes, data types, and relationships used within the module.

## 1. Core Entities

### 1.1 Purchase Order

The `purchase_orders` table stores the main purchase order information.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| id | UUID | Unique identifier for the purchase order | Primary Key | "550e8400-e29b-41d4-a716-446655440000" |
| number | VARCHAR(20) | Unique reference number for the purchase order | Unique, Required | "PO-2023-001" |
| vendor_id | UUID | Reference to the vendor | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440001" |
| vendor_name | VARCHAR(100) | Name of the vendor | Required | "Global Foods Supplier" |
| order_date | DATE | Date when the order was created | Required | "2023-01-15" |
| delivery_date | DATE | Expected delivery date | Optional | "2023-01-30" |
| status | VARCHAR(20) | Current status of the purchase order | Required | "draft" |
| currency_code | VARCHAR(3) | Currency code for the transaction | Required | "USD" |
| exchange_rate | DECIMAL(10,5) | Exchange rate to base currency | Required, Default: 1.0 | 1.00000 |
| description | TEXT | General description of the purchase order | Optional | "Monthly grocery supplies" |
| remarks | TEXT | Additional remarks | Optional | "Please deliver before noon" |
| email | VARCHAR(100) | Contact email for the purchase order | Optional | "procurement@example.com" |
| buyer | VARCHAR(100) | Name of the buyer | Optional | "John Smith" |
| credit_terms | VARCHAR(50) | Credit terms for the purchase order | Optional | "Net 30" |
| base_currency_code | VARCHAR(3) | Base currency code for accounting | Required | "USD" |
| base_subtotal_price | DECIMAL(15,2) | Subtotal in base currency | Required | 1000.00 |
| subtotal_price | DECIMAL(15,2) | Subtotal in transaction currency | Required | 1000.00 |
| base_net_amount | DECIMAL(15,2) | Net amount in base currency | Required | 950.00 |
| net_amount | DECIMAL(15,2) | Net amount in transaction currency | Required | 950.00 |
| base_disc_amount | DECIMAL(15,2) | Discount amount in base currency | Required | 50.00 |
| discount_amount | DECIMAL(15,2) | Discount amount in transaction currency | Required | 50.00 |
| base_tax_amount | DECIMAL(15,2) | Tax amount in base currency | Required | 95.00 |
| tax_amount | DECIMAL(15,2) | Tax amount in transaction currency | Required | 95.00 |
| base_total_amount | DECIMAL(15,2) | Total amount in base currency | Required | 1045.00 |
| total_amount | DECIMAL(15,2) | Total amount in transaction currency | Required | 1045.00 |
| created_by | UUID | Reference to the user who created the PO | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440002" |
| approved_by | UUID | Reference to the user who approved the PO | Foreign Key, Optional | "550e8400-e29b-41d4-a716-446655440003" |
| approval_date | TIMESTAMP | Date and time when the PO was approved | Optional | "2023-01-16T10:30:00Z" |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-15T10:30:00Z" |
| updated_at | TIMESTAMP | Date and time when the record was last updated | Required, Default: CURRENT_TIMESTAMP | "2023-01-15T10:30:00Z" |
| version | INTEGER | Version number for optimistic concurrency control | Required, Default: 1 | 1 |

### 1.2 Purchase Order Item

The `purchase_order_items` table stores the items included in a purchase order.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| id | UUID | Unique identifier for the purchase order item | Primary Key | "550e8400-e29b-41d4-a716-446655440004" |
| purchase_order_id | UUID | Reference to the purchase order | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440000" |
| item_id | UUID | Reference to the item | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440005" |
| name | VARCHAR(100) | Name of the item | Required | "Premium Jasmine Rice" |
| description | TEXT | Description of the item | Optional | "High-quality jasmine rice from Thailand" |
| conv_rate | DECIMAL(10,3) | Conversion rate between order unit and base unit | Required, Default: 1.000 | 1.000 |
| ordered_quantity | DECIMAL(15,3) | Quantity ordered in order unit | Required | 100.000 |
| order_unit | VARCHAR(20) | Unit of measure for ordering | Required | "kg" |
| base_quantity | DECIMAL(15,3) | Quantity in base unit | Required | 100.000 |
| base_unit | VARCHAR(20) | Base unit of measure | Required | "kg" |
| base_receiving_qty | DECIMAL(15,3) | Quantity to be received in base unit | Required | 100.000 |
| received_quantity | DECIMAL(15,3) | Quantity already received | Required, Default: 0.000 | 0.000 |
| remaining_quantity | DECIMAL(15,3) | Quantity remaining to be received | Required | 100.000 |
| unit_price | DECIMAL(15,2) | Price per unit | Required | 2.50 |
| status | VARCHAR(20) | Status of the item | Required | "pending" |
| is_foc | BOOLEAN | Whether the item is free of charge | Required, Default: false | false |
| tax_rate | DECIMAL(5,2) | Tax rate as a percentage | Required, Default: 0.00 | 7.00 |
| discount_rate | DECIMAL(5,2) | Discount rate as a percentage | Required, Default: 0.00 | 5.00 |
| base_subtotal_price | DECIMAL(15,2) | Subtotal in base currency | Required | 250.00 |
| subtotal_price | DECIMAL(15,2) | Subtotal in transaction currency | Required | 250.00 |
| base_net_amount | DECIMAL(15,2) | Net amount in base currency | Required | 237.50 |
| net_amount | DECIMAL(15,2) | Net amount in transaction currency | Required | 237.50 |
| base_disc_amount | DECIMAL(15,2) | Discount amount in base currency | Required | 12.50 |
| discount_amount | DECIMAL(15,2) | Discount amount in transaction currency | Required | 12.50 |
| base_tax_amount | DECIMAL(15,2) | Tax amount in base currency | Required | 16.63 |
| tax_amount | DECIMAL(15,2) | Tax amount in transaction currency | Required | 16.63 |
| base_total_amount | DECIMAL(15,2) | Total amount in base currency | Required | 254.13 |
| total_amount | DECIMAL(15,2) | Total amount in transaction currency | Required | 254.13 |
| comment | TEXT | Additional comments for the item | Optional | "Please ensure fresh batch" |
| tax_included | BOOLEAN | Whether tax is included in the unit price | Required, Default: false | false |
| discount_adjustment | BOOLEAN | Whether discount has been manually adjusted | Required, Default: false | false |
| tax_adjustment | BOOLEAN | Whether tax has been manually adjusted | Required, Default: false | false |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-15T10:30:00Z" |
| updated_at | TIMESTAMP | Date and time when the record was last updated | Required, Default: CURRENT_TIMESTAMP | "2023-01-15T10:30:00Z" |

### 1.3 Purchase Order Status History

The `purchase_order_status_history` table tracks changes to the purchase order status.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| id | UUID | Unique identifier for the status history record | Primary Key | "550e8400-e29b-41d4-a716-446655440006" |
| purchase_order_id | UUID | Reference to the purchase order | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440000" |
| from_status | VARCHAR(20) | Previous status | Required | "draft" |
| to_status | VARCHAR(20) | New status | Required | "sent" |
| changed_by | UUID | Reference to the user who changed the status | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440002" |
| reason | TEXT | Reason for the status change | Optional | "Order finalized and sent to vendor" |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-16T09:45:00Z" |

### 1.4 Purchase Order Attachment

The `purchase_order_attachments` table stores documents attached to purchase orders.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| id | UUID | Unique identifier for the attachment | Primary Key | "550e8400-e29b-41d4-a716-446655440007" |
| purchase_order_id | UUID | Reference to the purchase order | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440000" |
| file_name | VARCHAR(255) | Name of the file | Required | "vendor_quote.pdf" |
| file_type | VARCHAR(50) | MIME type of the file | Required | "application/pdf" |
| file_size | INTEGER | Size of the file in bytes | Required | 1048576 |
| file_path | VARCHAR(255) | Path to the file in storage | Required | "attachments/po/550e8400-e29b-41d4-a716-446655440000/vendor_quote.pdf" |
| description | TEXT | Description of the attachment | Optional | "Vendor quote for reference" |
| uploaded_by | UUID | Reference to the user who uploaded the file | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440002" |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-15T11:15:00Z" |

### 1.5 Purchase Order Comment

The `purchase_order_comments` table stores comments related to purchase orders.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| id | UUID | Unique identifier for the comment | Primary Key | "550e8400-e29b-41d4-a716-446655440008" |
| purchase_order_id | UUID | Reference to the purchase order | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440000" |
| comment | TEXT | Content of the comment | Required | "Please expedite this order as we are running low on stock." |
| commented_by | UUID | Reference to the user who made the comment | Foreign Key, Required | "550e8400-e29b-41d4-a716-446655440002" |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-15T14:20:00Z" |

## 2. Reference Entities

### 2.1 Purchase Order Status

The `purchase_order_statuses` table defines the possible statuses for purchase orders.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| code | VARCHAR(20) | Unique code for the status | Primary Key | "draft" |
| name | VARCHAR(50) | Display name for the status | Required | "Draft" |
| description | TEXT | Description of the status | Optional | "Purchase order is in draft state and can be edited" |
| is_active | BOOLEAN | Whether the status is active | Required, Default: true | true |
| display_order | INTEGER | Order for display in UI | Required | 1 |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-01T00:00:00Z" |
| updated_at | TIMESTAMP | Date and time when the record was last updated | Required, Default: CURRENT_TIMESTAMP | "2023-01-01T00:00:00Z" |

### 2.2 Purchase Order Item Status

The `purchase_order_item_statuses` table defines the possible statuses for purchase order items.

| Attribute | Data Type | Description | Constraints | Example |
|-----------|-----------|-------------|-------------|---------|
| code | VARCHAR(20) | Unique code for the status | Primary Key | "pending" |
| name | VARCHAR(50) | Display name for the status | Required | "Pending" |
| description | TEXT | Description of the status | Optional | "Item is pending and has not been ordered yet" |
| is_active | BOOLEAN | Whether the status is active | Required, Default: true | true |
| display_order | INTEGER | Order for display in UI | Required | 1 |
| created_at | TIMESTAMP | Date and time when the record was created | Required, Default: CURRENT_TIMESTAMP | "2023-01-01T00:00:00Z" |
| updated_at | TIMESTAMP | Date and time when the record was last updated | Required, Default: CURRENT_TIMESTAMP | "2023-01-01T00:00:00Z" |

## 3. Relationships

### 3.1 Primary Relationships

- **One-to-Many**: A purchase order has many items
  - `purchase_orders.id` → `purchase_order_items.purchase_order_id`

- **One-to-Many**: A purchase order has many status history records
  - `purchase_orders.id` → `purchase_order_status_history.purchase_order_id`

- **One-to-Many**: A purchase order has many attachments
  - `purchase_orders.id` → `purchase_order_attachments.purchase_order_id`

- **One-to-Many**: A purchase order has many comments
  - `purchase_orders.id` → `purchase_order_comments.purchase_order_id`

### 3.2 Foreign Key Relationships

- **purchase_orders.vendor_id** references **vendors.id**
- **purchase_orders.created_by** references **users.id**
- **purchase_orders.approved_by** references **users.id**
- **purchase_order_items.purchase_order_id** references **purchase_orders.id**
- **purchase_order_items.item_id** references **items.id**
- **purchase_order_status_history.purchase_order_id** references **purchase_orders.id**
- **purchase_order_status_history.changed_by** references **users.id**
- **purchase_order_attachments.purchase_order_id** references **purchase_orders.id**
- **purchase_order_attachments.uploaded_by** references **users.id**
- **purchase_order_comments.purchase_order_id** references **purchase_orders.id**
- **purchase_order_comments.commented_by** references **users.id**

## 4. Validation Rules

### 4.1 Purchase Order Validation Rules

1. **PO_VAL_001**: Purchase order number must be unique
2. **PO_VAL_002**: Order date must not be in the future
3. **PO_VAL_003**: Delivery date must be after order date
4. **PO_VAL_004**: Exchange rate must be positive
5. **PO_VAL_005**: Total amount must equal sum of item totals
6. **PO_VAL_006**: Purchase order must have at least one item
7. **PO_VAL_007**: Status transitions must follow the defined state diagram
8. **PO_VAL_008**: Currency code must be valid ISO 4217 code
9. **PO_VAL_009**: Email must be a valid email format
10. **PO_VAL_010**: Vendor must be active and approved

### 4.2 Purchase Order Item Validation Rules

1. **PO_ITEM_VAL_001**: Ordered quantity must be positive
2. **PO_ITEM_VAL_002**: Unit price must be non-negative
3. **PO_ITEM_VAL_003**: Tax rate must be between 0 and 100
4. **PO_ITEM_VAL_004**: Discount rate must be between 0 and 100
5. **PO_ITEM_VAL_005**: Total amount must equal (net amount + tax amount)
6. **PO_ITEM_VAL_006**: Net amount must equal (subtotal - discount amount)
7. **PO_ITEM_VAL_007**: Subtotal must equal (ordered quantity × unit price)
8. **PO_ITEM_VAL_008**: Remaining quantity must equal (ordered quantity - received quantity)
9. **PO_ITEM_VAL_009**: Base quantity must equal (ordered quantity × conversion rate)
10. **PO_ITEM_VAL_010**: Item must be active and available for purchase

## 5. Calculation Rules

### 5.1 Financial Calculations

1. **Item Subtotal**: `ordered_quantity × unit_price`
2. **Item Discount Amount**: `subtotal × (discount_rate ÷ 100)`
3. **Item Net Amount**: `subtotal - discount_amount`
4. **Item Tax Amount**: `net_amount × (tax_rate ÷ 100)`
5. **Item Total Amount**: `net_amount + tax_amount`
6. **Base Currency Conversion**: `amount × exchange_rate`
7. **Order Subtotal**: Sum of all item subtotals
8. **Order Total Discount**: Sum of all item discount amounts
9. **Order Total Tax**: Sum of all item tax amounts
10. **Order Final Total**: `subtotal - total_discount + total_tax`

### 5.2 Rounding Rules

1. All intermediate calculations must be rounded to 2 decimal places before use in subsequent calculations
2. Final monetary amounts must be rounded to 2 decimal places
3. Quantities must be rounded to 3 decimal places
4. Exchange rates must be rounded to 5 decimal places
5. Half-up (banker's) rounding method must be used for all rounding operations

## 6. Enumerated Values

### 6.1 Purchase Order Status Values

| Code | Name | Description |
|------|------|-------------|
| draft | Draft | Purchase order is in draft state and can be edited |
| sent | Sent | Purchase order has been sent to the vendor |
| partial | Partially Received | Some items have been received |
| fully_received | Fully Received | All items have been received |
| closed | Closed | Purchase order has been closed |
| cancelled | Cancelled | Purchase order has been cancelled |
| deleted | Deleted | Purchase order has been deleted |

### 6.2 Purchase Order Item Status Values

| Code | Name | Description |
|------|------|-------------|
| pending | Pending | Item is pending and has not been ordered yet |
| ordered | Ordered | Item has been ordered |
| partially_received | Partially Received | Some quantity has been received |
| fully_received | Fully Received | Full quantity has been received |
| closed | Closed | Item has been closed |
| cancelled | Cancelled | Item has been cancelled |

## 7. Indexes and Constraints

### 7.1 Indexes

1. Primary key indexes on all tables
2. Foreign key indexes for all relationships
3. Index on `purchase_orders.number` for quick lookup
4. Index on `purchase_orders.vendor_id` for filtering by vendor
5. Index on `purchase_orders.status` for filtering by status
6. Index on `purchase_orders.order_date` for date range queries
7. Index on `purchase_order_items.purchase_order_id` for quick access to items
8. Index on `purchase_order_items.item_id` for filtering by item
9. Composite index on `purchase_order_status_history.purchase_order_id` and `created_at` for chronological status tracking

### 7.2 Constraints

1. Unique constraint on `purchase_orders.number`
2. Check constraint on `purchase_orders.exchange_rate` to ensure positive value
3. Check constraint on `purchase_order_items.ordered_quantity` to ensure positive value
4. Check constraint on `purchase_order_items.unit_price` to ensure non-negative value
5. Check constraint on `purchase_order_items.tax_rate` to ensure value between 0 and 100
6. Check constraint on `purchase_order_items.discount_rate` to ensure value between 0 and 100
7. Foreign key constraints with appropriate ON DELETE and ON UPDATE actions
8. Check constraint on `purchase_orders.order_date` to ensure not in future
9. Check constraint on `purchase_orders.delivery_date` to ensure after order date when provided

## 8. Glossary

- **PO**: Purchase Order
- **FOC**: Free of Charge
- **GRN**: Goods Received Note
- **UUID**: Universally Unique Identifier
- **ISO 4217**: International standard for currency codes
- **Base Currency**: Primary currency used for accounting purposes
- **Transaction Currency**: Currency used for the specific transaction
- **Base Unit**: Standard unit of measure for an item
- **Order Unit**: Unit of measure used for ordering an item
- **Conversion Rate**: Factor to convert between order unit and base unit 