# Inventory Management System Data Dictionary

## Common Types

### Money
| Field    | Type   | Description                |
|----------|--------|----------------------------|
| amount   | number | The monetary amount        |
| currency | string | The currency code          |

### Attachment
| Field         | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| id            | string    | Unique identifier for the attachment      |
| file_name     | string    | Name of the file                          |
| description   | string?   | Description of the attachment             |
| is_public     | boolean   | Whether the attachment is publicly accessible |
| date          | date      | Date when the file was attached           |
| created_by    | string    | User who attached the file                |

### ActivityLog
| Field       | Type      | Description                               |
|-------------|-----------|-------------------------------------------|
| date        | timestamp | Date and time of the activity             |
| created_by  | string    | User who performed the action             |
| action_type | string    | Type of action performed                  |
| log_message | string    | Description of the activity               |

## Currency and Exchange Rate

### Currency
| Field       | Type    | Description                               |
|-------------|---------|-------------------------------------------|
| id          | number  | Unique identifier for the currency        |
| code        | string  | Currency code (e.g., USD, EUR)            |
| description | string  | Full name or description of the currency  |
| is_active   | boolean | Whether the currency is currently active  |
| symbol      | string  | Currency symbol or code for display       |

### ExchangeRate
| Field          | Type      | Description                               |
|----------------|-----------|-------------------------------------------|
| id             | number    | Unique identifier for the exchange rate   |
| currency_code  | string    | Code of the currency for this rate        |
| currency_name  | string    | Full name of the currency                 |
| rate          | number    | The exchange rate value                   |
| last_updated  | timestamp | Date when the rate was last updated       |

## Inventory

### InventoryTransaction
| Field            | Type            | Description                               |
|------------------|-----------------|-------------------------------------------|
| transaction_id   | number          | Unique identifier for the transaction     |
| item_id         | number          | ID of the item involved                   |
| location_id     | number          | ID of the location involved               |
| transaction_type| TransactionType | Type of transaction                       |
| quantity        | number          | Quantity involved in the transaction      |
| unit_cost       | number          | Cost per unit for this transaction        |
| total_cost      | number          | Total cost of the transaction             |
| transaction_date| timestamp       | Date of the transaction                   |
| reference_no    | string?         | Reference number (e.g., GRN number)       |
| reference_type  | string?         | Type of reference (e.g., 'GRN')           |
| user_id         | number          | ID of the user who performed the transaction |
| notes           | string?         | Additional notes about the transaction    |

### InventoryAdjustment
| Field        | Type                | Description                               |
|--------------|---------------------|-------------------------------------------|
| id           | string              | Unique identifier for the adjustment      |
| date         | timestamp           | Date of the adjustment                    |
| type         | 'IN' \| 'OUT'       | Type of adjustment                        |
| status       | AdjustmentStatus    | Status of the adjustment                  |
| location     | string              | Location where adjustment is made         |
| reason       | string              | Reason for the adjustment                 |
| description  | string?             | Additional description                    |
| department   | string              | Department making the adjustment          |
| items        | StockMovementItem[] | Items being adjusted                      |
| totals       | AdjustmentTotals    | Total quantities and costs               |
| created_by   | string              | User who created the adjustment          |
| created_at   | timestamp           | Creation date and time                    |
| modified_by  | string?             | User who last modified the adjustment     |
| modified_at  | timestamp?          | Last modification date and time           |
| posted_by    | string?             | User who posted the adjustment            |
| posted_at    | timestamp?          | Posting date and time                     |
| approved_by  | string?             | User who approved the adjustment          |
| approved_at  | timestamp?          | Approval date and time                    |

### StockMovementItem
| Field          | Type     | Description                               |
|----------------|----------|-------------------------------------------|
| id             | string   | Unique identifier for the item            |
| product_name   | string   | Name of the product                       |
| sku            | string   | Stock keeping unit                        |
| location       | Location | Location information                      |
| lots           | Lot[]    | Lot information                          |
| uom            | string   | Unit of measure                          |
| unit_cost      | number   | Cost per unit                            |
| total_cost     | number   | Total cost                               |
| current_stock  | number   | Current stock level                       |
| adjusted_stock | number   | Stock level after adjustment             |

### Lot
| Field        | Type      | Description                               |
|--------------|-----------|-------------------------------------------|
| lot_no       | string    | Lot number                                |
| quantity     | number    | Quantity in the lot                       |
| uom          | string    | Unit of measure                           |
| expiry_date  | timestamp | Expiry date of the lot                    |

