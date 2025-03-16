# Recipe Module - Component Structure

**Status**: Draft  
**Last Updated**: March 27, 2024

## Introduction

This document outlines the component structure of the Recipe Management module, detailing the hierarchy, responsibilities, and relationships between components. It serves as a guide for developers to understand the architecture and implementation of the module.

## Component Hierarchy

```
RecipeModule
├── RecipeListPage
│   ├── RecipeList
│   │   ├── RecipeCard (Grid View)
│   │   └── RecipeRow (List View)
│   ├── RecipeFilters
│   │   ├── SearchBar
│   │   ├── CategoryFilter
│   │   ├── CuisineFilter
│   │   ├── StatusFilter
│   │   └── CostRangeFilter
│   ├── ViewToggle (Grid/List)
│   ├── BatchOperations
│   │   ├── SelectAll
│   │   ├── ExportSelected
│   │   ├── PrintSelected
│   │   └── ArchiveSelected
│   └── Pagination
├── RecipeDetailPage
│   ├── RecipeHeader
│   │   ├── RecipeTitle
│   │   ├── RecipeStatus
│   │   └── ActionButtons
│   ├── RecipeImage
│   ├── RecipeTabs
│   │   ├── IngredientsTab
│   │   │   ├── IngredientsList
│   │   │   └── RecipeSummary
│   │   ├── PreparationTab
│   │   │   ├── StepsList
│   │   │   └── EquipmentList
│   │   ├── CostSummaryTab
│   │   │   ├── CostBreakdown
│   │   │   └── PricingCalculator
│   │   ├── DetailsTab
│   │   │   ├── RecipeDescription
│   │   │   ├── NutritionalInfo
│   │   │   └── AllergenInfo
│   │   └── NotesTab
│   │       ├── PrepNotes
│   │       ├── SpecialInstructions
│   │       └── AdditionalInfo
│   └── RelatedRecipes
├── RecipeFormPage
│   ├── RecipeFormHeader
│   ├── RecipeBasicInfoForm
│   │   ├── NameDescriptionSection
│   │   ├── CategoryCuisineSection
│   │   ├── YieldPortionSection
│   │   ├── TimeSection
│   │   └── StatusSection
│   ├── RecipeImageUpload
│   ├── IngredientManagement
│   │   ├── IngredientList
│   │   ├── IngredientForm
│   │   └── IngredientGrouping
│   ├── StepManagement
│   │   ├── StepList
│   │   ├── StepForm
│   │   └── StepReordering
│   ├── CostCalculation
│   │   ├── IngredientCosts
│   │   ├── LaborOverheadCosts
│   │   ├── PricingStrategy
│   │   └── MarginCalculator
│   └── FormActions
├── CategoryManagementPage
│   ├── CategoryList
│   ├── CategoryForm
│   └── CategoryHierarchy
└── CuisineManagementPage
    ├── CuisineList
    ├── CuisineForm
    └── RegionMapping
```

## Component Responsibilities

### Recipe List Page Components

#### RecipeList
- **Responsibility**: Display recipes in either grid or list format
- **Props**: 
  - `recipes`: Array of recipe objects
  - `viewMode`: 'grid' or 'list'
  - `onSelect`: Callback for recipe selection
  - `onEdit`: Callback for recipe editing
  - `onDelete`: Callback for recipe deletion
- **State**: 
  - `selectedRecipes`: Array of selected recipe IDs
- **Key Functions**: 
  - `handleSelect`: Handle recipe selection
  - `handleBatchOperation`: Handle batch operations on selected recipes

#### RecipeFilters
- **Responsibility**: Provide filtering options for the recipe list
- **Props**: 
  - `categories`: Available categories
  - `cuisines`: Available cuisine types
  - `onFilterChange`: Callback when filters change
- **State**: 
  - `activeFilters`: Current filter settings
- **Key Functions**: 
  - `applyFilters`: Apply selected filters
  - `clearFilters`: Clear all filters

#### ViewToggle
- **Responsibility**: Toggle between grid and list views
- **Props**: 
  - `currentView`: Current view mode
  - `onViewChange`: Callback when view changes
- **State**: None (controlled component)

#### BatchOperations
- **Responsibility**: Provide batch operations for selected recipes
- **Props**: 
  - `selectedRecipes`: Array of selected recipe IDs
  - `onExport`: Export callback
  - `onPrint`: Print callback
  - `onArchive`: Archive callback
- **State**: None (controlled component)

### Recipe Detail Page Components

