# Product Management Module - UI Implementation PRD

## 1. Introduction

### 1.1 Purpose
This document outlines the UI implementation requirements for the Product Management module based on the current codebase. It serves as a guide for maintaining consistency and understanding the existing features.

### 1.2 Scope
- Product listing and management
- Product search and filtering
- Product creation and editing
- Import/Export functionality
- Reporting capabilities
- Unit management (Order, Ingredient, Stock Count)

## 2. UI Components

### 2.1 Product List Page
- **Component**: `ProductList`
- **Location**: `/product-management/products`

#### 2.1.1 Header Actions
- Add Product button with Plus icon
- Import button with Upload icon
- Print button with Printer icon

#### 2.1.2 Search and Filter Bar
- Search input with Search icon
- More Filters button with Filter icon
- Sort button with ArrowUpDown icon

#### 2.1.3 Product Grid
- Checkbox column for multi-select
- Columns:
  - Name (Product name and code)
  - Category
  - Subcategory
  - Item Group
  - Base Price
  - Status
  - Actions

#### 2.1.4 Action Menu
- View details
- Edit product
- Additional actions (MoreVertical menu)

### 2.2 Product Detail View
- **Component**: `ProductDetail`
- **Location**: `/product-management/products/[id]`

#### 2.2.1 Header Section
- Product name and code
- Status badge
- Action buttons:
  - Edit
  - Delete
  - Clone
  - Back to list

#### 2.2.2 Tab Navigation
- **General Info Tab**
  - Basic product information
  - Description
  - Categories
  - Status settings
  - Images and attachments

- **Inventory Tab**
  - Stock levels
  - Units of measure
  - Storage locations
  - Minimum/maximum levels
  - Reorder points
  - Stock movements history

- **Order Unit Tab**
  - Purchase units
  - Conversion rates
  - Supplier packaging
  - Order multiples
  - Default order quantities

- **Counting Unit Tab**
  - Base counting units
  - Pack/bundle definitions
  - Counting multiples
  - Default counting unit

- **Stock Count Tab**
  - Count frequency
  - Count method
  - Variance thresholds
  - Count locations

#### 2.2.3 Tab Content Layout
- **Common Elements**
  - Section headers
  - Save/Cancel buttons
  - Form validation
  - Change tracking
  - Required field indicators

- **Data Entry Forms**
  - Input validation
  - Auto-save functionality
  - Field dependencies
  - Dynamic updates
  - Error handling

#### 2.2.4 Tab-Specific Features

##### General Info
```typescript
interface GeneralInfo {
  name: string
  code: string
  description: string
  localDescription?: string
  category: {
    main: string
    sub: string
    group: string
  }
  status: 'active' | 'inactive' | 'discontinued'
  images: {
    main: string
    additional: string[]
  }
  attachments: {
    id: string
    name: string
    type: string
    url: string
  }[]
  attributes: {
    size: string
    color: string
    weight: number
    dimensions: {
      length: number
      width: number
      height: number
    }
    shelfLife: number
    storageInstructions: string
  }
}
```

##### Inventory
```typescript
interface InventoryInfo {
  stockLevels: {
    locationId: string
    quantity: number
    unit: string
    value: number
  }[]
  stockSettings: {
    minLevel: number
    maxLevel: number
    reorderPoint: number
    safetyStock: number
  }
  movements: {
    date: string
    type: 'in' | 'out'
    quantity: number
    reference: string
  }[]
}
```

##### Order Units
```typescript
interface OrderUnit {
  orderUnit: string
  factor: number
  description: string
  isDefault: boolean
  isInverse: boolean
}
```

##### Unit Management
```typescript
interface UnitManagement {
  // Base Unit Configuration
  baseUnit: {
    id: string
    name: string
    symbol: string
    type: 'weight' | 'volume' | 'quantity' | 'length' | 'area'
    isBase: true
    precision: number
  }

  // Unit Groups
  unitGroups: {
    inventory: {
      defaultUnit: string
      allowedUnits: string[]
      conversions: UnitConversion[]
    }
    purchase: {
      defaultUnit: string
      allowedUnits: string[]
      conversions: UnitConversion[]
      packagingUnits: {
        unitId: string
        quantity: number
        isDefault: boolean
      }[]
    }
    counting: {
      defaultUnit: string
      allowedUnits: string[]
      conversions: UnitConversion[]
      countingFactor: number
      baseQuantity: number
    }
  }

  // Conversion Rules
  conversions: UnitConversion[]
}

interface UnitConversion {
  fromUnit: string
  toUnit: string
  factor: number
  offset?: number
  isReversible: boolean
  formula?: string
  lastUpdated: string
  updatedBy: string
  notes?: string
}
```