## Goods Received Note (GRN)

### GoodsReceiveNote
| Field               | Type            | Description                               |
|---------------------|-----------------|-------------------------------------------|
| id                  | string          | Unique identifier for the GRN             |
| ref                 | string          | Reference number                          |
| date                | date            | Date of receipt                           |
| invoice_date        | date?           | Date of the invoice                       |
| invoice_number      | string?         | Invoice number                            |
| tax_invoice_date    | date?           | Date of the tax invoice                   |
| tax_invoice_number  | string?         | Tax invoice number                        |
| description         | string          | Description of the receipt                |
| receiver            | string          | Name of the receiver                      |
| vendor              | string          | Name of the vendor                        |
| vendor_id           | string          | ID of the vendor                          |
| location            | string          | Location of receipt                       |
| currency            | string          | Currency code                             |
| status              | string          | Status of the GRN                         |
| is_consignment      | boolean         | Whether this is a consignment receipt     |
| is_cash             | boolean         | Whether this is a cash purchase           |
| items               | GRNItem[]       | Items received                            |
| attachments         | Attachment[]    | Attached documents                        |
| activity_log        | ActivityLog[]   | Log of activities                         |
| exchange_rate       | number          | Exchange rate used                        |
| base_currency       | string          | Base currency code                        |
| base_subtotal_price | number          | Subtotal in base currency                 |
| subtotal_price      | number          | Subtotal in transaction currency          |
| base_net_amount     | number          | Net amount in base currency               |
| net_amount          | number          | Net amount in transaction currency        |
| base_disc_amount    | number          | Discount amount in base currency          |
| discount_amount     | number          | Discount amount in transaction currency   |
| base_tax_amount     | number          | Tax amount in base currency               |
| tax_amount          | number          | Tax amount in transaction currency        |
| base_total_amount   | number          | Total amount in base currency             |
| total_amount        | number          | Total amount in transaction currency      |

### GRNItem
| Field               | Type          | Description                               |
|---------------------|---------------|-------------------------------------------|
| id                  | string        | Unique identifier for the GRN item        |
| name                | string        | Name of the item                          |
| description         | string        | Description of the item                   |
| job_code            | string        | Job code                                  |
| ordered_quantity    | number        | Quantity ordered                          |
| received_quantity   | number        | Quantity received                         |
| unit                | string        | Unit of measure                           |
| unit_price          | number        | Price per unit                            |
| subtotal_amount     | number        | Subtotal amount                           |
| total_amount        | number        | Total amount                              |
| tax_rate            | number        | Tax rate                                  |
| tax_amount          | number        | Tax amount                                |
| discount_rate       | number        | Discount rate                             |
| discount_amount     | number        | Discount amount                           |
| net_amount          | number        | Net amount                                |
| expiry_date         | date?         | Expiry date                               |
| serial_number       | string?       | Serial number                             |
| notes               | string?       | Additional notes                          |
| lot_number          | string        | Lot number                                |
| delivery_point      | string        | Delivery point                            |
| delivery_date       | timestamp     | Delivery date and time                    |
| location            | string        | Location                                  |
| is_free_of_charge   | boolean       | Whether item is free of charge            |
| tax_included        | boolean       | Whether tax is included in price          |
| adjustments         | Adjustments   | Tax and discount adjustments              |

### Adjustments
| Field    | Type    | Description                               |
|----------|---------|-------------------------------------------|
| discount | boolean | Whether discount adjustment is applied     |
| tax      | boolean | Whether tax adjustment is applied         |

## Purchase Order (PO)

