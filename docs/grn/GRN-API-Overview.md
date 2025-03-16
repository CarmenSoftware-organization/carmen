# Goods Received Note Module - API Overview

> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Overview, Authentication, Error Handling)

## Table of Contents
1. [Introduction](#introduction)
2. [API Architecture](#api-architecture)
3. [Authentication and Authorization](#authentication-and-authorization)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Versioning](#versioning)
7. [Common Request/Response Patterns](#common-requestresponse-patterns)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides an overview of the API architecture and design principles for the Goods Received Note (GRN) module within the Carmen F&B Management System. It covers authentication, error handling, rate limiting, versioning, and common request/response patterns.

## API Architecture

The GRN module API follows a RESTful architecture with the following characteristics:

### Design Principles

1. **Resource-Oriented**: The API is organized around resources (GRNs, items, etc.) with standard HTTP methods.
2. **Stateless**: Each request contains all the information needed to process it.
3. **Cacheable**: Responses explicitly indicate their cacheability.
4. **Layered System**: Clients cannot tell whether they are connected directly to the end server.
5. **Uniform Interface**: Resources are identified by URLs, manipulated through representations, and include self-descriptive messages.

### API Structure

The GRN API is structured as follows:

```
/api/grns                    # GRN collection
/api/grns/{id}               # Specific GRN
/api/grns/{id}/items         # Items in a GRN
/api/grns/{id}/extra-costs   # Extra costs in a GRN
/api/grns/{id}/journal       # Journal entries for a GRN
/api/grns/{id}/tax           # Tax entries for a GRN
/api/grns/{id}/attachments   # Attachments for a GRN
/api/grns/{id}/comments      # Comments for a GRN
/api/grns/{id}/activity      # Activity log for a GRN
/api/grns/{id}/approve       # Approve a GRN
/api/grns/{id}/reject        # Reject a GRN
/api/grns/{id}/submit        # Submit a GRN for approval
/api/grns/{id}/cancel        # Cancel a GRN
```

### Implementation Technologies

The GRN API is implemented using the following technologies:

- **Framework**: Next.js API Routes and Server Actions
- **Database Access**: Prisma ORM
- **Authentication**: JWT-based authentication
- **Validation**: Zod schema validation
- **Documentation**: OpenAPI (Swagger) specification

## Authentication and Authorization

### Authentication Methods

The GRN API supports the following authentication methods:

1. **JWT Token Authentication**:
   - Tokens are issued upon successful login
   - Tokens must be included in the `Authorization` header as `Bearer {token}`
   - Tokens expire after 24 hours and must be refreshed

2. **API Key Authentication** (for system integrations):
   - API keys are issued to trusted systems
   - Keys must be included in the `X-API-Key` header
   - Keys have configurable permissions and expiration

### Authorization Model

The GRN API uses a role-based access control (RBAC) model with the following roles:

1. **GRN Viewer**: Can view GRNs but cannot modify them
2. **GRN Creator**: Can create and edit GRNs
3. **GRN Approver**: Can approve or reject GRNs
4. **GRN Administrator**: Has full access to all GRN functionality

Permissions are checked at the API level for each request, and unauthorized requests are rejected with a 403 Forbidden response.

### Permission Requirements

| Endpoint                   | Viewer | Creator | Approver | Admin |
|----------------------------|--------|---------|----------|-------|
| GET /api/grns              | ✓      | ✓       | ✓        | ✓     |
| GET /api/grns/{id}         | ✓      | ✓       | ✓        | ✓     |
| POST /api/grns             | ✗      | ✓       | ✓        | ✓     |
| PUT /api/grns/{id}         | ✗      | ✓*      | ✓*       | ✓     |
| DELETE /api/grns/{id}      | ✗      | ✗       | ✗        | ✓     |
| POST /api/grns/{id}/submit | ✗      | ✓       | ✓        | ✓     |
| POST /api/grns/{id}/approve| ✗      | ✗       | ✓        | ✓     |
| POST /api/grns/{id}/reject | ✗      | ✗       | ✓        | ✓     |
| POST /api/grns/{id}/cancel | ✗      | ✓*      | ✓        | ✓     |

*With restrictions based on GRN status

## Error Handling

The GRN API uses a consistent error handling approach to provide clear and actionable error messages.

### Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field1": "Error details for field1",
      "field2": "Error details for field2"
    },
    "requestId": "unique-request-identifier"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code                | Description                                      |
|-------------|---------------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST           | The request is malformed or invalid              |
| 400         | VALIDATION_ERROR          | The request data failed validation               |
| 401         | UNAUTHORIZED              | Authentication is required                       |
| 403         | FORBIDDEN                 | The user lacks permission for this action        |
| 404         | RESOURCE_NOT_FOUND        | The requested resource does not exist            |
| 409         | CONFLICT                  | The request conflicts with the current state     |
| 422         | BUSINESS_RULE_VIOLATION   | The request violates a business rule            |
| 429         | RATE_LIMIT_EXCEEDED       | Too many requests                               |
| 500         | INTERNAL_SERVER_ERROR     | An unexpected error occurred                     |
| 503         | SERVICE_UNAVAILABLE       | The service is temporarily unavailable           |

### Validation Errors

Validation errors provide detailed information about which fields failed validation and why:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data failed validation",
    "details": {
      "receiptDate": "Receipt date is required",
      "items[0].receivedQuantity": "Received quantity must be greater than zero"
    },
    "requestId": "req-123456"
  }
}
```

### Business Rule Violations

Business rule violations indicate that the request is syntactically valid but violates a business rule:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot approve GRN with zero items",
    "details": {
      "rule": "GRN_MUST_HAVE_ITEMS",
      "resolution": "Add at least one item to the GRN before approval"
    },
    "requestId": "req-123456"
  }
}
```

### Error Logging and Monitoring

All API errors are logged with the following information:
- Error code and message
- Request details (URL, method, headers, body)
- User information (if authenticated)
- Stack trace (for server errors)
- Timestamp
- Request ID

Critical errors trigger alerts to the development team for immediate investigation.

## Rate Limiting

The GRN API implements rate limiting to protect against abuse and ensure fair usage.

### Rate Limit Rules

| Client Type | Limit                   | Window  |
|-------------|-------------------------|---------|
| Anonymous   | 10 requests             | 1 minute|
| Authenticated| 100 requests           | 1 minute|
| System      | 1000 requests           | 1 minute|

### Rate Limit Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1614556800
```

### Rate Limit Exceeded Response

When a rate limit is exceeded, the API returns a 429 Too Many Requests response:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 45 seconds.",
    "details": {
      "limit": 100,
      "reset": 1614556800
    },
    "requestId": "req-123456"
  }
}
```

## Versioning

The GRN API uses versioning to ensure backward compatibility as the API evolves.

### Versioning Strategy

Versioning is implemented through URL path prefixes:

```
/api/v1/grns
/api/v2/grns
```

### Version Lifecycle

Each API version follows this lifecycle:
1. **Current**: The recommended version for new integrations
2. **Supported**: Still supported but not recommended for new integrations
3. **Deprecated**: Still works but will be removed in the future
4. **Retired**: No longer available

### Version Headers

The current API version is included in response headers:

```
X-API-Version: v1
X-API-Deprecated: false
X-API-Sunset-Date: 2025-12-31
```

## Common Request/Response Patterns

### Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page
- `sortBy`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

Pagination information is included in the response:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

### Filtering

List endpoints support filtering with query parameters:

- Simple filters: `status=APPROVED`
- Date range filters: `fromDate=2024-01-01&toDate=2024-01-31`
- Complex filters: `filter={"status":{"in":["DRAFT","PENDING_APPROVAL"]}}`

### Field Selection

Clients can request specific fields to reduce response size:

```
GET /api/grns?fields=id,grnNumber,status,total
```

### Expanding Related Resources

Clients can request related resources to be included in the response:

```
GET /api/grns/123?expand=vendor,items,journalEntries
```

## Related Documentation

For more detailed information about the GRN API, please refer to the following documentation:

1. **API Endpoints Documentation**:
   - [GRN API Endpoints](./GRN-API-Endpoints.md)

2. **Technical Documentation**:
   - [GRN Technical Specification](./GRN-Technical-Specification.md)

3. **Integration Guides**:
   - [GRN Integration Guide](/docs/integration/grn-integration.md)
   - [API Authentication Guide](/docs/integration/api-authentication.md) 