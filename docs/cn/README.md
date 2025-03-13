# Credit Note Module Documentation

This directory contains comprehensive documentation for the Credit Note (CN) module in the Carmen F&B Management System.

## Documentation Index

### Business Documentation

- [Return Credit Note Business Analysis](return-credit-note-ba.md) - Business analysis of the Return Credit Note functionality
- [Credit Note Documentation](credit-note.md) - Comprehensive documentation of the Credit Note module

### Technical Documentation

- [Credit Note API Specification](credit-note-api-sp.md) - API specification for the Credit Note module

## Key Features

The Credit Note module provides the following key features:

1. **Credit Note Management**
   - Creation of credit notes for returns and adjustments
   - Editing and updating credit note details
   - Viewing credit note history and status
   - Cancellation and deletion of credit notes

2. **Item Management**
   - Adding items to credit notes
   - Specifying quantities, units, and prices
   - Managing item details and specifications
   - Tracking item return status

3. **Financial Management**
   - Calculation of credit amounts
   - Tax handling and adjustments
   - Integration with accounting systems
   - Financial reporting

4. **Workflow and Approvals**
   - Configurable approval workflows
   - Role-based approval processes
   - Status tracking and notifications
   - Audit trail of approval actions

5. **Integration**
   - Connection to vendor management
   - Integration with purchase orders and goods received notes
   - Inventory management integration
   - Financial system integration

6. **Reporting and Analytics**
   - Credit note status reporting
   - Return analysis by category
   - Vendor return analysis
   - Processing time analysis

## User Roles

The Credit Note module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Procurement Officer | Creates and manages credit notes | Create, edit, view CNs; add items; submit for approval |
| Procurement Manager | Approves credit notes | View CNs; approve/reject CNs |
| Finance Officer | Reviews financial aspects | View CNs; review financial details; export reports |
| Finance Manager | Approves financial aspects | Finance Officer permissions; financial approval of CNs |
| Warehouse Manager | Manages physical returns | Process returns; update inventory; verify returned items |
| General User | Basic access to relevant CNs | View assigned CNs; add comments |

## Implementation Status

The Credit Note module is currently in the implementation phase, with core functionality available and additional features being developed. 