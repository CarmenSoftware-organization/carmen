# Recipe Management

> **Feature:** Operational Planning > Recipe Management
> **Pages:** 20
> **Status:** ✅ Production Ready

---

## Overview

Recipe Management provides comprehensive tools for creating, managing, and analyzing recipes in Carmen ERP. The feature includes advanced capabilities for ingredient tracking, cost calculation, fractional sales support (pizza slices, cake portions), multi-variant yield management, and recipe performance analytics.

### Key Features

1. **Recipe CRUD** - Complete recipe lifecycle management
2. **Advanced Filtering** - Quick filters and complex query builder
3. **Dual View Modes** - Grid (cards) and list (table) views
4. **Ingredient Management** - Products and sub-recipes with wastage tracking
5. **Yield Variants** - Multiple selling options per recipe (whole, half, slices)
6. **Fractional Sales** - Support for pizza slices, cake portions, bottled beverages
7. **Cost Analysis** - Real-time cost calculations with margin tracking
8. **Bulk Operations** - Multi-select actions for efficiency
9. **Category System** - Hierarchical organization with visual coding
10. **Cuisine Classification** - Cultural and regional categorization

---

## Page Structure

### 1. Recipe List
**Route:** `/operational-planning/recipe-management/recipes`

#### Features:
- **View Modes**:
  - Grid view (responsive cards)
  - List view (data table)
- **Search**: Full-text search across recipe names
- **Quick Filters**:
  - No Media
  - Has Media
  - Active (published)
  - Draft
- **Advanced Filters**:
  - Field-based query builder
  - Multiple conditions with operators
  - Supports: Name, Category, Cuisine, Status, Cost Range, Margin, Prep Time, Difficulty
- **Bulk Operations**:
  - Activate/Deactivate
  - Export Selected
  - Delete Selected
- **Actions**:
  - Import recipes
  - Export recipes
  - Create new recipe

#### Components:
- `RecipeList` - Main list container
- `RecipeCardCompact` - Grid view cards
- Advanced filter builder
- Bulk action toolbar

### 2. Recipe Detail
**Route:** `/operational-planning/recipe-management/recipes/[id]`

#### Features:
- Complete recipe information
- Ingredient list with costs
- Preparation steps with images
- Yield variants display
- Cost breakdown
- Allergen information
- Nutrition facts
- Print functionality

#### Sections:
- Header with image and basic info
- Ingredients tab
- Preparation steps tab
- Cost analysis tab
- Variants tab (if fractional sales enabled)
- Notes and special instructions

### 3. Create Recipe (New)
**Route:** `/operational-planning/recipe-management/recipes/create`

#### Form Sections:
**Basic Information**
- Recipe name (required)
- Description
- Category selection
- Cuisine type
- Status (draft/published)
- Image upload
- Tags

**Yield Management**
- Base yield quantity
- Yield unit
- Enable fractional sales checkbox
- Fractional sales type (pizza-slice, cake-slice, etc.)
- Yield variants configuration

**Ingredients**
- Add product ingredients
- Add sub-recipe ingredients
- Quantity and unit
- Wastage percentage
- Inventory tracking
- Cost calculation

**Preparation Steps**
- Step-by-step instructions
- Duration per step
- Temperature requirements
- Equipment needed
- Step images

**Pricing & Cost**
- Cost per portion (auto-calculated)
- Selling price
- Target food cost percentage
- Labor cost percentage
- Overhead percentage
- Recommended price calculation

**Additional Details**
- Preparation notes
- Special instructions
- Additional information
- Allergens (multi-select)
- Carbon footprint data

**Metadata**
- Preparation time
- Cooking time
- Total time
- Difficulty level
- Deduct from stock toggle

### 4. Edit Recipe
**Route:** `/operational-planning/recipe-management/recipes/[id]/edit`

Same form as Create Recipe, pre-populated with existing data.

### 5. Recipe Categories
**Route:** `/operational-planning/recipe-management/categories`

#### Features:
- Category list view
- Create new category
- Edit existing category
- Delete category
- Parent-child hierarchy
- Color coding
- Icon selection
- Recipe count per category

### 6. Cuisine Types
**Route:** `/operational-planning/recipe-management/cuisine-types`

#### Features:
- Cuisine type list
- Add, edit, delete cuisine types
- Cultural classification
- Region mapping
- Recipe association count

---

## Data Model

