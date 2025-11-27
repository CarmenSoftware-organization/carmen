# Goods Received Note Module - API Endpoints Overview

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Endpoints)

## Table of Contents
1. [Introduction](#introduction)
2. [API Endpoints Organization](#api-endpoints-organization)
3. [Common Patterns](#common-patterns)
4. [API Endpoints Documentation](#api-endpoints-documentation)
5. [Related Documentation](#related-documentation)

## Introduction

This document provides an overview of the Goods Received Note (GRN) API endpoints. The GRN API allows clients to create, retrieve, update, and delete GRNs, as well as perform various actions on them such as posting and voiding.

Due to the comprehensive nature of the GRN API, the endpoint documentation has been organized into several focused documents for better readability and maintenance.

## API Endpoints Organization

The GRN API endpoints are organized into the following categories:

1. **Core Operations**: Basic CRUD operations for GRNs
2. **Financial Operations**: Endpoints related to financial processing of GRNs
3. **Item Operations**: Endpoints for managing GRN items
4. **Attachment Operations**: Endpoints for managing GRN attachments
5. **Comment Operations**: Endpoints for managing GRN comments

## Common Patterns

All GRN API endpoints follow these common patterns:

### Authentication

All endpoints require authentication using JWT tokens or API keys. See the [GRN API Overview](./GRN-API-Overview.md) for details on authentication methods.

### Error Handling

All endpoints use a consistent error handling approach. See the [GRN API Overview](./GRN-API-Overview.md) for details on error response formats and common error codes.

### Request/Response Format

All endpoints use JSON for request and response bodies. Date fields use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).

### Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (1-based)
- `limit`: Number of items per page
- `sortBy`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

## API Endpoints Documentation

The GRN API endpoints are documented in the following files:

1. [Core Operations](./GRN-API-Endpoints-Core.md)
   - List GRNs
   - Create GRN
   - Get GRN by ID
   - Update GRN
   - Delete GRN

2. [Financial Operations](./GRN-API-Endpoints-Financial.md)
   - Post GRN to Inventory
   - Void GRN
   - Get Journal Entries
   - Get Tax Entries

3. [Item Operations](./GRN-API-Endpoints-Items.md)
   - List GRN Items
   - Add Item to GRN
   - Update GRN Item
   - Remove Item from GRN
   - Bulk Update Items

4. [Attachment Operations](./GRN-API-Endpoints-Attachments.md)
   - List GRN Attachments
   - Add Attachment to GRN
   - Get Attachment
   - Delete Attachment

5. [Comment Operations](./GRN-API-Endpoints-Comments.md)
   - List GRN Comments
   - Add Comment to GRN
   - Update Comment
   - Delete Comment

## Related Documentation

For more information about the GRN API, please refer to the following documentation:

1. **API Overview**:
   - [GRN API Overview](./GRN-API-Overview.md)

2. **Technical Documentation**:
   - [GRN Technical Specification](./GRN-Technical-Specification.md)

3. **User Experience Documentation**:
   - [GRN User Experience](./GRN-User-Experience.md)
   - [GRN User Flow Diagram](./GRN-User-Flow-Diagram.md)

4. **Component Documentation**:
   - [GRN Component Specifications](./GRN-Component-Specifications.md) 