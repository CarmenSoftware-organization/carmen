# Purchase Request Module Documentation

This directory contains comprehensive documentation for the Purchase Request (PR) module in the Carmen F&B Management System.

## Documentation Index

### Business Documentation

- [Purchase Request Business Analysis](purchase-request-ba.md) - Business analysis of the Purchase Request module
- [Purchase Request Template Business Analysis](purchase-request-template-ba.md) - Business analysis of PR templates
- [Purchase Request Product Requirements Document (PRD)](purchase-request-prd.md) - Product requirements for the PR module
- [Module PRD](module-prd.md) - Detailed product requirements document
- [Business Logic](business-logic.md) - Business logic specifications

### Technical Documentation

- [Purchase Request API Specification](purchase-request-api-sp.md) - API specification for the PR module
- [Module Implementation](module-implementation.md) - Implementation details
- [Module Elements](module-elements.md) - Module elements and components
- [Item Details Specification](item-details-spec.md) - Detailed specification for item details
- [Module Requirements](module-requirements.md) - Technical requirements

### Diagrams and Flows

- [Purchase Request Flow](purchase-request-flow.md) - Flow diagrams for the PR module
- [User Flow](user-flow.md) - User flow diagrams
- [UI Flow Specification](ui-flow-specification.md) - UI flow specifications
- [Module Map](module-map.md) - Module map and structure
- [PR Sitemap](pr-sitemap.md) - Sitemap for the PR module

### Schema and API

- [Schema](Schema.md) - Database schema for the PR module
- [API](API.md) - API documentation
- [PR Requirements](PRRequirements.md) - Requirements for the PR API

## Key Features

The Purchase Request module provides the following key features:

1. **Purchase Request Management**
   - Creation of purchase requests
   - Editing and updating purchase request details
   - Viewing purchase request history and status
   - Cancellation and deletion of purchase requests

2. **Item Management**
   - Adding items to purchase requests
   - Specifying quantities, units, and estimated prices
   - Managing item details and specifications
   - Tracking item status

3. **Workflow and Approvals**
   - Configurable approval workflows
   - Role-based approval processes
   - Status tracking and notifications
   - Audit trail of approval actions

4. **Template Management**
   - Creating and managing PR templates
   - Using templates for recurring purchases
   - Template versioning and history

5. **Integration**
   - Connection to vendor management
   - Integration with purchase orders
   - Budget management integration
   - Inventory management integration

6. **Reporting and Analytics**
   - Purchase request status reporting
   - Budget allocation and tracking
   - Spending analysis by category
   - Request processing time analysis

## User Roles

The Purchase Request module supports the following user roles:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Requester | Creates and manages purchase requests | Create, edit, view PRs; add items; submit for approval |
| Department Manager | Approves departmental requests | View department PRs; approve/reject PRs |
| Finance Officer | Reviews financial aspects | View PRs; review financial details; export reports |
| Finance Manager | Approves financial aspects | Finance Officer permissions; financial approval of PRs |
| Procurement Officer | Processes approved PRs | View approved PRs; convert to POs; manage vendors |
| General User | Basic access to relevant PRs | View assigned PRs; add comments |

## Implementation Status

The Purchase Request module is currently in the implementation phase, with core functionality available and additional features being developed. 