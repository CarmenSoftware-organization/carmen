# Store Requisition API - Journal Entry Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Table of Contents
1. [Introduction](#introduction)
2. [Journal Entry Resource](#journal-entry-resource)
3. [Get Journal Entries](#get-journal-entries)
4. [Get Journal Entry](#get-journal-entry)
5. [Generate Journal Entry](#generate-journal-entry)
6. [Post Journal Entry](#post-journal-entry)
7. [Reverse Journal Entry](#reverse-journal-entry)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the Store Requisition API endpoints related to journal entries. These endpoints allow clients to retrieve, generate, post, and reverse journal entries associated with store requisitions.

For general API conventions, authentication, and common patterns, see [SR-API-Overview.md](./SR-API-Overview.md).

## Journal Entry Resource

### Resource Structure

A journal entry resource has the following structure:

```json
{
  "id": "JE-24001",
  "requisitionId": "SR-24001",
  "stockMovementId": "SM-24001",
  "type": "Stock Issue",
  "status": "Posted",
  "date": "2024-03-15T00:00:00Z",
  "postDate": "2024-03-15T10:45:00Z",
  "description": "Stock issue for Store #1 weekly replenishment",
  "reference": "SR-24001",
  "lines": [
    {
      "id": 1,
      "journalEntryId": "JE-24001",
      "accountCode": "5001",
      "accountName": "Store Inventory",
      "description": "Rice - 25 KG",
      "debit": 62.50,
      "credit": 0.00,
      "costCenter": "ST001",
      "department": "Store Operations",
      "productId": "PROD001",
      "quantity": 25.0,
      "unit": "KG"
    },
    {
      "id": 2,
      "journalEntryId": "JE-24001",
      "accountCode": "5002",
      "accountName": "Store Inventory",
      "description": "Flour - 8 KG",
      "debit": 20.00,
      "credit": 0.00,
      "costCenter": "ST001",
      "department": "Store Operations",
      "productId": "PROD002",
      "quantity": 8.0,
      "unit": "KG"
    },
    {
      "id": 3,
      "journalEntryId": "JE-24001",
      "accountCode": "1001",
      "accountName": "Warehouse Inventory",
      "description": "Rice - 25 KG",
      "debit": 0.00,
      "credit": 62.50,
      "costCenter": "WH001",
      "department": "Warehouse",
      "productId": "PROD001",
      "quantity": 25.0,
      "unit": "KG"
    },
    {
      "id": 4,
      "journalEntryId": "JE-24001",
      "accountCode": "1001",
      "accountName": "Warehouse Inventory",
      "description": "Flour - 8 KG",
      "debit": 0.00,
      "credit": 20.00,
      "costCenter": "WH001",
      "department": "Warehouse",
      "productId": "PROD002",
      "quantity": 8.0,
      "unit": "KG"
    }
  ],
  "totalDebit": 82.50,
  "totalCredit": 82.50,
  "createdBy": "user123",
  "createdAt": "2024-03-15T10:30:00Z",
  "postedBy": "user123",
  "postedAt": "2024-03-15T10:45:00Z",
  "reversedBy": null,
  "reversedAt": null,
  "notes": "Regular weekly stock issue"
}
```

### Resource Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the journal entry |
| requisitionId | string | Reference to the parent requisition |
| stockMovementId | string | Reference to the associated stock movement |
| type | string | Type of journal entry (Stock Issue, Stock Return, Stock Transfer) |
| status | string | Status of the journal entry (Draft, Posted, Reversed) |
| date | string (ISO 8601) | Date of the journal entry |
| postDate | string (ISO 8601) | Date when the journal entry was posted |
| description | string | Description of the journal entry |
| reference | string | Reference number (usually the requisition ID) |
| lines | array | Array of journal entry lines |
| lines[].id | number | Unique identifier for the line |
| lines[].journalEntryId | string | Reference to the parent journal entry |
| lines[].accountCode | string | Account code |
| lines[].accountName | string | Account name |
| lines[].description | string | Description of the line |
| lines[].debit | number | Debit amount |
| lines[].credit | number | Credit amount |
| lines[].costCenter | string | Cost center code |
| lines[].department | string | Department name |
| lines[].productId | string | Product identifier |
| lines[].quantity | number | Quantity |
| lines[].unit | string | Unit of measurement |
| totalDebit | number | Total debit amount |
| totalCredit | number | Total credit amount |
| createdBy | string | User who created the journal entry |
| createdAt | string (ISO 8601) | Creation timestamp |
| postedBy | string | User who posted the journal entry |
| postedAt | string (ISO 8601) | Posting timestamp |
| reversedBy | string | User who reversed the journal entry |
| reversedAt | string (ISO 8601) | Reversal timestamp |
| notes | string | Additional notes for the journal entry |

## Get Journal Entries

Retrieves a list of journal entries associated with a store requisition.

### HTTP Request

```
GET /api/v1/store-requisitions/{id}/journal-entries
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (Draft, Posted, Reversed) |
| type | string | Filter by type (Stock Issue, Stock Return, Stock Transfer) |
| date_from | string | Filter by date from (ISO 8601) |
| date_to | string | Filter by date to (ISO 8601) |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    {
      "id": "JE-24001",
      "requisitionId": "SR-24001",
      "stockMovementId": "SM-24001",
      "type": "Stock Issue",
      "status": "Posted",
      "date": "2024-03-15T00:00:00Z",
      "postDate": "2024-03-15T10:45:00Z",
      "description": "Stock issue for Store #1 weekly replenishment",
      "reference": "SR-24001",
      "totalDebit": 82.50,
      "totalCredit": 82.50,
      "createdBy": "user123",
      "createdAt": "2024-03-15T10:30:00Z",
      "postedBy": "user123",
      "postedAt": "2024-03-15T10:45:00Z",
      "reversedBy": null,
      "reversedAt": null
    },
    {
      "id": "JE-24002",
      "requisitionId": "SR-24001",
      "stockMovementId": "SM-24002",
      "type": "Stock Return",
      "status": "Posted",
      "date": "2024-03-16T00:00:00Z",
      "postDate": "2024-03-16T09:45:00Z",
      "description": "Stock return from Store #1",
      "reference": "SR-24001",
      "totalDebit": 12.50,
      "totalCredit": 12.50,
      "createdBy": "user456",
      "createdAt": "2024-03-16T09:30:00Z",
      "postedBy": "user456",
      "postedAt": "2024-03-16T09:45:00Z",
      "reversedBy": null,
      "reversedAt": null
    }
  ]
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Requisition not found |

## Get Journal Entry

Retrieves a specific journal entry by ID.

### HTTP Request

```
GET /api/v1/journal-entries/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Journal Entry ID |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "JE-24001",
    "requisitionId": "SR-24001",
    "stockMovementId": "SM-24001",
    "type": "Stock Issue",
    "status": "Posted",
    "date": "2024-03-15T00:00:00Z",
    "postDate": "2024-03-15T10:45:00Z",
    "description": "Stock issue for Store #1 weekly replenishment",
    "reference": "SR-24001",
    "lines": [
      {
        "id": 1,
        "journalEntryId": "JE-24001",
        "accountCode": "5001",
        "accountName": "Store Inventory",
        "description": "Rice - 25 KG",
        "debit": 62.50,
        "credit": 0.00,
        "costCenter": "ST001",
        "department": "Store Operations",
        "productId": "PROD001",
        "quantity": 25.0,
        "unit": "KG"
      },
      {
        "id": 2,
        "journalEntryId": "JE-24001",
        "accountCode": "5002",
        "accountName": "Store Inventory",
        "description": "Flour - 8 KG",
        "debit": 20.00,
        "credit": 0.00,
        "costCenter": "ST001",
        "department": "Store Operations",
        "productId": "PROD002",
        "quantity": 8.0,
        "unit": "KG"
      },
      {
        "id": 3,
        "journalEntryId": "JE-24001",
        "accountCode": "1001",
        "accountName": "Warehouse Inventory",
        "description": "Rice - 25 KG",
        "debit": 0.00,
        "credit": 62.50,
        "costCenter": "WH001",
        "department": "Warehouse",
        "productId": "PROD001",
        "quantity": 25.0,
        "unit": "KG"
      },
      {
        "id": 4,
        "journalEntryId": "JE-24001",
        "accountCode": "1001",
        "accountName": "Warehouse Inventory",
        "description": "Flour - 8 KG",
        "debit": 0.00,
        "credit": 20.00,
        "costCenter": "WH001",
        "department": "Warehouse",
        "productId": "PROD002",
        "quantity": 8.0,
        "unit": "KG"
      }
    ],
    "totalDebit": 82.50,
    "totalCredit": 82.50,
    "createdBy": "user123",
    "createdAt": "2024-03-15T10:30:00Z",
    "postedBy": "user123",
    "postedAt": "2024-03-15T10:45:00Z",
    "reversedBy": null,
    "reversedAt": null,
    "notes": "Regular weekly stock issue"
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Journal entry not found |

## Generate Journal Entry

Generates a journal entry for a stock movement.

### HTTP Request

```
POST /api/v1/stock-movements/{id}/generate-journal
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Stock Movement ID |

### Request Body

```json
{
  "date": "2024-03-15T00:00:00Z",
  "description": "Stock issue for Store #1 weekly replenishment",
  "notes": "Regular weekly stock issue"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string (ISO 8601) | Yes | Date of the journal entry |
| description | string | Yes | Description of the journal entry |
| notes | string | No | Additional notes for the journal entry |

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/journal-entries/JE-24001

{
  "data": {
    "id": "JE-24001",
    "requisitionId": "SR-24001",
    "stockMovementId": "SM-24001",
    "type": "Stock Issue",
    "status": "Draft",
    "date": "2024-03-15T00:00:00Z",
    "postDate": null,
    "description": "Stock issue for Store #1 weekly replenishment",
    "reference": "SR-24001",
    "lines": [
      {
        "id": 1,
        "journalEntryId": "JE-24001",
        "accountCode": "5001",
        "accountName": "Store Inventory",
        "description": "Rice - 25 KG",
        "debit": 62.50,
        "credit": 0.00,
        "costCenter": "ST001",
        "department": "Store Operations",
        "productId": "PROD001",
        "quantity": 25.0,
        "unit": "KG"
      },
      {
        "id": 2,
        "journalEntryId": "JE-24001",
        "accountCode": "5002",
        "accountName": "Store Inventory",
        "description": "Flour - 8 KG",
        "debit": 20.00,
        "credit": 0.00,
        "costCenter": "ST001",
        "department": "Store Operations",
        "productId": "PROD002",
        "quantity": 8.0,
        "unit": "KG"
      },
      {
        "id": 3,
        "journalEntryId": "JE-24001",
        "accountCode": "1001",
        "accountName": "Warehouse Inventory",
        "description": "Rice - 25 KG",
        "debit": 0.00,
        "credit": 62.50,
        "costCenter": "WH001",
        "department": "Warehouse",
        "productId": "PROD001",
        "quantity": 25.0,
        "unit": "KG"
      },
      {
        "id": 4,
        "journalEntryId": "JE-24001",
        "accountCode": "1001",
        "accountName": "Warehouse Inventory",
        "description": "Flour - 8 KG",
        "debit": 0.00,
        "credit": 20.00,
        "costCenter": "WH001",
        "department": "Warehouse",
        "productId": "PROD002",
        "quantity": 8.0,
        "unit": "KG"
      }
    ],
    "totalDebit": 82.50,
    "totalCredit": 82.50,
    "createdBy": "user123",
    "createdAt": "2024-03-15T10:30:00Z",
    "postedBy": null,
    "postedAt": null,
    "reversedBy": null,
    "reversedAt": null,
    "notes": "Regular weekly stock issue"
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Stock movement not found |
| 409 | CONFLICT | Journal entry already exists for this stock movement |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Post Journal Entry

Posts a journal entry to the general ledger.

### HTTP Request

```
POST /api/v1/journal-entries/{id}/post
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Journal Entry ID |

### Request Body

```json
{
  "postDate": "2024-03-15T10:45:00Z",
  "notes": "Posted to GL"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| postDate | string (ISO 8601) | Yes | Date to post the journal entry |
| notes | string | No | Additional notes for posting |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "JE-24001",
    "status": "Posted",
    "postDate": "2024-03-15T10:45:00Z",
    "postedBy": "user123",
    "postedAt": "2024-03-15T10:45:00Z",
    "notes": "Posted to GL"
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Journal entry not found |
| 409 | CONFLICT | Journal entry is not in Draft status |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Reverse Journal Entry

Reverses a posted journal entry.

### HTTP Request

```
POST /api/v1/journal-entries/{id}/reverse
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Journal Entry ID |

### Request Body

```json
{
  "reason": "Correction needed",
  "notes": "Reversing due to incorrect account mapping",
  "reverseDate": "2024-03-16T09:00:00Z"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for reversal |
| notes | string | No | Additional notes for reversal |
| reverseDate | string (ISO 8601) | Yes | Date to reverse the journal entry |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "JE-24001",
    "status": "Reversed",
    "reversedBy": "user123",
    "reversedAt": "2024-03-16T09:00:00Z",
    "reason": "Correction needed",
    "notes": "Reversing due to incorrect account mapping",
    "reversalJournalId": "JE-24003"
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Journal entry not found |
| 409 | CONFLICT | Journal entry is not in Posted status |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Related Documentation

- [Store Requisition API Overview](./SR-API-Overview.md)
- [Store Requisition API Requisition Endpoints](./SR-API-Requisition-Endpoints.md)
- [Store Requisition API Approval Endpoints](./SR-API-Approval-Endpoints.md)
- [Store Requisition API Stock Movement Endpoints](./SR-API-StockMovement-Endpoints.md)
- [Store Requisition Technical Specification](./SR-Technical-Specification.md) 