```typescript
interface Recipe {
  // Identity
  id: string;
  name: string;
  description: string;
  category: string;
  cuisine: string;
  status: 'draft' | 'published';
  image: string;

  // Yield Management
  yield: number;
  yieldUnit: string;

  // Advanced Fractional Sales Support
  yieldVariants: RecipeYieldVariant[];
  defaultVariantId: string;
  allowsFractionalSales: boolean;
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom';

  // Timing
  prepTime: number; // minutes
  cookTime: number;
  totalTime: number;
  difficulty: 'easy' | 'medium' | 'hard';

  // Pricing & Cost
  costPerPortion: number;
  sellingPrice: number;
  grossMargin: number; // percentage
  netPrice: number;
  grossPrice: number;
  totalCost: number;
  targetFoodCost: number; // target percentage
  laborCostPercentage: number;
  overheadPercentage: number;
  recommendedPrice: number;
  foodCostPercentage: number;
  grossProfit: number;

  // Environmental
  carbonFootprint: number;
  carbonFootprintSource?: string;

  // Operations
  hasMedia: boolean;
  deductFromStock: boolean;
  unitOfSale: string;

  // Components
  ingredients: Ingredient[];
  steps: PreparationStep[];

  // Documentation
  prepNotes: string;
  specialInstructions: string;
  additionalInfo: string;
  allergens: string[];
  tags: string[];

  // Audit
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

interface RecipeYieldVariant {
  id: string;
  name: string;
  unit: string; // 'slice', 'half', 'whole', 'glass', 'bottle'
  quantity: number;
  conversionRate: number; // Portion of base recipe (1.0 = whole, 0.125 = 1/8)
  sellingPrice: number;
  costPerUnit: number;
  isDefault: boolean;
  shelfLife?: number; // Hours after preparation/opening
  wastageRate?: number; // Expected waste percentage
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

interface Ingredient {
  id: string;
  name: string;
  type: 'product' | 'recipe'; // Sub-recipes supported
  quantity: number;
  unit: string;
  wastage: number; // Percentage
  inventoryQty: number;
  inventoryUnit: string;
  costPerUnit: number;
  totalCost: number; // Auto-calculated
  notes?: string;
}

interface PreparationStep {
  id: string;
  order: number;
  description: string;
  duration?: number; // minutes
  temperature?: number; // celsius/fahrenheit
  equipments: string[];
  image: string;
}
```

---

## Advanced Features

### Fractional Sales Management

Carmen ERP supports selling recipes in multiple variants, enabling operations like:

#### Pizza Slice Sales
```typescript
{
  allowsFractionalSales: true,
  fractionalSalesType: 'pizza-slice',
  yieldVariants: [
    {
      name: 'Pizza Slice',
      conversionRate: 0.125, // 1 slice = 1/8 pizza
      sellingPrice: 4.99,
      shelfLife: 4, // hours under heat lamp
      wastageRate: 5
    },
    {
      name: 'Half Pizza',
      conversionRate: 0.5,
      sellingPrice: 18.99
    },
    {
      name: 'Whole Pizza',
      conversionRate: 1.0,
      sellingPrice: 34.99,
      isDefault: true
    }
  ]
}
```

#### Cake Portion Sales
```typescript
{
  allowsFractionalSales: true,
  fractionalSalesType: 'cake-slice',
  yieldVariants: [
    {
      name: 'Cake Slice',
      conversionRate: 0.0625, // 1/16 of cake
      sellingPrice: 6.99,
      shelfLife: 72, // 3 days refrigerated
      minOrderQuantity: 1,
      maxOrderQuantity: 16
    },
    {
      name: 'Quarter Cake',
      conversionRate: 0.25,
      sellingPrice: 24.99
    },
    {
      name: 'Whole Cake',
      conversionRate: 1.0,
      sellingPrice: 89.99
    }
  ]
}
```

### Benefits:
- Flexible selling options
- Accurate cost tracking per variant
- Wastage management per variant
- Shelf life tracking
- Quantity limits for portion control

---

### Cost Calculation Engine

**Auto-Calculation Formula:**
```typescript
// Ingredient Cost
ingredientCost = (quantity * costPerUnit * (1 + wastage/100))

// Total Recipe Cost
totalCost = sum(all ingredientCosts)

// Cost Per Portion
costPerPortion = totalCost / yield

// For Yield Variants
variantCost = totalCost * conversionRate

// Gross Margin
grossMargin = ((sellingPrice - costPerPortion) / sellingPrice) * 100

// Food Cost Percentage
foodCostPercentage = (costPerPortion / sellingPrice) * 100

// Recommended Price
recommendedPrice = costPerPortion / (targetFoodCost / 100)

// Gross Profit
grossProfit = sellingPrice - costPerPortion
```

### Wastage Tracking
- Ingredient-level wastage percentages
- Variant-specific wastage rates
- Automatic cost adjustments
- Wastage reporting

---

### Advanced Filtering System

**Filter Operators:**
- `contains` - Partial text match
- `equals` - Exact match
- `notEquals` - Exclusion
- `greaterThan` - Numeric comparison
- `lessThan` - Numeric comparison
- `isEmpty` - NULL check
- `isNotEmpty` - NOT NULL check

**Filterable Fields:**
- Name, Category, Cuisine
- Status, Cost Range, Margin
- Preparation Time, Difficulty

**Filter Combinations:**
- Multiple conditions with AND logic
- Quick filters combinable with advanced
- Real-time filter result count

---

## API Endpoints

