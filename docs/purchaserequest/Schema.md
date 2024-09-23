### 1.2 PRItem Table

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier for the PR item |
| pr_id | UUID | FOREIGN KEY, NOT NULL | Reference to the PurchaseRequest table |
| product_id | UUID | FOREIGN KEY, NOT NULL | Reference to the Product table |
| location | VARCHAR(100) | NOT NULL | Location where the item is stored or needed |
| quantity_requested | DECIMAL(10,2) | NOT NULL | Quantity of the item requested |
| quantity_approved | DECIMAL(10,2) | | Quantity of the item approved (if different from requested) |
| unit | VARCHAR(20) | NOT NULL | Unit of measurement (e.g., Kgs, pcs) |
| currency | VARCHAR(3) | NOT NULL | Currency code (e.g., THB, USD) |
| price_current | DECIMAL(10,2) | NOT NULL | Current price per unit |
| price_last | DECIMAL(10,2) | | Last known price per unit |
| total_amount | DECIMAL(10,2) | NOT NULL | Total amount for this item (quantity * price) |
| status | ENUM('Pending', 'Approved', 'Rejected') | NOT NULL | Status of the item within the PR |
| comment | TEXT | | Additional notes or comments for this item |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp of item creation |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp of last update |

### Indexes
- pr_id
- product_id
- status

### Constraints
- quantity_requested must be greater than 0
- price_current must be greater than or equal to 0
- total_amount must be equal to quantity_requested * price_current

This updated PRItem table structure provides a more comprehensive and flexible approach to managing items within a purchase request. It includes fields for both requested and approved quantities, current and last prices, and allows for detailed tracking of each item's status and location.