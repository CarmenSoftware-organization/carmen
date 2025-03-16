# Credit Note Module - Overview

## Table of Contents

1. Module Overview
2. Key Features
3. Detailed Specifications
4. Use Cases
5. Required Screens
6. Additional Considerations
7. Closed Period Adjustment Process
8. System Configuration for Closed Period Handling

## 1. Module Overview

The Credit Note Module is designed to handle vendor returns and discounts within an inventory system integrated with an AP module. It supports multi-currency transactions, tracks order units and inventory units conversions, and handles various scenarios of returns and discounts, including cases with insufficient inventory and transactions affecting closed periods.

## 2. Key Features

- Multi-currency support for all transactions
- Order units and inventory units conversion tracking
- Integration with Good Receiving Notes (GRN) and AP module
- FIFO (First-In, First-Out) cost calculation and inventory valuation
- Lot number tracking and partial lot returns
- Handling of returns with insufficient inventory through direct AP credit notes
- Comprehensive audit trail and reporting
- Management of transactions affecting closed accounting periods

## 3. Detailed Specifications

### 3.1 Multi-Currency Management

- Maintain exchange rates for all relevant currencies
- Allow for daily/periodic updates of exchange rates
- Provide options for handling exchange rate differences
- Generate reports on currency exposure and impact on returns/credits

### 3.2 Unit Conversion

- Maintain conversion factors between order units and inventory units
- Automatically convert units during return process
- Track both original order units and inventory units for each transaction

### 3.3 GRN Integration

- Reference GRN number, date of receipt, item details, PO number, and lot number(s)
- Include currency of original transaction and exchange rate

### 3.4 Inventory Adjustments

- Update inventory levels and costs by lot when processing returns
- Adjust FIFO layers when returns are processed
- Handle cost adjustments in multiple currencies

### 3.5 AP Module Integration

- Adjust for lot-specific costs in credit calculations
- Handle currency conversions for AP adjustments
- Create direct AP credit notes for returns with insufficient inventory

### 3.6 Tax Handling

- Automatically calculate tax credit based on original tax charged
- Adjust for partial returns or when tax rates have changed
- Account for lot-specific tax considerations
- Credit the Input VAT report transaction
- Handle tax calculations and credits in multiple currencies

### 3.7 Audit Trail

- Log all actions related to returns and credits
- Include user ID, timestamp, and action details
- Track lot numbers in all transactions for complete traceability
- Record currency and exchange rate information for each transaction
- Log unit conversions between order and inventory units

### 3.8 Reporting

- Vendor Return Summary (with multi-currency support)
- Credit Note Aging (in base and foreign currencies)
- Return Reason Analysis
- Impact on Inventory Valuation (considering multiple currencies)
- Lot-specific return analysis
- FIFO cost adjustment report (with currency conversion details)
- Currency fluctuation impact report
- Unit conversion report
- Direct AP credit note report
- Closed period adjustment reports

## 4. Use Cases

### 4.1 Return Product (QTY)

#### 4.1.1 Remain in Full

- Scenario: The entire quantity of a product from a specific lot is being returned.
- System Actions:
    - Reverse the entire inventory transaction for the lot.
    - Update FIFO layers to reflect the full return.
    - Adjust the inventory quantity to zero for this lot.
    - Generate a full credit note for the original purchase amount.

#### 4.1.2 No Remaining Qty. of That Lot but Still Need to Return to Vendor

- Scenario: The lot has been fully consumed or sold, but a return to the vendor is still required.
- System Actions:
    - Create a direct AP credit note without affecting current inventory levels.
    - Flag this as an AP adjustment case in the audit trail.
    - Do not create any inventory adjustments.
    - Update financial records to reflect the credit without inventory impact.

#### 4.1.3 Partial Remaining QTY.

- Scenario: Only a portion of the original lot quantity is being returned.
- System Actions:
    - Update inventory levels for the specific lot, reducing by the available returned quantity.
    - Adjust FIFO layers partially, maintaining the cost structure for the unreturned portion.
    - Generate a credit note for the returned portion.
    - For any quantity not available in inventory:
        - Create a direct AP credit note for the remaining value.
        - Flag this portion as an AP adjustment in the audit trail.
    - Update average costs considering the partial return.

#### 4.1.4 Partial Remaining QTY on Other Locations

- Scenario: The return quantity is available, but spread across multiple storage locations.
- System Actions:
    - Identify all locations where the lot is stored.
    - Allow user to select which locations to pull the return from.
    - Update inventory levels across multiple locations as needed.
    - For any quantity not available across all locations:
        - Create a direct AP credit note for the remaining value.
        - Flag this portion as an AP adjustment in the audit trail.
    - Adjust FIFO layers considering multi-location impact and AP adjustments.
    - Generate a credit note reflecting the total returned quantity across locations and any AP adjustments.

### 4.2 Discount

#### 4.2.1 Remain in Full

- Scenario: A discount is applied to a full lot that is still entirely in inventory.
- System Actions:
    - Create a credit note for the discount amount without changing inventory quantity.
    - Adjust the cost of the entire lot in the FIFO layers.
    - Update average cost calculations for the item.
    - Reflect the discount in future inventory valuations.

#### 4.2.2 No Remaining Qty.

- Scenario: A discount is applied to a lot that has been fully consumed or sold.
- System Actions:
    - Generate a credit note for the discount amount.
    - Adjust historical FIFO layers to reflect the discount.
    - Update cost of goods sold for the period if applicable.
    - Flag this as a retrospective adjustment in financial reports.

#### 4.2.3 Partial Remaining QTY.

- Scenario: A discount is applied to a lot that is partially remaining in inventory.
- System Actions:
    - Create a credit note for the full discount amount.
    - Adjust FIFO layers for the remaining quantity.
    - Potentially split the discount between inventory adjustment and cost of goods sold.
    - Update average costs for the remaining inventory.

