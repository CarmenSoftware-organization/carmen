# Goods Received Note Business Rules Specification

**Module**: Procurement  
**Function**: Goods Received Notes  
**Component**: Business Rules  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Implementation Overview

**Purpose**: This specification defines the business rules, validation logic, and constraints that govern goods received note operations throughout their lifecycle. These rules ensure data integrity, business process compliance, and system consistency across all GRN functions.

**Implementation Files**:
- Validation logic: goods-received-note/new/item-location-selection/page.tsx
- Calculation logic: components/tabs/GoodsReceiveNoteItems.tsx
- Form validation: components/goods-receive-note.tsx
- Data types: lib/types.ts
- Workflow validation: new/manual-entry/page.tsx

**Current Status**: Core business rules implemented with frontend validation, calculation engines, and workflow controls. Some advanced business rules use simplified logic pending backend integration.

---

## Data Integrity Rules

### **Mandatory Field Requirements**

#### **GRN Header Fields**
- **GRN Reference**: Required for all GRNs, auto-generated for new GRNs
- **Date**: Required, cannot be future date
- **Vendor**: Required for all GRN types
- **Currency**: Required, defaults to USD
- **Exchange Rate**: Required when currency differs from base currency
- **Status**: Required, must be valid status from enumeration ('Received', 'Committed')

#### **GRN Item Fields**
- **Item Name**: Required for all items
- **Received Quantity**: Required, must be positive number
- **Unit**: Required, must be valid unit from system
- **Unit Price**: Required for non-FOC items
- **Location**: Required for inventory placement

#### **Optional Fields with Business Logic**
- **Invoice Number**: Optional but recommended for audit trail
- **Invoice Date**: Required if invoice number provided
- **Description**: Optional but enhances traceability
- **Consignment Flag**: Optional, affects inventory and financial processing

### **Data Type Validation**

#### **Numeric Field Constraints**
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

#### **String Field Constraints**
- **GRN Reference**: Alphanumeric, maximum 50 characters
- **Vendor Name**: Maximum 255 characters
- **Item Name**: Maximum 255 characters
- **Description**: Maximum 1000 characters
- **Location Code**: Maximum 20 characters

#### **Date Field Constraints**
- **GRN Date**: Cannot be future date
- **Invoice Date**: Cannot be more than 1 year in past or future
- **Delivery Date**: Must be within reasonable range of GRN date
- **Due Date**: Must be after invoice date when specified

---

## Quantity and Unit Management Rules

### **Quantity Validation Rules**

#### **Receiving Quantity Constraints**
```typescript
// From item-location-selection validation
const maxQuantity = item.remainingQuantity;
const validatedQuantity = Math.max(0, Math.min(quantity, maxQuantity));

// Business Rules:
// 1. Cannot receive negative quantities
// 2. Cannot exceed remaining quantity on purchase order
// 3. Must be positive for item selection
// 4. Zero quantities automatically deselect items
```

#### **Purchase Order Integration**
- **Remaining Quantity Check**: Received quantity cannot exceed (Ordered - Previously Received)
- **Unit Consistency**: Receiving units must be convertible to order units
- **Base Unit Calculations**: All quantities converted to base units for inventory
- **FOC Quantity Rules**: Free-of-charge quantities tracked separately from regular receipts

#### **Unit Conversion System**
```typescript
// Base quantity calculation
baseQuantity = receivedQuantity * conversionRate
baseReceivingQty = receivingQty * conversionRate

// Conversion rate display
"1 {receivingUnit} = {conversionRate} {baseUnit}"

// Available units: ["Kg", "Pcs", "Box", "Pack", "L", "mL"]
```

### **Multi-Unit Support**
- **Order Units**: Original purchase order units (read-only)
- **Receiving Units**: Selectable from available unit options
- **FOC Units**: Independent unit selection for free-of-charge items
- **Base Units**: Consistent inventory units for all items
- **Conversion Tracking**: Real-time conversion rate display and validation

---

## Financial Calculation Rules

### **Amount Calculation Logic**

#### **Line Item Calculations**
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

#### **Document-Level Totals**
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

#### **Currency and Exchange Rate Rules**
- **Single Currency**: All items in GRN must use same currency
- **Exchange Rate Consistency**: Same exchange rate applied to all items
- **Base Currency Conversion**: All amounts calculated in both GRN currency and base currency
- **Precision Standards**: All amounts displayed with 2 decimal places
- **Rounding Rules**: Standard rounding to nearest cent for financial calculations

