# Carmen F&B Management System Documentation

This directory contains comprehensive documentation for the Carmen F&B Management System, including business requirements, technical specifications, and design documents.

## Documentation Structure

### Top-Level Directories

- [API Specifications](./api-specifications) - API endpoints, data structures, and technical specifications
- [Business Analysis](./business-analysis) - Business requirements and analysis documents
- [System Overview](./system-overview) - System-wide documentation, architecture, and workflow diagrams
- [Testing](./testing) - Testing procedures, test plans, and test forms

### Module Documentation

- [Purchase Orders (PO)](./po) - Documentation for the Purchase Order module
- [Purchase Requests (PR)](./pr) - Documentation for the Purchase Request module
- [Goods Received Notes (GRN)](./grn) - Documentation for the Goods Received Note module
- [Credit Notes (CN)](./cn) - Documentation for the Credit Note module
- [Store Requisitions (SR)](./sr) - Documentation for the Store Requisition module
- [Inventory Management](./inventory-management) - Documentation for the Inventory Management module
- [Inventory Adjustment](./inventory-adjustment) - Documentation for the Inventory Adjustment module
- [Product Management](./product-management) - Documentation for the Product Management module
- [User Management](./user-management) - Documentation for the User Management module
- [Recipe Module](./recipe-module) - Documentation for the Recipe Management module
- [Platform Notification Service](./platform-notification-service) - Documentation for the Notification Service

## Documentation Types

Each module typically contains the following types of documentation:

1. **Business Analysis (BA)** - Business requirements and analysis
2. **Product Requirements Document (PRD)** - Detailed product requirements
3. **Functional Specification Document (FSD)** - Technical specifications for implementation
4. **API Specification** - API endpoints and data structures
5. **User Flows** - Diagrams illustrating user interactions
6. **State Diagrams** - Diagrams showing state transitions
7. **Data Flow Diagrams** - Diagrams showing data movement through the system

## Documentation Standards

When creating or updating documentation:

1. Place system-wide documents in their corresponding top-level directories
   - API specifications in `/docs/api-specifications`
   - Business analysis documents in `/docs/business-analysis`
   - System overview documents in `/docs/system-overview`
   - Testing-related documents in `/docs/testing`
2. Place module-specific documents in their respective module directories (e.g., `/docs/po`)
3. Use Markdown format for all documentation
4. Include diagrams using Mermaid syntax where appropriate
5. Keep documentation up-to-date with implementation changes
6. Cross-reference related documents when applicable

## Recent Updates

- **April 18, 2025**: Reorganized documentation structure with clear separation of concerns
- **March 14, 2024**: Added purchase-request-ba.md to the list of consolidated documents in PR module
- **March 14, 2024**: Renamed module-map.md to PR-Module-Structure.md in PR module documentation
- **March 14, 2024**: Completed documentation refinement (Phase 3) for the PR module
- **March 14, 2024**: Enhanced Integration Points documentation across modules
- **March 14, 2024**: Added detailed User Role specifications for PR module
- **March 12, 2024**: Completed documentation consolidation (Phase 2) for the PR module
- **March 12, 2024**: Created comprehensive Procurement Process Flow document
- **March 12, 2024**: Updated cross-references between procurement-related modules