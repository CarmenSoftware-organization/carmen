# Product Units API Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Authentication
All API requests require authentication using Bearer token authentication.

```
Authorization: Bearer {your_api_token}
```

## Base URL
```
https://api.carmenerp.com/v1
```

## Endpoints

### List Units
`GET /units`

Retrieves a list of all measurement units with optional filtering.

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 50, max: 200): Items per page
- `search` (string): Search by name or abbreviation
- `status` (string): Filter by status (active, inactive)
- `type` (string): Filter by unit type (weight, volume, quantity, length, etc.)

**Success Response:**
```json
{
  "data": [
    {
      "id": "unit_101",
      "name": "Kilogram",
      "abbreviation": "kg",
      "type": "weight",
      "status": "active",
      "isBaseUnit": true,
      "conversionFactor": 1,
      "productCount": 156
    },
    {
      "id": "unit_102",
      "name": "Gram",
      "abbreviation": "g",
      "type": "weight",
      "status": "active",
      "isBaseUnit": false,
      "conversionFactor": 0.001,
      "baseUnitId": "unit_101",
      "productCount": 23
    }
  ],
  "meta": {
    "total": 24,
    "page": 1,
    "limit": 50,
    "totalPages": 1
  }
}
```

### Get Unit
`GET /units/{id}`

Retrieves detailed information about a specific unit.

**URL Parameters:**
- `id` (string, required): Unit ID

**Query Parameters:**
- `includeProducts` (boolean, default: false): Include associated products

**Success Response:**
```json
{
  "id": "unit_102",
  "name": "Gram",
  "abbreviation": "g",
  "type": "weight",
  "status": "active",
  "isBaseUnit": false,
  "conversionFactor": 0.001,
  "baseUnitId": "unit_101",
  "baseUnitName": "Kilogram",
  "baseUnitAbbreviation": "kg",
  "productCount": 23,
  "createdAt": "2023-01-15T10:30:00Z",
  "updatedAt": "2023-01-15T10:30:00Z"
}
```

### Create Unit
`POST /units`

Creates a new measurement unit.

**Request Body:**
```json
{
  "name": "Metric Ton",
  "abbreviation": "t",
  "type": "weight",
  "status": "active",
  "isBaseUnit": false,
  "conversionFactor": 1000,
  "baseUnitId": "unit_101"
}
```

**Success Response:**
```json
{
  "id": "unit_125",
  "name": "Metric Ton",
  "abbreviation": "t",
  "message": "Unit created successfully"
}
```

### Update Unit
`PUT /units/{id}`

Updates an existing measurement unit.

**URL Parameters:**
- `id` (string, required): Unit ID

**Request Body:**
```json
{
  "name": "Tonne",
  "abbreviation": "t",
  "status": "active",
  "conversionFactor": 1000
}
```

**Success Response:**
```json
{
  "id": "unit_125",
  "message": "Unit updated successfully"
}
```

### Delete Unit
`DELETE /units/{id}`

Deletes a unit if it is not associated with any products or conversion rules.

**URL Parameters:**
- `id` (string, required): Unit ID

**Success Response:**
```json
{
  "id": "unit_125",
  "message": "Unit deleted successfully"
}
```

### Get Conversion Factors
`GET /units/conversions`

Retrieves a matrix of conversion factors between units of the same type.

**Query Parameters:**
- `type` (string, optional): Filter by unit type (weight, volume, etc.)

**Success Response:**
```json
{
  "type": "weight",
  "conversions": [
    {
      "fromUnit": {
        "id": "unit_101",
        "name": "Kilogram",
        "abbreviation": "kg"
      },
      "toUnit": {
        "id": "unit_102",
        "name": "Gram", 
        "abbreviation": "g"
      },
      "factor": 1000
    },
    {
      "fromUnit": {
        "id": "unit_102",
        "name": "Gram",
        "abbreviation": "g"
      },
      "toUnit": {
        "id": "unit_101",
        "name": "Kilogram",
        "abbreviation": "kg"
      },
      "factor": 0.001
    }
  ]
}
```

### Create Conversion Factor
`POST /units/conversions`

Creates or updates a conversion factor between two units.

**Request Body:**
```json
{
  "fromUnitId": "unit_101",
  "toUnitId": "unit_125",
  "factor": 0.001
}
```

**Success Response:**
```json
{
  "message": "Conversion factor created successfully",
  "fromUnit": "Kilogram",
  "toUnit": "Metric Ton",
  "factor": 0.001
}
```

### Bulk Operations

#### Bulk Create Units
`POST /units/bulk`

Creates multiple units in a single request.

**Request Body:**
```json
{
  "units": [
    {
      "name": "Milliliter",
      "abbreviation": "ml",
      "type": "volume",
      "status": "active",
      "isBaseUnit": false,
      "conversionFactor": 0.001,
      "baseUnitId": "unit_105"
    },
    {
      "name": "Centiliter",
      "abbreviation": "cl",
      "type": "volume",
      "status": "active",
      "isBaseUnit": false,
      "conversionFactor": 0.01,
      "baseUnitId": "unit_105"
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Units created successfully",
  "created": 2,
  "failed": 0,
  "units": [
    {
      "id": "unit_126",
      "name": "Milliliter",
      "abbreviation": "ml"
    },
    {
      "id": "unit_127",
      "name": "Centiliter",
      "abbreviation": "cl"
    }
  ]
}
```

#### Bulk Update Units
`PUT /units/bulk`

Updates multiple units in a single request.

**Request Body:**
```json
{
  "units": [
    {
      "id": "unit_126",
      "status": "inactive"
    },
    {
      "id": "unit_127",
      "status": "inactive"
    }
  ]
}
```

**Success Response:**
```json
{
  "message": "Units updated successfully",
  "updated": 2,
  "failed": 0,
  "units": [
    {
      "id": "unit_126",
      "name": "Milliliter"
    },
    {
      "id": "unit_127",
      "name": "Centiliter"
    }
  ]
}
```

### Get Unit Types
`GET /units/types`

Retrieves the list of available unit types.

**Success Response:**
```json
{
  "types": [
    {
      "id": "weight",
      "name": "Weight",
      "baseUnit": {
        "id": "unit_101",
        "name": "Kilogram",
        "abbreviation": "kg"
      },
      "unitCount": 6
    },
    {
      "id": "volume",
      "name": "Volume",
      "baseUnit": {
        "id": "unit_105",
        "name": "Liter",
        "abbreviation": "L"
      },
      "unitCount": 5
    },
    {
      "id": "quantity",
      "name": "Quantity",
      "baseUnit": {
        "id": "unit_110",
        "name": "Each",
        "abbreviation": "ea"
      },
      "unitCount": 4
    }
  ]
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Unit not found",
    "details": "No unit exists with ID unit_999"
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `DUPLICATE_ENTRY`: Resource with the same unique identifier already exists
- `UNAUTHORIZED`: Authentication required or invalid credentials
- `FORBIDDEN`: User lacks permission to perform the action
- `UNIT_IN_USE`: Cannot delete unit associated with products
- `INCOMPATIBLE_UNITS`: Cannot convert between units of different types
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Rate Limiting

API requests are limited to:
- 50 requests per minute
- 2000 requests per day

Rate limit headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Versioning

Current API version: v1

Future versions will be accessible at:
```
https://api.carmenerp.com/v2/units
``` 