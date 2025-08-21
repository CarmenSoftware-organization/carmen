# Recipe Yield Variants Management Functional Specification

## Overview
The Recipe Yield Variants Management system enables comprehensive multi-yield recipe management supporting fractional product sales in hospitality environments. This component allows single recipes to have multiple selling configurations (whole, half, slice, portion) with independent pricing, conversion rates, and operational parameters.

## Component Architecture

### Core Components
- **Recipe Data Model**: Extended recipe structure with yield variant support
- **Yield Variant Engine**: Manages variant calculations and conversions
- **Fractional Sales Controller**: Handles fractional sales type configurations
- **Cost Calculation Service**: Calculates per-variant costs and pricing
- **Inventory Integration Layer**: Interfaces with stock management systems

### Data Architecture Pattern
- **Composition Pattern**: Recipe contains multiple yield variants as child objects
- **Strategy Pattern**: Different calculation strategies for various fractional sales types
- **Builder Pattern**: Constructs complex recipe structures with variants
- **Observer Pattern**: Notifies dependent systems when variants change

## Core Functionality

### Function 1: Recipe Variant Management
- **Purpose**: Manages multiple yield variants for a single base recipe
- **Inputs**:
  - Base recipe definition with ingredients and preparation steps
  - Array of yield variant configurations
  - Default variant designation
- **Processing**:
  1. Validates variant conversion rates sum logically
  2. Calculates per-variant costs based on base recipe
  3. Applies variant-specific wastage rates
  4. Sets selling prices and profit margins
  5. Configures shelf life and storage requirements
- **Outputs**:
  - Complete recipe structure with all variants
  - Validation results and warnings
  - Cost analysis per variant

### Function 2: Fractional Sales Type Configuration
- **Purpose**: Configures different types of fractional sales patterns
- **Inputs**:
  - Fractional sales type ('pizza-slice', 'cake-slice', 'bottle-glass', 'portion-control', 'custom')
  - Base recipe yield and unit
  - Desired selling configurations
- **Processing**:
  1. Applies appropriate conversion rate patterns
  2. Sets up standard variant names and units
  3. Configures wastage expectations by type
  4. Establishes min/max order quantities
- **Outputs**:
  - Configured yield variants matching sales type
  - Standard naming conventions
  - Operational parameter defaults

### Function 3: Cost and Pricing Calculation
- **Purpose**: Calculates accurate costs and suggested pricing for each variant
- **Inputs**:
  - Base recipe with ingredient costs
  - Variant conversion rates and wastage rates
  - Target profit margins and overhead percentages
- **Processing**:
  1. Calculates ingredient costs per variant portion
  2. Applies variant-specific wastage adjustments
  3. Includes labor costs proportional to preparation time
  4. Adds overhead and profit margin calculations
  5. Computes recommended selling prices
- **Outputs**:
  - Detailed cost breakdown per variant
  - Profit margin analysis
  - Competitive pricing recommendations

### Function 4: Inventory Integration
- **Purpose**: Integrates variant sales with inventory management systems
- **Inputs**:
  - Sale transactions with variant specifications
  - Current inventory levels
  - Recipe variant configurations
- **Processing**:
  1. Converts variant sales to base recipe consumption
  2. Applies conversion rates to ingredient deductions
  3. Tracks variant-specific wastage patterns
  4. Updates inventory levels accurately
- **Outputs**:
  - Inventory deduction calculations
  - Wastage tracking by variant
  - Stock level updates

## Data Models

### Enhanced Recipe Structure

```typescript
interface Recipe {
  id: string
  name: string
  description: string
  category: string
  cuisine: string
  status: 'draft' | 'published'
  
  // Base recipe properties
  yield: number
  yieldUnit: string
  
  // Enhanced fractional sales support
  yieldVariants: RecipeYieldVariant[]
  defaultVariantId: string
  allowsFractionalSales: boolean
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  
  // Timing and difficulty
  prepTime: number
  cookTime: number
  totalTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  
  // Cost and pricing (base recipe)
  costPerPortion: number
  sellingPrice: number
  grossMargin: number
  totalCost: number
  
  // Operational data
  ingredients: Ingredient[]
  steps: PreparationStep[]
  allergens: string[]
  tags: string[]
  
  // Financial calculations
  targetFoodCost: number
  laborCostPercentage: number
  overheadPercentage: number
  recommendedPrice: number
  foodCostPercentage: number
  grossProfit: number
}

interface RecipeYieldVariant {
  id: string
  name: string                    // Display name (e.g., "Pizza Slice", "Half Cake")
  unit: string                   // Selling unit (e.g., "slice", "half", "portion")
  quantity: number               // Number of units this variant represents
  conversionRate: number         // Portion of base recipe (1.0 = whole, 0.125 = 1/8)
  sellingPrice: number          // Price for this variant
  costPerUnit: number           // Cost to produce this variant
  isDefault: boolean            // Whether this is the default selling option
  
  // Operational parameters
  shelfLife?: number            // Hours after preparation/opening
  wastageRate?: number          // Expected waste percentage for this variant
  minOrderQuantity?: number     // Minimum units that can be ordered
  maxOrderQuantity?: number     // Maximum units that can be ordered
}

interface Ingredient {
  id: string
  name: string
  type: 'product' | 'recipe'    // Product or sub-recipe
  quantity: number              // Amount needed for base recipe
  unit: string                  // Unit of measurement
  wastage: number              // Wastage percentage for this ingredient
  inventoryQty: number         // Current stock level
  inventoryUnit: string        // Stock keeping unit
  costPerUnit: number          // Cost per unit
  totalCost: number            // Total cost for recipe quantity
  notes?: string               // Special handling notes
}

interface PreparationStep {
  id: string
  order: number
  description: string
  duration?: number            // Time in minutes
  temperature?: number         // Temperature in Celsius
  equipments: string[]         // Required equipment
  image: string               // Step illustration
}
```

