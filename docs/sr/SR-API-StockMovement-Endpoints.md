# Store Requisition API - Stock Movement Endpoints

> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Table of Contents
1. [Introduction](#introduction)
2. [Stock Movement Resource](#stock-movement-resource)
3. [Get Stock Movement](#get-stock-movement)
4. [Issue Stock](#issue-stock)
5. [Receive Stock](#receive-stock)
6. [Adjust Stock Movement](#adjust-stock-movement)
7. [Cancel Stock Movement](#cancel-stock-movement)
8. [Get Stock Movement History](#get-stock-movement-history)
9. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the Store Requisition API endpoints related to stock movement operations. These endpoints allow clients to issue, receive, adjust, and cancel stock movements associated with store requisitions, as well as retrieve stock movement details and history.

For general API conventions, authentication, and common patterns, see [SR-API-Overview.md](./SR-API-Overview.md).

## Stock Movement Resource

### Resource Structure

A stock movement resource has the following structure:

```json
{
  "id": "SM-24001",
  "requisitionId": "SR-24001",
  "type": "Issue",
  "status": "Completed",
  "source": {
    "locationId": "WH001",
    "locationName": "Main Warehouse",
    "locationType": "Warehouse"
  },
  "destination": {
    "locationId": "ST001",
    "locationName": "Store #1",
    "locationType": "Store"
  },
  "date": "2024-03-15T00:00:00Z",
  "completedDate": "2024-03-15T10:30:00Z",
  "items": [
    {
      "id": 1,
      "stockMovementId": "SM-24001",
      "requisitionItemId": 1,
      "productId": "PROD001",
      "description": "Rice",
      "unit": "KG",
      "qtyRequired": 25.0,
      "qtyApproved": 25.0,
      "qtyIssued": 25.0,
      "costPerUnit": 2.50,
      "total": 62.50,
      "lots": [
        {
          "lotId": "LOT001",
          "expiryDate": "2024-06-15T00:00:00Z",
          "quantity": 15.0,
          "costPerUnit": 2.50
        },
        {
          "lotId": "LOT002",
          "expiryDate": "2024-07-20T00:00:00Z",
          "quantity": 10.0,
          "costPerUnit": 2.50
        }
      ],
      "status": "Completed"
    },
    {
      "id": 2,
      "stockMovementId": "SM-24001",
      "requisitionItemId": 2,
      "productId": "PROD002",
      "description": "Flour",
      "unit": "KG",
      "qtyRequired": 10.0,
      "qtyApproved": 8.0,
      "qtyIssued": 8.0,
      "costPerUnit": 2.50,
      "total": 20.00,
      "lots": [
        {
          "lotId": "LOT003",
          "expiryDate": "2024-05-10T00:00:00Z",
          "quantity": 8.0,
          "costPerUnit": 2.50
        }
      ],
      "status": "Completed"
    }
  ],
  "totalAmount": 82.50,
  "createdBy": "user123",
  "createdAt": "2024-03-15T09:00:00Z",
  "updatedBy": "user123",
  "updatedAt": "2024-03-15T10:30:00Z",
  "notes": "Regular weekly stock issue"
}
```

### Resource Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the stock movement |
| requisitionId | string | Reference to the parent requisition |
| type | string | Type of stock movement (Issue, Transfer, Return) |
| status | string | Status of the stock movement (Pending, In Progress, Completed, Cancelled) |
| source | object | Source location details |
| source.locationId | string | Source location ID |
| source.locationName | string | Source location name |
| source.locationType | string | Source location type (Warehouse, Store) |
| destination | object | Destination location details |
| destination.locationId | string | Destination location ID |
| destination.locationName | string | Destination location name |
| destination.locationType | string | Destination location type (Warehouse, Store) |
| date | string (ISO 8601) | Date of the stock movement |
| completedDate | string (ISO 8601) | Date when the stock movement was completed |
| items | array | Array of stock movement items |
| items[].id | number | Unique identifier for the item |
| items[].stockMovementId | string | Reference to the parent stock movement |
| items[].requisitionItemId | number | Reference to the requisition item |
| items[].productId | string | Product identifier |
| items[].description | string | Description of the item |
| items[].unit | string | Unit of measurement |
| items[].qtyRequired | number | Quantity requested in the requisition |
| items[].qtyApproved | number | Quantity approved in the requisition |
| items[].qtyIssued | number | Quantity issued in the stock movement |
| items[].costPerUnit | number | Cost per unit |
| items[].total | number | Total cost for the item |
| items[].lots | array | Array of lot information |
| items[].lots[].lotId | string | Lot identifier |
| items[].lots[].expiryDate | string (ISO 8601) | Expiry date of the lot |
| items[].lots[].quantity | number | Quantity from this lot |
| items[].lots[].costPerUnit | number | Cost per unit for this lot |
| items[].status | string | Status of the item (Pending, In Progress, Completed, Cancelled) |
| totalAmount | number | Total amount of the stock movement |
| createdBy | string | User who created the stock movement |
| createdAt | string (ISO 8601) | Creation timestamp |
| updatedBy | string | User who last updated the stock movement |
| updatedAt | string (ISO 8601) | Last update timestamp |
| notes | string | Additional notes for the stock movement |

## Get Stock Movement

Retrieves a specific stock movement by ID.

### HTTP Request

```
GET /api/v1/stock-movements/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Stock Movement ID |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| fields | string | Comma-separated list of fields to include |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SM-24001",
    "requisitionId": "SR-24001",
    "type": "Issue",
    "status": "Completed",
    "source": {
      "locationId": "WH001",
      "locationName": "Main Warehouse",
      "locationType": "Warehouse"
    },
    "destination": {
      "locationId": "ST001",
      "locationName": "Store #1",
      "locationType": "Store"
    },
    "date": "2024-03-15T00:00:00Z",
    "completedDate": "2024-03-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "stockMovementId": "SM-24001",
        "requisitionItemId": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "qtyApproved": 25.0,
        "qtyIssued": 25.0,
        "costPerUnit": 2.50,
        "total": 62.50,
        "lots": [
          {
            "lotId": "LOT001",
            "expiryDate": "2024-06-15T00:00:00Z",
            "quantity": 15.0,
            "costPerUnit": 2.50
          },
          {
            "lotId": "LOT002",
            "expiryDate": "2024-07-20T00:00:00Z",
            "quantity": 10.0,
            "costPerUnit": 2.50
          }
        ],
        "status": "Completed"
      },
      {
        "id": 2,
        "stockMovementId": "SM-24001",
        "requisitionItemId": 2,
        "productId": "PROD002",
        "description": "Flour",
        "unit": "KG",
        "qtyRequired": 10.0,
        "qtyApproved": 8.0,
        "qtyIssued": 8.0,
        "costPerUnit": 2.50,
        "total": 20.00,
        "lots": [
          {
            "lotId": "LOT003",
            "expiryDate": "2024-05-10T00:00:00Z",
            "quantity": 8.0,
            "costPerUnit": 2.50
          }
        ],
        "status": "Completed"
      }
    ],
    "totalAmount": 82.50,
    "createdBy": "user123",
    "createdAt": "2024-03-15T09:00:00Z",
    "updatedBy": "user123",
    "updatedAt": "2024-03-15T10:30:00Z",
    "notes": "Regular weekly stock issue"
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Stock movement not found |

## Issue Stock

Creates a stock movement to issue stock for an approved requisition.

### HTTP Request

```
POST /api/v1/store-requisitions/{id}/issue
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "date": "2024-03-15T00:00:00Z",
  "notes": "Regular weekly stock issue",
  "items": [
    {
      "requisitionItemId": 1,
      "qtyIssued": 25.0,
      "lots": [
        {
          "lotId": "LOT001",
          "quantity": 15.0
        },
        {
          "lotId": "LOT002",
          "quantity": 10.0
        }
      ]
    },
    {
      "requisitionItemId": 2,
      "qtyIssued": 8.0,
      "lots": [
        {
          "lotId": "LOT003",
          "quantity": 8.0
        }
      ]
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string (ISO 8601) | Yes | Date of the stock movement |
| notes | string | No | Additional notes for the stock movement |
| items | array | Yes | Array of stock movement items |
| items[].requisitionItemId | number | Yes | Reference to the requisition item |
| items[].qtyIssued | number | Yes | Quantity to issue |
| items[].lots | array | Yes | Array of lot information |
| items[].lots[].lotId | string | Yes | Lot identifier |
| items[].lots[].quantity | number | Yes | Quantity from this lot |

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/stock-movements/SM-24001

{
  "data": {
    "id": "SM-24001",
    "requisitionId": "SR-24001",
    "type": "Issue",
    "status": "Completed",
    "source": {
      "locationId": "WH001",
      "locationName": "Main Warehouse",
      "locationType": "Warehouse"
    },
    "destination": {
      "locationId": "ST001",
      "locationName": "Store #1",
      "locationType": "Store"
    },
    "date": "2024-03-15T00:00:00Z",
    "completedDate": "2024-03-15T10:30:00Z",
    "items": [
      {
        "id": 1,
        "stockMovementId": "SM-24001",
        "requisitionItemId": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "qtyApproved": 25.0,
        "qtyIssued": 25.0,
        "costPerUnit": 2.50,
        "total": 62.50,
        "lots": [
          {
            "lotId": "LOT001",
            "expiryDate": "2024-06-15T00:00:00Z",
            "quantity": 15.0,
            "costPerUnit": 2.50
          },
          {
            "lotId": "LOT002",
            "expiryDate": "2024-07-20T00:00:00Z",
            "quantity": 10.0,
            "costPerUnit": 2.50
          }
        ],
        "status": "Completed"
      },
      {
        "id": 2,
        "stockMovementId": "SM-24001",
        "requisitionItemId": 2,
        "productId": "PROD002",
        "description": "Flour",
        "unit": "KG",
        "qtyRequired": 10.0,
        "qtyApproved": 8.0,
        "qtyIssued": 8.0,
        "costPerUnit": 2.50,
        "total": 20.00,
        "lots": [
          {
            "lotId": "LOT003",
            "expiryDate": "2024-05-10T00:00:00Z",
            "quantity": 8.0,
            "costPerUnit": 2.50
          }
        ],
        "status": "Completed"
      }
    ],
    "totalAmount": 82.50,
    "createdBy": "user123",
    "createdAt": "2024-03-15T10:30:00Z",
    "updatedBy": null,
    "updatedAt": null,
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
| 404 | NOT_FOUND | Requisition not found |
| 409 | CONFLICT | Requisition is not in Approved status or stock movement already exists |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation (e.g., insufficient stock) |

## Receive Stock

Confirms receipt of stock for a stock movement.

### HTTP Request

```
POST /api/v1/stock-movements/{id}/receive
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Stock Movement ID |

### Request Body

```json
{
  "date": "2024-03-15T11:00:00Z",
  "notes": "All items received in good condition",
  "items": [
    {
      "id": 1,
      "qtyReceived": 25.0
    },
    {
      "id": 2,
      "qtyReceived": 8.0
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string (ISO 8601) | Yes | Date of receipt |
| notes | string | No | Additional notes for the receipt |
| items | array | Yes | Array of received items |
| items[].id | number | Yes | Stock movement item ID |
| items[].qtyReceived | number | Yes | Quantity received |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SM-24001",
    "status": "Completed",
    "completedDate": "2024-03-15T11:00:00Z",
    "items": [
      {
        "id": 1,
        "status": "Completed",
        "qtyReceived": 25.0
      },
      {
        "id": 2,
        "status": "Completed",
        "qtyReceived": 8.0
      }
    ],
    "updatedBy": "user456",
    "updatedAt": "2024-03-15T11:00:00Z",
    "notes": "All items received in good condition"
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
| 409 | CONFLICT | Stock movement is not in Pending or In Progress status |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Adjust Stock Movement

Adjusts an existing stock movement that is in Pending or In Progress status.

### HTTP Request

```
PATCH /api/v1/stock-movements/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Stock Movement ID |

### Request Body

```json
{
  "notes": "Adjusted due to stock availability",
  "items": [
    {
      "id": 1,
      "qtyIssued": 20.0,
      "lots": [
        {
          "lotId": "LOT001",
          "quantity": 10.0
        },
        {
          "lotId": "LOT002",
          "quantity": 10.0
        }
      ]
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string (ISO 8601) | No | Date of the stock movement |
| notes | string | No | Additional notes for the stock movement |
| items | array | No | Array of stock movement items to adjust |
| items[].id | number | Yes | Stock movement item ID |
| items[].qtyIssued | number | Yes | New quantity to issue |
| items[].lots | array | Yes | Array of lot information |
| items[].lots[].lotId | string | Yes | Lot identifier |
| items[].lots[].quantity | number | Yes | Quantity from this lot |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SM-24001",
    "requisitionId": "SR-24001",
    "type": "Issue",
    "status": "In Progress",
    "source": {
      "locationId": "WH001",
      "locationName": "Main Warehouse",
      "locationType": "Warehouse"
    },
    "destination": {
      "locationId": "ST001",
      "locationName": "Store #1",
      "locationType": "Store"
    },
    "date": "2024-03-15T00:00:00Z",
    "completedDate": null,
    "items": [
      {
        "id": 1,
        "stockMovementId": "SM-24001",
        "requisitionItemId": 1,
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "qtyApproved": 25.0,
        "qtyIssued": 20.0,
        "costPerUnit": 2.50,
        "total": 50.00,
        "lots": [
          {
            "lotId": "LOT001",
            "expiryDate": "2024-06-15T00:00:00Z",
            "quantity": 10.0,
            "costPerUnit": 2.50
          },
          {
            "lotId": "LOT002",
            "expiryDate": "2024-07-20T00:00:00Z",
            "quantity": 10.0,
            "costPerUnit": 2.50
          }
        ],
        "status": "In Progress"
      },
      {
        "id": 2,
        "stockMovementId": "SM-24001",
        "requisitionItemId": 2,
        "productId": "PROD002",
        "description": "Flour",
        "unit": "KG",
        "qtyRequired": 10.0,
        "qtyApproved": 8.0,
        "qtyIssued": 8.0,
        "costPerUnit": 2.50,
        "total": 20.00,
        "lots": [
          {
            "lotId": "LOT003",
            "expiryDate": "2024-05-10T00:00:00Z",
            "quantity": 8.0,
            "costPerUnit": 2.50
          }
        ],
        "status": "In Progress"
      }
    ],
    "totalAmount": 70.00,
    "createdBy": "user123",
    "createdAt": "2024-03-15T09:00:00Z",
    "updatedBy": "user123",
    "updatedAt": "2024-03-15T10:45:00Z",
    "notes": "Adjusted due to stock availability"
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
| 409 | CONFLICT | Stock movement is not in Pending or In Progress status |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation (e.g., insufficient stock) |

## Cancel Stock Movement

Cancels a stock movement that is in Pending or In Progress status.

### HTTP Request

```
POST /api/v1/stock-movements/{id}/cancel
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Stock Movement ID |

### Request Body

```json
{
  "reason": "Stock no longer needed",
  "comments": "Store found alternative supplies"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for cancellation |
| comments | string | No | Additional comments |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SM-24001",
    "status": "Cancelled",
    "reason": "Stock no longer needed",
    "comments": "Store found alternative supplies",
    "updatedBy": "user123",
    "updatedAt": "2024-03-15T11:15:00Z"
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
| 409 | CONFLICT | Stock movement is not in Pending or In Progress status |

## Get Stock Movement History

Retrieves the history of stock movements for a store requisition.

### HTTP Request

```
GET /api/v1/store-requisitions/{id}/stock-movements
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    {
      "id": "SM-24001",
      "requisitionId": "SR-24001",
      "type": "Issue",
      "status": "Completed",
      "source": {
        "locationId": "WH001",
        "locationName": "Main Warehouse"
      },
      "destination": {
        "locationId": "ST001",
        "locationName": "Store #1"
      },
      "date": "2024-03-15T00:00:00Z",
      "completedDate": "2024-03-15T10:30:00Z",
      "totalAmount": 82.50,
      "createdBy": "user123",
      "createdAt": "2024-03-15T09:00:00Z",
      "updatedBy": "user123",
      "updatedAt": "2024-03-15T10:30:00Z"
    },
    {
      "id": "SM-24002",
      "requisitionId": "SR-24001",
      "type": "Return",
      "status": "Completed",
      "source": {
        "locationId": "ST001",
        "locationName": "Store #1"
      },
      "destination": {
        "locationId": "WH001",
        "locationName": "Main Warehouse"
      },
      "date": "2024-03-16T00:00:00Z",
      "completedDate": "2024-03-16T09:45:00Z",
      "totalAmount": 12.50,
      "createdBy": "user456",
      "createdAt": "2024-03-16T09:00:00Z",
      "updatedBy": "user456",
      "updatedAt": "2024-03-16T09:45:00Z"
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

## Related Documentation

- [Store Requisition API Overview](./SR-API-Overview.md)
- [Store Requisition API Requisition Endpoints](./SR-API-Requisition-Endpoints.md)
- [Store Requisition API Approval Endpoints](./SR-API-Approval-Endpoints.md)
- [Store Requisition API Journal Entry Endpoints](./SR-API-JournalEntry-Endpoints.md)
- [Store Requisition Technical Specification](./SR-Technical-Specification.md) 