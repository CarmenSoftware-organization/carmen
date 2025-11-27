# Recipe Module - API Core Endpoints

**Status**: Draft  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: March 27, 2024

## Introduction

This document details the core API endpoints for the Recipe Management module, covering the basic CRUD (Create, Read, Update, Delete) operations for recipes.

## Data Models

### Recipe

```typescript
interface Recipe {
  id: string;                    // Unique identifier
  name: string;                  // Recipe name
  description: string;           // Detailed description
  category: string;              // Recipe category ID
  cuisine: string;               // Cuisine type ID
  status: 'draft' | 'published'; // Recipe status
  image: string;                 // Main recipe image URL
  yield: number;                 // Output quantity
  yieldUnit: string;             // Unit of measurement
  prepTime: number;              // Preparation time in minutes
  cookTime: number;              // Cooking time in minutes
  totalTime: number;             // Total time in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  costPerPortion: number;        // Cost per serving
  sellingPrice: number;          // Selling price
  grossMargin: number;           // Gross margin percentage
  netPrice: number;              // Net price
  grossPrice: number;            // Gross price
  totalCost: number;             // Total recipe cost
  carbonFootprint: number;       // Environmental impact
  carbonFootprintSource?: string; // Source of carbon footprint data
  hasMedia: boolean;             // Whether recipe has media
  deductFromStock: boolean;      // Whether to deduct from stock
  ingredients: Ingredient[];     // List of ingredients
  steps: PreparationStep[];      // Preparation steps
  prepNotes: string;             // Preparation notes
  specialInstructions: string;   // Special instructions
  additionalInfo: string;        // Additional information
  allergens: string[];           // List of allergen IDs
  tags: string[];                // List of tag IDs
  createdAt: string;             // Creation timestamp
  updatedAt: string;             // Last update timestamp
  createdBy: string;             // Creator user ID
  updatedBy: string;             // Last updater user ID
  targetFoodCost: number;        // Target food cost percentage
  laborCostPercentage: number;   // Labor cost percentage
  overheadPercentage: number;    // Overhead percentage
  recommendedPrice: number;      // Recommended selling price
  foodCostPercentage: number;    // Food cost percentage
  grossProfit: number;           // Gross profit
  unitOfSale: string;            // Unit of sale
}
```

### Ingredient

```typescript
interface Ingredient {
  id: string;                   // Unique identifier
  name: string;                 // Ingredient name
  type: 'product' | 'recipe';   // Ingredient type
  quantity: number;             // Required quantity
  unit: string;                 // Unit of measurement
  wastage: number;              // Wastage percentage
  inventoryQty: number;         // Inventory quantity
  inventoryUnit: string;        // Inventory unit
  costPerUnit: number;          // Cost per unit
  totalCost: number;            // Total ingredient cost
}
```

### PreparationStep

```typescript
interface PreparationStep {
  id: string;                   // Unique identifier
  order: number;                // Step sequence
  description: string;          // Step instructions
  duration: number;             // Time in minutes
  equipments: string[];         // Required equipment
  image: string;                // Step image URL
}
```

## Endpoints

### List Recipes

Retrieves a paginated list of recipes with optional filtering.

**Endpoint**: `GET /api/recipes`

**Query Parameters**:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 20 |
| `sort` | string | Field to sort by | 'updatedAt' |
| `order` | string | Sort order ('asc' or 'desc') | 'desc' |
| `status` | string | Filter by status | - |
| `category` | string | Filter by category ID | - |
| `cuisine` | string | Filter by cuisine ID | - |
| `search` | string | Search term for name/description | - |
| `minCost` | number | Minimum cost per portion | - |
| `maxCost` | number | Maximum cost per portion | - |
| `tags` | string | Comma-separated list of tag IDs | - |
| `createdBy` | string | Filter by creator user ID | - |
| `updatedBy` | string | Filter by updater user ID | - |

**Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "thai-green-curry",
        "name": "Thai Green Curry",
        "description": "Authentic Thai green curry with chicken and vegetables",
        "category": "main-course",
        "cuisine": "thai",
        "status": "published",
        "image": "/images/recipes/thai-green-curry.jpg",
        "yield": 4,
        "yieldUnit": "portions",
        "prepTime": 20,
        "cookTime": 25,
        "totalTime": 45,
        "difficulty": "medium",
        "costPerPortion": 5.75,
        "sellingPrice": 18.99,
        "grossMargin": 69.7,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-20T14:15:00Z"
      },
      // More recipes...
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  },
  "message": "Recipes retrieved successfully",
  "errors": []
}
```

### Get Recipe by ID

Retrieves a single recipe by its ID.

**Endpoint**: `GET /api/recipes/:id`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Recipe ID |

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "thai-green-curry",
    "name": "Thai Green Curry",
    "description": "Authentic Thai green curry with chicken and vegetables",
    "category": "main-course",
    "cuisine": "thai",
    "status": "published",
    "image": "/images/recipes/thai-green-curry.jpg",
    "yield": 4,
    "yieldUnit": "portions",
    "prepTime": 20,
    "cookTime": 25,
    "totalTime": 45,
    "difficulty": "medium",
    "costPerPortion": 5.75,
    "sellingPrice": 18.99,
    "grossMargin": 69.7,
    "netPrice": 16.99,
    "grossPrice": 18.99,
    "totalCost": 23.00,
    "carbonFootprint": 2.5,
    "carbonFootprintSource": "Internal calculation",
    "hasMedia": true,
    "deductFromStock": true,
    "ingredients": [
      {
        "id": "chicken-breast",
        "name": "Chicken Breast",
        "type": "product",
        "quantity": 500,
        "unit": "g",
        "wastage": 5,
        "inventoryQty": 500,
        "inventoryUnit": "g",
        "costPerUnit": 0.01,
        "totalCost": 5.25
      },
      // More ingredients...
    ],
    "steps": [
      {
        "id": "step1",
        "order": 1,
        "description": "Heat oil in a large pan over medium heat.",
        "duration": 2,
        "equipments": ["pan", "stove"],
        "image": "/recipes/steps/thai-green-curry-1.jpg"
      },
      // More steps...
    ],
    "prepNotes": "Prepare all ingredients before starting cooking.",
    "specialInstructions": "Adjust spice level according to preference.",
    "additionalInfo": "Can be made vegetarian by substituting tofu for chicken.",
    "allergens": ["peanuts", "shellfish"],
    "tags": ["spicy", "asian", "dinner"],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:15:00Z",
    "createdBy": "user123",
    "updatedBy": "user456",
    "targetFoodCost": 33,
    "laborCostPercentage": 30,
    "overheadPercentage": 20,
    "recommendedPrice": 19.99,
    "foodCostPercentage": 30.3,
    "grossProfit": 13.24,
    "unitOfSale": "portion"
  },
  "message": "Recipe retrieved successfully",
  "errors": []
}
```

### Create Recipe

Creates a new recipe.

**Endpoint**: `POST /api/recipes`

**Request Body**:

```json
{
  "name": "Vegetable Stir Fry",
  "description": "Quick and healthy vegetable stir fry with soy sauce",
  "category": "main-course",
  "cuisine": "asian",
  "status": "draft",
  "image": "/images/recipes/vegetable-stir-fry.jpg",
  "yield": 2,
  "yieldUnit": "portions",
  "prepTime": 15,
  "cookTime": 10,
  "totalTime": 25,
  "difficulty": "easy",
  "deductFromStock": true,
  "ingredients": [
    {
      "name": "Mixed Vegetables",
      "type": "product",
      "quantity": 300,
      "unit": "g",
      "wastage": 2,
      "inventoryQty": 300,
      "inventoryUnit": "g",
      "costPerUnit": 0.005,
      "totalCost": 1.53
    },
    {
      "name": "Soy Sauce",
      "type": "product",
      "quantity": 30,
      "unit": "ml",
      "wastage": 0,
      "inventoryQty": 30,
      "inventoryUnit": "ml",
      "costPerUnit": 0.02,
      "totalCost": 0.60
    }
  ],
  "steps": [
    {
      "order": 1,
      "description": "Heat oil in a wok over high heat.",
      "duration": 1,
      "equipments": ["wok", "stove"],
      "image": ""
    },
    {
      "order": 2,
      "description": "Add vegetables and stir fry for 5 minutes.",
      "duration": 5,
      "equipments": ["wok", "spatula"],
      "image": ""
    }
  ],
  "prepNotes": "Wash and chop all vegetables before cooking.",
  "specialInstructions": "",
  "additionalInfo": "",
  "allergens": ["soy"],
  "tags": ["quick", "healthy", "vegetarian"],
  "targetFoodCost": 33,
  "laborCostPercentage": 30,
  "overheadPercentage": 20,
  "unitOfSale": "portion"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "vegetable-stir-fry",
    "name": "Vegetable Stir Fry",
    "description": "Quick and healthy vegetable stir fry with soy sauce",
    "category": "main-course",
    "cuisine": "asian",
    "status": "draft",
    "image": "/images/recipes/vegetable-stir-fry.jpg",
    "yield": 2,
    "yieldUnit": "portions",
    "prepTime": 15,
    "cookTime": 10,
    "totalTime": 25,
    "difficulty": "easy",
    "costPerPortion": 1.07,
    "sellingPrice": 0,
    "grossMargin": 0,
    "netPrice": 0,
    "grossPrice": 0,
    "totalCost": 2.13,
    "carbonFootprint": 0,
    "hasMedia": true,
    "deductFromStock": true,
    "ingredients": [
      {
        "id": "mixed-vegetables",
        "name": "Mixed Vegetables",
        "type": "product",
        "quantity": 300,
        "unit": "g",
        "wastage": 2,
        "inventoryQty": 300,
        "inventoryUnit": "g",
        "costPerUnit": 0.005,
        "totalCost": 1.53
      },
      {
        "id": "soy-sauce",
        "name": "Soy Sauce",
        "type": "product",
        "quantity": 30,
        "unit": "ml",
        "wastage": 0,
        "inventoryQty": 30,
        "inventoryUnit": "ml",
        "costPerUnit": 0.02,
        "totalCost": 0.60
      }
    ],
    "steps": [
      {
        "id": "step1",
        "order": 1,
        "description": "Heat oil in a wok over high heat.",
        "duration": 1,
        "equipments": ["wok", "stove"],
        "image": ""
      },
      {
        "id": "step2",
        "order": 2,
        "description": "Add vegetables and stir fry for 5 minutes.",
        "duration": 5,
        "equipments": ["wok", "spatula"],
        "image": ""
      }
    ],
    "prepNotes": "Wash and chop all vegetables before cooking.",
    "specialInstructions": "",
    "additionalInfo": "",
    "allergens": ["soy"],
    "tags": ["quick", "healthy", "vegetarian"],
    "createdAt": "2024-03-27T12:00:00Z",
    "updatedAt": "2024-03-27T12:00:00Z",
    "createdBy": "user123",
    "updatedBy": "user123",
    "targetFoodCost": 33,
    "laborCostPercentage": 30,
    "overheadPercentage": 20,
    "recommendedPrice": 3.24,
    "foodCostPercentage": 33,
    "grossProfit": 0,
    "unitOfSale": "portion"
  },
  "message": "Recipe created successfully",
  "errors": []
}
```