#### Unit Management Features

##### 1. Base Unit Configuration
- **Base Unit Selection**
  - Single source of truth for measurements
  - Cannot be changed once transactions exist
  - Determines precision for all calculations
  - Supports standard unit types:
    - Weight (g, kg, lb, oz)
    - Volume (ml, l, gal)
    - Quantity (pcs, doz)
    - Length (mm, cm, m)
    - Area (cm², m²)

##### 2. Unit Groups Management

###### 2.1 Inventory Units
- **Purpose**: Stock keeping and movement tracking
- **Features**:
  - Default inventory unit selection
  - Stock level display units
  - Movement tracking units
  - Minimum stock level units
  - Maximum stock level units
  - Reorder point units

###### 2.2 Purchase Units
- **Purpose**: Procurement and receiving
- **Features**:
  - Supplier packaging units
  - Case/carton definitions
  - Minimum order quantities
  - Standard order multiples
  - Purchase cost units
  - Receiving units

###### 2.3 Recipe Units
- **Purpose**: Recipe creation and costing
- **Features**:
  - Recipe yield units
  - Ingredient units
  - Preparation units
  - Portion size units
  - Batch conversion units
  - Display units for BOMs

###### 2.4 Counting Units
- **Purpose**: Define how products can be counted and packaged
- **Features**:
  - Base counting unit definition (e.g., piece, each)
  - Pack/bundle unit definitions
  - Standard counting multiples
  - Count conversion factors
  - **Common Units**:
    - Piece (pc)
    - Each (ea)
    - Dozen (doz)
    - Box
    - Pack
    - Set
    - Bundle
    - Case
    - Container
  - **Counting Rules**:
    - Base unit must be defined (piece/each)
    - Whole number conversions only
    - No fractional quantities allowed
    - Standard multiples (e.g., 1 dozen = 12 pieces)
    - Pack/set definitions must be consistent
  - **Validation**:
    - Integer quantity validation
    - Pack size validation
    - Bundle size validation
    - Set completeness validation
    - Conversion factor validation
  - **Display**:
    - Quantity format settings
    - Unit abbreviation rules
    - Plural form handling
    - Zero quantity handling
    - Pack/bundle display format

###### 2.5 Conversion Rules

###### 3.1 Conversion Types
- **Linear Conversions**
  ```typescript
  // Example: kg to g
  factor = 1000
  toValue = fromValue * factor
  ```

- **Offset Conversions**
  ```typescript
  // Example: °C to °F
  factor = 1.8
  offset = 32
  toValue = (fromValue * factor) + offset
  ```

- **Custom Formula Conversions**
  ```typescript
  // Example: Complex conversions
  formula = "customFormula(fromValue, parameters)"
  toValue = eval(formula)
  ```

###### 3.2 Conversion Validation
- Circular reference prevention
- Precision handling
- Rounding rules
- Error margins
- Conversion limits

###### 3.3 Conversion Features
- Bidirectional conversion support
- Transitive conversion paths
- Conversion history tracking
- Audit trail for changes
- Validation rules

##### 4. UI Components

###### 4.1 Unit Selection
```typescript
interface UnitSelector {
  groupType: 'inventory' | 'purchase' | 'recipe' | 'counting'
  currentUnit: string
  allowedUnits: string[]
  onUnitChange: (newUnit: string) => void
  showConversion: boolean
  disabled?: boolean
}
```

###### 4.2 Conversion Calculator
```typescript
interface ConversionCalculator {
  fromUnit: string
  toUnit: string
  value: number
  precision: number
  showWorkings: boolean
  onCalculate: (result: number) => void
}
```

###### 4.3 Unit Group Editor
```typescript
interface UnitGroupEditor {
  groupType: keyof UnitManagement['unitGroups']
  units: string[]
  conversions: UnitConversion[]
  onUpdate: (updates: Partial<UnitGroup>) => void
  validationRules: ValidationRule[]
}
```