### PurchaseOrder
| Field                | Type                | Description                               |
|---------------------|---------------------|-------------------------------------------|
| id                  | string             | Unique identifier for the purchase order  |
| number              | string             | Purchase order number                     |
| vendor_id           | number             | ID of the vendor                          |
| vendor_name         | string             | Name of the vendor                        |
| order_date          | date               | Date the order was placed                 |
| delivery_date       | date?              | Expected delivery date                    |
| status              | PurchaseOrderStatus| Status of the purchase order              |
| currency_code       | string             | Currency code for this order              |
| exchange_rate       | number             | Exchange rate used                        |
| notes               | string?            | Additional notes                          |
| created_by          | number             | ID of the user who created the order      |
| approved_by         | number?            | ID of the user who approved the order     |
| approval_date       | date?              | Date of approval                          |
| email               | string             | Contact email                             |
| buyer               | string             | Buyer name                                |
| credit_terms        | string             | Credit terms                              |
| description         | string             | Description of the order                  |
| remarks             | string             | Additional remarks                        |
| items               | PurchaseOrderItem[]| Line items in the order                   |
| base_currency_code  | string             | Base currency code                        |
| base_subtotal_price | number             | Subtotal in base currency                 |
| subtotal_price      | number             | Subtotal in transaction currency          |
| base_net_amount     | number             | Net amount in base currency               |
| net_amount          | number             | Net amount in transaction currency        |
| base_disc_amount    | number             | Discount amount in base currency          |
| discount_amount     | number             | Discount amount in transaction currency   |
| base_tax_amount     | number             | Tax amount in base currency               |
| tax_amount          | number             | Tax amount in transaction currency        |
| base_total_amount   | number             | Total amount in base currency             |
| total_amount        | number             | Total amount in transaction currency      |

### PurchaseOrderItem
| Field                | Type                    | Description                               |
|---------------------|-------------------------|-------------------------------------------|
| id                  | string                  | Unique identifier for the item            |
| name                | string                  | Item name                                 |
| description         | string                  | Item description                          |
| conv_rate           | number                  | Conversion rate                           |
| ordered_quantity    | number                  | Quantity ordered                          |
| order_unit          | string                  | Unit of order                             |
| base_quantity       | number                  | Quantity in base unit                     |
| base_unit           | string                  | Base unit                                 |
| base_receiving_qty  | number                  | Receiving quantity in base unit           |
| received_quantity   | number                  | Quantity received                         |
| remaining_quantity  | number                  | Remaining quantity to receive             |
| unit_price          | number                  | Price per unit                            |
| status              | PurchaseRequestItemStatus| Status of the item                       |
| is_foc              | boolean                 | Whether item is Free of Charge            |
| tax_rate            | number                  | Tax rate                                  |
| discount_rate       | number                  | Discount rate                             |
| attachments         | Attachment[]            | Attached files                            |
| base_subtotal_price | number                  | Subtotal in base currency                 |
| subtotal_price      | number                  | Subtotal in transaction currency          |
| base_net_amount     | number                  | Net amount in base currency               |
| net_amount          | number                  | Net amount in transaction currency        |
| base_disc_amount    | number                  | Discount amount in base currency          |
| discount_amount     | number                  | Discount amount in transaction currency   |
| base_tax_amount     | number                  | Tax amount in base currency               |
| tax_amount          | number                  | Tax amount in transaction currency        |
| base_total_amount   | number                  | Total amount in base currency             |
| total_amount        | number                  | Total amount in transaction currency      |
| comment             | string?                 | Additional comments                       |
| tax_included        | boolean                 | Whether tax is included in price          |
| adjustments         | { discount: boolean; tax: boolean; } | Tax and discount adjustments |
| last_receive_date   | timestamp?              | Date and time of last receipt             |
| last_price          | number?                 | Last purchase price                       |
| last_vendor_id      | number?                 | ID of last vendor                         |
| attached_file       | File?                   | Attached file                             |
| inventory_info      | InventoryInfo           | Inventory information                     |
| received            | GRNItem[]?              | Received items                            |

### InventoryInfo
| Field                  | Type      | Description                               |
|------------------------|-----------|-------------------------------------------|
| on_hand                | number    | Current on-hand quantity                  |
| on_ordered             | number    | Quantity on order                         |
| reorder_level          | number    | Reorder point                            |
| restock_level          | number    | Restock level                            |
| avg_monthly_usage      | number    | Average monthly usage                     |
| last_price             | number    | Last purchase price                       |
| last_order_date        | date      | Date of last order                        |
| last_vendor            | string    | Last vendor name                          |

## Vendor Management

### Vendor
| Field                     | Type         | Description                               |
|---------------------------|--------------|-------------------------------------------|
| id                        | string       | Unique identifier for the vendor          |
| company_name              | string       | Name of the company                       |
| business_registration_number| string       | Business registration number              |
| tax_id                    | string       | Tax identification number                 |
| establishment_date        | date         | Date of establishment                     |
| business_type_id          | string       | Type of business                          |
| rating                    | number       | Vendor rating                             |
| is_active                 | boolean      | Whether the vendor is active              |
| addresses                 | Address[]    | List of addresses                         |
| contacts                  | Contact[]    | List of contacts                          |
| certifications           | Certification[]| List of certifications                   |
| environmental_impact      | EnvironmentalImpact? | Environmental impact data         |