#### 4.2.4 Partial Remaining QTY on Other Locations

- Scenario: A discount is applied to a lot that is partially remaining but spread across locations.
- System Actions:
    - Generate a credit note for the full discount amount.
    - Adjust FIFO layers across all relevant locations.
    - Update inventory valuations for each affected location.
    - Provide a breakdown of the discount application across locations.

### 4.3 Mixed Inventory and AP Credit Note

- Scenario: A return request is made for a quantity that partially exceeds available inventory.
- System Actions:
    - Identify available inventory across all relevant locations.
    - Process an inventory return for the available quantity:
        - Update inventory levels.
        - Adjust FIFO layers.
        - Generate an inventory-based credit note portion.
    - For the quantity exceeding available inventory:
        - Create a direct AP credit note.
        - Flag this portion as an AP adjustment.
    - Generate a single credit note document that clearly separates:
        - The inventory return portion.
        - The direct AP credit portion.
    - Update all relevant financial records and reports to reflect this split transaction.

### 4.4 Transactions Over Closed Periods

- Scenario: A credit note needs to be issued for a transaction that occurred in a closed accounting period.
- System Actions:
    - Allow creation of the credit note with a current date.
    - Link the credit note to the original transaction in the closed period.
    - Create appropriate adjusting entries in the current open period.
    - For inventory returns:
        - If the inventory period is open but the financial period is closed, allow inventory adjustments but create financial entries in the current period.
        - If both inventory and financial periods are closed, create adjustment entries in the current period for both inventory and financials.
    - For discounts:
        - Create adjusting entries in the current period, referencing the original transaction.
    - Generate reports showing the impact on historical and current period financials.

## 5. Required Screens

### 5.1 Credit Note List Screen

- Purpose: Overview of all credit notes
- Key Elements:
    - List of credit notes with columns: Credit Note Number, Date, Vendor, Total Amount, Currency, Status
    - Filters for date range, vendor, status, and currency
    - Search functionality
    - "Create New Credit Note" button
    - Options to view, edit, or delete credit notes

### 5.2 Create/Edit Credit Note Screen

- Purpose: Create a new credit note or edit an existing one
- Key Elements:
    - Credit Note Number
    - Credit Note Date picker
    - Vendor selection (with search functionality)
    - GRN reference number (with lookup functionality)
    - Invoice Number
    - Invoice Date
    - Tax Invoice Number
    - Tax Invoice Date
    - Currency selection (with current exchange rate display)
    - Reason for credit note (dropdown)
    - Comments/Notes field
    - Table for item entry:
        - Product Name (with search/lookup)
        - Description
        - Lot Number (with lookup)
        - Quantity in Order Units
        - Quantity in Inventory Units
        - Unit Price
        - Discount
        - Tax
        - Total
        - Applied Lot Number
        - Applied Location
    - Subtotal, Tax Total, and Grand Total (in selected currency and base currency)
    - Section showing:
        - Requested return quantity
        - Available inventory quantity
        - Quantity to be processed as inventory return
        - Quantity to be processed as direct AP credit
    - Clear visual distinction between inventory return and AP credit portions
    - Fields for AP credit justification when applicable

### 5.3 Credit Note Detail Screen

- Purpose: View detailed information about a specific credit note
- Key Elements:
    - Credit Note Header Information
    - Status indicator
    - Items table with all details
    - Financial summary
    - Tabs for:
        - Items
        - Inventory Impact
        - Journal Entries
        - Tax Details
        - Comments
        - Activity Log
    - Action buttons for processing, printing, etc.

### 5.4 Lot Selection Screen

- Purpose: Select specific lots for return when multiple lots are available
- Key Elements:
    - Product information
    - Table of available lots with:
        - Lot number
        - Expiry date
        - Location
        - Available quantity
        - Original cost
        - Current cost
    - Input fields for return quantity per lot
    - Running total of selected quantity
    - Validation to ensure total matches requested return quantity

## 6. Additional Considerations

### 6.1 Dashboard Elements

- Credit Note Summary widget
- Recent Credit Notes list
- Credit Notes by Status chart
- Top Return Reasons chart
- Credit Note Aging widget
- Currency Impact summary

### 6.2 Mobile Considerations

- Simplified Credit Note list view
- Barcode/QR code scanning for lot identification
- Step-by-step guided credit note creation
- Offline capability for remote warehouse operations
- Photo attachment for documenting return condition

### 6.3 Integration Points

- Inventory Management System
- Accounts Payable Module
- General Ledger
- Tax Reporting System
- Vendor Management System
- Warehouse Management System
- Business Intelligence/Reporting Tools

## 7. Closed Period Adjustment Process

### 7.1 Identification

- System identifies if a credit note affects a closed period
- User is notified during credit note creation
- Special authorization may be required

### 7.2 Documentation

- Additional documentation requirements for closed period adjustments
- Reason codes specific to closed period adjustments
- Attachment of supporting documents

### 7.3 Processing

- Creation of adjustment entries in current period
- Clear referencing to original transactions
- Special reporting tags for closed period adjustments

### 7.4 Reporting

- Specific reports for closed period adjustments
- Impact analysis on historical financial statements
- Audit trail for compliance purposes

## 8. System Configuration for Closed Period Handling

### 8.1 Period Settings

- Configuration for financial period closing
- Configuration for inventory period closing
- Rules for allowing/restricting transactions in closed periods

### 8.2 Authorization Levels

- User role permissions for closed period transactions
- Approval requirements for closed period adjustments
- Audit logging for closed period activities

### 8.3 Accounting Rules

- Configuration for adjustment account mapping
- Rules for cost adjustment handling
- Tax adjustment configuration 