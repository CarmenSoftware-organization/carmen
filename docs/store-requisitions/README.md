# Store Requisition Module Documentation

> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Overview

The Store Requisition (SR) module is a core component of the Carmen F&B Management System, enabling efficient management of internal stock requests between warehouses and stores. This documentation set provides comprehensive information about the module's functionality, technical specifications, user experience design, component architecture, and API endpoints.

## Documentation Structure

The SR module documentation is organized into the following sections:

### Core Documentation

- [**SR-Overview.md**](./SR-Overview.md) - High-level overview of the module, its purpose, key features, and business context
- [**SR-Technical-Specification.md**](./SR-Technical-Specification.md) - Detailed technical specifications, including data models, interfaces, and implementation details
- [**SR-User-Experience.md**](./SR-User-Experience.md) - User experience design, including user personas, journeys, interface descriptions, and visual user flow diagrams
- [**SR-Component-Specifications.md**](./SR-Component-Specifications.md) - Specifications for the React components that make up the module

### API Documentation

- [**SR-API-Overview.md**](./SR-API-Overview.md) - Introduction to the Store Requisition API, including conventions and common patterns
- [**SR-API-Requisition-Endpoints.md**](./SR-API-Requisition-Endpoints.md) - API endpoints for requisition management
- [**SR-API-Approval-Endpoints.md**](./SR-API-Approval-Endpoints.md) - API endpoints for the approval process
- [**SR-API-StockMovement-Endpoints.md**](./SR-API-StockMovement-Endpoints.md) - API endpoints for stock movement operations
- [**SR-API-JournalEntry-Endpoints.md**](./SR-API-JournalEntry-Endpoints.md) - API endpoints for journal entries

### Supporting Documentation

- [**testing.md**](../testing.md) - Testing strategies and procedures for the SR module
- [**troubleshooting.md**](../troubleshooting.md) - Common issues and their solutions

## Getting Started

If you're new to the Store Requisition module, we recommend starting with the [SR-Overview.md](./SR-Overview.md) document to understand the module's purpose and key features. Then, depending on your role and interests, you can explore the technical specifications, user experience design, or API documentation.

## Related Modules

The Store Requisition module interacts with several other modules in the Carmen F&B Management System:

- **Inventory Management** - For stock level tracking and updates
- **Finance** - For journal entry generation and posting
- **Workflow** - For approval process management
- **User Management** - For user authentication and authorization

## Contributing

To contribute to this documentation, please follow these guidelines:

1. Create a branch from the main repository
2. Make your changes
3. Submit a pull request with a clear description of the changes
4. Ensure all links and references are updated correctly

## Contact

For questions or feedback about this documentation, please contact the Carmen F&B Management System documentation team. 