#### RecipeHeader
- **Responsibility**: Display recipe title, status, and action buttons
- **Props**: 
  - `recipe`: Recipe object
  - `onEdit`: Edit callback
  - `onPrint`: Print callback
  - `onShare`: Share callback
- **State**: None (controlled component)

#### RecipeTabs
- **Responsibility**: Manage tabbed interface for recipe details
- **Props**: 
  - `recipe`: Recipe object
  - `activeTab`: Currently active tab
  - `onTabChange`: Tab change callback
- **State**: 
  - `localActiveTab`: Locally managed active tab

#### IngredientsTab
- **Responsibility**: Display recipe ingredients and summary
- **Props**: 
  - `ingredients`: Array of ingredient objects
  - `yield`: Recipe yield
  - `yieldUnit`: Recipe yield unit
- **State**: 
  - `groupedIngredients`: Ingredients grouped by component

#### PreparationTab
- **Responsibility**: Display preparation steps and equipment
- **Props**: 
  - `steps`: Array of preparation step objects
  - `equipment`: Array of required equipment
- **State**: None (controlled component)

#### CostSummaryTab
- **Responsibility**: Display cost breakdown and pricing information
- **Props**: 
  - `recipe`: Recipe object with cost data
  - `onUpdateCost`: Callback for cost updates
- **State**: 
  - `editMode`: Boolean for edit mode

### Recipe Form Page Components

#### RecipeBasicInfoForm
- **Responsibility**: Manage basic recipe information inputs
- **Props**: 
  - `initialData`: Initial recipe data
  - `onChange`: Change callback
  - `categories`: Available categories
  - `cuisines`: Available cuisine types
- **State**: 
  - `formData`: Current form data

#### IngredientManagement
- **Responsibility**: Manage recipe ingredients
- **Props**: 
  - `ingredients`: Initial ingredients
  - `onChange`: Change callback
  - `products`: Available products
  - `recipes`: Available recipes for sub-recipes
- **State**: 
  - `currentIngredients`: Current ingredient list
  - `editingIngredient`: Currently editing ingredient

#### StepManagement
- **Responsibility**: Manage preparation steps
- **Props**: 
  - `steps`: Initial steps
  - `onChange`: Change callback
- **State**: 
  - `currentSteps`: Current step list
  - `editingStep`: Currently editing step
  - `reordering`: Boolean for reordering mode

#### CostCalculation
- **Responsibility**: Calculate and display recipe costs
- **Props**: 
  - `ingredients`: Recipe ingredients
  - `yield`: Recipe yield
  - `targetFoodCost`: Target food cost percentage
  - `laborCost`: Labor cost percentage
  - `overheadCost`: Overhead cost percentage
  - `onChange`: Change callback
- **State**: 
  - `calculatedCosts`: Calculated cost values

## Data Flow

### Recipe List Page
1. User applies filters through `RecipeFilters`
2. Filtered recipes are passed to `RecipeList`
3. User toggles view mode with `ViewToggle`
4. User selects recipes and performs batch operations with `BatchOperations`
5. Pagination controls page display

### Recipe Detail Page
1. Recipe data is loaded and passed to `RecipeHeader` and `RecipeTabs`
2. User navigates between tabs in `RecipeTabs`
3. Each tab displays specific recipe information
4. User can perform actions through action buttons in `RecipeHeader`

### Recipe Form Page
1. Initial recipe data (if editing) is loaded into form components
2. User inputs basic information in `RecipeBasicInfoForm`
3. User manages ingredients in `IngredientManagement`
4. User manages steps in `StepManagement`
5. `CostCalculation` updates as ingredients and yield change
6. User saves or publishes recipe through form actions

## Component Interactions

### Recipe List to Detail Navigation
- User clicks on a recipe in `RecipeList`
- Application navigates to `RecipeDetailPage` with selected recipe ID
- `RecipeDetailPage` loads recipe data and renders components

### Detail to Edit Navigation
- User clicks Edit button in `RecipeHeader`
- Application navigates to `RecipeFormPage` with recipe ID
- `RecipeFormPage` loads recipe data into form components

### Form Submission
- User completes form and clicks Save/Publish
- Form data is validated
- If valid, data is submitted to API
- On success, user is redirected to `RecipeDetailPage` or `RecipeListPage`

## Related Documentation

- [Recipe Module Overview](./RECIPE-Overview.md)
- [Business Requirements](./RECIPE-Business-Requirements.md)
- [Product Requirements Document](./RECIPE-PRD.md)
- [Page Flow](./RECIPE-Page-Flow.md)
- [API Documentation](./RECIPE-API-Endpoints-Overview.md) 