##### 5. Validation Rules
- **Base Unit Rules**
  - Must be defined before other units
  - Cannot be changed if transactions exist
  - Must have appropriate precision

- **Conversion Rules**
  - No circular references
  - All conversions must be positive
  - Bidirectional conversions must be inverse
  - Custom formulas must be validated

- **Group Rules**
  - Each group must have a default unit
  - Default unit must have conversions
  - Purchase units must support packaging
  - Recipe units must support scaling

#### 2.2.5 State Management
- Form state tracking
- Unsaved changes warning
- Auto-save functionality
- Tab state persistence
- Loading states per tab

#### 2.2.6 Validation Rules
- Required fields by tab
- Cross-field validations
- Business rule validation
- Unit conversion validation
- Price and cost validations

#### 2.2.7 Tab Interactions
- Tab switching behavior
- Data persistence between tabs
- Loading states
- Error handling
- Success notifications

### 2.3 Data Structure
```typescript
interface Product {
  id: string
  productCode: string
  name: string
  description?: string
  categoryId: string
  subCategoryId: string
  itemGroup: string
  basePrice: number
  currency: string
  isActive: boolean
  primaryInventoryUnitId: string
}
```

### 2.2 Unit Management

#### 2.2.1 Stock Count Units
- **Component**: `StockCount`
- **Purpose**: Configure units and rules for physical inventory counting

##### Features
1. Settings Configuration
   - Base counting unit display (inherited from product)
   - Count frequency selection (daily/weekly/monthly/quarterly)
   - Warning threshold percentage
   - Error threshold percentage
   - Double count requirement toggle
   - Approval requirement toggle

2. Pack/Bundle Definitions
   - Pack unit selection (e.g., Sack, Box, Bag)
   - Quantity in base units
   - Base unit equivalent display
   - Add/remove pack definitions
   - Real-time conversion preview

3. Count History Display
   - Date of count
   - System quantity
   - Counted quantity
   - Variance percentage with color coding:
     - Green: No variance
     - Yellow: Within warning threshold
     - Orange: Within error threshold
     - Red: Exceeds error threshold
   - Status badges (Completed/Pending/Error)
   - Notes for significant variances

##### UI Requirements
1. Display Rules
   - All quantities must display 3 decimal places
   - Variance percentages must display 2 decimal places
   - Pack definitions must be sortable by unit name
   - Warning/error thresholds must be 0-100%
   - Count history must be sortable by date and status

2. Validation Rules
   - Pack quantities must be greater than 0
   - Warning threshold must be less than error threshold
   - Base unit must match product's inventory unit
   - Duplicate pack units not allowed
   - Pack definitions must have both unit and quantity

3. State Management
   - Settings changes must be saved explicitly
   - Pack definition changes must be confirmed
   - Count history must be paginated
   - Filter state must persist during session
   - Sort order must persist during session

4. Error Handling
   - Display validation errors inline
   - Show warning for threshold conflicts
   - Confirm before deleting pack definitions
   - Prevent saving invalid configurations
   - Show error for duplicate pack units

5. Performance Requirements
   - Pack conversion calculations must be real-time
   - Count history loading must be paginated
   - Settings updates must be immediate
   - Pack definition updates must be optimized
   - Status changes must update immediately

## 3. Features

### 3.1 Product Search
- Real-time search functionality
- Search across product fields
- Reset to first page on search
- Debounced search implementation

### 3.2 Pagination
- Page size: 10 items
- Current page tracking
- Total pages calculation
- Page navigation controls

### 3.3 Data Management
- Loading state handling
- Error state management
- Empty state display
- Data fetching with filters

### 3.4 Actions
- Add new product
- Import products
- Generate reports
- View product details
- Edit existing products

### 3.5 View Mode
- **PRD_VM_001**: Display comprehensive product information in a tabbed interface:
  - Basic Info Tab
    - Product code and name
    - Description
    - Category hierarchy
    - Status indicator
    - Creation/modification info
  - Inventory Tab
    - Current stock levels
    - Minimum/maximum levels
    - Reorder points
    - Stock value
    - Location breakdown
  - Order Unit Tab
    - Purchase units
    - Conversion rates
    - Supplier packaging
    - Order multiples
    - Default order quantity
  - Counting Unit Tab
    - Base counting unit
    - Pack/bundle definitions
    - Counting multiples
    - Default counting unit
  - Stock Count Tab
    - Last count date
    - Count frequency
    - Variance history
    - Count schedules

