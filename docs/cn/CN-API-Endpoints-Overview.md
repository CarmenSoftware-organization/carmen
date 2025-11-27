# Credit Note API Endpoints Overview

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents
- [Introduction](#introduction)
- [API Endpoints Organization](#api-endpoints-organization)
- [Common Patterns](#common-patterns)
- [API Endpoints Documentation](#api-endpoints-documentation)
- [Related Documentation](#related-documentation)

## Introduction

The Credit Note API allows clients to manage credit notes through a set of RESTful endpoints. This API enables operations such as creating, retrieving, and managing credit notes, as well as handling related entities like items, comments, attachments, and inventory adjustments.

Credit notes are documents issued to record and process returns or adjustments related to previously received goods or services. They are typically linked to purchase orders (POs) and goods received notes (GRNs).

## API Endpoints Organization

The Credit Note API endpoints are organized into the following categories:

1. **Core Operations**: Basic CRUD operations for credit notes
2. **Financial Operations**: Operations related to financial aspects like journal entries and tax entries
3. **Item Operations**: Operations for managing items within a credit note
4. **Attachment Operations**: Operations for managing file attachments
5. **Comment Operations**: Operations for managing comments and discussions
6. **Inventory Operations**: Operations for processing inventory adjustments related to returns

## Common Patterns

All Credit Note API endpoints follow these common patterns:

- **Authentication**: All endpoints require authentication using JWT tokens
- **Error Handling**: Consistent error response format with appropriate HTTP status codes
- **Request/Response Format**: JSON format for all request and response bodies
- **Pagination**: List endpoints support pagination with `page` and `limit` parameters
- **Sorting**: List endpoints support sorting with `sortBy` and `order` parameters
- **Filtering**: List endpoints support filtering with various query parameters

## API Endpoints Documentation

The Credit Note API endpoints are documented in detail in the following files:

- [Core Operations](./CN-API-Endpoints-Core.md): Create, retrieve, update, and delete credit notes
- [Financial Operations](./CN-API-Endpoints-Financial.md): Journal entries, tax entries, and financial calculations
- [Item Operations](./CN-API-Endpoints-Items.md): Add, update, and remove items from credit notes
- [Attachment Operations](./CN-API-Endpoints-Attachments.md): Upload, download, and manage file attachments
- [Comment Operations](./CN-API-Endpoints-Comments.md): Add, update, and manage comments
- [Inventory Operations](./CN-API-Endpoints-Inventory.md): Process inventory returns and adjustments

## Related Documentation

### API Documentation
- [Credit Note API Overview](./CN-API-Endpoints-Overview.md) (this document)
- [Credit Note API - Core Operations](./CN-API-Endpoints-Core.md)
- [Credit Note API - Financial Operations](./CN-API-Endpoints-Financial.md)
- [Credit Note API - Item Operations](./CN-API-Endpoints-Items.md)
- [Credit Note API - Attachment Operations](./CN-API-Endpoints-Attachments.md)
- [Credit Note API - Comment Operations](./CN-API-Endpoints-Comments.md)
- [Credit Note API - Inventory Operations](./CN-API-Endpoints-Inventory.md)

### Technical Documentation
- [Credit Note Technical Specification](./credit-note-api-sp.md)
- [Credit Note Component Structure](./credit-note-component-structure.md)

### User Experience Documentation
- [Credit Note User Experience](./credit-note-prd.md)
- [Credit Note Page Flow](./credit-note-page-flow.md)
- [Credit Note User Flow Diagram](./CN-User-Flow-Diagram.md)

### Business Analysis
- [Return Credit Note Business Analysis](./return-credit-note-ba.md) 