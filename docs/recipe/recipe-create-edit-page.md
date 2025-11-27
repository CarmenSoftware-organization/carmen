# Recipe Create/Edit Page Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Page Layout

### Header Section
- Page title ("Create New Recipe" or "Edit Recipe: [Recipe Name]")
- Save button
- Cancel button
- Additional actions for Edit mode:
  - Update Cost button
  - Print button
  - Void button

### Tab Navigation
Four main tabs:
1. General Information
2. Ingredients
3. Preparation Steps
4. Cost Information

## Tab Contents

### 1. General Information Tab

#### Layout
- Two-column layout for form fields
- Full-width for notes
- Image upload section

#### Fields
- Recipe Code (auto-generated for new, read-only for edit)
- Description (required)
- Other Description
- Category (dropdown)
- Location (dropdown)
- Unit of Sale
- Number of Portions
- Preparation Time
- Total Time
- Preparation Notes (textarea)
- Recipe Image Upload

### 2. Ingredients Tab

#### Layout
- Add Ingredient button
- Ingredients table
- Running total cost

#### Ingredients Table Columns
- Type (Product/Recipe)
- Item
- Description
- Recipe Quantity
- Recipe Unit
- Inventory Quantity
- Inventory Unit
- Cost/Unit
- Wastage %
- Wastage Cost
- Net Cost
- Total Cost
- Actions (Edit/Delete)

#### Add/Edit Ingredient Modal
- Type selector
- Item selector
- Quantity inputs
- Unit selectors
- Cost information
- Wastage input

### 3. Preparation Steps Tab

#### Layout
- Numbered steps list
- Add Step button
- Media attachments section

#### Step Structure
- Step number
- Description
- Media attachments
- Actions (Edit/Delete/Reorder)

#### Add/Edit Step Modal
- Step description
- Media upload
- Step number (optional override)

### 4. Cost Information Tab

#### Layout
- Single column form
- Automatic calculations section
- Override options

#### Fields
- Total Cost (calculated)
- Total Mix Percentage
- Cost of Total Mix
- Net Price
- Gross Price
- Service Charge %
- Tax Rate %
- Cost per Portion (calculated)

## Actions

### Page Level Actions
- Save Recipe
- Cancel Edit
- Update Cost
- Print Recipe
- Void Recipe (Edit mode only)

### Section Level Actions
- Add Ingredient
- Edit Ingredient
- Delete Ingredient
- Add Preparation Step
- Edit Preparation Step
- Delete Preparation Step
- Reorder Steps
- Upload Media
- Remove Media

## Form Validation

### Required Fields
- Description
- Category
- Unit of Sale
- Number of Portions
- At least one ingredient
- At least one preparation step

### Business Rules
- Positive numbers for quantities
- Valid percentages (0-100)
- Compatible units for conversion
- Valid cost calculations

## Error Handling

### Validation Errors
- Field-level error messages
- Form-level error summary
- Business rule validation messages

### System Errors
- Save/Load errors
- Image upload errors
- Cost calculation errors
- Unit conversion errors

## Responsive Behavior

### Desktop
- Side-by-side forms
- Full table views
- Multi-column layouts

### Tablet
- Stack forms vertically
- Scrollable tables
- Reduced columns in tables

### Mobile
- Single column layout
- Card views instead of tables
- Collapsible sections