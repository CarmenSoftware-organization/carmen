# ProductSelectionComponent - MOQ Tier Functionality

## Overview

The ProductSelectionComponent now includes MOQ (Minimum Order Quantity) tier functionality similar to the vendor portal, allowing users to specify multiple quantity breakpoints for the same product without pricing information. This enables template creators to define different MOQ requirements for vendors to quote against.

## Features Implemented

### 1. **Expandable Product Items**
- **Toggle Expansion**: Click chevron arrow next to product name to show/hide MOQ tiers
- **Visual Indicators**: Badge showing number of MOQ tiers when collapsed
- **Auto-initialization**: First MOQ tier automatically created when expanding

### 2. **MOQ Tier Management**
- **Add Tiers**: Plus button to add new MOQ tiers for each product
- **Remove Tiers**: X button to remove individual MOQ tiers  
- **Smart Defaults**: Next MOQ automatically calculated as last MOQ + 100
- **Individual Configuration**: Each tier has its own MOQ quantity, unit, and notes

### 3. **MOQ Tier Properties**
- **MOQ Quantity**: Numeric input for minimum order quantity
- **Unit Selection**: Dropdown matching product's available units
- **Notes**: Optional text field for tier-specific requirements
- **No Pricing**: Template focuses only on quantity requirements

## UI/UX Design

### Visual Layout
```
Product Name [v] [2 MOQ tiers] [X]
├── Category → Subcategory → Item Group  
├── Order Unit: [dropdown] (default: kg)
└── MOQ Tiers [+]
    ├── MOQ: [100] Unit: [kg] Notes: [Volume discount] [X]
    └── MOQ: [500] Unit: [kg] Notes: [Bulk order] [X]
```

### Color Coding
- **Green**: Selected products and indicators
- **Blue**: MOQ tier section with blue border and background
- **Red**: Remove buttons with hover states
- **Gray/Slate**: Secondary information and placeholders

## Technical Implementation

### Data Structures
```typescript
interface ProductMOQTier {
  id: string           // Unique identifier
  productId: string    // Reference to product
  moq: number         // Minimum order quantity
  unit: string        // Unit of measurement
  notes?: string      // Optional notes
}
```

### State Management
```typescript
// MOQ tiers per product
const [productMOQTiers, setProductMOQTiers] = useState<Record<string, ProductMOQTier[]>>({})

// Expanded products state
const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
```

### Key Functions
```typescript
// Add new MOQ tier
const addMOQTier = (productId: string) => {
  const newTier: ProductMOQTier = {
    id: `${productId}-${Date.now()}`,
    productId,
    moq: lastMOQ + 100,
    unit: getProductOrderUnit(productId),
    notes: ''
  }
}

// Remove MOQ tier
const removeMOQTier = (productId: string, tierIndex: number) => {
  // Filter out the tier at specified index
}

// Update tier properties
const updateMOQTier = (productId: string, tierIndex: number, field: keyof ProductMOQTier, value: any) => {
  // Update specific field of specific tier
}
```

## User Workflows

### Creating MOQ Tiers
1. Select products from categories or add individual products
2. Click chevron arrow next to product name to expand
3. First MOQ tier is automatically created (MOQ: 100)
4. Click + button to add additional tiers
5. Configure MOQ quantity, unit, and optional notes for each tier
6. Collapse/expand to save space

### Managing Existing Tiers
1. Expand product to show existing tiers
2. Modify MOQ quantities, units, or notes inline
3. Remove specific tiers with X button
4. Add more tiers as needed
5. Product badge shows total number of tiers

## Business Logic

### MOQ Calculation
- **First Tier**: Defaults to 100 units
- **Additional Tiers**: Previous MOQ + 100 (e.g., 100, 200, 300)
- **User Override**: Can manually adjust any MOQ quantity
- **Validation**: Should enforce ascending MOQ values (implementation ready)

### Unit Management
- **Inheritance**: MOQ tier units default to product's selected order unit
- **Independence**: Each tier can have different units if needed
- **Consistency**: Units are limited to product's available units

## Integration Points

### Template Generation
- MOQ tiers become part of template specification
- Vendors see quantity requirements without pricing
- Each tier represents a quote opportunity

### Excel Export
- MOQ tiers can be included in Excel templates
- Separate rows/columns for each quantity tier
- Notes field provides additional context

### Vendor Portal
- Template MOQ tiers guide vendor pricing structure  
- Vendors provide pricing for each specified quantity
- System matches template tiers to vendor submissions

## Similar Patterns

This follows the established MOQ pattern from:
- **Vendor Portal**: `addMOQTier()` / `removeMOQTier()` functions
- **MOQPricingComponent**: Multi-tier structure with add/remove
- **Staff Pricelist Form**: Tier management interface

## Benefits

1. **Flexible Requirements**: Multiple quantity options per product
2. **Vendor Guidance**: Clear quantity expectations for quotes  
3. **Comparison Ready**: Multiple tiers enable volume pricing comparison
4. **Template Reusability**: Save MOQ structures for future campaigns
5. **No Pricing Bias**: Quantity-only requirements keep pricing competitive

## Example Usage

A restaurant creating a meat purchasing template might specify:
- **Beef Ribeye**: 
  - Tier 1: 50 kg (weekly order)
  - Tier 2: 200 kg (monthly bulk)
  - Tier 3: 500 kg (quarterly contract)

This allows vendors to provide competitive pricing at different volume levels while giving the buyer flexibility in order quantities.