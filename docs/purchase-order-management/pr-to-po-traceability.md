# Purchase Order Module - PR-to-PO Item Traceability

## 1. Introduction

### 1.1 Purpose
This document outlines the requirements and implementation details for maintaining traceability between Purchase Request (PR) items and Purchase Order (PO) items in the Carmen F&B Management System. This traceability is essential for audit purposes, procurement accountability, and operational efficiency.

### 1.2 Scope
This document covers:
- Data model requirements for PR-to-PO traceability
- Business rules governing the relationship between PR items and PO items
- User interface considerations for displaying traceability information
- API requirements for querying traceability data
- Reporting capabilities for PR-to-PO traceability

### 1.3 Related Documents
- Purchase Order Product Requirements Document (PRD)
- Purchase Order Functional Specification Document (FSD)
- Purchase Request Module Documentation
- Procurement Process Documentation

## 2. Traceability Requirements

### 2.1 Core Requirements
1. **Complete Traceability**: Each PO item created from a PR item must maintain a reference to its source PR item throughout its lifecycle.
2. **Data Preservation**: PR source information must be preserved in PO items even if the source PR is archived or modified.
3. **Bidirectional Linking**: Users should be able to navigate from PR items to their corresponding PO items and vice versa.
4. **Quantity Tracking**: The system must track how much of each PR item quantity has been converted to PO items.
5. **Multiple PR Sources**: PO items must support tracing back to multiple PR items if they are consolidated from multiple sources.
6. **Audit Support**: PR-to-PO traceability data must support audit requirements and compliance needs.

### 2.2 Business Rules
1. **PO_056**: PO items created from PR items must maintain reference to source PR item ID
2. **PO_057**: PO items must store PR number, requestor, and department for traceability
3. **PO_058**: Changes to PO item quantities must be validated against PR item quantities
4. **PO_059**: PO items must display their source PR information when available
5. **PO_060**: Reports must be able to trace PO items back to their PR sources
6. **PO_061**: When a PO is created from multiple PRs, each item must maintain its individual PR source
7. **PO_062**: PR-to-PO item mapping must be maintained even if the PO item is modified
8. **PO_063**: Historical PR data must be preserved in PO items even if the source PR is archived
9. **PO_064**: PR-to-PO traceability data must be included in audit logs
10. **PO_065**: PR-to-PO traceability must be maintained throughout the PO lifecycle

## 3. Data Model

### 3.1 PO Item Traceability Fields
The PO Item data model must include the following fields for PR traceability:

```typescript
interface PurchaseOrderItem {
  // Existing fields...
  
  // PR Traceability Fields
  prItemId?: string;         // Reference to source PR item
  prNumber?: string;         // Source PR number for quick reference
  prRequestor?: string;      // Person who requested the item
  prRequestDate?: Date;      // When the item was requested
  prDepartment?: string;     // Department that requested the item
  prOriginalQuantity?: number; // Original quantity requested in PR
  prRemainingQuantity?: number; // Remaining quantity not yet converted to POs
}
```

### 3.2 PR Item Traceability Fields
The PR Item data model must include the following fields for PO traceability:

```typescript
interface PurchaseRequestItem {
  // Existing fields...
  
  // PO Traceability Fields
  convertedToPOQuantity: number; // Quantity already converted to POs
  linkedPOItems: {              // POs this PR item has been converted to
    poItemId: string;
    poNumber: string;
    quantity: number;
    conversionDate: Date;
  }[];
}
```

## 4. User Interface Requirements

### 4.1 PO Creation from PR
When creating a PO from a PR:
1. The system must clearly indicate which PR items are being converted to PO items
2. The system must display the PR source information for each item
3. The system must validate that PO quantities do not exceed available PR quantities
4. The system must allow users to select which PR items to include in the PO

### 4.2 PO Item Display
When displaying PO items:
1. The system must indicate which items are linked to PR items
2. The system must provide a way to view the source PR information
3. The system must display the PR number, requestor, and department
4. The system must provide a link to navigate to the source PR

