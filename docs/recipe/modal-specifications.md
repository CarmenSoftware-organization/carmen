# Modal/Popup Screens Specifications

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Add/Edit Ingredient Modal

### Layout
- Modal title: "Add Ingredient" or "Edit Ingredient"
- Two-column layout for form fields
- Action buttons at bottom

### Content
#### Form Fields
- Type Selector
  - Radio or dropdown
  - Options: Product, Recipe
  - Required field

- Item Selection
  - Searchable dropdown
  - Filtered by Type
  - Shows description on selection
  - Required field

- Recipe Quantities
  - Quantity input (numeric, required)
  - Unit selector (dropdown, required)
  - Real-time unit conversion preview

- Inventory Details
  - Inventory quantity (calculated/editable)
  - Inventory unit (dropdown)
  - Cost per unit (numeric, required)
  - Real-time cost calculation

- Wastage Information
  - Wastage percentage (numeric, 0-100)
  - Wastage cost (calculated)
  - Net cost (calculated)
  - Total cost (calculated)

### Actions
- Save & Add Another
- Save
- Cancel

### Validation Rules
- Valid quantity (positive number)
- Valid wastage percentage (0-100%)
- Compatible units for conversion
- Required fields completion

## 2. Add/Edit Preparation Step Modal

### Layout
- Modal title: "Add Step" or "Edit Step"
- Full-width layout
- Media preview section
- Action buttons at bottom

### Content
#### Form Fields
- Step Number
  - Auto-generated
  - Manually adjustable
  - Required field

- Step Description
  - Rich text editor or textarea
  - Character limit indicator
  - Required field

#### Media Section
- Media upload area
  - Drag & drop support
  - Multiple file selection
  - Supported formats list
- Thumbnail previews
- Delete media option
- Reorder media option

### Actions
- Save & Add Another
- Save
- Cancel

### Validation Rules
- Required description
- Valid media file types
- Maximum media file size
- Maximum number of media items per step

## 3. Media Upload Modal

### Layout
- Modal title: "Upload Media"
- Upload area with preview
- Progress indicator
- Action buttons

### Content
- Upload Area
  - Drag & drop zone
  - File browser button
  - Supported formats info
  - File size limits

- Preview Section
  - Image/video preview
  - File information
  - Edit options (if applicable)

### Actions
- Upload
- Cancel
- Crop/Edit (for images)
- Remove

### Validation Rules
- File type validation
- File size validation
- Image dimensions (if applicable)
- Required fields

## 4. Cost Update Confirmation Modal

### Layout
- Modal title: "Update Cost Confirmation"
- Content message
- Action buttons

### Content
- Warning message
- Cost change summary
  - Current total cost
  - New calculated cost
  - Difference
- Impact summary
  - Affected calculations
  - Price implications

### Actions
- Confirm Update
- Cancel

## 5. Void Recipe Confirmation Modal

### Layout
- Modal title: "Void Recipe Confirmation"
- Warning content
- Action buttons

### Content
- Warning message
- Recipe information summary
- Void reason input (optional)
- Impact warning
  - Usage in other recipes
  - Active orders/planning

### Actions
- Confirm Void
- Cancel

## 6. Unit Conversion Modal

### Layout
- Modal title: "Unit Conversion"
- Conversion form
- Result display

### Content
- Source Unit
  - Quantity input
  - Unit selector
- Target Unit
  - Unit selector
  - Converted quantity (calculated)
- Conversion formula display

### Actions
- Apply Conversion
- Cancel

## Common Modal Features

### Responsive Behavior
#### Desktop
- Centered modal
- Maximum width
- Scrollable content if needed

#### Tablet/Mobile
- Full width margins
- Increased touch targets
- Simplified layouts

### Error Handling
- Validation error messages
- System error messages
- Network error handling
- Loading states

### Accessibility
- Focus management
- Keyboard navigation
- Screen reader support
- ARIA attributes

### Visual Feedback
- Loading indicators
- Success/error states
- Interactive element states
- Progress indicators

### Technical Notes
- Backdrop click handling
- Escape key handling
- Form state management
- Data validation
- API integration points