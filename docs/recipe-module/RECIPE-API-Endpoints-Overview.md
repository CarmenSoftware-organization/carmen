# Recipe Module - API Endpoints Overview

**Status**: Draft  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: March 27, 2024

## Introduction

This document provides an overview of the API endpoints available in the Recipe Management module. It serves as an index to the detailed API documentation and offers a high-level understanding of the available operations.

## API Endpoints Organization

The Recipe Management API endpoints are organized into the following categories:

1. **Core Operations**: Basic CRUD operations for recipes
2. **Category Operations**: Endpoints for managing recipe categories
3. **Ingredient Operations**: Endpoints for managing recipe ingredients
4. **Attachment Operations**: Endpoints for managing recipe media attachments
5. **Comment Operations**: Endpoints for managing recipe comments

## Common Patterns

### Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

### Request Format

- GET requests use query parameters for filtering and pagination
- POST, PUT, and PATCH requests accept JSON bodies
- DELETE requests typically don't require a request body

### Response Format

All responses follow a standard format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "errors": []
}
```

For error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Operation failed",
  "errors": [
    {
      "code": "ERROR_CODE",
      "message": "Detailed error message"
    }
  ]
}
```

### Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Field to sort by (e.g., `name`, `updatedAt`)
- `order`: Sort order (`asc` or `desc`, default: `asc`)

Paginated responses include metadata:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  },
  "message": "Operation successful",
  "errors": []
}
```

## API Endpoints Documentation

### Core Operations

Detailed documentation: [Recipe API Core Operations](./RECIPE-API-Endpoints-Core.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes` | List recipes with filtering and pagination |
| GET | `/api/recipes/:id` | Get recipe by ID |
| POST | `/api/recipes` | Create a new recipe |
| PUT | `/api/recipes/:id` | Update an existing recipe |
| DELETE | `/api/recipes/:id` | Delete a recipe |
| PATCH | `/api/recipes/:id/status` | Update recipe status |

### Category Operations

Detailed documentation: [Recipe API Category Operations](./RECIPE-API-Endpoints-Categories.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipe-categories` | List recipe categories |
| GET | `/api/recipe-categories/:id` | Get category by ID |
| POST | `/api/recipe-categories` | Create a new category |
| PUT | `/api/recipe-categories/:id` | Update an existing category |
| DELETE | `/api/recipe-categories/:id` | Delete a category |

### Ingredient Operations

Detailed documentation: [Recipe API Ingredient Operations](./RECIPE-API-Endpoints-Ingredients.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes/:id/ingredients` | List ingredients for a recipe |
| POST | `/api/recipes/:id/ingredients` | Add ingredient to a recipe |
| PUT | `/api/recipes/:id/ingredients/:ingredientId` | Update recipe ingredient |
| DELETE | `/api/recipes/:id/ingredients/:ingredientId` | Remove ingredient from recipe |
| POST | `/api/recipes/:id/ingredients/reorder` | Reorder recipe ingredients |

### Attachment Operations

Detailed documentation: [Recipe API Attachment Operations](./RECIPE-API-Endpoints-Attachments.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes/:id/attachments` | List attachments for a recipe |
| POST | `/api/recipes/:id/attachments` | Upload attachment to a recipe |
| DELETE | `/api/recipes/:id/attachments/:attachmentId` | Remove attachment from recipe |
| PUT | `/api/recipes/:id/attachments/:attachmentId` | Update attachment metadata |

### Comment Operations

Detailed documentation: [Recipe API Comment Operations](./RECIPE-API-Endpoints-Comments.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recipes/:id/comments` | List comments for a recipe |
| POST | `/api/recipes/:id/comments` | Add comment to a recipe |
| PUT | `/api/recipes/:id/comments/:commentId` | Update recipe comment |
| DELETE | `/api/recipes/:id/comments/:commentId` | Remove comment from recipe |

## Error Codes

| Code | Description |
|------|-------------|
| `RECIPE_NOT_FOUND` | Recipe with the specified ID was not found |
| `CATEGORY_NOT_FOUND` | Category with the specified ID was not found |
| `INGREDIENT_NOT_FOUND` | Ingredient with the specified ID was not found |
| `ATTACHMENT_NOT_FOUND` | Attachment with the specified ID was not found |
| `COMMENT_NOT_FOUND` | Comment with the specified ID was not found |
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | User is not authorized to perform the operation |
| `INTERNAL_ERROR` | Internal server error occurred |

## Rate Limiting

API endpoints are subject to rate limiting:

- 100 requests per minute per user
- 1000 requests per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1616979600
```

## Related Documentation

- [Recipe Module Overview](./RECIPE-Overview.md)
- [Business Requirements](./RECIPE-Business-Requirements.md)
- [Product Requirements Document](./RECIPE-PRD.md)
- [Component Structure](./RECIPE-Component-Structure.md)
- [Page Flow](./RECIPE-Page-Flow.md)
- [API Core Operations](./RECIPE-API-Endpoints-Core.md)
- [API Category Operations](./RECIPE-API-Endpoints-Categories.md)
- [API Ingredient Operations](./RECIPE-API-Endpoints-Ingredients.md)
- [API Attachment Operations](./RECIPE-API-Endpoints-Attachments.md)
- [API Comment Operations](./RECIPE-API-Endpoints-Comments.md) 