- **PRD_VM_002**: Action buttons
  - Edit
  - Copy
  - Print
  - Export
  - Archive/Unarchive
  - Status change

- **PRD_VM_003**: Related information panels
  - Recent transactions
  - Price history
  - Supplier history
  - Attached documents
  - Audit trail

### 3.6 Edit/Add Mode
- **PRD_ED_001**: Basic Info Tab
  - Required fields:
    - Product code (auto-generated for new)
    - Product name
    - Primary category
    - Base unit
    - Status
  - Optional fields:
    - Description
    - Sub-category
    - Product group
    - Brand
    - Model
    - Manufacturer
    - Local description
    - Remarks

- **PRD_ED_002**: Inventory Tab
  - Stock control settings:
    - Track inventory (toggle)
    - Minimum level
    - Maximum level
    - Reorder point
    - Safety stock
    - ABC classification
  - Location settings:
    - Default location
    - Allowed locations
    - Storage conditions

- **PRD_ED_003**: Order Unit Tab
  - Purchase unit configuration:
    - Default purchase unit
    - Order multiples
    - Minimum order quantity
    - Lead time
    - Default supplier
  - Packaging information:
    - Package dimensions
    - Package weight
    - Units per package
    - Barcode/SKU

- **PRD_ED_004**: Counting Unit Tab
  - Base counting unit setup:
    - Base unit selection
    - Conversion factor
    - Count precision
  - Pack/bundle setup:
    - Pack sizes
    - Bundle definitions
    - Display format
    - Validation rules

- **PRD_ED_005**: Stock Count Tab
  - Count settings:
    - Count frequency
    - Count method
    - Variance thresholds
    - Count locations
  - Validation rules:
    - Count tolerances
    - Approval requirements
    - Documentation needs

- **PRD_ED_006**: Environmental Impact Tab
  - Impact metrics:
    - Carbon footprint
    - Energy efficiency
    - Water usage
    - Waste generation
  - Certifications:
    - Environmental certificates
    - Compliance documents
    - Audit requirements

- **PRD_ED_007**: Form Controls
  - Save (validates all required fields)
  - Save and New
  - Cancel
  - Reset
  - Preview
  - Save as Template

- **PRD_ED_008**: Validation Rules
  - Required field validation
  - Format validation
  - Business rule validation
  - Cross-field validation
  - Unit conversion validation

- **PRD_ED_009**: Auto-save functionality
  - Periodic auto-save
  - Draft versioning
  - Recovery options
  - Change tracking

- **PRD_ED_010**: Attachment Management
  - Document upload
  - Image upload
  - File type validation
  - Size limitations
  - Preview capability

### 3.7 System Calculations Rules

### 3.8 Unit Conversion Rules

### 3.9 Price List Rules

### 3.10 Edit/Add Mode (PRD_ED_001 to PRD_ED_010)
- Required and optional fields for each tab:
  - Basic Info Tab
  - Inventory Tab
  - Order Unit Tab
  - Counting Unit Tab
  - Stock Count Tab
- Form controls and validation rules
- Auto-save functionality
- Attachment management

### 3.9 Unit Management Rules

#### 3.9.1 Common Unit Management Features
- **PRD_074**: Unit List Display:
  - **PRD_074.1**: Display units in a table format with columns for unit code, description, factor, default status, direction, and conversion
  - **PRD_074.2**: Show conversion preview in real-time as factors are modified
  - **PRD_074.3**: Support inline editing in edit mode
  - **PRD_074.4**: Provide add/delete capabilities in edit mode
  - **PRD_074.5**: Maintain consistent layout across all unit types

- **PRD_075**: Unit Conversion Rules:
  - **PRD_075.1**: Support bi-directional conversion with toggle
  - **PRD_075.2**: Display conversion formula: "1 UNIT = X BASE_UNIT" or "1 BASE_UNIT = X UNIT"
  - **PRD_075.3**: Show calculation formula: "Qty × Factor"
  - **PRD_075.4**: Update conversion display in real-time
  - **PRD_075.5**: Validate conversion factors to be non-zero positive numbers

