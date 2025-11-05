# Carmen ERP System - Comprehensive Business Rules Summary

**Document Version**: 1.0
**Last Updated**: January 2025
**Status**: Comprehensive Analysis of All System Business Rules
**Source**: Based on analysis of all PRD and business rule documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Procurement Module Business Rules](#procurement-module-business-rules)
   - [Purchase Request Business Rules](#purchase-request-business-rules)
   - [Purchase Request Approval Workflow Rules](#purchase-request-approval-workflow-rules)
   - [Goods Received Note Business Rules](#goods-received-note-business-rules)
3. [Inventory Management Business Rules](#inventory-management-business-rules)
4. [Fractional Sales Business Rules](#fractional-sales-business-rules)
5. [Cross-Module Business Rules](#cross-module-business-rules)

---

## Overview

This document provides a comprehensive summary of all business rules implemented across the Carmen ERP system. Business rules are organized by module and function, with clear categorization of rule types, enforcement levels, and implementation status.

### Business Rule Categories

The system implements business rules across the following categories:

1. **Data Integrity Rules**: Field requirements, validation, and format constraints
2. **Authorization & Access Rules**: Role-based permissions and approval authority
3. **Workflow & Process Rules**: Status transitions and approval routing
4. **Financial Rules**: Currency handling, pricing, and budget controls
5. **Operational Rules**: Item management, inventory, and procurement controls
6. **Temporal Rules**: Timing constraints, SLA enforcement, and date validation
7. **Integration Rules**: External system synchronization and data consistency

---

## Procurement Module Business Rules

### Purchase Request Business Rules

#### **Role-Based Access Control Rules**

**User Role Definitions**:
- **Requester/Staff**: Basic PR creation and submission rights
- **Department Head**: Departmental approval authority
- **Finance Manager**: Financial review and budget oversight
- **Purchasing Staff**: Vendor assignment and procurement execution
- **General Manager**: High-level approval authority
- **System Administrator**: Complete system access

**Widget Access Rules**:
```
Requester:
  - myPR: true, myApproval: false, myOrder: false
  - visibilitySetting: 'department'

Department Head:
  - myPR: true, myApproval: true, myOrder: false
  - visibilitySetting: 'department'

Finance Manager:
  - myPR: true, myApproval: true, myOrder: false
  - visibilitySetting: 'full'

Purchasing Staff:
  - myPR: true, myApproval: true, myOrder: true
  - visibilitySetting: 'full'
```

**Workflow Action Permissions**:

- **Edit Action**: PR status must be 'Draft' OR 'Rejected', only requestor can edit (except System Administrator)
- **Delete Action**: PR status must be 'Draft', only requestor can delete (except System Administrator)
- **Submit Action**: PR status must be 'Draft', only requestor can submit (except System Administrator)
- **Approval Action**: User must be assigned to current workflow stage, status must be 'Submitted' OR 'In Progress'

**Field-Level Access Control**:

*Requestor/Staff Permissions*:
- Can Edit: location, product, comment, requestQty, requestUnit, requiredDate, refNumber, date, type, requestor, department, description

*Department Manager/Approver Permissions*:
- Can Edit: comment, approvedQty
- All other fields: view-only

*Purchasing Staff Permissions*:
- Can Edit: comment, approvedQty, vendor, price, orderUnit
- All other fields: view-only

#### **Workflow Business Rules**

**Priority-Based Decision Logic**:

1. **All Rejected (Priority 1)**: All items rejected → Reject PR
2. **Any Review (Priority 2)**: Any items marked for review → Return PR
3. **Any Pending (Priority 3)**: Any items still pending → Block submission
4. **Any Approved (Priority 4)**: Any items approved → Approve PR

**Item Status Rules**:
- **Pending**: Initial status for all new items
- **Approved**: Items approved for procurement
- **Rejected**: Items denied procurement
- **Review**: Items marked for additional review

**Workflow Stage Progression**:
1. requester → departmentHeadApproval
2. departmentHeadApproval → financialApproval
3. financialApproval → purchasing
4. purchasing → completed

**Return Logic Rules**:
- From financialApproval: Return to departmentHeadApproval
- From other stages: Return to requester
- Rejection: Direct to 'rejected' stage

#### **Data Validation Rules**

**Required Field Validation**:

*PR Header Required Fields*:
- Date: Must be valid date, defaults to current date
- Type: Must be selected from PRType enum
- Requestor: Auto-populated from user context
- Description: Optional but recommended

*Item Required Fields*:
- Location: Must be selected from available locations
- Product Name: Must be selected from product catalog
- Requested Quantity: Must be positive number > 0
- Unit: Must be selected from available units

**Business Logic Validation**:
```typescript
Validation Rules:
  - !newItem.name: Missing product name
  - !newItem.location: Missing location
  - newItem.quantityRequested <= 0: Invalid quantity

Error Handling:
  - Display error: "Validation failed: Please fill in all required fields"
  - Prevent item creation until validation passes
```

**Data Format Rules**:

*Numeric Field Constraints*:
- Quantities: Step 0.00001, 5 decimal places precision
- Prices: Step 0.01, 2 decimal places precision
- Exchange Rates: 4 decimal places precision

*Text Field Constraints*:
- Description: Multi-line textarea, unlimited length
- Comments: Text input, reasonable length limits
- Reference Numbers: System-generated unique identifiers

#### **Financial Business Rules**

**Currency Management Rules**:
- **Supported Currencies**: USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, MXN
- **Base Currency**: THB (Thai Baht) as system default
- **Exchange Rates**: Real-time rate application for conversions

**Currency Conversion Rules**:
```typescript
Conversion Logic:
  - convertedAmount = amount * exchangeRate
  - Display format: "USD 1,234.56" when currency differs from base
```

**Price Calculation Rules**:
```typescript
Financial Calculations:
  - baseAmount = price * quantity
  - discountAmount = baseAmount * discountRate
  - netAmount = baseAmount - discountAmount
  - taxAmount = netAmount * taxRate
  - totalAmount = netAmount + taxAmount
```

**Financial Visibility Rules**:
- **Requestors**: Hidden by default (controlled by user settings)
- **Approvers/Purchasers**: Always visible
- **Financial Information**: Hidden from requestors via `canViewFinancialInfo()`

---

### Purchase Request Approval Workflow Rules

#### **Authorization & Access Rules**

**Role-Based Permissions**:

*Requester Role Authority*:
- Can create and submit purchase requests within their department and location scope
- Can view status and progress of their own submitted requests
- Cannot approve their own purchase requests regardless of approval authority level
- Can provide additional information and respond to requests for clarification

*Department Head Approval Authority*:
- Can approve requests from their assigned departments up to established financial limits
- Department Head approval is mandatory for requests exceeding 5,000 BAHT in Market List workflows
- Can delegate approval authority to designated deputies within their department
- Cross-department approvals require specific authorization or escalation to Finance Manager level

*Purchasing Staff Review Authority*:
- Can review technical specifications and vendor compliance for all requests
- Can request modifications for procurement policy compliance
- Cannot provide final approval but can recommend approval or rejection
- Have access to vendor management and pricing validation functions

*Finance Manager Approval Authority*:
- Can approve requests up to 50,000 BAHT across all departments
- Finance Manager approval is required for all Asset Purchase requests regardless of amount
- Can override budget allocation warnings with documented justification
- Have authority to modify budget codes and allocation assignments

*General Manager Final Authority*:
- General Manager approval is required for all requests exceeding 50,000 BAHT
- Can approve emergency procurement requests outside normal workflow
- Can authorize budget transfers and special allocation adjustments
- General Manager approval is final and cannot be overridden by system or other users

**Approval Thresholds**:

*Budget-Based Routing*:
- Market List requests under 5,000 BAHT bypass Department Head approval and route directly to completion
- General Purchase requests under 10,000 BAHT skip General Manager approval after Finance approval
- Asset Purchase requests always require full approval chain regardless of amount
- Service requests follow standard approval chain with department-specific modifications

*Department-Based Authority*:
- Department Heads have unlimited approval authority within their department for requests under 25,000 BAHT
- Cross-department requests exceeding 10,000 BAHT require Finance Manager approval
- Multi-location requests require approval from each affected location's department head
- Emergency requests can bypass normal department approval with General Manager authorization

**Delegation Rules**:

*Approval Authority Transfer*:
- Department Heads can designate temporary approval delegates within their department
- Delegation must be formally recorded in system with effective date ranges
- Delegates cannot exceed the original authority holder's approval limits
- Finance Manager delegation requires General Manager approval for amounts over 25,000 BAHT

*Substitute Approval Processing*:
- System automatically routes to designated substitute when primary approver is unavailable
- Substitute assignments must be configured in advance with specific authority limits
- Emergency substitution requires two-level approval for requests over standard limits

#### **Workflow & Process Rules**

**Sequence Requirements**:

*Mandatory Stage Progression*:
- All workflows must begin with Request Creation stage where requestor provides complete information
- Purchasing Review must occur before Department Approval in General Purchase workflows
- Finance Review cannot be bypassed for any request exceeding departmental approval limits
- Completed stage marks workflow conclusion and prevents further modifications

*Stage Completion Validation*:
- Each workflow stage must receive explicit approval or rejection before progression
- Incomplete stages block advancement to subsequent approval levels
- System validates that all required fields and attachments are provided before stage completion
- Approval actions must include approver identification and timestamp for audit trail

**Status Progression**:

*Request Status Management*:
- **Draft**: Allows unlimited modifications by requestor before submission
- **Submitted**: Locks basic request information and initiates workflow processing
- **InProgress**: Indicates active review and approval processing
- **Completed**: Indicates successful approval and authorization for procurement
- **Rejected**: Stops workflow processing and returns request to requestor

*Workflow Status Tracking*:
- **Pending**: Indicates awaiting action from assigned approver
- **Approved**: At stage level advances request to next workflow stage
- **Rejected**: At stage level can return request to previous stage or requestor
- System maintains complete status history for audit and tracking purposes

**Escalation Triggers**:

*Service Level Agreement Enforcement*:
- Request Creation stage must be completed within 4 hours for General Purchase workflows
- Purchasing Review must be completed within 8 hours of assignment
- Department Approval must be completed within 12 hours of routing
- Finance Review must be completed within 24 hours for requests over threshold amounts
- General Manager approval must be completed within 48 hours for high-value requests

*Automatic Escalation Rules*:
- SLA violations trigger automatic notification to approver's manager
- Requests pending for 150% of SLA time route to substitute approver if configured
- Critical requests exceeding 200% of SLA time escalate to General Manager attention
- Emergency procurement requests bypass normal SLA requirements with special authorization

#### **Financial & Business Logic Rules**

**Calculation Methods**:

*Budget Validation Processing*:
- System compares request total against available departmental budget allocation
- Hard budget limits prevent approval when allocation is exceeded without override authority
- Soft budget warnings alert approvers when 80% of allocation is reached
- Multi-period budget calculations consider fiscal year allocation and year-to-date spending

*Currency Conversion Standards*:
- Foreign currency requests convert to base currency using current exchange rates
- Exchange rate lock prevents rate fluctuation during approval processing
- Multi-currency budgets maintain separate allocation tracking by currency
- Currency conversion fees are calculated and included in total cost analysis

**Pricing Rules**:

*Market List Pricing Validation*:
- Market list items must be validated against current market pricing before approval
- Price deviations exceeding 15% from last purchase price require additional justification
- Vendor pricing must be verified through purchasing staff review process
- Emergency purchases may bypass pricing validation with appropriate authorization

*Asset Purchase Pricing Controls*:
- Asset purchases require vendor quotations and competitive bidding for amounts over 25,000 BAHT
- Capital expenditure requests must include depreciation and ROI analysis
- Multi-vendor comparisons are mandatory for standardized asset categories
- Single-source purchases require documented justification and approval

**Budget Controls**:

*Departmental Budget Enforcement*:
- Each department maintains separate budget allocation for operational and capital expenses
- Budget transfers between departments require Finance Manager approval
- Year-end budget reconciliation affects approval authority for final quarter requests
- New fiscal year budgets reset approval thresholds and allocation limits

*Project-Based Budget Management*:
- Project-specific requests must reference valid project codes and budget allocations
- Cross-project budget transfers require project manager and Finance Manager approval
- Project completion affects remaining budget availability and approval requirements

#### **Temporal & Scheduling Rules**

**Timing Constraints**:

*Business Hours Processing*:
- Standard approval workflows operate during business hours (8 AM - 6 PM local time)
- After-hours submissions queue for next business day processing unless marked urgent
- Weekend and holiday processing is limited to emergency procurement requests
- Multi-location requests account for time zone differences in SLA calculations

*Delivery Date Validation*:
- Requested delivery dates must allow sufficient time for approval processing and vendor fulfillment
- Rush delivery requests require additional approval for associated premium costs
- Delivery scheduling must consider operational calendar and blackout periods
- Special event procurement has expedited approval processing with compressed SLA

**Date Logic**:

*Request Date Processing*:
- Request creation date establishes baseline for all SLA calculations and audit trails
- Approval dates must be sequential and cannot predate the previous stage completion
- Delivery dates cannot be earlier than minimum procurement lead time plus approval processing time
- Budget period validation ensures requests are processed within appropriate fiscal periods

**Deadline Management**:

*Critical Date Enforcement*:
- Purchase requests for scheduled events must be submitted with adequate lead time
- Month-end budget reconciliation affects approval processing for final week submissions
- Year-end requests have accelerated approval requirements to ensure processing completion
- Contract renewal requests must be submitted 30 days before expiration to ensure continuity

#### **Exception & Error Handling Rules**

**Override Conditions**:

*Emergency Procurement Authorization*:
- General Manager can authorize emergency procurement bypassing normal workflow stages
- Emergency overrides require post-procurement validation and documentation within 48 hours
- Emergency authorization is limited to operational necessity and cannot exceed 100,000 BAHT
- Emergency overrides require Finance Manager counter-signature for amounts over 25,000 BAHT

*Budget Override Authority*:
- Finance Manager can approve budget overrides up to 25% above departmental allocation
- Budget overrides require detailed justification and repayment plan documentation
- General Manager approval is required for budget overrides exceeding 25% overage
- End-of-year budget overrides require board approval for amounts over 100,000 BAHT

**Error Recovery**:

*Workflow Correction Procedures*:
- Incorrect workflow routing can be corrected by Finance Manager with approval stage reset
- Data entry errors can be corrected by requestor during Draft status only
- Approval errors require workflow reset to previous stage with approver notification
- System errors causing workflow interruption trigger automatic escalation to system administrator

*Request Modification Process*:
- Approved requests cannot be modified without workflow reset and re-approval processing
- Minor modifications (delivery date, comments) may be allowed with approver consent
- Material changes (amount, vendor, specifications) require complete workflow restart
- Modification requests must be documented with change justification and impact analysis

**Warning Thresholds**:

*Budget and Spending Alerts*:
- Budget utilization warnings are generated at 75%, 90%, and 95% of allocation consumption
- Department spending pattern analysis triggers alerts for unusual procurement activity
- Vendor concentration warnings alert when single vendor represents over 40% of department spending
- Price variance alerts trigger when requested pricing exceeds historical averages by 20%

*Approval Timing Warnings*:
- SLA approaching notifications are sent at 75% of allocated time
- Overdue approval notifications escalate to approver manager after SLA expiration
- Workflow stagnation alerts trigger after 5 business days without action
- End-of-period processing alerts remind approvers of pending fiscal deadlines

**Fallback Procedures**:

*Approver Unavailability*:
- Automatic delegation to configured substitute approvers after 24 hours of inactivity
- Escalation to higher authority level when all department approvers are unavailable
- Emergency approval committee activation for critical business operations
- General Manager final authority activation when all other approval channels are exhausted

*System Recovery Procedures*:
- Workflow state preservation during system maintenance or unexpected downtime
- Manual approval process activation when automated workflow is unavailable
- Post-system recovery validation ensures all pending approvals are properly restored
- Audit trail reconstruction for approvals processed during system recovery periods

---

### Goods Received Note Business Rules

#### **Data Integrity Rules**

**Mandatory Field Requirements**:

*GRN Header Fields*:
- **GRN Reference**: Required for all GRNs, auto-generated for new GRNs
- **Date**: Required, cannot be future date
- **Vendor**: Required for all GRN types
- **Currency**: Required, defaults to USD
- **Exchange Rate**: Required when currency differs from base currency
- **Status**: Required, must be valid status from enumeration ('Received', 'Committed')

*GRN Item Fields*:
- **Item Name**: Required for all items
- **Received Quantity**: Required, must be positive number
- **Unit**: Required, must be valid unit from system
- **Unit Price**: Required for non-FOC items
- **Location**: Required for inventory placement

*Optional Fields with Business Logic*:
- **Invoice Number**: Optional but recommended for audit trail
- **Invoice Date**: Required if invoice number provided
- **Description**: Optional but enhances traceability
- **Consignment Flag**: Optional, affects inventory and financial processing

**Data Type Validation**:

*Numeric Field Constraints*:
```typescript
// Quantity validations
receivedQuantity: number >= 0
unitPrice: number >= 0
exchangeRate: number > 0
taxRate: number >= 0 && <= 100
discountRate: number >= 0 && <= 100

// Calculation precision
minimumFractionDigits: 2
maximumFractionDigits: 2
```

*String Field Constraints*:
- **GRN Reference**: Alphanumeric, maximum 50 characters
- **Vendor Name**: Maximum 255 characters
- **Item Name**: Maximum 255 characters
- **Description**: Maximum 1000 characters
- **Location Code**: Maximum 20 characters

*Date Field Constraints*:
- **GRN Date**: Cannot be future date
- **Invoice Date**: Cannot be more than 1 year in past or future
- **Delivery Date**: Must be within reasonable range of GRN date
- **Due Date**: Must be after invoice date when specified

#### **Quantity and Unit Management Rules**

**Quantity Validation Rules**:

*Receiving Quantity Constraints*:
```typescript
// Validation logic
const maxQuantity = item.remainingQuantity;
const validatedQuantity = Math.max(0, Math.min(quantity, maxQuantity));

// Business Rules:
// 1. Cannot receive negative quantities
// 2. Cannot exceed remaining quantity on purchase order
// 3. Must be positive for item selection
// 4. Zero quantities automatically deselect items
```

*Purchase Order Integration*:
- **Remaining Quantity Check**: Received quantity cannot exceed (Ordered - Previously Received)
- **Unit Consistency**: Receiving units must be convertible to order units
- **Base Unit Calculations**: All quantities converted to base units for inventory
- **FOC Quantity Rules**: Free-of-charge quantities tracked separately from regular receipts

*Unit Conversion System*:
```typescript
// Base quantity calculation
baseQuantity = receivedQuantity * conversionRate
baseReceivingQty = receivingQty * conversionRate

// Conversion rate display
"1 {receivingUnit} = {conversionRate} {baseUnit}"

// Available units: ["Kg", "Pcs", "Box", "Pack", "L", "mL"]
```

**Multi-Unit Support**:
- **Order Units**: Original purchase order units (read-only)
- **Receiving Units**: Selectable from available unit options
- **FOC Units**: Independent unit selection for free-of-charge items
- **Base Units**: Consistent inventory units for all items
- **Conversion Tracking**: Real-time conversion rate display and validation

#### **Financial Calculation Rules**

**Amount Calculation Logic**:

*Line Item Calculations*:
```typescript
// Net amount calculation
const calculateNetAmount = (item: GoodsReceiveNoteItem) => {
  const subtotal = item.unitPrice * item.receivedQuantity;
  return subtotal - (subtotal * (item.discountRate || 0) / 100);
};

// Tax amount calculation
const calculateTaxAmount = (item: GoodsReceiveNoteItem) => {
  const netAmount = calculateNetAmount(item);
  return netAmount * (item.taxRate || 0) / 100;
};

// Total amount calculation
totalAmount = calculateNetAmount(item) + calculateTaxAmount(item);
```

*Document-Level Totals*:
```typescript
// Aggregated calculations
baseSubTotalPrice: sum of all item base subtotals
subTotalPrice: sum of all item subtotals
baseNetAmount: sum of all item base net amounts
netAmount: sum of all item net amounts
baseTaxAmount: sum of all item base tax amounts
taxAmount: sum of all item tax amounts
baseTotalAmount: sum of all item base total amounts
totalAmount: sum of all item total amounts
```

*Currency and Exchange Rate Rules*:
- **Single Currency**: All items in GRN must use same currency
- **Exchange Rate Consistency**: Same exchange rate applied to all items
- **Base Currency Conversion**: All amounts calculated in both GRN currency and base currency
- **Precision Standards**: All amounts displayed with 2 decimal places
- **Rounding Rules**: Standard rounding to nearest cent for financial calculations

**Discount and Tax Processing**:

*Discount Application*:
- **Line-Level Discounts**: Applied before tax calculations
- **Percentage-Based**: Discount rates between 0% and 100%
- **Amount-Based**: Calculated from percentage and subtotal
- **Base Currency**: Discount amounts converted using exchange rate

*Tax Calculation Rules*:
- **Tax-Inclusive vs Tax-Exclusive**: Configurable per item
- **Tax Rate Validation**: Must be between 0% and 100%
- **Tax System Support**: GST and VAT systems supported
- **Base Tax Amounts**: Tax calculations in both currencies

#### **Purchase Order Integration Rules**

**PO-Based Creation Rules**:

*Vendor Consistency*:
- **Vendor Matching**: GRN vendor must match PO vendor
- **Multi-PO Support**: Single GRN can include items from multiple POs from same vendor
- **Vendor Validation**: Only active vendors can be selected

*Item Validation Rules*:
- **PO Item Matching**: GRN items must correspond to valid PO line items
- **Status Checking**: Only Open and Partial POs available for receipt
- **Quantity Limits**: Cannot receive more than ordered minus previously received
- **Unit Compatibility**: Receiving units must be convertible to order units

*Purchase Order Status Updates*:
- **Partial Receipt**: PO status changes to 'Partial' when partially received
- **Full Receipt**: PO status changes to 'Fully Received' when completely received
- **Line Item Tracking**: Individual line item status tracking
- **Remaining Quantity**: Automatic calculation of remaining quantities

**Manual Creation Rules**:

*Standalone GRN Requirements*:
- **Vendor Selection**: Must select valid vendor from system
- **Item Definition**: Manual entry of item details
- **Location Assignment**: Must specify receiving location
- **Price Information**: Unit prices required for valuation

*Data Completeness Validation*:
```typescript
// Manual entry validation
if (!localDetails.vendor || !localDetails.date ||
    localItems.length === 0 ||
    localItems.some(item => !item.name || !item.receivedQuantity || !item.location)) {
  // Validation error - prevent creation
}
```

#### **Workflow and Status Management Rules**

**Status Transition Rules**:

*Valid Status Values*:
- **Received**: Initial status for new GRNs
- **Committed**: Final status after approval and processing

*Status Change Permissions*:
- **Create**: All authorized users can create GRNs in 'Received' status
- **Edit**: GRNs in 'Received' status can be modified
- **Commit**: Requires appropriate approval level
- **View**: All users can view GRNs based on security permissions

*Mode-Based Access Control*:
```typescript
// Component access rules
const isEditable = internalMode === "edit" || internalMode === "add";
const isViewing = internalMode === "view";
const isConfirming = internalMode === "confirm";

// Field-level controls
disabled={mode === "view"}
readOnly={!isEditable}
```

**Creation Workflow Rules**:

*PO-Based Workflow Validation*:
1. **Vendor Selection**: Must select active vendor before proceeding
2. **PO Selection**: Must select at least one Open/Partial PO
3. **Item Selection**: Must select items with positive receiving quantities
4. **Location Assignment**: All items must have valid locations
5. **Final Review**: Confirmation step before creation

*Manual Workflow Validation*:
1. **Header Completion**: Vendor, date, and reference required
2. **Item Definition**: Name, quantity, and location required for each item
3. **Price Information**: Unit prices required for financial calculations
4. **Data Consistency**: All items must be valid before creation

---

## Inventory Management Business Rules

### **Transaction Types**

The inventory management system supports five core transaction types:

1. **Receive Goods (IN)**: Adding inventory to the system through purchases or returns
2. **Issue Goods (OUT)**: Removing inventory for sales, consumption, or other uses
3. **Transfer Goods (TRANSFER)**: Moving inventory between locations
4. **Adjust Inventory**: Correcting inventory quantities and costs
5. **Vendor Credit Notes (Returns to Vendor)**: Returning goods to vendors

### **Costing Methods**

#### **FIFO (First-In-First-Out)**

- Each receipt creates a new cost layer
- Issues deplete layers in the order they were created
- Supports detailed cost tracking and valuation
- Provides more accurate inventory valuation in inflationary environments
- Requires more detailed record-keeping and processing

#### **Average Cost**

- Calculates a new average cost with each receipt
- All issues use the current average cost
- Simplifies cost tracking but may be less precise for individual transactions
- Reduces the complexity of inventory valuation
- Requires less detailed record-keeping than FIFO
- May be more appropriate for commodities or items with minimal cost variations

### **Receive Goods (IN) Process Rules**

**Process Flow**:
1. Create entry in ReceiveGoods table
2. For each item received:
   - Create entry in ReceiveGoodsDetails table
   - Create entry in InventoryTransactions table (StockMovement = 'IN')
   - Apply costing method:
     - **If FIFO**: Create new entry in FIFOCostLayers table
     - **If Average**: Calculate new average cost and create entry in AverageCostTracking table
   - Update InventoryStatus table (increase QuantityOnHand, update costs)
3. Update total quantity and cost in ReceiveGoods table

**Edit and Delete Rules**:
- **Editability Check**: Verify if any items from this receipt have been issued or transferred
- If items have been used: Prevent editing/deletion and inform the user
- **Reversal Process**: Create reversal entries to undo effects before applying new values
- **FIFO Adjustment**: Remove or adjust the corresponding FIFOCostLayer
- **Average Cost Recalculation**: Recalculate average cost after reversal

### **Issue Goods (OUT) Process Rules**

**Process Flow**:
1. Create entry in Issues table
2. For each item issued:
   - Create entry in IssueDetails table
   - Create entry in InventoryTransactions table (StockMovement = 'OUT')
   - Apply costing method:
     - **If FIFO**: Identify and update FIFOCostLayers (start with oldest layer, move to newer as needed)
     - **If Average**: Use current average cost from latest AverageCostTracking entry
   - Update InventoryStatus table (decrease QuantityOnHand, update costs)
3. Update total quantity and cost in Issues table

### **Transfer Goods (TRANSFER) Process Rules**

**Process Flow**:
1. Create entry in Transfers table
2. For each item transferred:
   - Create entry in TransferDetails table
   - Create two entries in InventoryTransactions table (OUT from source, IN to destination)
   - Apply costing method:
     - **If FIFO**: Update source FIFO layers, create destination FIFO layers
     - **If Average**: Use source average cost, create/update destination average cost
   - Update InventoryStatus table for both locations (decrease source, increase destination)
3. Update total quantity in Transfers table

### **Adjust Inventory Process Rules**

**Process Flow**:
1. Create entry in Adjustments table
2. For each item adjusted:
   - Create entry in AdjustmentDetails table
   - Create entry in InventoryTransactions table (StockMovement = 'IN' for positive, 'OUT' for negative)
   - Apply costing method:
     - **If FIFO**: Create new layer (positive) or update existing layers (negative)
     - **If Average**: Calculate new average cost (positive) or use current average cost (negative)
   - Update InventoryStatus table (adjust QuantityOnHand, update costs)
3. Update total quantity in Adjustments table

### **Vendor Credit Notes (Returns to Vendor) Process Rules**

**Process Flow**:
1. Create entry in VendorCreditNotes table
2. For each item being returned:
   - Create entry in VendorCreditNoteDetails table
   - Create entry in InventoryTransactions table (TransactionType = 'VendorReturn', StockMovement = 'OUT')
   - Apply costing method:
     - **If FIFO**: Match to original receipt layer if possible, otherwise use most recent layers
     - **If Average**: Use current average cost, recalculate after removal
   - Update InventoryStatus table (decrease QuantityOnHand, update costs)
3. Update total quantity and amount in VendorCreditNotes table
4. Create payable or offset against existing payables to the vendor
5. Update financial records or journals to reflect the return and credit

### **Implementation Considerations**

**Data Integrity**:
- Robust error handling and transaction management
- Database constraints and validation rules
- Comprehensive audit trails for all inventory transactions

**Performance Optimization**:
- Proper indexing on frequently queried fields
- Partitioning for large transaction tables
- Optimized queries for high-volume operations

**Transaction Volume Management**:
- Scalability for high transaction volumes
- Impact assessment on FIFO layer updates
- Batch processing for bulk operations

**Security and Access Control**:
- Role-based access controls
- Approval hierarchies for critical transactions
- Proper segregation of duties

**System Integration**:
- Integration with purchasing, sales, and finance systems
- Robust API interfaces for external systems
- Real-time or near-real-time data synchronization

---

## Fractional Sales Business Rules

### **Food Safety Rules**

#### **Critical Control Point Management**

**Temperature Control Requirements**:
- All fractional items must maintain safe temperatures according to HACCP guidelines
- Hot foods must be held at 140°F or above
- Cold foods must be held at 41°F or below

**Holding Time Limits**:
- Pizza slices cannot exceed 4 hours in hot holding
- Cake slices requiring refrigeration cannot exceed 2 hours at room temperature

**Cross-Contamination Prevention**:
- Cutting tools and surfaces must be sanitized between different product types, especially when allergens are involved
- System blocks fractional item creation when proper sanitation protocols are not followed

**Documentation Requirements**:
- All food safety violations trigger automatic documentation including timestamp, location, responsible staff member, and corrective actions taken

#### **Sanitation Protocol Enforcement**

**Equipment Sanitization**:
- Cutting tools must be sanitized every 2 hours or between different product categories, whichever occurs first
- System tracks sanitization timestamps and prevents operations when compliance lapses

**Surface Cleanliness**:
- Cutting surfaces must be cleaned and sanitized between different allergen categories
- System maintains allergen status tracking for all work surfaces

**Staff Hygiene Monitoring**:
- Hand washing and glove changes are required before handling fractional items
- System integration with hand washing stations tracks compliance

### **Quality Control Rules**

#### **Pizza Slice Standards**

**Size Consistency Requirements**:
- Pizza slices must fall within 85-115% of standard size specifications
- System calculates slice consistency using diameter measurements and slice count validation

**Appearance Quality Thresholds**:
- Visual quality scores must meet minimum standards of 7 out of 10
- Slices falling below threshold receive automatic markdowns or disposal recommendations

**Serving Temperature Standards**:
- Pizza slices must maintain serving temperature of 140°F minimum
- System monitors display case temperatures and triggers alerts when thresholds are exceeded

#### **Cake Portion Standards**

**Weight Consistency Control**:
- Cake slices must maintain weight within 10 grams of target portion size
- System tracks portion weights and flags deviations exceeding tolerance levels

**Presentation Quality Requirements**:
- Cake slices must meet visual presentation standards including clean cuts, intact frosting, and proper garnish placement
- Quality scores below 8 out of 10 trigger review protocols

**Freshness Indicators**:
- Cake freshness is monitored through visual inspection scores and time-since-preparation tracking
- Items exceeding freshness thresholds receive automatic price adjustments or removal recommendations

### **Operational Workflow Rules**

#### **Cutting Procedure Standards**

**Tool Selection Requirements**:
- Appropriate cutting tools must be selected based on product type
- Pizza wheels for pizza items, sharp knives for cake items
- Tool sanitization verified before use

**Portion Size Calculations**:
- System calculates optimal portion sizes based on whole item dimensions and target slice count
- Deviations from calculated portions require manager approval

**Timing Requirements**:
- Cutting operations must be completed within specified time windows to maintain food quality and safety
- Pizza cutting must occur within 10 minutes of removal from oven

#### **Storage and Display Rules**

**Temperature Zone Compliance**:
- Fractional items must be stored in appropriate temperature zones immediately after cutting
- Hot items in heated displays, cold items in refrigerated cases within 30 minutes of cutting

**Display Duration Limits**:
- Pizza slices maximum 4 hours hot display
- Cake slices maximum 8 hours refrigerated display

**Inventory Rotation Protocol**:
- First-in-first-out rotation is enforced for all fractional items
- System tracks cutting timestamps and prioritizes older items for sale recommendations

### **Inventory Management Rules**

#### **Minimum Level Maintenance**

**Dynamic Threshold Calculation**:
- Minimum inventory levels are calculated based on historical demand patterns, day of week, time of day, and seasonal factors
- System adjusts thresholds automatically based on sales velocity

**Reorder Point Automation**:
- When fractional item inventory falls below minimum levels during peak periods, system automatically triggers production requests with priority levels based on urgency

**Buffer Stock Requirements**:
- Safety stock levels are maintained based on demand variability and preparation lead times
- Higher variability items maintain larger buffer stocks

#### **Waste Minimization Controls**

**Overproduction Prevention**:
- System monitors waste percentages and triggers production adjustments when waste exceeds 15% threshold
- Production recommendations consider historical demand and current inventory levels

**Price Adjustment Automation**:
- When items approach expiration or quality decline thresholds, system automatically applies tiered discounts:
  - 10% at 75% of shelf life
  - 25% at 90% of shelf life

**Disposal Authorization**:
- Items requiring disposal due to safety or quality concerns require manager authorization
- System documents disposal reasons and calculates waste costs for analysis

### **Pricing and Revenue Rules**

#### **Dynamic Pricing Controls**

**Time-Based Adjustments**:
- Pricing adjustments are applied based on time of day and demand patterns
- Premium pricing during peak hours, discounts during slow periods to optimize revenue and reduce waste

**Quality-Based Pricing**:
- Items with quality scores below optimal levels receive automatic discounts proportional to quality reduction
- Critical quality issues block sales entirely

#### **Margin Protection Rules**

**Minimum Margin Enforcement**:
- System enforces minimum margin requirements for all fractional sales
- Prices cannot be reduced below cost-plus-minimum-margin thresholds without management override

**Competition Monitoring**:
- When competitor pricing information is available, system provides alerts when pricing significantly exceeds competitive benchmarks

### **Compliance and Audit Rules**

#### **Regulatory Compliance Monitoring**

**Health Department Requirements**:
- System ensures all operations comply with local health department regulations including temperature logs, time stamps, and staff certifications

**HACCP Compliance**:
- Critical control points are monitored continuously with automatic alerts when parameters exceed acceptable ranges
- All deviations trigger immediate corrective action protocols

#### **Documentation and Reporting**

**Audit Trail Maintenance**:
- Complete audit trail is maintained for all fractional item operations including cutting, storage, sales, and disposal activities with staff identification and timestamps

**Violation Tracking**:
- System tracks all rule violations with severity classification, corrective actions taken, and resolution verification
- Repeat violations trigger escalated response protocols

**Performance Reporting**:
- Regular compliance reports are generated showing rule adherence rates, violation trends, and improvement opportunities with management recommendations

### **Training and Competency Rules**

#### **Staff Certification Requirements**

**Food Safety Training**:
- All staff handling fractional items must maintain current food safety certifications
- System tracks certification expiration dates and blocks access for expired certifications

**Procedure Competency**:
- Staff must demonstrate competency in cutting procedures, quality assessment, and safety protocols through periodic evaluations and skill verification

#### **Performance Monitoring**

- Individual staff performance is monitored through quality metrics, compliance rates, and waste generation
- Performance feedback drives additional training recommendations

### **Performance Standards**

#### **Key Performance Indicators**

**Compliance Score Targets**:
- Overall compliance score must maintain 95% or higher
- No critical violations exceeding 24 hours without resolution

**Quality Score Maintenance**:
- Average quality scores must remain above 8.5 out of 10
- Less than 5% of items falling below acceptable thresholds

**Waste Reduction Goals**:
- Food waste from fractional items must not exceed 12% of total production
- Continuous improvement targets of 2% annual reduction

#### **Corrective Action Requirements**

**Response Time Standards**:
- Critical violations require immediate response within 30 minutes
- Major violations within 2 hours
- Minor violations within 8 hours

**Resolution Verification**:
- All corrective actions must be verified by appropriate authority levels
- Documented with evidence of effectiveness before cases are closed

---

## Cross-Module Business Rules

### **User Context and Authentication**

**Role-Based Access Control**:
- Multiple user roles: staff, department-manager, financial-manager, purchasing-staff, counter, chef
- Users can switch between departments and locations
- Permission system controls UI and functionality based on role
- Users can dynamically change their active role, department, or location

### **Department and Location Management**

**Organizational Structure Rules**:
- Departments can be assigned to specific cost centers
- Locations have delivery requirements and physical count settings
- User assignments to departments and locations control data visibility
- Department and location context affects workflow routing and approval requirements

### **Budget and Financial Controls**

**Multi-Currency Support**:
- System supports multiple currencies with exchange rate management
- Base currency (THB) for all financial calculations
- Currency conversion applies across all financial transactions
- Exchange rates locked during approval processing

**Budget Allocation and Tracking**:
- Departments maintain separate budget allocations
- Budget consumption tracked in real-time
- Approval thresholds based on budget limits
- Budget warnings at 75%, 90%, and 95% consumption

### **Audit Trail and Compliance**

**Activity Logging**:
- All significant actions logged with user and timestamp
- Complete change tracking with before/after values
- Comment support for process transparency
- Attachment management for supporting documents

**Data Security**:
- Input sanitization to prevent injection attacks
- Server-side validation for all client-submitted data
- Complete audit trail of all user actions
- Access logging for security monitoring

### **Integration and Data Synchronization**

**External System Integration**:
- Real-time validation against live data when available
- Vendor management integration for procurement
- Inventory system integration for stock movements
- Financial system integration for cost distribution

**Data Consistency Rules**:
- Transaction integrity with all-or-nothing updates
- Rollback capability for failed operations
- Concurrent access control to prevent conflicts
- Data backup before significant operations

---

## Implementation Status Summary

### **Fully Implemented Business Rules**

- ✅ Role-based access control with field-level permissions
- ✅ Workflow decision engine with priority-based routing
- ✅ Multi-layer validation with real-time feedback
- ✅ Multi-currency support with exchange rate handling
- ✅ Complete item lifecycle with inventory integration
- ✅ FIFO and Average costing methods
- ✅ Food safety critical controls and temperature monitoring
- ✅ Comprehensive audit trails and activity logging

### **Partially Implemented Business Rules**

- 🔄 Real-time budget validation against live data
- 🔄 Automated waste tracking for fractional sales
- 🔄 Dynamic pricing adjustments based on demand
- 🔄 Advanced approval routing for complex scenarios
- 🔄 Predictive inventory management
- 🔄 Automated compliance reporting

### **Planned Implementation**

- 📋 Enhanced external system integration
- 📋 Advanced analytics and reporting
- 📋 Machine learning for demand forecasting
- 📋 Automated vendor performance tracking
- 📋 Enhanced mobile app integration
- 📋 Real-time collaboration features

---

## Business Rule Enforcement Levels

### **System-Enforced Rules** (Cannot be bypassed)
- Data type validation and format constraints
- Required field validation
- Role-based access control
- Status transition rules
- Financial calculation rules
- FIFO/Average costing logic

### **Business-Enforced Rules** (Require approval override)
- Budget limit enforcement
- Approval authority thresholds
- Vendor selection requirements
- Price variance limits
- Quality thresholds
- SLA enforcement

### **Advisory Rules** (Provide warnings)
- Budget consumption warnings
- Price deviation alerts
- Quality score recommendations
- Inventory level suggestions
- Waste minimization recommendations
- Performance optimization tips

---

## Conclusion

This comprehensive business rules summary provides a complete overview of all business rules implemented across the Carmen ERP system. The rules ensure data integrity, enforce organizational policies, maintain proper workflow control, and support efficient operations across procurement, inventory management, fractional sales, and all integrated modules.

All business rules are designed to be:
- **Measurable**: Clear metrics for compliance monitoring
- **Enforceable**: System controls prevent rule violations
- **Auditable**: Complete audit trails for all rule enforcement
- **Maintainable**: Documented for easy updates and modifications
- **Scalable**: Designed to support growing business needs

*This document should be reviewed and updated regularly to reflect changes in business requirements, regulatory compliance, and system enhancements.*
