# Purchase Order Module Documentation

This directory contains comprehensive documentation for the Purchase Order module in the Carmen F&B Management System.

## Documentation Index

### Business Documentation

- [Purchase Order Business Analysis](purchase-order-ba.md) - Business analysis of the Purchase Order module
- [Purchase Order Product Requirements Document (PRD)](purchase-order-prd.md) - Product requirements for the Purchase Order module
- [Purchase Order Data Dictionary](purchase-order-data-dictionary.md) - Comprehensive data dictionary for the Purchase Order module
- [PR-to-PO Item Traceability](../Procurement-Process-Flow.md) - Detailed documentation on PR-to-PO item traceability (now part of the consolidated Procurement Process Flow document)

### Technical Documentation

- [Purchase Order API Specification](purchase-order-api-sp.md) - API specification for the Purchase Order module
- [Purchase Order FSD Part 1: Overview and Architecture](po-fsd-part1.md) - Functional specification covering system overview and architecture
- [Purchase Order FSD Part 2: Implementation Details](po-fsd-part2.md) - Functional specification covering implementation details
- [Purchase Order FSD Part 3: Quality Assurance and Deployment](po-fsd-part3.md) - Functional specification covering QA and deployment

### Diagrams and Flows

- [Purchase Order User Flow Diagram](purchase-order-user-flow.md) - User flow diagrams including creation, goods receipt, modification, reporting, status transitions, and mobile interactions
- [Purchase Order State Diagram](purchase-order-state-diagram.md) - State transition diagrams for the Purchase Order module
- [Purchase Order Data Flow Diagram](purchase-order-data-flow.md) - Data flow diagrams for the Purchase Order module

## Key Features

The Purchase Order module provides the following key features:

1. **Purchase Order Management**
   - Creation of purchase orders with vendor selection
   - Editing and updating purchase order details
   - Viewing purchase order history and status
   - Deletion of draft purchase orders only
   - Voiding or closing of active purchase orders (sent/partially received/fully received)

2. **Item Management**
   - Adding items to purchase orders
   - Specifying quantities, units, and prices
   - Managing free-of-charge (FOC) items
   - Tracking received quantities
   - Maintaining traceability to source PR items

3. **Financial Management**
   - Calculation of subtotals, taxes, and totals
   - Currency conversion for multi-currency operations
   - Budget tracking and financial validation
   - Cost allocation to departments or cost centers

4. **Status Tracking**
   - Tracking purchase order status throughout lifecycle
   - Status history and audit trail
   - Status-based permissions and actions
   - Notifications for status changes
   - Draft POs can be deleted, while active POs can only be voided or closed
   - Comprehensive state transition rules for each status

5. **Integration**
   - Connection to vendor management
   - Integration with goods receipt
   - Financial system integration
   - Inventory management integration
   - Bidirectional traceability with Purchase Requests

6. **Reporting and Analytics**
   - Purchase order status reporting
   - Vendor performance analysis
   - Spending analysis by category
   - Budget variance reporting
   - PR-to-PO traceability reporting

## User Roles

The Purchase Order module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Procurement Officer | Creates and manages purchase orders | Create, edit, view POs; add items; send to vendors; delete draft POs; void active POs |
| Procurement Manager | Oversees procurement operations | All Procurement Officer permissions; delete draft POs; void active POs |
| Finance Officer | Reviews financial aspects | View POs; review financial details; export reports |
| Finance Manager | Monitors financial aspects | Finance Officer permissions; monitor budget allocation |
| Department Manager | Reviews departmental purchases | View department POs |
| Inventory Manager | Manages goods receipt | Receive goods; create GRNs; close active POs |
| General User | Basic access to relevant POs | View assigned POs; add comments |

## Implementation Status

The Purchase Order module is currently in the design and specification phase. Implementation will begin after the approval of the functional specification documents. 