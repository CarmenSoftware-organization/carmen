# Mapping Pages Specification

## Common Elements Across Mapping Pages

### Header Structure
Height: 64px
Layout:
```
┌─────────────────────────────────────────────┐
│ Title          Search Bar       Add Button  │
└─────────────────────────────────────────────┘
```

Components:
1. Title
   - Font: 24px, bold
   - Position: Left-aligned

2. Search Bar
   - Width: 320px
   - Type: Text input with search icon
   - Placeholder text varies by page
   - Clear button when not empty

3. Add New Button
   - Type: Primary button
   - Icon: Plus sign
   - Position: Right-aligned

### Filter Section
Height: Auto
Layout: Horizontal flex container
Spacing: 16px between filters

Common Components:
- Clear Filters button
- Save Filter preset option
- Applied filters chips display

### Grid Common Features
- Row hover state
- Selectable rows
- Sortable columns
- Column resizing
- Bulk actions toolbar
- Row action menu

### Pagination
- Items per page selector (10, 25, 50, 100)
- Page navigation controls
- Total items counter
- Current page indicator

## 1. Location Mapping Page

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header                                      │
├─────────────────────────────────────────────┤
│ Filters                                     │
├─────────────────────────────────────────────┤
│ Grid                                        │
├─────────────────────────────────────────────┤
│ Pagination                                  │
└─────────────────────────────────────────────┘
```

### Page-Specific Elements

#### Search Bar
- Placeholder: "Search locations by code or name"
- Searches across: Location Code, POS Name, Mapped Name

#### Filter Section
1. Status Filter
   - Type: Dropdown (multi-select)
   - Options:
     * Active
     * Inactive
     * Pending
     * Error

2. POS Type Filter
   - Type: Dropdown
   - Options: Based on configured POS systems

#### Mapping Grid
Columns:
1. Location Code
   - Width: 120px
   - Sortable
   - Type: Text

2. POS Location Name
   - Width: 200px
   - Sortable
   - Type: Text

3. Mapped Name
   - Width: 200px
   - Sortable
   - Type: Text

4. Status
   - Width: 100px
   - Type: Badge
   - Colors:
     * Active: Green
     * Inactive: Gray
     * Pending: Orange
     * Error: Red

5. Actions
   - Width: 100px
   - Type: Icon buttons
   - Options:
     * Edit
     * Delete
     * View History

## 2. Recipe Mapping Page

### Layout Structure
Similar to Location Mapping with additional filters

### Page-Specific Elements

#### Search Bar
- Placeholder: "Search by POS item code or recipe code"
- Searches across: POS Code, Description, Recipe Code

#### Filter Section
1. Location Filter
   - Type: Dropdown (multi-select)
   - Options: All mapped locations
   - Default: All locations

2. Category Filter
   - Type: Dropdown (multi-select)
   - Options: Product categories
   - Default: All categories

3. Status Filter
   - Type: Dropdown (multi-select)
   - Options:
     * Mapped
     * Unmapped
     * Error
     * Inactive

#### Mapping Grid
Columns:
1. POS Item Code
   - Width: 120px
   - Sortable
   - Type: Text

2. POS Description
   - Width: 200px
   - Sortable
   - Type: Text

3. Recipe Code
   - Width: 120px
   - Sortable
   - Type: Text with link to recipe

4. Units
   - Width: 150px
   - Type: Text with tooltip
   - Shows: Both POS and Recipe units

5. Status
   - Width: 100px
   - Type: Badge
   - Colors by status

6. Actions
   - Width: 100px
   - Type: Icon buttons
   - Options:
     * Edit
     * Delete
     * View History
     * Test Mapping

## 3. Unit Mapping Page

### Layout Structure
Similar to Recipe Mapping

### Page-Specific Elements

#### Search Bar
- Placeholder: "Search by unit name or code"
- Searches across: Unit names and codes

#### Filter Section
1. Unit Type Filter
   - Type: Dropdown
   - Options:
     * Recipe Units
     * Sales Units
     * All Units

2. Status Filter
   - Type: Dropdown
   - Options:
     * Active
     * Inactive
     * Custom

#### Mapping Grid
Columns:
1. Unit Code
   - Width: 100px
   - Sortable
   - Type: Text

2. Unit Name
   - Width: 150px
   - Sortable
   - Type: Text

3. Base Unit
   - Width: 100px
   - Type: Text

4. Conversion Rate
   - Width: 120px
   - Type: Number
   - Format: Decimal (4 places)

5. Status
   - Width: 100px
   - Type: Badge

6. Actions
   - Width: 100px
   - Type: Icon buttons
   - Options:
     * Edit
     * Delete
     * View Usage

### Interaction States

#### Grid Row States
1. Normal
   - Background: White
   - Text: Regular weight

2. Hover
   - Background: Light gray
   - Cursor: Pointer

3. Selected
   - Background: Light blue
   - Checkbox: Checked

4. Error
   - Border: Red
   - Icon: Warning

#### Action States
1. Edit Mode
   - Inline editing
   - Validation feedback
   - Save/Cancel buttons

2. Delete
   - Confirmation dialog
   - Dependency check
   - Undo option

3. Bulk Actions
   - Selection counter
   - Action toolbar
   - Progress indicator

### Error Handling
1. Validation Errors
   - Inline error messages
   - Field highlighting
   - Error summary

2. System Errors
   - Error notifications
   - Retry options
   - Error logging

3. Conflict Resolution
   - Conflict detection
   - Resolution options
   - Merge capabilities

### Responsive Behavior

#### Desktop (>1024px)
- Full grid visible
- All columns shown
- Side-by-side filters

#### Tablet (768px-1024px)
- Scrollable grid
- Hidden optional columns
- Stacked filters

#### Mobile (<768px)
- Card view instead of grid
- Essential information only
- Simplified actions
- Full-width filters