### Update Recipe

Updates an existing recipe.

**Endpoint**: `PUT /api/recipes/:id`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Recipe ID |

**Request Body**: Same as Create Recipe, but all fields are optional.

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "vegetable-stir-fry",
    "name": "Vegetable Stir Fry with Tofu",
    "description": "Quick and healthy vegetable stir fry with tofu and soy sauce",
    // Updated recipe data...
    "updatedAt": "2024-03-27T14:30:00Z",
    "updatedBy": "user123"
  },
  "message": "Recipe updated successfully",
  "errors": []
}
```

### Delete Recipe

Deletes a recipe.

**Endpoint**: `DELETE /api/recipes/:id`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Recipe ID |

**Response**:

```json
{
  "success": true,
  "data": null,
  "message": "Recipe deleted successfully",
  "errors": []
}
```

### Update Recipe Status

Updates the status of a recipe.

**Endpoint**: `PATCH /api/recipes/:id/status`

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Recipe ID |

**Request Body**:

```json
{
  "status": "published"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "vegetable-stir-fry",
    "status": "published",
    "updatedAt": "2024-03-27T15:00:00Z",
    "updatedBy": "user123"
  },
  "message": "Recipe status updated successfully",
  "errors": []
}
```

## Error Responses

### Recipe Not Found

```json
{
  "success": false,
  "data": null,
  "message": "Recipe not found",
  "errors": [
    {
      "code": "RECIPE_NOT_FOUND",
      "message": "Recipe with ID 'invalid-id' was not found"
    }
  ]
}
```

### Validation Error

```json
{
  "success": false,
  "data": null,
  "message": "Validation error",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Name is required",
      "field": "name"
    },
    {
      "code": "VALIDATION_ERROR",
      "message": "Yield must be a positive number",
      "field": "yield"
    }
  ]
}
```

### Unauthorized

```json
{
  "success": false,
  "data": null,
  "message": "Unauthorized",
  "errors": [
    {
      "code": "UNAUTHORIZED",
      "message": "You do not have permission to perform this action"
    }
  ]
}
```

## Related Documentation

- [API Endpoints Overview](./RECIPE-API-Endpoints-Overview.md)
- [API Category Operations](./RECIPE-API-Endpoints-Categories.md)
- [API Ingredient Operations](./RECIPE-API-Endpoints-Ingredients.md)
- [API Attachment Operations](./RECIPE-API-Endpoints-Attachments.md)
- [API Comment Operations](./RECIPE-API-Endpoints-Comments.md)