# Purchase Request (PR) Module Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview
This directory contains comprehensive documentation for the Purchase Request (PR) module of the Carmen F&B Management System. The PR module enables users to create, manage, and process purchase requests throughout their lifecycle.

## Documentation Structure
The documentation has been consolidated into the following key documents:

### Core Documentation
- [**PR-Overview.md**](./PR-Overview.md) - Comprehensive overview of the PR module, including purpose, key features, and business context
- [**PR-Technical-Specification.md**](./PR-Technical-Specification.md) - Technical specifications, data models, and implementation details
- [**PR-User-Experience.md**](./PR-User-Experience.md) - User flows, UI specifications, and interaction patterns
- [**PR-Component-Specifications.md**](./PR-Component-Specifications.md) - Detailed specifications for key components and business logic
- [**PR-API-Specifications.md**](./PR-API-Specifications.md) - API endpoints, request/response formats, and integration details
- [**PR-Module-Structure.md**](./PR-Module-Structure.md) - Detailed technical reference for module structure, components, and state management

### Cross-Module Documentation
- [**Procurement-Process-Flow.md**](../Procurement-Process-Flow.md) - End-to-end procurement process across PR, PO, GRN, and CN modules

### Supporting Documentation
- [**testing.md**](./testing.md) - Testing strategies and test cases for the PR module
- [**troubleshooting.md**](./troubleshooting.md) - Common issues and their resolutions

## Documentation Status
The documentation has undergone a consolidation process:
- **Phase 1** (Completed): Creation of consolidated document structures
- **Phase 2** (Completed): Content migration from original documents to consolidated structure
- **Phase 3** (Completed): Content refinement, gap filling, and standardization

All documentation is now finalized and ready for use. Future updates will be made as needed for maintenance or feature additions.

## Consolidation Process
The documentation has been consolidated from multiple source documents into a more organized and maintainable structure. This consolidation offers several benefits:

1. **Improved Organization**: Related content is grouped together in logical documents
2. **Reduced Redundancy**: Duplicate information has been eliminated
3. **Better Maintainability**: Fewer documents to maintain and update
4. **Enhanced Discoverability**: Clearer structure makes information easier to find
5. **Consistent Formatting**: Standardized document structure across all content

### Original Documents Being Replaced
The following original documents have been consolidated and will be removed:

#### Module Overview and Requirements
- module-prd.md → PR-Overview.md, PR-Technical-Specification.md
- purchase-request-prd.md → PR-Overview.md, PR-Technical-Specification.md
- purchase-request-ba.md → PR-Overview.md
- module-requirements.md → PR-Technical-Specification.md
- module-implementation.md → PR-Technical-Specification.md
- module-elements.md → PR-Technical-Specification.md, PR-User-Experience.md

#### Technical Documentation
- Schema.md → PR-Technical-Specification.md
- data-models.md → PR-Technical-Specification.md
- business-logic.md → PR-Component-Specifications.md
- item-details-spec.md → PR-Component-Specifications.md
- module-map.md → PR-Module-Structure.md

#### User Experience
- user-flow.md → PR-User-Experience.md
- ui-flow-specification.md → PR-User-Experience.md
- pr-sitemap.md → PR-User-Experience.md

#### API Documentation
- purchase-request-api-sp.md → PR-API-Specifications.md
- api-endpoints.md → PR-API-Specifications.md
- workflow-api-sp.md → PR-API-Specifications.md

#### Integration
- pr-to-po-traceability.md → Procurement-Process-Flow.md

### Documents Not Consolidated
The following documents contain specialized information that has not been fully consolidated and will be maintained separately:

- **purchase-request-template-ba.md** - Detailed business analysis for the PR Template functionality

### Removal Plan
The original documents will be removed after:
1. Verifying all content has been successfully migrated
2. Ensuring all cross-references have been updated
3. Confirming the consolidated documents are complete and accurate
4. Getting approval from the documentation team

## Contributing to Documentation
When contributing to this documentation:
1. Follow the established document structure
2. Use Markdown for all documentation
3. Include diagrams using Mermaid syntax where appropriate
4. Cross-reference related documents
5. Update the README.md when adding new documents

## Related Documentation
- [Purchase Order (PO) Documentation](../po/README.md)
- [Goods Received Note (GRN) Documentation](../grn/README.md)
- [Credit Note (CN) Documentation](../cn/README.md)
- [Application Overview](../application-overview.md)

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

## Recent Updates

- **March 14, 2024**: Added purchase-request-ba.md to the list of consolidated documents
- **March 14, 2024**: Renamed module-map.md to PR-Module-Structure.md to align with documentation naming conventions
- **March 14, 2024**: Completed documentation refinement (Phase 3) for the PR module
- **March 14, 2024**: Enhanced Integration Points section in PR-User-Experience.md
- **March 14, 2024**: Added detailed Purpose and Scope section to Introduction
- **March 14, 2024**: Expanded User Roles with comprehensive responsibilities
- **March 14, 2024**: Updated all document statuses to Final
- **March 12, 2024**: Completed documentation consolidation (Phase 2) for the PR module
- **March 12, 2024**: Added comprehensive data models documentation
- **March 12, 2024**: Updated API documentation with authentication and error handling details
- **March 12, 2024**: Added testing documentation and troubleshooting guide
- **March 12, 2024**: Improved workflow documentation 