```http
GET /api/recipes
POST /api/recipes
GET /api/recipes/:id
PUT /api/recipes/:id
DELETE /api/recipes/:id

GET /api/recipes/search
GET /api/recipes/filter

GET /api/recipes/:id/cost-breakdown
GET /api/recipes/:id/variants

POST /api/recipes/bulk/activate
POST /api/recipes/bulk/deactivate
POST /api/recipes/bulk/delete
POST /api/recipes/bulk/export

GET /api/recipe-categories
POST /api/recipe-categories
PUT /api/recipe-categories/:id
DELETE /api/recipe-categories/:id

GET /api/cuisine-types
POST /api/cuisine-types
PUT /api/cuisine-types/:id
DELETE /api/cuisine-types/:id

POST /api/recipes/import
GET /api/recipes/export
```

---

## Business Rules

### Recipe Validation
1. **Name Required**: Recipe name must be unique within organization
2. **Yield Required**: Base yield quantity and unit mandatory
3. **At Least One Ingredient**: Recipe must have minimum one ingredient
4. **Cost Calculation**: Automatic when ingredients change
5. **Variant Rates**: Conversion rates must sum to ≤ base yield

### Fractional Sales Rules
1. **Default Variant**: One variant must be marked as default
2. **Conversion Rates**: Must be between 0 and 1.0
3. **Shelf Life Tracking**: Required for fractional sales types
4. **Quantity Limits**: Min/max quantities for portion control
5. **Wastage Rates**: Different rates per variant size

### Cost Management
1. **Target Food Cost**: Recommended 25-35% for most items
2. **Wastage Inclusion**: Wastage % added to ingredient costs
3. **Sub-Recipe Costs**: Nested recipe costs aggregated
4. **Price Recommendations**: Based on target food cost percentage
5. **Margin Alerts**: Warning when margins below target

### Inventory Integration
1. **Stock Deduction**: Flag determines if recipe affects inventory
2. **Ingredient Tracking**: Real-time availability checking
3. **Inventory Units**: Conversion between recipe and inventory units
4. **Wastage Accounting**: Included in stock calculations
5. **Sub-Recipe Cascading**: Ingredients from sub-recipes tracked

---

## Integration Points

### Inventory Management
- Real-time ingredient availability
- Stock deduction on recipe use
- Wastage tracking and reporting
- Inventory unit conversions

### POS Integration
- Recipe variants mapped to POS items
- Fractional sales synchronization
- Cost tracking per sale
- Popular item identification

### Menu Engineering
- Performance metrics per recipe
- Sales data analysis
- Profitability tracking
- Menu optimization recommendations

### Product Management
- Product catalog integration
- Supplier cost updates
- Product substitutions
- Allergen management

### Finance
- Cost accounting
- Margin analysis
- Profitability reporting
- Price optimization

---

## User Guide

### Creating a Recipe

1. Navigate to Recipe Management → Recipes
2. Click "New Recipe"
3. Fill basic information (name, description, category, cuisine)
4. Add ingredients:
   - Select from products or sub-recipes
   - Enter quantity and unit
   - Set wastage percentage
   - View auto-calculated cost
5. Configure yield:
   - Set base yield (e.g., 4 portions, 1 pizza)
   - Enable fractional sales if needed
   - Add yield variants (slices, halves, etc.)
6. Add preparation steps with images
7. Set pricing and targets
8. Add allergens and tags
9. Save as draft or publish

### Using Advanced Filters

1. Click "Advanced Filters" button
2. Click "Add Filter Condition"
3. Select field, operator, and value
4. Add multiple conditions as needed
5. Click "Apply Filters"
6. Clear with "Reset" or "Clear All"

### Bulk Operations

1. Switch to list view (optional)
2. Select recipes using checkboxes
3. Use bulk action toolbar:
   - Activate multiple recipes
   - Deactivate for temporary removal
   - Export selected to Excel/CSV
   - Delete multiple recipes
4. Confirm action

---

## Troubleshooting

### Issue: Cost Not Calculating
**Cause**: Missing ingredient cost data
**Solution**: Ensure all ingredients have `costPerUnit` values

### Issue: Fractional Sales Not Available
**Cause**: `allowsFractionalSales` flag not enabled
**Solution**: Edit recipe and enable fractional sales checkbox

### Issue: Filters Not Working
**Cause**: Invalid filter operator for field type
**Solution**: Use numeric operators only for numeric fields

### Issue: Bulk Actions Disabled
**Cause**: No recipes selected
**Solution**: Use checkboxes to select at least one recipe

---

## Performance Optimization

**Best Practices:**
- Use quick filters before advanced filters
- Filter results cached for 5 minutes
- Bulk operations paginated (max 100 at a time)
- Image thumbnails lazy-loaded
- Recipe calculations memoized

**Query Optimization:**
- Ingredient costs pre-calculated and cached
- Search uses indexed fields
- List view pagination (50 items per page)
- Grid view pagination (60 items per page)

---

## Future Enhancements

**Planned Features:**
- Recipe version history
- Recipe collaboration and comments
- AI-powered recipe suggestions
- Nutrition calculator integration
- Recipe scaling calculator
- Seasonal recipe tracking
- Recipe analytics dashboard
- Allergen cross-contamination warnings

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
