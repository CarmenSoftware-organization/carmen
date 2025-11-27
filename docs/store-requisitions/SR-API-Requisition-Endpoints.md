# Store Requisition API - Requisition Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Table of Contents
1. [Introduction](#introduction)
2. [Requisition Resource](#requisition-resource)
3. [List Requisitions](#list-requisitions)
4. [Create Requisition](#create-requisition)
5. [Get Requisition](#get-requisition)
6. [Update Requisition](#update-requisition)
7. [Delete Requisition](#delete-requisition)
8. [Submit Requisition](#submit-requisition)
9. [Void Requisition](#void-requisition)
10. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the Store Requisition API endpoints related to requisition management. These endpoints allow clients to create, retrieve, update, and delete store requisitions, as well as perform actions such as submitting and voiding requisitions.

For general API conventions, authentication, and common patterns, see [SR-API-Overview.md](./SR-API-Overview.md).

## Requisition Resource

### Resource Structure

A store requisition resource has the following structure:

```json
{
  "id": "SR-24001",
  "date": "2024-03-14T00:00:00Z",
  "refNo": "SR-24001",
  "description": "Weekly stock replenishment",
  "status": "Draft",
  "totalAmount": 62.50,
  "movement": {
    "source": "WH001",
    "sourceName": "Main Warehouse",
    "destination": "ST001",
    "destinationName": "Store #1",
    "type": "Issue"
  },
  "items": [
    {
      "id": 1,
      "requisitionId": "SR-24001",
      "productId": "PROD001",
      "description": "Rice",
      "unit": "KG",
      "qtyRequired": 25.0,
      "qtyApproved": null,
      "costPerUnit": 2.50,
      "total": 62.50,
      "requestDate": "2024-03-14T00:00:00Z",
      "inventory": {
        "onHand": 100.0,
        "onOrder": 50.0,
        "lastPrice": 2.45,
        "lastVendor": "Vendor A"
      },
      "itemInfo": {
        "location": "Main Warehouse",
        "locationCode": "WH001",
        "itemName": "Rice",
        "category": "Dry Goods",
        "subCategory": "Grains",
        "itemGroup": "Food",
        "barCode": "1234567890",
        "locationType": "inventory"
      },
      "qtyIssued": null,
      "approvalStatus": null,
      "createdAt": "2024-03-14T10:30:00Z",
      "updatedAt": null
    }
  ],
  "createdBy": "user123",
  "createdAt": "2024-03-14T10:30:00Z",
  "updatedBy": null,
  "updatedAt": null
}
```

### Resource Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the requisition |
| date | string (ISO 8601) | Date of the requisition |
| refNo | string | Reference number for the requisition |
| description | string | Description of the requisition |
| status | string | Status of the requisition (Draft, Pending Approval, Approved, Rejected, Void, Complete) |
| totalAmount | number | Total amount of the requisition |
| movement | object | Movement details |
| movement.source | string | Source location code |
| movement.sourceName | string | Source location name |
| movement.destination | string | Destination location code |
| movement.destinationName | string | Destination location name |
| movement.type | string | Type of movement (Issue, Transfer) |
| items | array | Array of requisition items |
| items[].id | number | Unique identifier for the item |
| items[].requisitionId | string | Reference to the parent requisition |
| items[].productId | string | Product identifier |
| items[].description | string | Description of the item |
| items[].unit | string | Unit of measurement |
| items[].qtyRequired | number | Quantity requested |
| items[].qtyApproved | number | Quantity approved (null if not yet approved) |
| items[].costPerUnit | number | Cost per unit |
| items[].total | number | Total cost for the item |
| items[].requestDate | string (ISO 8601) | Date of the request |
| items[].inventory | object | Inventory information |
| items[].inventory.onHand | number | Current on-hand quantity |
| items[].inventory.onOrder | number | Quantity on order |
| items[].inventory.lastPrice | number | Last purchase price |
| items[].inventory.lastVendor | string | Last vendor used |
| items[].itemInfo | object | Item information |
| items[].itemInfo.location | string | Location name |
| items[].itemInfo.locationCode | string | Location code |
| items[].itemInfo.itemName | string | Item name |
| items[].itemInfo.category | string | Item category |
| items[].itemInfo.subCategory | string | Item subcategory |
| items[].itemInfo.itemGroup | string | Item group |
| items[].itemInfo.barCode | string | Item barcode |
| items[].itemInfo.locationType | string | Location type (inventory, direct) |
| items[].qtyIssued | number | Quantity issued (null if not yet issued) |
| items[].approvalStatus | string | Approval status (Accept, Reject, Review, null) |
| items[].createdAt | string (ISO 8601) | Creation timestamp |
| items[].updatedAt | string (ISO 8601) | Last update timestamp |
| createdBy | string | User who created the requisition |
| createdAt | string (ISO 8601) | Creation timestamp |
| updatedBy | string | User who last updated the requisition |
| updatedAt | string (ISO 8601) | Last update timestamp |

## List Requisitions

Retrieves a list of store requisitions based on the provided filters.

### HTTP Request

```
GET /api/v1/store-requisitions
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Number of items per page (default: 20, max: 100) |
| sort | string | Field to sort by (default: date) |
| order | string | Sort order (asc, desc, default: desc) |
| status | string | Filter by status (comma-separated list) |
| date_from | string | Filter by date from (ISO 8601) |
| date_to | string | Filter by date to (ISO 8601) |
| source | string | Filter by source location |
| destination | string | Filter by destination location |
| search | string | Search term for description or reference number |
| fields | string | Comma-separated list of fields to include |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": [
    {
      "id": "SR-24001",
      "date": "2024-03-14T00:00:00Z",
      "refNo": "SR-24001",
      "description": "Weekly stock replenishment",
      "status": "Draft",
      "totalAmount": 62.50,
      "movement": {
        "source": "WH001",
        "sourceName": "Main Warehouse",
        "destination": "ST001",
        "destinationName": "Store #1",
        "type": "Issue"
      },
      "createdBy": "user123",
      "createdAt": "2024-03-14T10:30:00Z",
      "updatedBy": null,
      "updatedAt": null
    },
    {
      "id": "SR-24000",
      "date": "2024-03-13T00:00:00Z",
      "refNo": "SR-24000",
      "description": "Emergency supplies",
      "status": "Complete",
      "totalAmount": 125.75,
      "movement": {
        "source": "WH001",
        "sourceName": "Main Warehouse",
        "destination": "ST002",
        "destinationName": "Store #2",
        "type": "Issue"
      },
      "createdBy": "user123",
      "createdAt": "2024-03-13T09:15:00Z",
      "updatedBy": "user456",
      "updatedAt": "2024-03-13T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |

## Create Requisition

Creates a new store requisition.

### HTTP Request

```
POST /api/v1/store-requisitions
```

### Request Body

```json
{
  "date": "2024-03-14T00:00:00Z",
  "description": "Weekly stock replenishment",
  "movement": {
    "source": "WH001",
    "destination": "ST001",
    "type": "Issue"
  },
  "items": [
    {
      "productId": "PROD001",
      "qtyRequired": 25.0,
      "unit": "KG"
    },
    {
      "productId": "PROD002",
      "qtyRequired": 10.0,
      "unit": "KG"
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string (ISO 8601) | Yes | Date of the requisition |
| description | string | Yes | Description of the requisition |
| movement | object | Yes | Movement details |
| movement.source | string | Yes | Source location code |
| movement.destination | string | Yes | Destination location code |
| movement.type | string | Yes | Type of movement (Issue, Transfer) |
| items | array | Yes | Array of requisition items |
| items[].productId | string | Yes | Product identifier |
| items[].qtyRequired | number | Yes | Quantity requested |
| items[].unit | string | Yes | Unit of measurement |

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/store-requisitions/SR-24001

{
  "data": {
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "refNo": "SR-24001",
    "description": "Weekly stock replenishment",
    "status": "Draft",
    "totalAmount": 87.50,
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "requisitionId": "SR-24001",
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 62.50,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 100.0,
          "onOrder": 50.0,
          "lastPrice": 2.45,
          "lastVendor": "Vendor A"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Rice",
          "category": "Dry Goods",
          "subCategory": "Grains",
          "itemGroup": "Food",
          "barCode": "1234567890",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T10:30:00Z",
        "updatedAt": null
      },
      {
        "id": 2,
        "requisitionId": "SR-24001",
        "productId": "PROD002",
        "description": "Flour",
        "unit": "KG",
        "qtyRequired": 10.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 25.00,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 75.0,
          "onOrder": 25.0,
          "lastPrice": 2.40,
          "lastVendor": "Vendor B"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Flour",
          "category": "Dry Goods",
          "subCategory": "Baking",
          "itemGroup": "Food",
          "barCode": "2345678901",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T10:30:00Z",
        "updatedAt": null
      }
    ],
    "createdBy": "user123",
    "createdAt": "2024-03-14T10:30:00Z",
    "updatedBy": null,
    "updatedAt": null
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request body |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Get Requisition

Retrieves a specific store requisition by ID.

### HTTP Request

```
GET /api/v1/store-requisitions/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

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
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "refNo": "SR-24001",
    "description": "Weekly stock replenishment",
    "status": "Draft",
    "totalAmount": 87.50,
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "requisitionId": "SR-24001",
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 25.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 62.50,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 100.0,
          "onOrder": 50.0,
          "lastPrice": 2.45,
          "lastVendor": "Vendor A"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Rice",
          "category": "Dry Goods",
          "subCategory": "Grains",
          "itemGroup": "Food",
          "barCode": "1234567890",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T10:30:00Z",
        "updatedAt": null
      },
      {
        "id": 2,
        "requisitionId": "SR-24001",
        "productId": "PROD002",
        "description": "Flour",
        "unit": "KG",
        "qtyRequired": 10.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 25.00,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 75.0,
          "onOrder": 25.0,
          "lastPrice": 2.40,
          "lastVendor": "Vendor B"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Flour",
          "category": "Dry Goods",
          "subCategory": "Baking",
          "itemGroup": "Food",
          "barCode": "2345678901",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T10:30:00Z",
        "updatedAt": null
      }
    ],
    "createdBy": "user123",
    "createdAt": "2024-03-14T10:30:00Z",
    "updatedBy": null,
    "updatedAt": null
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Requisition not found |

## Update Requisition

Updates an existing store requisition. Only requisitions in Draft status can be updated.

### HTTP Request

```
PATCH /api/v1/store-requisitions/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "description": "Updated weekly stock replenishment",
  "items": [
    {
      "id": 1,
      "qtyRequired": 30.0
    },
    {
      "productId": "PROD003",
      "qtyRequired": 5.0,
      "unit": "KG"
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| date | string (ISO 8601) | No | Date of the requisition |
| description | string | No | Description of the requisition |
| movement | object | No | Movement details |
| movement.source | string | No | Source location code |
| movement.destination | string | No | Destination location code |
| movement.type | string | No | Type of movement (Issue, Transfer) |
| items | array | No | Array of requisition items |
| items[].id | number | No* | Unique identifier for existing item |
| items[].productId | string | No* | Product identifier for new item |
| items[].qtyRequired | number | Yes | Quantity requested |
| items[].unit | string | No* | Unit of measurement for new item |

*Note: For existing items, `id` is required. For new items, `productId` and `unit` are required.

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "date": "2024-03-14T00:00:00Z",
    "refNo": "SR-24001",
    "description": "Updated weekly stock replenishment",
    "status": "Draft",
    "totalAmount": 112.50,
    "movement": {
      "source": "WH001",
      "sourceName": "Main Warehouse",
      "destination": "ST001",
      "destinationName": "Store #1",
      "type": "Issue"
    },
    "items": [
      {
        "id": 1,
        "requisitionId": "SR-24001",
        "productId": "PROD001",
        "description": "Rice",
        "unit": "KG",
        "qtyRequired": 30.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 75.00,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 100.0,
          "onOrder": 50.0,
          "lastPrice": 2.45,
          "lastVendor": "Vendor A"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Rice",
          "category": "Dry Goods",
          "subCategory": "Grains",
          "itemGroup": "Food",
          "barCode": "1234567890",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T10:30:00Z",
        "updatedAt": "2024-03-14T11:15:00Z"
      },
      {
        "id": 2,
        "requisitionId": "SR-24001",
        "productId": "PROD002",
        "description": "Flour",
        "unit": "KG",
        "qtyRequired": 10.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 25.00,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 75.0,
          "onOrder": 25.0,
          "lastPrice": 2.40,
          "lastVendor": "Vendor B"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Flour",
          "category": "Dry Goods",
          "subCategory": "Baking",
          "itemGroup": "Food",
          "barCode": "2345678901",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T10:30:00Z",
        "updatedAt": null
      },
      {
        "id": 3,
        "requisitionId": "SR-24001",
        "productId": "PROD003",
        "description": "Sugar",
        "unit": "KG",
        "qtyRequired": 5.0,
        "qtyApproved": null,
        "costPerUnit": 2.50,
        "total": 12.50,
        "requestDate": "2024-03-14T00:00:00Z",
        "inventory": {
          "onHand": 50.0,
          "onOrder": 20.0,
          "lastPrice": 2.35,
          "lastVendor": "Vendor C"
        },
        "itemInfo": {
          "location": "Main Warehouse",
          "locationCode": "WH001",
          "itemName": "Sugar",
          "category": "Dry Goods",
          "subCategory": "Baking",
          "itemGroup": "Food",
          "barCode": "3456789012",
          "locationType": "inventory"
        },
        "qtyIssued": null,
        "approvalStatus": null,
        "createdAt": "2024-03-14T11:15:00Z",
        "updatedAt": null
      }
    ],
    "createdBy": "user123",
    "createdAt": "2024-03-14T10:30:00Z",
    "updatedBy": "user123",
    "updatedAt": "2024-03-14T11:15:00Z"
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
| 409 | CONFLICT | Requisition is not in Draft status |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Delete Requisition

Deletes a store requisition. Only requisitions in Draft status can be deleted.

### HTTP Request

```
DELETE /api/v1/store-requisitions/{id}
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Response

```http
HTTP/1.1 204 No Content
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Requisition not found |
| 409 | CONFLICT | Requisition is not in Draft status |

## Submit Requisition

Submits a store requisition for approval. Only requisitions in Draft status can be submitted.

### HTTP Request

```
POST /api/v1/store-requisitions/{id}/submit
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "comments": "Ready for approval"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| comments | string | No | Comments for the submission |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "status": "Pending Approval",
    "updatedAt": "2024-03-14T11:30:00Z",
    "updatedBy": "user123"
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
| 409 | CONFLICT | Requisition is not in Draft status |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Void Requisition

Voids a store requisition. Requisitions in Draft, Pending Approval, or Approved status can be voided.

### HTTP Request

```
POST /api/v1/store-requisitions/{id}/void
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "reason": "No longer needed",
  "comments": "Items will be requested next week"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for voiding |
| comments | string | No | Additional comments |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "id": "SR-24001",
    "status": "Void",
    "updatedAt": "2024-03-14T11:45:00Z",
    "updatedBy": "user123"
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
| 409 | CONFLICT | Requisition cannot be voided (already Complete or Void) |

## Related Documentation

- [Store Requisition API Overview](./SR-API-Overview.md)
- [Store Requisition API Approval Endpoints](./SR-API-Approval-Endpoints.md)
- [Store Requisition API Stock Movement Endpoints](./SR-API-StockMovement-Endpoints.md)
- [Store Requisition API Journal Entry Endpoints](./SR-API-JournalEntry-Endpoints.md)
- [Store Requisition Technical Specification](./SR-Technical-Specification.md) 