# Goods Received Note Module - API Attachment Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Endpoints - Attachment Operations)

## Table of Contents
1. [Introduction](#introduction)
2. [Get Attachments](#get-attachments)
3. [Get Attachment by ID](#get-attachment-by-id)
4. [Upload Attachment](#upload-attachment)
5. [Update Attachment](#update-attachment)
6. [Delete Attachment](#delete-attachment)
7. [Download Attachment](#download-attachment)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the attachment API endpoints of the Goods Received Note (GRN) module. These endpoints allow clients to manage attachments for GRNs, including uploading, downloading, and deleting files.

## Get Attachments

Retrieves all attachments associated with a specific GRN.

### Request

```
GET /api/grns/{id}/attachments
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Response

```json
{
  "attachments": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174031",
      "grnId": "123e4567-e89b-12d3-a456-426614174000",
      "fileName": "delivery-note.pdf",
      "fileSize": 1024000,
      "fileType": "application/pdf",
      "description": "Vendor delivery note",
      "uploadedBy": "john.doe@example.com",
      "uploadedAt": "2024-03-15T10:30:00Z",
      "updatedBy": "john.doe@example.com",
      "updatedAt": "2024-03-15T10:30:00Z",
      "downloadUrl": "/api/grns/123e4567-e89b-12d3-a456-426614174000/attachments/123e4567-e89b-12d3-a456-426614174031/download"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174032",
      "grnId": "123e4567-e89b-12d3-a456-426614174000",
      "fileName": "quality-certificate.pdf",
      "fileSize": 512000,
      "fileType": "application/pdf",
      "description": "Quality certificate for received goods",
      "uploadedBy": "john.doe@example.com",
      "uploadedAt": "2024-03-15T11:30:00Z",
      "updatedBy": "john.doe@example.com",
      "updatedAt": "2024-03-15T11:30:00Z",
      "downloadUrl": "/api/grns/123e4567-e89b-12d3-a456-426614174000/attachments/123e4567-e89b-12d3-a456-426614174032/download"
    }
  ]
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Get Attachment by ID

Retrieves a specific attachment from a GRN by its ID.

### Request

```
GET /api/grns/{id}/attachments/{attachmentId}
```

### Path Parameters

| Parameter    | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| id           | string | Yes      | GRN ID (UUID)       |
| attachmentId | string | Yes      | Attachment ID (UUID)|

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174031",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "fileName": "delivery-note.pdf",
  "fileSize": 1024000,
  "fileType": "application/pdf",
  "description": "Vendor delivery note",
  "uploadedBy": "john.doe@example.com",
  "uploadedAt": "2024-03-15T10:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T10:30:00Z",
  "downloadUrl": "/api/grns/123e4567-e89b-12d3-a456-426614174000/attachments/123e4567-e89b-12d3-a456-426614174031/download"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or attachment not found                      |

## Upload Attachment

Uploads a new attachment to a GRN.

### Request

```
POST /api/grns/{id}/attachments
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Request Body

This endpoint accepts `multipart/form-data` with the following fields:

| Field       | Type   | Required | Description                                      |
|-------------|--------|----------|--------------------------------------------------|
| file        | file   | Yes      | The file to upload                               |
| description | string | No       | Description of the attachment                    |

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174033",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "fileName": "invoice.pdf",
  "fileSize": 768000,
  "fileType": "application/pdf",
  "description": "Vendor invoice",
  "uploadedBy": "john.doe@example.com",
  "uploadedAt": "2024-03-15T15:30:00Z",
  "downloadUrl": "/api/grns/123e4567-e89b-12d3-a456-426614174000/attachments/123e4567-e89b-12d3-a456-426614174033/download"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |
| 413         | PAYLOAD_TOO_LARGE    | File size exceeds the maximum allowed size       |
| 415         | UNSUPPORTED_MEDIA_TYPE | File type not supported                        |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Update Attachment

Updates the description of an existing attachment.

### Request

```
PUT /api/grns/{id}/attachments/{attachmentId}
```

### Path Parameters

| Parameter    | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| id           | string | Yes      | GRN ID (UUID)       |
| attachmentId | string | Yes      | Attachment ID (UUID)|

### Request Body

```json
{
  "description": "Updated vendor invoice description"
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174033",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "fileName": "invoice.pdf",
  "fileSize": 768000,
  "fileType": "application/pdf",
  "description": "Updated vendor invoice description",
  "uploadedBy": "john.doe@example.com",
  "uploadedAt": "2024-03-15T15:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T16:30:00Z",
  "downloadUrl": "/api/grns/123e4567-e89b-12d3-a456-426614174000/attachments/123e4567-e89b-12d3-a456-426614174033/download"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or attachment not found                      |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Delete Attachment

Deletes an attachment from a GRN.

### Request

```
DELETE /api/grns/{id}/attachments/{attachmentId}
```

### Path Parameters

| Parameter    | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| id           | string | Yes      | GRN ID (UUID)       |
| attachmentId | string | Yes      | Attachment ID (UUID)|

### Response

```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or attachment not found                      |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Download Attachment

Downloads an attachment file.

### Request

```
GET /api/grns/{id}/attachments/{attachmentId}/download
```

### Path Parameters

| Parameter    | Type   | Required | Description         |
|--------------|--------|----------|---------------------|
| id           | string | Yes      | GRN ID (UUID)       |
| attachmentId | string | Yes      | Attachment ID (UUID)|

### Response

The response is the file content with appropriate Content-Type and Content-Disposition headers.

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or attachment not found                      |
| 500         | INTERNAL_SERVER_ERROR | Error retrieving file                           |

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
   - [Comment Operations](./GRN-API-Endpoints-Comments.md) 