- **PRD_076**: Default Unit Management:
  - **PRD_076.1**: Allow only one default unit per type
  - **PRD_076.2**: Automatically update other units' default status
  - **PRD_076.3**: Require at least one default unit
  - **PRD_076.4**: Prevent deletion of default unit
  - **PRD_076.5**: Show clear visual indication of default unit

#### 3.9.2 Order Unit Specific Rules
- **PRD_077**: Order Unit Configuration:
  - **PRD_077.1**: Base unit must match product's inventory unit
  - **PRD_077.2**: Support common order units (BOX, CASE, PALLET)
  - **PRD_077.3**: Allow order-specific conversion factors
  - **PRD_077.4**: Support order rules (minimum quantity, multiples)
  - **PRD_077.5**: Validate against inventory unit compatibility

#### 3.9.3 Ingredient Unit Specific Rules
- **PRD_078**: Ingredient Unit Configuration:
  - **PRD_078.1**: Use KG as standard base unit
  - **PRD_078.2**: Support common weight units (G, KG, LB, OZ)
  - **PRD_078.3**: Maintain high precision for recipe calculations
  - **PRD_078.4**: Support small quantity conversions
  - **PRD_078.5**: Validate recipe compatibility

#### 3.9.4 UI Components and Interactions
- **PRD_079**: Edit Mode Controls:
  - **PRD_079.1**: Show "Add Unit" button only in edit mode
  - **PRD_079.2**: Enable inline editing of description and factor
  - **PRD_079.3**: Show save/cancel icons for new unit addition
  - **PRD_079.4**: Show delete icon for existing units
  - **PRD_079.5**: Disable editing of base unit properties

- **PRD_080**: Visual Feedback:
  - **PRD_080.1**: Highlight active/selected rows
  - **PRD_080.2**: Show validation errors inline
  - **PRD_080.3**: Provide visual feedback for direction changes
  - **PRD_080.4**: Indicate required fields
  - **PRD_080.5**: Show loading states during operations

#### 3.9.5 Validation Rules
- **PRD_081**: Input Validation:
  - **PRD_081.1**: Validate unit code uniqueness
  - **PRD_081.2**: Require non-empty description
  - **PRD_081.3**: Validate conversion factor range (> 0)
  - **PRD_081.4**: Prevent duplicate default units
  - **PRD_081.5**: Validate compatibility with base unit

#### 3.9.6 Data Format Rules
- **PRD_082**: Number Formatting:
  - **PRD_082.1**: Display conversion factors with 5 decimal places
  - **PRD_082.2**: Right-align numeric values
  - **PRD_082.3**: Use consistent unit symbols
  - **PRD_082.4**: Format calculations with appropriate precision
  - **PRD_082.5**: Support regional number formats

#### 3.9.7 Order Unit Management
- **PRD_083**: Order Unit Features:
  - **PRD_083.1**: Support minimum order quantity field
  - **PRD_083.2**: Implement order multiple rules
  - **PRD_083.3**: Display supplier packaging information
  - **PRD_083.4**: Show cost implications of unit changes
  - **PRD_083.5**: Support bulk order conversions

- **PRD_084**: Order Unit Validation:
  - **PRD_084.1**: Validate against inventory unit compatibility
  - **PRD_084.2**: Enforce minimum order quantities
  - **PRD_084.3**: Check order multiple compliance
  - **PRD_084.4**: Verify supplier packaging constraints
  - **PRD_084.5**: Validate cost calculations

#### 3.9.8 Ingredient Unit Management
- **PRD_085**: Ingredient Unit Features:
  - **PRD_085.1**: Support high-precision conversions
  - **PRD_085.2**: Display recipe compatibility
  - **PRD_085.3**: Show yield calculations
  - **PRD_085.4**: Support batch scaling
  - **PRD_085.5**: Handle fractional quantities

- **PRD_086**: Ingredient Unit Validation:
  - **PRD_086.1**: Validate recipe unit compatibility
  - **PRD_086.2**: Check precision requirements
  - **PRD_086.3**: Verify scaling calculations
  - **PRD_086.4**: Enforce minimum quantity rules
  - **PRD_086.5**: Validate nutritional calculations

