# Store Requisition API - Approval Endpoints

> **Document Status**: Initial Draft - Content Consolidation (Phase 1)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 2 - Content Migration

## Table of Contents
1. [Introduction](#introduction)
2. [Approval Resource](#approval-resource)
3. [Get Approval Status](#get-approval-status)
4. [Approve Requisition](#approve-requisition)
5. [Reject Requisition](#reject-requisition)
6. [Request Changes](#request-changes)
7. [Get Approval History](#get-approval-history)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the Store Requisition API endpoints related to the approval process. These endpoints allow clients to approve, reject, or request changes to store requisitions, as well as retrieve approval status and history.

For general API conventions, authentication, and common patterns, see [SR-API-Overview.md](./SR-API-Overview.md).

## Approval Resource

### Resource Structure

An approval resource has the following structure:

```json
{
  "id": 1,
  "requisitionId": "SR-24001",
  "status": "Approved",
  "level": 1,
  "approverRole": "Department Head",
  "approverId": "user456",
  "approverName": "Jane Smith",
  "comments": "Approved as requested",
  "timestamp": "2024-03-14T11:30:00Z",
  "nextApprover": null,
  "nextApproverRole": null
}
```

### Resource Fields

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier for the approval |
| requisitionId | string | Reference to the parent requisition |
| status | string | Status of the approval (Pending, Approved, Rejected, Changes Requested) |
| level | number | Approval level in the workflow |
| approverRole | string | Role of the approver |
| approverId | string | User ID of the approver |
| approverName | string | Name of the approver |
| comments | string | Comments provided by the approver |
| timestamp | string (ISO 8601) | Timestamp of the approval action |
| nextApprover | string | User ID of the next approver (null if final approval) |
| nextApproverRole | string | Role of the next approver (null if final approval) |

## Get Approval Status

Retrieves the current approval status of a store requisition.

### HTTP Request

```
GET /api/v1/store-requisitions/{id}/approval
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
  "data": {
    "requisitionId": "SR-24001",
    "status": "Pending Approval",
    "currentLevel": 1,
    "totalLevels": 2,
    "currentApprover": {
      "role": "Department Head",
      "id": "user456",
      "name": "Jane Smith"
    },
    "nextApprover": {
      "role": "Finance Manager",
      "id": "user789",
      "name": "John Doe"
    },
    "approvalHistory": [
      {
        "level": 0,
        "status": "Submitted",
        "role": "Store Manager",
        "id": "user123",
        "name": "Alice Johnson",
        "comments": "Ready for approval",
        "timestamp": "2024-03-14T10:45:00Z"
      }
    ]
  }
}
```

### Error Responses

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Requisition not found |

## Approve Requisition

Approves a store requisition at the current approval level.

### HTTP Request

```
POST /api/v1/store-requisitions/{id}/approve
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "comments": "Approved as requested",
  "items": [
    {
      "id": 1,
      "qtyApproved": 25.0,
      "approvalStatus": "Accept"
    },
    {
      "id": 2,
      "qtyApproved": 8.0,
      "approvalStatus": "Accept"
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| comments | string | No | Comments for the approval |
| items | array | No | Array of item approvals (if partial approval) |
| items[].id | number | Yes | Item ID |
| items[].qtyApproved | number | Yes | Approved quantity |
| items[].approvalStatus | string | Yes | Approval status (Accept, Reject) |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "requisitionId": "SR-24001",
    "status": "Approved",
    "level": 1,
    "approverRole": "Department Head",
    "approverId": "user456",
    "approverName": "Jane Smith",
    "comments": "Approved as requested",
    "timestamp": "2024-03-14T11:30:00Z",
    "nextApprover": "user789",
    "nextApproverRole": "Finance Manager"
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
| 409 | CONFLICT | Requisition is not in Pending Approval status or user is not the current approver |
| 422 | BUSINESS_RULE_VIOLATION | Business rule violation |

## Reject Requisition

Rejects a store requisition at the current approval level.

### HTTP Request

```
POST /api/v1/store-requisitions/{id}/reject
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "reason": "Budget constraints",
  "comments": "Cannot approve due to budget constraints this month"
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for rejection |
| comments | string | No | Additional comments |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "requisitionId": "SR-24001",
    "status": "Rejected",
    "level": 1,
    "approverRole": "Department Head",
    "approverId": "user456",
    "approverName": "Jane Smith",
    "reason": "Budget constraints",
    "comments": "Cannot approve due to budget constraints this month",
    "timestamp": "2024-03-14T11:30:00Z"
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
| 409 | CONFLICT | Requisition is not in Pending Approval status or user is not the current approver |

## Request Changes

Requests changes to a store requisition at the current approval level.

### HTTP Request

```
POST /api/v1/store-requisitions/{id}/request-changes
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Requisition ID |

### Request Body

```json
{
  "reason": "Quantity adjustment needed",
  "comments": "Please reduce quantities to align with budget",
  "items": [
    {
      "id": 1,
      "comments": "Reduce quantity to 20 KG",
      "approvalStatus": "Review"
    },
    {
      "id": 2,
      "comments": "Reduce quantity to 5 KG",
      "approvalStatus": "Review"
    }
  ]
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for requesting changes |
| comments | string | No | Additional comments |
| items | array | No | Array of item change requests |
| items[].id | number | Yes | Item ID |
| items[].comments | string | No | Comments for the specific item |
| items[].approvalStatus | string | Yes | Approval status (Review) |

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": {
    "requisitionId": "SR-24001",
    "status": "Changes Requested",
    "level": 1,
    "approverRole": "Department Head",
    "approverId": "user456",
    "approverName": "Jane Smith",
    "reason": "Quantity adjustment needed",
    "comments": "Please reduce quantities to align with budget",
    "timestamp": "2024-03-14T11:30:00Z"
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
| 409 | CONFLICT | Requisition is not in Pending Approval status or user is not the current approver |

## Get Approval History

Retrieves the approval history of a store requisition.

### HTTP Request

```
GET /api/v1/store-requisitions/{id}/approval-history
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
      "id": 1,
      "requisitionId": "SR-24001",
      "status": "Submitted",
      "level": 0,
      "approverRole": "Store Manager",
      "approverId": "user123",
      "approverName": "Alice Johnson",
      "comments": "Ready for approval",
      "timestamp": "2024-03-14T10:45:00Z"
    },
    {
      "id": 2,
      "requisitionId": "SR-24001",
      "status": "Changes Requested",
      "level": 1,
      "approverRole": "Department Head",
      "approverId": "user456",
      "approverName": "Jane Smith",
      "reason": "Quantity adjustment needed",
      "comments": "Please reduce quantities to align with budget",
      "timestamp": "2024-03-14T11:30:00Z"
    },
    {
      "id": 3,
      "requisitionId": "SR-24001",
      "status": "Resubmitted",
      "level": 0,
      "approverRole": "Store Manager",
      "approverId": "user123",
      "approverName": "Alice Johnson",
      "comments": "Quantities adjusted as requested",
      "timestamp": "2024-03-14T13:15:00Z"
    },
    {
      "id": 4,
      "requisitionId": "SR-24001",
      "status": "Approved",
      "level": 1,
      "approverRole": "Department Head",
      "approverId": "user456",
      "approverName": "Jane Smith",
      "comments": "Approved with adjusted quantities",
      "timestamp": "2024-03-14T14:00:00Z"
    },
    {
      "id": 5,
      "requisitionId": "SR-24001",
      "status": "Approved",
      "level": 2,
      "approverRole": "Finance Manager",
      "approverId": "user789",
      "approverName": "John Doe",
      "comments": "Final approval granted",
      "timestamp": "2024-03-14T15:30:00Z"
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
- [Store Requisition API Stock Movement Endpoints](./SR-API-StockMovement-Endpoints.md)
- [Store Requisition API Journal Entry Endpoints](./SR-API-JournalEntry-Endpoints.md)
- [Store Requisition Technical Specification](./SR-Technical-Specification.md) 