### Contact
| Field      | Type    | Description                               |
|------------|---------|-------------------------------------------|
| id         | string  | Unique identifier for the contact         |
| name       | string  | Contact name                              |
| position   | string  | Position in the company                   |
| phone      | string  | Phone number                              |
| email      | string  | Email address                             |
| department | string  | Department                                |
| is_primary | boolean | Whether this is the primary contact       |

### Address
| Field         | Type    | Description                               |
|---------------|---------|-------------------------------------------|
| id            | string  | Unique identifier for the address         |
| address_type  | string  | Type of address (e.g., BILLING, SHIPPING) |
| address_line  | string  | Street address                            |
| sub_district_id | string  | Sub-district identifier                   |
| district_id   | string  | District identifier                       |
| province_id   | string  | Province identifier                       |
| postal_code   | string  | Postal code                               |
| is_primary    | boolean | Whether this is the primary address       |

### EnvironmentalImpact
| Field           | Type                | Description                               |
|-----------------|---------------------|-------------------------------------------|
| carbon_footprint | ImpactMetric        | Carbon footprint measurement             |
| energy_efficiency| ImpactMetric        | Energy efficiency measurement            |
| waste_reduction  | ImpactMetric        | Waste reduction measurement              |
| compliance_rate  | ImpactMetric        | Environmental compliance rate            |
| last_updated     | timestamp           | Last update timestamp                     |
| esg_score        | string              | Environmental, Social, Governance score   |
| certifications  | VendorCertification[]| Environmental certifications             |

### ImpactMetric
| Field     | Type   | Description                               |
|-----------|--------|-------------------------------------------|
| value     | number | Metric value                              |
| unit      | string | Unit of measurement                       |
| trend     | number | Trend indicator                           |
| benchmark | number | Benchmark value                           |

## Store Requisition (SR)

### Requisition
| Field        | Type              | Description                               |
|--------------|-------------------|-------------------------------------------|
| date         | date              | Document date                             |
| ref_no       | string           | Reference number (format: SR-YYYY-NNN)     |
| request_to   | string           | Destination store/location                 |
| store_name   | string           | Name of the store                         |
| description  | string           | Description of the requisition            |
| status       | string           | Status (Draft/In Process/Complete/Reject/Void) |
| total_amount | number           | Total amount of requisition               |
| movement     | Movement         | Movement details                          |
| items        | RequisitionItem[]| List of items requested                   |
| created_at   | timestamp        | Creation timestamp                        |
| updated_at   | timestamp        | Last update timestamp                     |
| timezone     | string           | IANA timezone identifier                  |

### RequisitionItem
| Field           | Type           | Description                               |
|-----------------|----------------|-------------------------------------------|
| id              | number         | Unique identifier for the item            |
| description     | string         | Item description                          |
| unit            | string         | Unit of measure                           |
| qty_required    | number         | Quantity required                         |
| qty_approved    | number         | Quantity approved                         |
| cost_per_unit   | number         | Cost per unit                            |
| total           | number         | Total cost                               |
| request_date    | date           | Request date                             |
| inventory       | InventoryState | Current inventory state                   |
| item_info       | ItemInfo       | Item information                          |
| qty_issued      | number         | Quantity issued                           |
| approval_status | string         | Status (Accept/Reject/Review)             |
| created_at      | timestamp      | Creation timestamp                        |
| updated_at      | timestamp      | Last update timestamp                     |

### InventoryState
| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| on_hand     | number | Current on-hand quantity                  |
| on_order    | number | Quantity on order                         |
| last_price  | number | Last purchase price                       |
| last_vendor | string | Last vendor name                          |

### ItemInfo
| Field        | Type   | Description                               |
|--------------|--------|-------------------------------------------|
| location     | string | Item location                             |
| location_code| string | Location code                             |
| item_name    | string | Name of the item                          |
| category     | string | Item category                             |
| sub_category | string | Item subcategory                          |
| item_group   | string | Item group                                |
| bar_code     | string | Barcode                                   |
| location_type| string | Location type (direct/inventory)          |