#### 3.9.9 Stock Count Unit Management
- **PRD_089**: Stock Count Unit Features:
  - **PRD_089.1**: Support base counting unit definition
  - **PRD_089.2**: Configure count precision settings
  - **PRD_089.3**: Define pack/bundle definitions
  - **PRD_089.4**: Track count history with variances
  - **PRD_089.5**: Support multiple counting frequencies

- **PRD_090**: Stock Count Unit Validation:
  - **PRD_090.1**: Validate against base unit compatibility
  - **PRD_090.2**: Enforce precision requirements
  - **PRD_090.3**: Check pack definition validity
  - **PRD_090.4**: Verify variance calculations
  - **PRD_090.5**: Validate count frequency settings

#### 3.9.10 Unit Management Error Handling
- **PRD_087**: Error States:
  - **PRD_087.1**: Display validation errors inline
  - **PRD_087.2**: Show conversion calculation errors
  - **PRD_087.3**: Indicate incompatible unit combinations
  - **PRD_087.4**: Highlight rule violations
  - **PRD_087.5**: Provide error resolution guidance

#### 3.9.11 Unit Management Performance
- **PRD_088**: Performance Requirements:
  - **PRD_088.1**: Real-time conversion updates
  - **PRD_088.2**: Efficient validation checks
  - **PRD_088.3**: Optimized calculation handling
  - **PRD_088.4**: Responsive UI updates
  - **PRD_088.5**: Cached conversion rates

## 4. UI States

### 4.1 Loading State
- Display loading indicator
- Disable interactions
- Maintain layout structure

### 4.2 Error State
- Show error message
- Error details display
- Recovery options

### 4.3 Empty State
- No products message
- Action suggestions
- Maintain consistent layout

### 4.4 Interactive States
- Hover effects on rows
- Active state indicators
- Selected state styling
- Disabled state handling

## 5. Component Integration

### 5.1 Shared Components
- Table components from @/components/ui/table
- Button from @/components/ui/button
- Badge from @/components/ui/badge
- Input from @/components/ui/input
- Checkbox from @/components/ui/checkbox
- StatusBadge from @/components/ui/custom-status-badge

### 5.2 Icons
- Search
- Filter
- ArrowUpDown
- Pencil
- MoreVertical
- Eye
- Plus
- Printer
- Upload

## 6. Navigation

### 6.1 Route Structure
- List view: /product-management/products
- New product: /product-management/products/new
- Import: /product-management/products/import
- Reports: /product-management/reports/products
- Details: /product-management/products/[id]

### 6.2 Navigation Handling
- Router integration
- Back navigation
- Route parameters
- Query parameters

## 7. Performance Considerations

### 7.1 Data Loading
- Paginated data fetching
- Search query optimization
- Loading state management
- Error boundary implementation

### 7.2 Interaction Optimization
- Debounced search
- Optimized re-renders
- Efficient state updates
- Memoized callbacks

## 8. Accessibility

### 8.1 Requirements
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Color contrast

### 8.2 Interactive Elements
- Button roles
- Table semantics
- Form controls
- Status indicators

## 9. Styling

### 9.1 Layout
- Responsive design
- Grid structure
- Spacing system
- Component alignment

### 9.2 Theme Integration
- Color schemes
- Typography
- Shadows
- Border styles
- Icons

## 10. Error Handling

### 10.1 User Feedback
- Error messages
- Loading indicators
- Success notifications
- Warning alerts

### 10.2 Recovery
- Retry mechanisms
- Fallback content
- Error boundaries
- State recovery

## 11. Future Considerations

### 11.1 Enhancements
- Advanced filtering
- Bulk actions
- Custom views
- Export formats
- Search optimization

### 11.2 Integration
- API versioning
- State management
- Cache strategy
- Real-time updates

### 11.3 Business Objectives
- Maintain comprehensive product master data
- Manage product categorization and hierarchies
- Control product pricing and costs
- Support multi-unit conversions
- Enable efficient product search and filtering
- Integrate with inventory and procurement systems

### 11.4 Module Overview
The Product Management module consists of several key components:
1. Product Master Management
2. Category Hierarchy Management
3. Unit Conversion System
4. Pricing Management
5. Product Variants Management
6. Integration Management