### **Discount and Tax Processing**

#### **Discount Application**
- **Line-Level Discounts**: Applied before tax calculations
- **Percentage-Based**: Discount rates between 0% and 100%
- **Amount-Based**: Calculated from percentage and subtotal
- **Base Currency**: Discount amounts converted using exchange rate

#### **Tax Calculation Rules**
- **Tax-Inclusive vs Tax-Exclusive**: Configurable per item
- **Tax Rate Validation**: Must be between 0% and 100%
- **Tax System Support**: GST and VAT systems supported
- **Base Tax Amounts**: Tax calculations in both currencies

---

## Purchase Order Integration Rules

### **PO-Based Creation Rules**

#### **Vendor Consistency**
- **Vendor Matching**: GRN vendor must match PO vendor
- **Multi-PO Support**: Single GRN can include items from multiple POs from same vendor
- **Vendor Validation**: Only active vendors can be selected

#### **Item Validation Rules**
- **PO Item Matching**: GRN items must correspond to valid PO line items
- **Status Checking**: Only Open and Partial POs available for receipt
- **Quantity Limits**: Cannot receive more than ordered minus previously received
- **Unit Compatibility**: Receiving units must be convertible to order units

#### **Purchase Order Status Updates**
- **Partial Receipt**: PO status changes to 'Partial' when partially received
- **Full Receipt**: PO status changes to 'Fully Received' when completely received
- **Line Item Tracking**: Individual line item status tracking
- **Remaining Quantity**: Automatic calculation of remaining quantities

### **Manual Creation Rules**

#### **Standalone GRN Requirements**
- **Vendor Selection**: Must select valid vendor from system
- **Item Definition**: Manual entry of item details
- **Location Assignment**: Must specify receiving location
- **Price Information**: Unit prices required for valuation

#### **Data Completeness Validation**
```typescript
// Manual entry validation
if (!localDetails.vendor || !localDetails.date || 
    localItems.length === 0 || 
    localItems.some(item => !item.name || !item.receivedQuantity || !item.location)) {
  // Validation error - prevent creation
}
```

---

## Workflow and Status Management Rules

### **Status Transition Rules**

#### **Valid Status Values**
- **Received**: Initial status for new GRNs
- **Committed**: Final status after approval and processing

#### **Status Change Permissions**
- **Create**: All authorized users can create GRNs in 'Received' status
- **Edit**: GRNs in 'Received' status can be modified
- **Commit**: Requires appropriate approval level
- **View**: All users can view GRNs based on security permissions

#### **Mode-Based Access Control**
```typescript
// Component access rules
const isEditable = internalMode === "edit" || internalMode === "add";
const isViewing = internalMode === "view";
const isConfirming = internalMode === "confirm";

// Field-level controls
disabled={mode === "view"}
readOnly={!isEditable}
```

### **Creation Workflow Rules**

#### **PO-Based Workflow Validation**
1. **Vendor Selection**: Must select active vendor before proceeding
2. **PO Selection**: Must select at least one Open/Partial PO
3. **Item Selection**: Must select items with positive receiving quantities
4. **Location Assignment**: All items must have valid locations
5. **Final Review**: Confirmation step before creation

#### **Manual Workflow Validation**
1. **Header Completion**: Vendor, date, and reference required
2. **Item Definition**: Name, quantity, and location required for each item
3. **Price Information**: Unit prices required for financial calculations
4. **Data Consistency**: All items must be valid before creation

---

## Data Quality and Consistency Rules

### **Business Logic Constraints**

#### **Inventory Location Rules**
- **Valid Locations**: Items must be assigned to valid inventory locations
- **Location Types**: Support for both inventory (INV) and direct (DIR) locations
- **Multi-Location**: Single GRN can receive items to multiple locations
- **Location Validation**: Location codes must exist in system

#### **Audit Trail Requirements**
- **Activity Logging**: All significant actions logged with user and timestamp
- **Change Tracking**: Modifications tracked with before/after values
- **Comment Support**: User comments captured for process transparency
- **Attachment Management**: Supporting documents linked to GRN

#### **Financial Controls**
- **Currency Consistency**: All line items must use same currency as header
- **Exchange Rate Validation**: Rates must be positive and reasonable
- **Amount Reconciliation**: Line item totals must equal header totals
- **Rounding Consistency**: All calculations use same rounding rules

### **Data Validation Framework**