### StockMovement
| Field        | Type              | Description                               |
|--------------|-------------------|-------------------------------------------|
| id           | number            | Unique identifier for the movement        |
| movement_type| string            | Type of movement                          |
| source_doc   | string            | Source document reference                 |
| commit_date  | timestamp         | Commit date and time                      |
| posting_date | timestamp         | Posting date and time                     |
| status       | string            | Movement status                           |
| movement     | Movement          | Movement details                          |
| items        | MovementItem[]    | Items being moved                         |
| totals       | MovementTotals    | Movement totals                          |
| created_at   | timestamp         | Creation timestamp                        |
| updated_at   | timestamp         | Last update timestamp                     |
| timezone     | string            | IANA timezone identifier                  |

### Movement
| Field           | Type   | Description                               |
|-----------------|--------|-------------------------------------------|
| source          | string | Source location code                      |
| source_name     | string | Source location name                      |
| destination     | string | Destination location code                 |
| destination_name| string | Destination location name                 |
| type            | string | Movement type                             |

### MovementItem
| Field       | Type         | Description                               |
|-------------|--------------|-------------------------------------------|
| id          | number       | Unique identifier for the item            |
| product_name| string       | Name of the product                       |
| sku         | string       | Stock keeping unit                        |
| uom         | string       | Unit of measure                           |
| before_qty   | number       | Quantity before movement                  |
| in_qty       | number       | Incoming quantity                         |
| out_qty      | number       | Outgoing quantity                         |
| after_qty    | number       | Quantity after movement                   |
| unit_cost    | number       | Cost per unit                            |
| total_cost   | number       | Total cost                               |
| location     | Location     | Location information                      |
| lots         | LotMovement[]| Lot movement information                  |

### Location
| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| type        | string | Location type (INV/DIR)                   |
| code        | string | Location code                             |
| name        | string | Location name                             |
| display_type| string | Display type                              |

### LotMovement
| Field     | Type      | Description                               |
|-----------|-----------|-------------------------------------------|
| lot_no    | string    | Lot number                                |
| quantity  | number    | Quantity in the lot                       |
| uom       | string    | Unit of measure                           |
| created_at| timestamp | Creation timestamp                        |

### MovementTotals
| Field     | Type   | Description                               |
|-----------|--------|-------------------------------------------|
| in_qty     | number | Total incoming quantity                   |
| out_qty     | number | Total outgoing quantity                   |
| total_cost  | number | Total cost                               |
| lot_count   | number | Number of lots                           |

## Recipe Management

### Recipe
| Field             | Type               | Description                               |
|-------------------|--------------------|-------------------------------------------|
| id                | string             | Unique recipe identifier                  |
| title             | string             | Recipe title                              |
| description       | string             | Detailed description                      |
| ingredients       | Ingredient[]       | List of ingredients                       |
| instructions      | string[]           | Step-by-step instructions                 |
| cuisine           | CuisineType        | Associated cuisine type                   |
| category          | Category           | Recipe category                           |
| nutritionalInfo   | NutritionalInfo    | Nutritional breakdown                     |
| tags              | string[]           | Search/taxonomy tags                      |
| preparationTime   | number             | Prep time in minutes                      |
| cookingTime       | number             | Cook time in minutes                      |
| servings          | number             | Number of servings                        |
| difficulty        | 'Easy'|'Medium'|'Hard' | Difficulty level                |
| rating            | number?            | Average user rating                       |
| createdAt         | Date               | Creation timestamp                        |
| updatedAt         | Date               | Last update timestamp                     |
| imageUrl          | string?            | URL of featured image                     |

### Ingredient
| Field         | Type     | Description                               |
|---------------|----------|-------------------------------------------|
| id            | string   | Unique ingredient ID                      |
| name          | string   | Ingredient name                           |
| quantity      | number   | Required quantity                         |
| unit          | string   | Measurement unit                          |
| notes         | string?  | Preparation notes                         |

### RecipeCategory
| Field         | Type     | Description                               |
|---------------|----------|-------------------------------------------|
| id            | string   | Unique category ID                        |
| name          | string   | Category name                             |
| description   | string   | Category description                      |
| icon          | string?  | Optional icon URL                         |

### RecipeCuisine
| Field         | Type     | Description                               |
|---------------|----------|-------------------------------------------|
| id            | string   | Unique cuisine ID                         |
| name          | string   | Cuisine name                              |
| region        | string   | Geographic region                         |
| characteristics | string[] | Key characteristics                      |