### Fractional Sales Type Templates

```typescript
interface FractionalSalesTemplate {
  type: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  defaultVariants: {
    name: string
    unit: string
    conversionRate: number
    wastageRate: number
    shelfLifeHours: number
  }[]
  operationalDefaults: {
    cuttingInstructions: string
    storageRequirements: string
    servingGuidelines: string
  }
}
```

## Integration Points

### POS System Integration
- **Variant Selection**: POS systems can select specific yield variants for orders
- **Price Sync**: Automatic synchronization of variant pricing to POS
- **Conversion Tracking**: Track which variants are sold and in what quantities

### Inventory Management Integration  
- **Stock Deduction**: Convert variant sales to base recipe ingredient consumption
- **Wastage Tracking**: Monitor variant-specific wastage patterns
- **Yield Planning**: Use variant data for production planning

### Financial System Integration
- **Cost Accounting**: Provide accurate cost data per variant sold
- **Profit Analysis**: Track profitability by recipe variant
- **Pricing Updates**: Sync cost changes to update variant pricing

### Recipe Management Interface
- **Variant Configuration**: UI for creating and editing yield variants
- **Cost Calculator**: Real-time cost and pricing calculations
- **Template Application**: Quick setup using fractional sales templates

## Performance Requirements

### Data Processing
- **Recipe Loading**: Load complete recipe with variants in < 100ms
- **Cost Calculations**: Update all variant costs in < 200ms when ingredients change
- **Variant Creation**: Create new variants with full calculations in < 300ms

### Storage Optimization
- **Data Normalization**: Efficient storage of variant data without duplication
- **Indexing Strategy**: Optimize queries for recipes by fractional sales type
- **Caching Layer**: Cache frequently accessed recipe variants in memory

### Scalability
- **Recipe Volume**: Support 10,000+ recipes with multiple variants each
- **Concurrent Access**: Handle 500+ concurrent users managing recipes
- **Calculation Load**: Process 1,000+ cost calculations per minute

## Error Handling

### Validation Rules

#### Conversion Rate Validation
- **Total Coverage**: All variants should reasonably cover the base recipe
- **Logical Rates**: Conversion rates must be between 0.001 and 1.0
- **Uniqueness**: No two variants should have identical conversion rates

#### Cost Calculation Validation
- **Positive Values**: All costs and prices must be positive numbers
- **Margin Validation**: Ensure selling prices exceed costs by minimum margin
- **Ingredient Availability**: Verify all ingredients exist and have valid costs

#### Operational Parameter Validation
- **Shelf Life Limits**: Shelf life must be reasonable for food safety
- **Quantity Limits**: Min/max order quantities must be logical
- **Wastage Rates**: Wastage percentages should be within expected ranges (0-50%)

### Error Recovery

#### Data Consistency
- **Transactional Updates**: Ensure all variant updates complete successfully or rollback
- **Dependency Checks**: Verify no active POS mappings before deleting variants
- **Backup Defaults**: Maintain valid default variants if others become invalid

#### User Experience
- **Progressive Validation**: Validate fields as users input data
- **Clear Error Messages**: Provide specific, actionable error descriptions  
- **Auto-correction**: Suggest corrections for common input errors

## Business Logic Rules

### Variant Creation Rules
1. **Default Variant Required**: Every recipe must have exactly one default variant
2. **Naming Conventions**: Variant names should be descriptive and unique within recipe
3. **Logical Sequencing**: Variants should progress logically (slice < quarter < half < whole)
4. **Price Relationships**: Generally, per-unit pricing should decrease with larger variants

### Fractional Sales Type Rules

#### Pizza-Slice Pattern
- **Standard Variants**: Slice (1/8), Half (1/2), Whole (1)
- **Cutting Instructions**: "Cut into 8 equal slices when selling by slice"
- **Shelf Life**: Slices 4 hours, whole pizza 1-2 hours optimal
- **Wastage Expectations**: Whole < Half < Slice (due to cutting waste)

#### Cake-Slice Pattern
- **Standard Variants**: Slice (1/16), Quarter (1/4), Half (1/2), Whole (1)
- **Cutting Instructions**: "Cut into 16 equal slices for portion control"
- **Shelf Life**: Uncut portions last longer than pre-cut
- **Storage**: Refrigeration required for optimal shelf life

#### Portion-Control Pattern
- **Standard Variants**: Single portion (recipe-defined), Double portion
- **Consistency Focus**: Exact portion sizes for cost control
- **Service Standards**: Specific plating and presentation requirements

### Cost Calculation Rules
1. **Ingredient Scaling**: Scale ingredient costs by exact conversion rate
2. **Wastage Application**: Apply wastage after scaling to variant size
3. **Labor Allocation**: Distribute labor costs proportionally to complexity
4. **Overhead Distribution**: Apply overhead as percentage of total costs

## Quality Assurance

### Testing Requirements
- **Unit Tests**: Validate all cost calculations and conversions
- **Integration Tests**: Test with actual recipe and inventory data
- **Performance Tests**: Verify response times under load
- **User Acceptance Tests**: Validate business workflows with stakeholders

### Data Integrity Checks
- **Audit Trails**: Log all changes to recipes and variants with timestamps
- **Consistency Monitoring**: Regular checks for data integrity across systems
- **Backup Validation**: Ensure recipe data can be restored completely

### Compliance Verification
- **Food Safety**: Ensure shelf life and storage requirements meet regulations
- **Nutritional Accuracy**: Validate nutritional information scales correctly
- **Cost Accounting**: Verify cost calculations meet accounting standards