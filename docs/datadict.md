# Inventory Management System Data Dictionary

## Common Types

## Currency and Exchange Rate

### Currency
| Field       | Type    | Description                               |
|-------------|---------|-------------------------------------------|
| id          | number  | Unique identifier for the currency        |
| code        | string  | Currency code (e.g., USD, EUR)            |
| description | string  | Full name or description of the currency  |
| active      | boolean | Whether the currency is currently active  |
| currency    | string  | Currency symbol or code for display       |

### ExchangeRate
| Field        | Type   | Description                               |
|--------------|--------|-------------------------------------------|
| id           | number | Unique identifier for the exchange rate   |
| currencyCode | string | Code of the currency for this rate        |
| currencyName | string | Full name of the currency                 |
| rate         | number | The exchange rate value                   |
| lastUpdated  | string | Date when the rate was last updated       |

## Inventory

### Item
| Field            | Type          | Description                               |
|------------------|---------------|-------------------------------------------|
| itemId           | number        | Unique identifier for the item            |
| itemCode         | string        | Unique code for the item                  |
| itemName         | string        | Name of the item                          |
| description      | string?       | Detailed description of the item          |
| categoryId       | number        | ID of the category this item belongs to   |
| baseUnitId       | number        | ID of the base unit for this item         |
| costingMethod    | CostingMethod | Method used for costing this item         |
| isActive         | boolean       | Whether the item is currently active      |
| isSerialized     | boolean       | Whether the item is tracked by serial numbers |
| minimumQuantity  | number?       | Minimum quantity to maintain in inventory |
| maximumQuantity  | number?       | Maximum quantity to maintain in inventory |
| reorderPoint     | number?       | Quantity at which to reorder              |
| reorderQuantity  | number?       | Suggested quantity to reorder             |
| leadTime         | number?       | Lead time for reordering in days          |
| lastPurchaseDate | Date?         | Date of last purchase                     |
| lastPurchasePrice| number?       | Price of last purchase                    |
| lastSaleDate     | Date?         | Date of last sale                         |
| lastSalePrice    | number?       | Price of last sale                        |

### InventoryTransaction
| Field           | Type            | Description                               |
|-----------------|-----------------|-------------------------------------------|
| transactionId   | number          | Unique identifier for the transaction     |
| itemId          | number          | ID of the item involved                   |
| locationId      | number          | ID of the location involved               |
| transactionType | TransactionType | Type of transaction                       |
| quantity        | number          | Quantity involved in the transaction      |
| unitCost        | number          | Cost per unit for this transaction        |
| totalCost       | number          | Total cost of the transaction             |
| transactionDate | Date            | Date of the transaction                   |
| referenceNo     | string?         | Reference number (e.g., GRN number)       |
| referenceType   | string?         | Type of reference (e.g., 'GRN')           |
| userId          | number          | ID of the user who performed the transaction |
| notes           | string?         | Additional notes about the transaction    |

## Goods Receive Note (GRN)

### GoodsReceiveNote
| Field          | Type     | Description                               |
|----------------|----------|-------------------------------------------|
| grnRefNo       | string   | Unique reference number for the GRN       |
| date           | Date     | Date of the GRN                           |
| invoiceDate    | Date?    | Date of the invoice                       |
| invoiceNo      | string?  | Invoice number                            |
| taxInvoiceDate | Date?    | Date of the tax invoice                   |
| taxInvoiceNo   | string?  | Tax invoice number                        |
| description    | string?  | Description of the GRN                    |
| receiverId     | number   | ID of the receiver                        |
| vendorId       | number   | ID of the vendor                          |
| locationId     | number   | ID of the receiving location              |
| currencyCode   | string   | Currency code for this GRN                |
| exchangeRate   | number   | Exchange rate used                        |
| status         | GRNStatus| Status of the GRN                         |
| isConsignment  | boolean  | Whether this is a consignment receipt     |
| isCash         | boolean  | Whether this is a cash purchase           |
| cashBookId     | number?  | ID of the cash book (for cash purchases)  |

### GRNItem
| Field              | Type          | Description                               |
|--------------------|---------------|-------------------------------------------|
| grnItemId          | number        | Unique identifier for the GRN item        |
| grnRefNo           | string        | Reference to the parent GRN               |
| poLineId           | number        | ID of the related purchase order line     |
| itemId             | number        | ID of the item received                   |
| storeLocationId    | number        | ID of the store location                  |
| receivedQuantity   | number        | Quantity received                         |
| receivedUnitId     | number        | ID of the unit used for receiving         |
| isFOC              | boolean       | Whether the item is Free of Charge        |
| price              | number        | Price per unit                            |
| taxAmount          | number        | Tax amount for this item                  |
| totalAmount        | number        | Total amount for this item                |
| status             | GRNItemStatus | Status of the GRN item                    |
| deliveryPoint      | string?       | Delivery point for this item              |
| basePrice          | number        | Price in base unit                        |
| baseQuantity       | number        | Quantity in base unit                     |
| extraCost          | number        | Extra cost allocated to this item         |
| totalCost          | number        | Total cost (basePrice + extraCost)        |
| discountAdjustment | boolean       | Whether discount adjustment is applied    |
| discountAmount     | number?       | Discount amount if applicable             |
| taxAdjustment      | boolean       | Whether tax adjustment is applied         |
| lotNumber          | string?       | LOT number for this item                  |
| expiryDate         | Date?         | Expiry date for the item                  |
| comment            | string?       | Comment for this GRN item                 |