### 11.5 UI Rules
- **PRD_021**: Product list must display key information (code, name, category, unit, status)
- **PRD_022**: Item grid must support inline editing for base prices and conversion rates
- **PRD_023**: Cost and price information must update in real-time as values are modified
- **PRD_024**: Status changes must be reflected immediately in the UI
- **PRD_025**: Validation errors must be displayed clearly next to relevant fields
- **PRD_026**: Required fields must be visually marked with asterisk (*)
- **PRD_027**: Currency fields must display appropriate currency symbols
- **PRD_028**: All dates must be displayed using system's regional format with UTC offset (e.g., "2024-03-20 +07:00")
- **PRD_029**: Action buttons must be disabled based on user permissions
- **PRD_030**: Print preview must match final product document format
- **PRD_031**: All monetary amounts must be displayed with 2 decimal places
- **PRD_032**: All quantities must be displayed with 3 decimal places
- **PRD_033**: Conversion rates must be displayed with 5 decimal places
- **PRD_034**: All numeric values must be right-aligned
- **PRD_035**: All numeric values must use system's regional numeric format
- **PRD_036**: Date inputs must enforce regional format validation
- **PRD_037**: Date/time values must be stored as timestamptz in UTC
- **PRD_038**: Time zone conversions must respect daylight saving rules
- **PRD_039**: Calendar controls must indicate working days and holidays
- **PRD_040**: Date range validations must consider time zone differences

### 3.9 Stock Count Unit Requirements

#### Base Unit Configuration (PRD_089)
- **Base Unit Definition**:
  - Display the product's base inventory unit
  - Allow setting count precision (1, 0.1, 0.01, 0.001)
  - Show base unit label with proper capitalization
  - Disable editing in view mode

#### Pack/Bundle Definitions (PRD_090)
- **Pack Unit Management**:
  - Support multiple pack units per product
  - Allow adding/editing/removing pack definitions
  - Display conversion calculations
  - Show base unit equivalents

- **Pack Unit Fields**:
  - Pack Unit (e.g., BOX, CASE)
  - Quantity in base unit
  - Description
  - Default flag
  - Direction toggle (inverse conversion)

- **Validation Rules**:
  - Pack unit name is required
  - Quantity must be positive
  - Quantity must be numeric
  - No duplicate pack units allowed
  - At least one pack unit must be set as default

#### UI Components (PRD_091)
- **Table Layout**:
  - Default column (checkbox)
  - Unit column (text)
  - Factor column (numeric input)
  - Description column (text input)
  - Conversion column (calculated)
  - Calculation column (formula)
  - Actions column (in edit mode)

- **Action Buttons**:
  - Add New Unit button (in edit mode)
  - Save button for new units
  - Cancel button for new units
  - Delete button for existing units
  - Direction toggle button

#### Edit Mode Features (PRD_092)
- **Inline Editing**:
  - Factor value with numeric input
  - Description with text input
  - Default selection with checkbox
  - Direction with toggle button

- **New Unit Form**:
  - Input fields for all required data
  - Validation on save
  - Cancel option to clear form
  - Add button to confirm

#### View Mode Features (PRD_093)
- **Read-only Display**:
  - All values displayed as text
  - Conversion calculations shown
  - No action buttons visible
  - Default unit indicated

#### Conversion Display (PRD_094)
- **Conversion Text**:
  - Show "1 UNIT = X BASE_UNIT" format
  - Display inverse when direction toggled
  - Use 5 decimal precision for factors
  - Update dynamically with changes

#### Calculation Display (PRD_095)
- **Formula Text**:
  - Show multiplication or division formula
  - Update based on direction toggle
  - Display factor with 5 decimal precision
  - Indicate operation type (× or ÷)

### 3.10 Common Unit Management Features
- **Edit Mode Control**:
  - Consistent isEditing prop across all unit tabs
  - Proper state management
  - Clear visual indication of edit mode
  - Validation enforcement

- **Data Management**:
  - Proper type definitions
  - State updates with immutable patterns
  - Error handling
  - Loading states

- **UI Consistency**:
  - Common styling across unit tabs
  - Consistent button placement
  - Uniform table layouts
  - Matching interaction patterns 