#### **Frontend Validation Rules**
```typescript
// Numeric input validation
min={0}
max={item.remainingQuantity}
step="any"
type="number"

// Real-time validation feedback
onFocus={(e) => e.target.select()}
onChange={(e) => handleQuantityChange(item.id, e.target.value)}

// Business rule enforcement
const validatedQuantity = Math.max(0, Math.min(quantity, maxQuantity));
```

#### **Form-Level Validation**
- **Required Field Checking**: All mandatory fields validated before submission
- **Cross-Field Validation**: Related fields validated together
- **Business Rule Validation**: Complex business rules enforced
- **User Feedback**: Clear error messages for validation failures

---

## Integration and External System Rules

### **Vendor Management Integration**
- **Vendor Status**: Only active vendors available for selection
- **Vendor Search**: Search by company name and business registration number
- **Vendor Data**: Complete vendor information displayed for context
- **Multi-Vendor Restriction**: Single GRN limited to single vendor

### **Inventory System Integration**
- **Stock Movement Generation**: Automatic stock movements for received items
- **Location Updates**: Inventory levels updated for receiving locations
- **Unit Conversion**: Base units used for inventory tracking
- **Cost Updates**: Item costs updated based on receipt information

### **Financial System Integration**
- **Cost Distribution**: Extra costs distributed across line items
- **Tax Processing**: Tax amounts calculated per line item and aggregated
- **Currency Conversion**: Multi-currency support with exchange rate application
- **Account Code Assignment**: Items assigned to appropriate account codes

---

## Error Handling and Recovery Rules

### **Validation Error Management**
- **Field-Level Errors**: Individual field validation with inline feedback
- **Form-Level Errors**: Complete form validation before submission
- **Business Rule Violations**: Clear messages for business rule failures
- **Recovery Guidance**: Specific instructions for error correction

### **Data Consistency Protection**
- **Concurrent Access**: Prevention of simultaneous editing conflicts
- **Transaction Integrity**: All-or-nothing approach to data updates
- **Rollback Capability**: Ability to undo changes in case of errors
- **Data Backup**: Automatic backup before significant operations

### **System Integration Resilience**
- **Fallback Mechanisms**: Graceful degradation when external systems unavailable
- **Retry Logic**: Automatic retry for transient failures
- **Error Logging**: Comprehensive error logging for troubleshooting
- **User Notification**: Clear communication of system issues

---

## Security and Access Control Rules

### **Role-Based Access Control**
- **Create Permission**: Authorization required to create new GRNs
- **Edit Permission**: Separate permission for modifying existing GRNs
- **View Permission**: Read-only access to GRN information
- **Approval Permission**: Special permission for status changes

### **Data Security Rules**
- **Input Sanitization**: All user inputs sanitized to prevent injection attacks
- **Data Validation**: Server-side validation for all client-submitted data
- **Audit Logging**: Complete audit trail of all user actions
- **Access Logging**: User access attempts logged for security monitoring

### **Business Data Protection**
- **Vendor Information**: Sensitive vendor data protected appropriately
- **Financial Data**: Pricing and cost information secured
- **User Information**: Personal data handled according to privacy requirements
- **System Configuration**: Critical settings protected from unauthorized access

---

## Performance and Scalability Rules

### **Data Processing Constraints**
- **Item Limits**: Maximum number of items per GRN
- **File Size Limits**: Attachment size restrictions
- **Processing Timeouts**: Maximum processing time for operations
- **Concurrent Users**: System capacity for simultaneous users

### **Database Optimization Rules**
- **Index Strategy**: Optimized indexes for common queries
- **Query Performance**: Query execution time limits
- **Data Retention**: Historical data retention policies
- **Archive Strategy**: Old data archival procedures

---

## Current Implementation Limitations

### **Mock Data Dependencies**
- **Vendor Integration**: Uses mock vendor data instead of live integration
- **Location Management**: Mock location assignments rather than dynamic lookup
- **Unit Conversion**: Simplified conversion factors without complex lookup

### **Simplified Business Logic**
- **Tax Calculations**: Basic tax calculations without complex jurisdictional rules
- **Financial Integration**: Simplified financial calculations pending backend integration
- **Approval Workflow**: Basic approval process without complex routing

### **Backend Integration Gaps**
- **Real-time Validation**: Limited real-time validation against live data
- **Concurrent Access Control**: Basic concurrency control without advanced locking
- **External System Integration**: Mock integrations instead of live connections

---

*This business rules specification documents the actual implementation as found in the source code. Rules marked as simplified or mock indicate areas requiring enhancement for production deployment.*