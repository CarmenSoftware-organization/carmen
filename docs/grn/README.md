# Goods Received Note Module Documentation

This directory contains comprehensive documentation for the Goods Received Note (GRN) module in the Carmen F&B Management System.

## Documentation Index

### Business Documentation

- [Goods Received Note Business Analysis](goods-received-note-ba.md) - Detailed business analysis of the GRN module
- [GRN Business Analysis](grn-ba.md) - Additional business analysis documentation for GRN

### Technical Documentation

- [GRN API Specification](grn-api-sp.md) - API specification for the GRN module
- [GRN Module PRD](grn-module-prd.md) - Product Requirements Document for the GRN module
- [GRN Page Flow](grn-page-flow.md) - Page flow diagrams for the GRN module
- [GRN Component Structure](grn-component-structure.md) - Component structure and hierarchy for the GRN module

## Key Features

The Goods Received Note module provides the following key features:

1. **GRN Management**
   - Creation of goods received notes
   - Editing and updating GRN details
   - Viewing GRN history and status
   - Cancellation and deletion of GRNs

2. **Item Management**
   - Adding items to GRNs
   - Specifying quantities, units, and prices
   - Managing item details and specifications
   - Tracking item receipt status

3. **Quality Control**
   - Quality inspection recording
   - Acceptance/rejection of items
   - Defect tracking and reporting
   - Quality metrics and analysis

4. **Financial Management**
   - Calculation of received goods value
   - Tax handling and adjustments
   - Integration with accounting systems
   - Financial reporting

5. **Workflow and Approvals**
   - Configurable approval workflows
   - Role-based approval processes
   - Status tracking and notifications
   - Audit trail of approval actions

6. **Integration**
   - Connection to vendor management
   - Integration with purchase orders
   - Inventory management integration
   - Financial system integration

7. **Reporting and Analytics**
   - GRN status reporting
   - Receipt analysis by category
   - Vendor performance analysis
   - Processing time analysis

## User Roles

The Goods Received Note module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Warehouse Staff | Receives goods and creates GRNs | Create, edit, view GRNs; add items; record receipts |
| Warehouse Manager | Approves GRNs | View GRNs; approve/reject GRNs; manage exceptions |
| Quality Control | Inspects received goods | Inspect items; record quality issues; approve/reject items |
| Finance Officer | Reviews financial aspects | View GRNs; review financial details; export reports |
| Finance Manager | Approves financial aspects | Finance Officer permissions; financial approval of GRNs |
| Procurement Officer | Links GRNs to purchase orders | View GRNs; link to POs; manage vendor communications |
| General User | Basic access to relevant GRNs | View assigned GRNs; add comments |

## Implementation Status

The Goods Received Note module is currently in the implementation phase, with core functionality available and additional features being developed.

## Related Modules

The GRN module integrates closely with the following modules:
- Purchase Order (PO) module
- Inventory Management module
- Credit Note (CN) module
- Financial Management module 