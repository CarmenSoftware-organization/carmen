# ProductSelectionComponent - Add Product Functionality

## Overview

The ProductSelectionComponent now includes an "Add Product" feature similar to the vendor portal's MOQ add functionality, allowing users to directly add individual products to their template selection without navigating through the category hierarchy.

## Features Added

### 1. **Add Product Dialog**
- **Location**: "Add Product" button in the Selected Items panel header
- **Functionality**: Opens a searchable dialog showing all available products
- **Search**: Real-time search across product names, categories, subcategories, and item groups
- **Filtering**: Shows up to 50 results to maintain performance

### 2. **Individual Product Management**
- **Add**: Click "Add" button next to any product in the dialog
- **Remove**: Click "X" button next to any product in the Selected Items panel
- **Status**: Shows "Added" status for products already in selection
- **Prevention**: Prevents duplicate additions

### 3. **Enhanced Selected Items Panel**
- **Order Unit Dropdown**: Each product shows its configurable order unit
- **Remove Button**: Individual product removal capability
- **Product Info**: Complete product hierarchy and ID display
- **State Management**: Automatic cleanup of order units when products are removed

## Technical Implementation

### State Management
```typescript
// Add dialog state
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
const [addSearchTerm, setAddSearchTerm] = useState('')
const [addFilteredProducts, setAddFilteredProducts] = useState(mockProducts)
```

### Key Functions
```typescript
// Add product to selection
const handleAddProduct = (productId: string) => {
  if (!productSelection.specificItems.includes(productId)) {
    onChange({
      ...productSelection,
      specificItems: [...productSelection.specificItems, productId]
    })
  }
}

// Remove product from selection
const handleRemoveProduct = (productId: string) => {
  const newSpecificItems = productSelection.specificItems.filter(id => id !== productId)
  onChange({
    ...productSelection,
    specificItems: newSpecificItems
  })
}
```

## Usage Patterns

### Adding Products
1. Click "Add Product" button in Selected Items panel
2. Search for products using the search input
3. Click "Add" next to desired products
4. Dialog closes automatically after adding
5. Product appears in Selected Items with default order unit

### Managing Selected Products
1. View all selected products in the right panel
2. Adjust order units using the dropdown for each product
3. Remove individual products using the "X" button
4. Order units are automatically cleaned up on removal

## Integration with Existing Functionality

### Product Resolution
- Maintains compatibility with category/subcategory/item group selections
- Products added via "Add Product" are treated as `specificItems`
- No conflicts with hierarchical selections

### Order Unit Management
- New products get default order units automatically
- Order unit state is synchronized with product selections
- Cleanup occurs when products are removed

## UI/UX Enhancements

### Visual Indicators
- Green dot indicator for selected products
- Border styling to distinguish selected items
- Status badges (Added/Add) in the dialog
- Remove button with hover states

### Performance Optimizations
- Limits dialog results to 50 products
- Real-time search filtering
- Efficient state updates
- Automatic cleanup of unused state

## Testing

Comprehensive test coverage includes:
- Order unit validation and consistency
- Add/remove product functionality
- Search filtering capability
- Product resolution from mixed selections
- State management verification

## Similar Patterns

This implementation follows the same patterns as:
- **Vendor Portal MOQ**: Add/remove MOQ tiers functionality
- **Staff Pricelist Form**: Add/remove pricing tiers
- **General Add Pattern**: Consistent with existing "Add" buttons throughout the system

The functionality provides a flexible, user-friendly way to build product selections while maintaining the existing hierarchical selection capabilities.