### RoutingRule
| Field         | Type               | Description                               |
|---------------|--------------------|-------------------------------------------|
| id            | number             | Rule ID                                   |
| conditions    | RoutingCondition[] | Conditional logic                         |
| actions       | RoutingAction[]    | Actions to trigger                        |

### WorkflowNotification
| Field         | Type                 | Description                               |
|---------------|----------------------|-------------------------------------------|
| id            | number               | Notification ID                           |
| channels      | NotificationChannel[]| Delivery channels                        |
| triggers      | NotificationEventTrigger[] | Event triggers                |
| template      | Template             | Notification template                     |

## System Administration

### RoleConfiguration
| Field         | Type         | Description                               |
|---------------|--------------|-------------------------------------------|
| name          | string       | Role name                                 |
| permissions   | string[]     | List of permissions                       |
| workflowAccess| string[]     | Accessible workflows                      |

### AssignedUser
| Field         | Type         | Description                               |
|---------------|--------------|-------------------------------------------|
| id            | number       | User ID                                   |
| name          | string       | User name                                 |
| email         | string       | User email                                |
| roleId        | number       | Assigned role ID                          |


## Workflow Management

### WorkflowConfiguration
| Field          | Type               | Description                               |
|----------------|--------------------|-------------------------------------------|
| name           | string             | Unique workflow name                     |
| description    | string             | Workflow purpose description             |
| stages         | WorkflowStage[]    | Ordered list of approval stages          |
| rules          | WorkflowRule[]     | Conditional routing rules                |
| actions        | WorkflowAction[]   | Automated actions per stage              |
| version        | number             | Configuration version                    |
| is_active      | boolean            | Whether workflow is active               |
| created_at     | timestamp          | Creation timestamp                       |
| updated_at     | timestamp          | Last update timestamp                    |

### WorkflowStage
| Field          | Type               | Description                               |
|----------------|--------------------|-------------------------------------------|
| stage_id       | number             | Unique stage identifier                  |
| name           | string             | Stage name (e.g., 'Manager Approval')    |
| approvers      | Approver[]         | List of eligible approvers               |
| escalation_rules | EscalationRule[]  | Escalation configuration                 |
| sla            | number             | Service level agreement in hours         |
| notifications  | NotificationConfig[]| Notification settings                   |

### WorkflowAction
| Field          | Type               | Description                               |
|----------------|--------------------|-------------------------------------------|
| trigger        | string             | Event triggering the action              |
| action_type    | string             | Type (e.g., 'EMAIL', 'STATUS_UPDATE')    |
| parameters     | object             | Action-specific parameters               |
| target_stage   | number?            | Relevant stage for action                |

### RoutingRule
| Field          | Type               | Description                               |
|----------------|--------------------|-------------------------------------------|
| condition      | string             | Conditional expression                   |
| target_stage   | number             | Stage to route to                        |
| priority       | number             | Rule evaluation priority                 |

## Enums

### CostingMethod
- FIFO
- MOVING_AVERAGE
- WEIGHTED_AVERAGE

### TransactionType
- RECEIVE
- ISSUE
- TRANSFER
- ADJUST

### GRNStatus
- RECEIVED
- COMMITTED
- VOID

### GRNItemStatus
- ACCEPTED
- REJECTED

### PurchaseOrderStatus
- Open
- Voided
- Closed
- Draft
- Sent
- Partial
- FullyReceived
- Cancelled
- Deleted

### PRType
- GeneralPurchase
- MarketList
- AssetPurchase
- ServiceRequest

### DocumentStatus
- Draft
- Submitted
- InProgress
- Completed
- Rejected

### WorkflowStatus
- Pending
- Approved
- Rejected

### WorkflowStage
- Requester
- DepartmentHeadApproval
- PurchaseCoordinatorReview
- FinanceManagerApproval
- GeneralManagerApproval
- Completed

### CurrencyCode
- USD
- EUR
- GBP
- JPY
- CNY
- THB

### AdjustmentStatus
- Draft
- Pending
- Approved
- Posted
- Void

### StoreRequisitionStatus
- Draft
- Submitted
- Approved
- InProcess
- Completed
- Rejected
- Void

### MovementType
- Issue
- Transfer
- Return

### LocationType
- Direct
- Inventory

### ApprovalStatus
- Accept
- Reject
- Review

### MovementStatus
- Pending
- Committed
- Posted
- Void
