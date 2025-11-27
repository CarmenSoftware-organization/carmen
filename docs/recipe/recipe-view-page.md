# Recipe View Page Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Page Layout

### Header Section
- Recipe name
- Recipe code
- Recipe status badge (Active/Void)
- Action buttons:
  - Edit Recipe
  - Print Recipe
  - Back to List

### Main Content
Organized in sections with clear visual separation

## Content Sections

### 1. Recipe Overview
- Recipe image (if available)
- Basic Information:
  - Category
  - Recipe Unit (Per Recipe)
  - Unit of Sale (Per Portion)
  - Number of Portions
  - Preparation Time
  - Total Time
  - Status
  - Creation Date
  - Last Modified Date
  - Interface Inventory?

### 2. Recipe Notes
- Preparation Notes
- Special Instructions
- Additional Information

### 3. Cost Summary
- Total Cost
- Cost per Portion
- Total Mix Percentage
- Margin Percentage 
- Net Price
- Gross Price
- Service Charge
- Tax Rate
- Final Pricing Information

### 4. Ingredients List
Display table with:
- Item name
- Type (Product/Recipe)
- Recipe Quantity and Unit  ( Sales of Unit for Recipe Type )
- Wastage %
- Inventory Quantity and Unit ( Sales of Unit for Recipe Type ) 1:1 Ratio
- Cost Information:
  - Cost per Unit
  - Net Cost 
  - Wastage Cost 
  - Total Cost
  
### 5. Preparation Steps
- Use Drag and Drop
- Numbered list of steps
- Media attachments for each step
- Image and Video Link to You Tube
- Step descriptions
- Visual indicators for steps with media
### 6. Carbon Footprint 
- ??? Standard Value 
- Check Supplier for the data resource for Applications Recipe and Product 

## Actions

### Primary Actions
- Edit Recipe
- Share Recipe
- Back to List

### Secondary Actions
- Download Recipe Card / PDF
- Share Recipe (if implemented) Print/Mail/Link/PDF
- View Recipe History (if implemented)

## Content Display Rules

### General Rules
- Read-only display of all information
- Formatted numbers and currencies
- Converted units where applicable
- Organized hierarchy of information

### Media Display
- Thumbnail view of recipe image
- Gallery view for step media
- Modal/lightbox for enlarged images

## Print Layout

### Print Version Includes
- Recipe header information
- Ingredient list with quantities
- Preparation steps
- Cost information (optional)
- QR code or reference number
- Print date and time

## Responsive Behavior

### Desktop View
- Multi-column layout
- Side-by-side information panels
- Full data tables

### Tablet View
- Flexible grid layout
- Collapsible sections
- Scrollable tables

### Mobile View
- Single column layout
- Expandable sections
- Card-based ingredient display
- Vertical step layout

## Error States

### No Data Handling
- Placeholder for missing image
- "Not available" for missing data
- Fallback for missing calculations

### System Errors
- Loading error messages
- Media loading fallbacks
- Calculation error indicators

## Performance Considerations

### Loading States
- Progressive content loading
- Skeleton screens for loading state
- Lazy loading for images and media

### Optimization
- Compressed images
- Cached data where appropriate
- Optimized for print rendering
