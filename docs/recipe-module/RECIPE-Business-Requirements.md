# Recipe Module - Business Requirements

**Status**: Draft  
**Last Updated**: March 27, 2024

## 1. Introduction

### Purpose
This document outlines the business requirements for the Recipe Management module within the Carmen F&B Management System. It serves as a comprehensive guide for developers, testers, and business stakeholders to understand the module's functionality and business rules.

### Scope
The documentation covers the Recipe Management module, including recipe creation, editing, listing, and management functionalities. It encompasses all business rules, data definitions, and logic implementations related to recipe handling.

### Audience
- Development Team
- Quality Assurance Team
- F&B Operations Managers
- Kitchen Staff
- Cost Controllers
- System Administrators

## 2. Business Context

### Business Objectives
- Standardize recipe creation and management across the organization
- Enable accurate cost tracking and pricing calculations
- Facilitate efficient kitchen operations through detailed recipe documentation
- Support inventory management through ingredient tracking
- Monitor and optimize food costs and margins
- Track environmental impact through carbon footprint measurements

### Module Overview
The Recipe Management module consists of several key components:
1. Recipe Library Management
2. Recipe Creation and Editing
3. Cost and Pricing Management
4. Ingredient Management
5. Preparation Steps Management
6. Media Management
7. Recipe Categories and Cuisine Types

### Key Stakeholders
- Kitchen Management Team
- Cost Control Department
- Inventory Management Team
- F&B Operations Staff
- Quality Control Team
- Procurement Department

## 3. Business Rules

### Recipe Creation (REC_CR)
- **REC_CR_001**: Each recipe must have a unique identifier
- **REC_CR_002**: Required fields include name, category, yield, and at least one ingredient
- **REC_CR_003**: Recipes start in 'draft' status before being published
- **REC_CR_004**: Yield must be specified with both quantity and unit
- **REC_CR_005**: Preparation time must include prep time and cooking time

### Recipe Costing (REC_CO)
- **REC_CO_001**: Cost per portion must be calculated based on total ingredient costs and yield
- **REC_CO_002**: Gross margin calculation must include labor and overhead costs
- **REC_CO_003**: Target food cost percentage must be specified
- **REC_CO_004**: Selling price must be calculated based on cost and target margin
- **REC_CO_005**: Wastage must be factored into ingredient costs

### Ingredient Management (REC_IN)
- **REC_IN_001**: Each ingredient must specify quantity and unit
- **REC_IN_002**: Ingredients can be either products or sub-recipes
- **REC_IN_003**: Wastage percentage must be specified for each ingredient
- **REC_IN_004**: Stock deduction settings must be specified per recipe
- **REC_IN_005**: Unit conversions must be handled for inventory management

### Recipe Status (REC_ST)
- **REC_ST_001**: Valid statuses are 'draft' and 'published'
- **REC_ST_002**: Only published recipes can be used in production
- **REC_ST_003**: Status changes must be tracked with timestamp and user
- **REC_ST_004**: Published recipes require complete information

## 4. Data Definitions

### Recipe Entity
```typescript
interface Recipe {
  id: string                    // Unique identifier
  name: string                  // Recipe name
  description: string           // Detailed description
  category: string             // Recipe category
  cuisine: string              // Cuisine type
  status: 'draft' | 'published' // Recipe status
  image: string                // Main recipe image
  yield: number                // Output quantity
  yieldUnit: string            // Unit of measurement
  prepTime: number             // Preparation time in minutes
  cookTime: number             // Cooking time in minutes
  totalTime: number            // Total time in minutes
  difficulty: 'easy' | 'medium' | 'hard'
  costPerPortion: number       // Cost per serving
  sellingPrice: number         // Selling price
  grossMargin: number          // Gross margin percentage
  carbonFootprint: number      // Environmental impact
  ingredients: Ingredient[]    // List of ingredients
  steps: PreparationStep[]     // Preparation steps
  // ... additional fields
}
```

### Ingredient Entity
```typescript
interface Ingredient {
  id: string                   // Unique identifier
  name: string                 // Ingredient name
  type: 'product' | 'recipe'   // Ingredient type
  quantity: number             // Required quantity
  unit: string                 // Unit of measurement
  wastage: number             // Wastage percentage
  costPerUnit: number         // Cost per unit
  totalCost: number           // Total ingredient cost
}
```

### Preparation Step Entity
```typescript
interface PreparationStep {
  id: string                   // Unique identifier
  order: number                // Step sequence
  description: string          // Step instructions
  duration: number             // Time in minutes
  equipments: string[]         // Required equipment
  image: string                // Step image
}
```

## 5. Logic Implementation

### Cost Calculations
- Total Cost = Σ(Ingredient Cost × (1 + Wastage%))
- Cost Per Portion = Total Cost / Yield
- Gross Margin = ((Selling Price - Cost Per Portion) / Selling Price) × 100
- Recommended Price = Cost Per Portion / (1 - Target Food Cost%)

### Status Management
- Draft → Published transition requires:
  - All required fields completed
  - At least one ingredient
  - At least one preparation step
  - Cost calculations completed
  - Media assets attached (if required)

### Inventory Integration
- Stock deduction based on recipe yield
- Unit conversion between recipe and inventory units
- Wastage tracking per ingredient
- Stock level validation before production

## 6. Validation and Testing

### Test Scenarios
1. Recipe Creation
   - Create with minimum required fields
   - Create with all fields
   - Attempt to create with missing required fields
   - Create with invalid data formats

2. Cost Calculations
   - Verify cost calculations with different yields
   - Verify margin calculations
   - Test price recommendations
   - Validate wastage calculations

3. Status Management
   - Test status transitions
   - Validate publishing requirements
   - Test draft mode functionality

### Error Handling
- Invalid data format validation
- Missing required field validation
- Cost calculation error handling
- Image upload error handling
- Unit conversion error handling

## 7. Maintenance and Governance

### Ownership
- Primary Owner: Kitchen Management Team
- Technical Owner: Development Team
- Content Owner: F&B Operations

### Review Process
1. Regular review of recipes (quarterly)
2. Cost review (monthly)
3. Ingredient updates (as needed)
4. Media asset review (semi-annually)

### Change Management
1. All changes must be documented
2. Major changes require kitchen management approval
3. Cost changes must be reviewed by cost control
4. Version history must be maintained

## 8. Related Documentation

- [Recipe Module Overview](./RECIPE-Overview.md)
- [Product Requirements Document](./RECIPE-PRD.md)
- [Component Structure](./RECIPE-Component-Structure.md)
- [Page Flow](./RECIPE-Page-Flow.md)
- [API Documentation](./RECIPE-API-Endpoints-Overview.md) 