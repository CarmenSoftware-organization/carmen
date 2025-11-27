# Goods Received Note Module Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Overview

The Goods Received Note (GRN) module is a core component of the Carmen F&B Management System, enabling efficient management of inventory receipts from vendors. This documentation set provides comprehensive information about the module's functionality, technical specifications, user experience design, component architecture, and API endpoints.

## Documentation Structure

The GRN module documentation is organized into the following sections:

### Core Documentation

- [**GRN-Overview.md**](./GRN-Overview.md) - High-level overview of the module, its purpose, key features, and business context
- [**GRN-Technical-Specification.md**](./GRN-Technical-Specification.md) - Detailed technical specifications, including data models, interfaces, and implementation details
- [**GRN-User-Experience.md**](./GRN-User-Experience.md) - User experience design, including user personas, journeys, interface descriptions, and visual user flow diagrams
- [**GRN-User-Flow-Diagram.md**](./GRN-User-Flow-Diagram.md) - Visual representations of user flows and process workflows using Mermaid diagrams
- [**GRN-Component-Specifications.md**](./GRN-Component-Specifications.md) - Specifications for the React components that make up the module

### API Documentation

- [**GRN-API-Overview.md**](./GRN-API-Overview.md) - Introduction to the Goods Received Note API, including conventions and common patterns
- [**GRN-API-Endpoints-Overview.md**](./GRN-API-Endpoints-Overview.md) - Overview of all API endpoints for GRN management
- [**GRN-API-Endpoints-Core.md**](./GRN-API-Endpoints-Core.md) - Core CRUD operations for GRNs
- [**GRN-API-Endpoints-Financial.md**](./GRN-API-Endpoints-Financial.md) - Financial operations (journal entries, tax entries, extra costs)
- [**GRN-API-Endpoints-Items.md**](./GRN-API-Endpoints-Items.md) - Item operations (add, update, delete items)
- [**GRN-API-Endpoints-Attachments.md**](./GRN-API-Endpoints-Attachments.md) - Attachment operations (upload, download, delete files)
- [**GRN-API-Endpoints-Comments.md**](./GRN-API-Endpoints-Comments.md) - Comment operations (add, update, delete comments)

### Supporting Documentation

- [**testing.md**](../testing.md) - Testing strategies and procedures for the GRN module
- [**troubleshooting.md**](../troubleshooting.md) - Common issues and their solutions

## Getting Started

If you're new to the Goods Received Note module, we recommend starting with the [GRN-Overview.md](./GRN-Overview.md) document to understand the module's purpose and key features. Then, depending on your role and interests, you can explore the technical specifications, user experience design, or API documentation.

For a visual understanding of the GRN process flow, refer to the [GRN-User-Flow-Diagram.md](./GRN-User-Flow-Diagram.md) document, which provides Mermaid diagrams illustrating the complete lifecycle of a GRN and how different user roles interact with the system.

## Related Modules

The Goods Received Note module interacts with several other modules in the Carmen F&B Management System:

- **Purchase Order** - For linking GRNs to purchase orders
- **Inventory Management** - For updating inventory levels
- **Finance** - For generating journal entries and invoices
- **User Management** - For user authentication and authorization

## Contributing

To contribute to this documentation, please follow these guidelines:

1. Create a branch from the main repository
2. Make your changes
3. Submit a pull request with a clear description of the changes
4. Ensure all links and references are updated correctly

## Contact

For questions or feedback about this documentation, please contact the Carmen F&B Management System documentation team. 