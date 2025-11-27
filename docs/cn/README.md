# Credit Note Module Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This directory contains comprehensive documentation for the Credit Note (CN) module in the Carmen F&B Management System.

## Documentation Index

### Business Documentation

- [Credit Note Overview](CN-Overview.md) - Comprehensive overview of the Credit Note module
- [Credit Note Business Requirements](CN-Business-Requirements.md) - Business requirements and rules for the Credit Note module
- [Credit Note PRD](CN-PRD.md) - Product Requirements Document for the Credit Note module

### Technical Documentation

- [Credit Note API Overview](CN-API-Endpoints-Overview.md) - Overview of the Credit Note API endpoints
- [Credit Note API - Core Operations](CN-API-Endpoints-Core.md) - Core CRUD operations for Credit Notes
- [Credit Note API - Financial Operations](CN-API-Endpoints-Financial.md) - Financial operations for Credit Notes
- [Credit Note API - Item Operations](CN-API-Endpoints-Items.md) - Item operations for Credit Notes
- [Credit Note API - Attachment Operations](CN-API-Endpoints-Attachments.md) - Attachment operations for Credit Notes
- [Credit Note API - Comment Operations](CN-API-Endpoints-Comments.md) - Comment operations for Credit Notes
- [Credit Note API - Inventory Operations](CN-API-Endpoints-Inventory.md) - Inventory operations for Credit Notes
- [Credit Note API Specification](CN-API-Specification.md) - Detailed API specification for the Credit Note module
- [Credit Note Component Structure](CN-Component-Structure.md) - Component hierarchy and responsibilities
- [Credit Note Page Flow](CN-Page-Flow.md) - Detailed page flow diagrams and user journeys
- [Credit Note User Flow Diagram](CN-User-Flow-Diagram.md) - Visual representations of user flows

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

4. **Integration**
   - Connection to vendor management
   - Integration with purchase orders and goods received notes
   - Inventory management integration
   - Financial system integration

5. **Reporting and Analytics**
   - Credit note status reporting
   - Return analysis by category
   - Vendor return analysis
   - Processing time analysis

## User Roles

The Credit Note module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Procurement Officer | Creates and manages credit notes | Create, edit, view CNs; add items; process CNs |
| Finance Officer | Reviews financial aspects | View CNs; review financial details; export reports |
| Finance Manager | Manages financial aspects | Finance Officer permissions; financial posting of CNs |
| Warehouse Manager | Manages physical returns | Process returns; update inventory; verify returned items |
| General User | Basic access to relevant CNs | View assigned CNs; add comments |

## Implementation Status

The Credit Note module is currently in the implementation phase, with core functionality available and additional features being developed. 

## Module Structure

The Credit Note module is structured as follows:

- **List View**: Displays all credit notes with filtering and search capabilities
- **Detail View**: Shows comprehensive information about a specific credit note
- **Creation Flow**: Guides users through the process of creating a new credit note
- **Processing Flow**: Manages the processing of credit notes including inventory and financial posting
- **Integration Points**: Connects with other modules such as GRN, Inventory, and Finance 