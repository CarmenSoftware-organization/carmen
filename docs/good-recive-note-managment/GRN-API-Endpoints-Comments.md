# Goods Received Note Module - API Comment Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Endpoints - Comment Operations)

## Table of Contents
1. [Introduction](#introduction)
2. [Get Comments](#get-comments)
3. [Get Comment by ID](#get-comment-by-id)
4. [Add Comment](#add-comment)
5. [Update Comment](#update-comment)
6. [Delete Comment](#delete-comment)
7. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the comment API endpoints of the Goods Received Note (GRN) module. These endpoints allow clients to manage comments for GRNs, including adding, updating, and deleting comments.

## Get Comments

Retrieves all comments associated with a specific GRN.

### Request

```
GET /api/grns/{id}/comments
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Query Parameters

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| page      | number | No       | Page number (default: 1)                         |
| limit     | number | No       | Items per page (default: 20, max: 100)           |
| sortBy    | string | No       | Field to sort by (default: 'createdAt')          |
| order     | string | No       | Sort order: 'asc' or 'desc' (default: 'desc')    |

### Response

```json
{
  "comments": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174034",
      "grnId": "123e4567-e89b-12d3-a456-426614174000",
      "content": "Please verify the quantities received against the delivery note.",
      "createdBy": "john.doe@example.com",
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedBy": "john.doe@example.com",
      "updatedAt": "2024-03-15T10:30:00Z",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174035",
        "email": "john.doe@example.com",
        "name": "John Doe",
        "avatarUrl": "https://example.com/avatars/john-doe.jpg"
      }
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174036",
      "grnId": "123e4567-e89b-12d3-a456-426614174000",
      "content": "Quantities verified and match the delivery note.",
      "createdBy": "jane.smith@example.com",
      "createdAt": "2024-03-15T11:30:00Z",
      "updatedBy": "jane.smith@example.com",
      "updatedAt": "2024-03-15T11:30:00Z",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174037",
        "email": "jane.smith@example.com",
        "name": "Jane Smith",
        "avatarUrl": "https://example.com/avatars/jane-smith.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "pages": 1
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Get Comment by ID

Retrieves a specific comment from a GRN by its ID.

### Request

```
GET /api/grns/{id}/comments/{commentId}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| commentId | string | Yes      | Comment ID (UUID)|

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174034",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "Please verify the quantities received against the delivery note.",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T10:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T10:30:00Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174035",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatars/john-doe.jpg"
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or comment not found                         |

## Add Comment

Adds a new comment to a GRN.

### Request

```
POST /api/grns/{id}/comments
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Request Body

```json
{
  "content": "The quality of the received goods is excellent."
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174038",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "The quality of the received goods is excellent.",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T15:30:00Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174035",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatars/john-doe.jpg"
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Update Comment

Updates an existing comment. Users can only update their own comments.

### Request

```
PUT /api/grns/{id}/comments/{commentId}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| commentId | string | Yes      | Comment ID (UUID)|

### Request Body

```json
{
  "content": "The quality of the received goods is excellent. No damages observed."
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174038",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "content": "The quality of the received goods is excellent. No damages observed.",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T15:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T16:30:00Z",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174035",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatars/john-doe.jpg"
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions or not the comment owner|
| 404         | RESOURCE_NOT_FOUND   | GRN or comment not found                         |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Delete Comment

Deletes a comment from a GRN. Users can only delete their own comments, unless they have admin privileges.

### Request

```
DELETE /api/grns/{id}/comments/{commentId}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| commentId | string | Yes      | Comment ID (UUID)|

### Response

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions or not the comment owner|
| 404         | RESOURCE_NOT_FOUND   | GRN or comment not found                         |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Related Documentation

For more information about the GRN API, please refer to the following documentation:

1. **API Overview**:
   - [GRN API Endpoints Overview](./GRN-API-Endpoints-Overview.md)
   - [GRN API Overview](./GRN-API-Overview.md)

2. **Other API Endpoints**:
   - [Core Operations](./GRN-API-Endpoints-Core.md)
   - [Workflow Operations](./GRN-API-Endpoints-Workflow.md)
   - [Financial Operations](./GRN-API-Endpoints-Financial.md)
   - [Item Operations](./GRN-API-Endpoints-Items.md)
   - [Attachment Operations](./GRN-API-Endpoints-Attachments.md) 