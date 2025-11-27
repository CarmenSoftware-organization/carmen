# Goods Received Note Module - Overview

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - README.md
> - goods-received-note-ba.md
> - grn-ba.md
> - grn-module-prd.md

## Table of Contents
1. [Introduction](#introduction)
2. [Module Purpose](#module-purpose)
3. [Key Features](#key-features)
4. [Business Context](#business-context)
5. [Module Architecture](#module-architecture)
6. [Integration Points](#integration-points)
7. [Related Documentation](#related-documentation)

## Introduction

The Goods Received Note (GRN) module is a core component of the Carmen F&B Management System, enabling efficient management of inventory receipts from vendors. This document provides a high-level overview of the module, its purpose, key features, and business context.

The GRN module is essential for managing and tracking the receipt of goods from vendors, ensuring accurate inventory records, and facilitating proper financial accounting. It serves as the bridge between procurement and inventory management, validating that ordered items have been received correctly and updating inventory levels accordingly.

### Scope
The GRN module covers the entire goods receipt process, from creation to approval, including:
- Inventory updates
- Financial postings
- Integration with other modules such as Purchase Orders and Inventory Management
- Quality control checks
- Vendor performance tracking

### Audience
- Procurement team members
- Warehouse staff
- Finance department
- System administrators
- Development team
- Quality assurance team

## Module Purpose

The primary purpose of the GRN module is to:

1. **Document Receipt of Goods**: Create a formal record of goods received from vendors, including quantities, conditions, and any discrepancies.

2. **Update Inventory**: Automatically update inventory levels when goods are received, ensuring accurate stock records.

3. **Financial Integration**: Generate necessary accounting entries for received goods, including accounts payable transactions.

4. **Purchase Order Reconciliation**: Match received goods against purchase orders to verify that ordered items have been delivered correctly.

5. **Quality Control**: Support quality inspection processes for received goods, with options to accept, reject, or partially accept deliveries.

6. **Vendor Performance Tracking**: Collect data on vendor delivery performance, including timeliness, accuracy, and quality.

## Key Features

The GRN module includes the following key features:

1. **GRN Creation and Management**:
   - Create GRNs with or without reference to purchase orders
   - Support for partial receipts and multiple receipts against a single PO
   - Ability to handle unexpected or unordered items

2. **Inventory Integration**:
   - Automatic inventory updates upon GRN approval
   - Support for multiple storage locations
   - Lot and batch tracking for applicable items
   - Expiry date management for perishable goods

3. **Financial Processing**:
   - Automatic generation of journal entries
   - Support for landed costs and additional expenses
   - Tax calculation and management
   - Currency conversion for international purchases

4. **Quality Control**:
   - Quality inspection workflows
   - Rejection and return processing
   - Conditional acceptance with notes

5. **Reporting and Analytics**:
   - GRN status tracking and reporting
   - Vendor performance metrics
   - Receipt history and audit trails
   - Variance analysis (ordered vs. received)

6. **Integration Capabilities**:
   - Seamless integration with Purchase Order module
   - Connection to Inventory Management
   - Integration with Finance module for accounting entries
   - Workflow integration for approvals

## Business Context

### Business Objectives
- Accurately record and track the receipt of goods from vendors
- Ensure proper inventory management and stock level updates
- Facilitate accurate financial accounting and vendor payments
- Maintain audit trails for all goods receipt transactions
- Improve operational efficiency in the receiving process
- Support data-driven vendor management decisions

### Business Processes
The GRN module supports the following business processes:

1. **Goods Receipt Process**:
   - Receiving goods at warehouse or store locations
   - Verifying received items against purchase orders
   - Documenting any discrepancies or quality issues
   - Updating inventory records
   - Initiating payment processes

2. **Inventory Management Process**:
   - Updating stock levels based on received goods
   - Managing lot/batch tracking information
   - Handling expiry dates for perishable items
   - Allocating received goods to appropriate storage locations

3. **Financial Process**:
   - Creating accounts payable entries
   - Recording landed costs and additional expenses
   - Managing tax implications
   - Supporting invoice matching and payment processing

4. **Vendor Management Process**:
   - Tracking vendor delivery performance
   - Managing vendor returns and rejections
   - Supporting vendor evaluation and selection

## Module Architecture

The GRN module is built on a modular architecture that integrates with other core modules of the Carmen F&B Management System:

### Core Components
1. **GRN Management Interface**:
   - GRN list view with filtering and sorting capabilities
   - GRN creation and editing forms
   - GRN detail view with tabbed interface

2. **Business Logic Layer**:
   - GRN validation and processing rules
   - Inventory update logic
   - Financial calculation engine
   - Workflow and approval routing

3. **Data Access Layer**:
   - GRN data models and repositories
   - Query and transaction management
   - Data validation and integrity checks

4. **Integration Services**:
   - API endpoints for external system integration
   - Event publishing for system-wide notifications
   - Subscription to relevant system events

### Technical Stack
- Frontend: React with Next.js framework
- Backend: Node.js with Express
- Database: PostgreSQL with Prisma ORM
- API: RESTful API with OpenAPI specification
- Authentication: JWT-based authentication with role-based access control

## Integration Points

The GRN module integrates with several other modules within the Carmen F&B Management System:

1. **Purchase Order Module**:
   - Retrieves purchase order details for GRN creation
   - Updates purchase order status based on goods receipt
   - Shares vendor and item information

2. **Inventory Management Module**:
   - Updates inventory levels upon GRN approval
   - Manages lot/batch tracking information
   - Handles storage location assignments
   - Processes inventory movements

3. **Finance Module**:
   - Generates journal entries for goods receipt
   - Manages accounts payable records
   - Handles tax calculations and reporting
   - Supports invoice matching and payment processing

4. **Vendor Management Module**:
   - Shares vendor information and contact details
   - Updates vendor performance metrics
   - Manages vendor returns and quality issues

5. **Workflow Module**:
   - Handles approval routing for GRNs
   - Manages user notifications
   - Enforces business rules and permissions

6. **User Management Module**:
   - Controls user access and permissions
   - Manages user roles and responsibilities
   - Tracks user actions for audit purposes

## Related Documentation

For more detailed information about the GRN module, please refer to the following documentation:

1. **Technical Documentation**:
   - [GRN Technical Specification](./GRN-Technical-Specification.md)
   - [GRN Component Specifications](./GRN-Component-Specifications.md)

2. **User Experience Documentation**:
   - [GRN User Experience](./GRN-User-Experience.md)

3. **API Documentation**:
   - [GRN API Overview](./GRN-API-Overview.md)
   - [GRN API Endpoints](./GRN-API-Endpoints.md)

4. **Related Module Documentation**:
   - [Purchase Order Module](/docs/po/README.md)
   - [Inventory Management Module](/docs/inventory-management/README.md)
   - [Finance Module Documentation](/docs/finance/README.md) 