## Purchase Order (PO)

### PurchaseOrder
| Field                | Type                | Description                               |
|----------------------|---------------------|-------------------------------------------|
| poId                 | number              | Unique identifier for the purchase order  |
| vendorId             | number              | ID of the vendor                          |
| orderDate            | Date                | Date the order was placed                 |
| expectedDeliveryDate | Date?               | Expected delivery date                    |
| status               | PurchaseOrderStatus | Status of the purchase order              |
| totalAmount          | number              | Total amount of the purchase order        |
| currencyCode         | string              | Currency code for this order              |
| exchangeRate         | number              | Exchange rate used                        |
| notes                | string?             | Additional notes                          |
| createdBy            | number              | ID of the user who created the order      |
| approvedBy           | number?             | ID of the user who approved the order     |
| approvalDate         | Date?               | Date of approval                          |

### PurchaseOrderLine
| Field           | Type         | Description                               |
|-----------------|--------------|-------------------------------------------|
| poLineId        | number       | Unique identifier for the PO line         |
| poId            | number       | ID of the parent purchase order           |
| itemId          | number       | ID of the item ordered                    |
| orderedQuantity | number       | Quantity ordered                          |
| orderedUnitId   | number       | ID of the unit used for ordering          |
| unitPrice       | number       | Price per unit                            |
| receivedQuantity| number       | Quantity received so far                  |
| lineStatus      | POLineStatus | Status of this line item                  |
| lastReceiveDate | Date?        | Date of the last receipt for this line    |
| lastPrice       | number?      | Last price this item was purchased at     |
| lastVendorId    | number?      | ID of the last vendor for this item       |

## Purchase Request (PR)

### PurchaseRequest
| Field               | Type            | Description                               |
|---------------------|-----------------|-------------------------------------------|
| id                  | string          | Unique identifier for the purchase request|
| refNumber           | string          | Reference number for the request          |
| date                | Date            | Date of the request                       |
| type                | PRType          | Type of purchase request                  |
| description         | string          | Description of the request                |
| requestorId         | string          | ID of the requestor                       |
| requestor           | object          | Details of the requestor                  |
| currency            | string          | Currency code for this request            |
| status              | DocumentStatus  | Status of the document                    |
| workflowStatus      | WorkflowStatus  | Status in the approval workflow           |
| currentWorkflowStage| WorkflowStage   | Current stage in the workflow             |
| location            | string          | Location for the request                  |
| items               | PurchaseRequestItem[] | Items requested                     |
| attachments         | Attachment[]    | Attached files                            |
| subtotal            | Money           | Subtotal amount                           |
| tax                 | Money           | Tax amount                                |
| totalAmount         | Money           | Total amount of the request               |
| jobCode             | string          | Job code for this request                 |
| department          | string          | Department making the request             |
| budgetCode          | string          | Budget code for this request              |
| allocatedBudget     | Money           | Budget allocated for this request         |
| yearToDateSpending  | Money           | Year-to-date spending                     |
| exchangeRate        | number          | Exchange rate used                        |
| exchangeRateDate    | Date            | Date of the exchange rate                 |
| paymentMethod       | string?         | Payment method                            |
| paymentTerms        | string?         | Payment terms                             |
| earlyPaymentDiscount| string?         | Early payment discount terms              |
| comments            | Comment[]       | Comments on the request                   |
| approvals           | WorkflowStep[]  | Approval steps                            |
| deliveryPoint       | string          | Delivery point for the items              |
| activityLog         | ActivityLogEntry[] | Log of activities on this request      |
| additionalCharges   | Money           | Any additional charges                    |

### PurchaseRequestItem
| Field       | Type   | Description                               |
|-------------|--------|-------------------------------------------|
| id          | string | Unique identifier for the item            |
| description | string | Description of the item                   |
| quantity    | number | Quantity requested                        |
| unitPrice   | Money  | Price per unit                            |
| totalPrice  | Money  | Total price for this item                 |

## Enums

### DocumentStatus
- DRAFT
- SUBMITTED
- IN_PROGRESS
- COMPLETED
- REJECTED

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
- Open = "Open",
- Voided = "Voided",
- Closed = "Closed",
- Draft = "Draft",
- Sent = "Sent",
- PartiallyReceived = "PartiallyReceived",
- FullyReceived = "FullyReceived",
- Cancelled = "Cancelled",
- Deleted = "Deleted",

### POLineStatus
- Open
- Closed

### PRType
- GENERAL_PURCHASE
- MARKET_LIST
- ASSET_PURCHASE
- SERVICE_REQUEST

### WorkflowStatus
- PENDING
- APPROVED
- REJECTED

### WorkflowStage
- REQUESTER
- DEPARTMENT_HEAD_APPROVAL
- PURCHASE_COORDINATOR_REVIEW
- FINANCE_MANAGER_APPROVAL
- GENERAL_MANAGER_APPROVAL
- COMPLETED