### 4.3 PR Item Display
When displaying PR items:
1. The system must indicate which items have been converted to PO items
2. The system must display how much of each item has been converted to POs
3. The system must provide a way to view the linked PO items
4. The system must provide links to navigate to the linked POs

## 5. API Requirements

### 5.1 Traceability Endpoints
The system must provide the following API endpoints for PR-to-PO traceability:

1. **Get PO Items by PR Item**
   ```
   GET /api/purchase-requests/:prId/items/:prItemId/po-items
   ```
   Returns all PO items linked to a specific PR item

2. **Get PR Source for PO Item**
   ```
   GET /api/purchase-orders/:poId/items/:itemId/pr-source
   ```
   Returns the PR source information for a specific PO item

3. **Get PR-to-PO Traceability Report**
   ```
   GET /api/reports/pr-to-po-traceability
   ```
   Returns a comprehensive report of PR-to-PO item mappings

### 5.2 Data Validation
The API must enforce the following validations:

1. When creating a PO item from a PR item, validate that:
   - The PR item exists and is in an appropriate status
   - The requested quantity does not exceed the available PR quantity
   - The user has permission to convert the PR item to a PO item

2. When updating a PO item linked to a PR item, validate that:
   - The traceability link is maintained
   - Any quantity changes are properly validated
   - The PR source information is preserved

## 6. Reporting Requirements

### 6.1 PR-to-PO Traceability Report
The system must provide a comprehensive PR-to-PO traceability report that includes:

1. PR information (number, date, requestor, department)
2. PR item details (name, description, quantity, unit)
3. PO information (number, date, vendor, status)
4. PO item details (quantity, unit, price)
5. Conversion details (date, user, quantity)
6. Delivery status (received quantity, remaining quantity)

### 6.2 PR Fulfillment Report
The system must provide a PR fulfillment report that shows:

1. PR information (number, date, requestor, department)
2. PR item details (name, description, quantity, unit)
3. Conversion status (converted quantity, remaining quantity)
4. Linked POs (number, date, status)
5. Delivery status (received quantity, remaining quantity)

### 6.3 Audit Trail
The system must maintain an audit trail of PR-to-PO conversions that includes:

1. When each PR item was converted to a PO item
2. Who performed the conversion
3. What quantities were converted
4. Any modifications to the PO item after conversion

## 7. Benefits

### 7.1 Operational Benefits
1. **Improved Accountability**: Clear traceability from request to purchase
2. **Enhanced Visibility**: Complete view of procurement process
3. **Efficient Troubleshooting**: Quickly identify issues in the procurement chain
4. **Better Planning**: Accurate tracking of request fulfillment

### 7.2 Compliance Benefits
1. **Audit Support**: Comprehensive data for internal and external audits
2. **Regulatory Compliance**: Support for procurement regulations
3. **Policy Enforcement**: Ensure adherence to procurement policies
4. **Fraud Prevention**: Transparent tracking reduces fraud risk

### 7.3 Financial Benefits
1. **Budget Tracking**: Link actual purchases back to requested items
2. **Cost Control**: Monitor price variations between request and purchase
3. **Spend Analysis**: Analyze procurement patterns from request to purchase
4. **Variance Reporting**: Identify discrepancies between requested and purchased items

## 8. Implementation Considerations

### 8.1 Data Migration
For existing POs and PRs, the system should:
1. Attempt to establish traceability links based on available data
2. Flag items where automatic linking is not possible
3. Provide tools for manual linking of existing items

### 8.2 Performance Considerations
To maintain system performance:
1. Implement efficient indexing on traceability fields
2. Consider caching frequently accessed traceability data
3. Optimize queries that join PR and PO data

### 8.3 User Training
Users should be trained on:
1. How to create POs from PRs while maintaining traceability
2. How to view and interpret traceability information
3. How to use traceability reports for operational and audit purposes

## 9. Conclusion
PR-to-PO item traceability is a critical feature that enhances the procurement process by providing clear visibility into how purchase requests are fulfilled through purchase orders. This feature supports operational efficiency, compliance requirements, and financial control, making it an essential component of the Purchase Order module. 