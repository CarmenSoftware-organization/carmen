# Detail/CRUD Screen Layout Specification

## Overview
This specification defines a standardized layout pattern for detail views and CRUD (Create, Read, Update, Delete) operations that can be consistently applied across different content types.

## Core Components

### Header Section
- Primary header bar (60px height):
  - Left: Back button with optional cancel text
  - Center: Screen title ("Edit [Item]" / "New [Item]" / "[Item] Details")
  - Right: Primary action button(s)
    - Save/Done for edit mode
    - Edit for view mode
    - Maximum 2 buttons
- Optional warning bar below header for validation messages
- Optional progress indicator for multi-step forms

### Content Container
- Full remaining viewport height
- Scrollable content area
- Standard padding: 16px horizontal
- Bottom padding accounts for action buttons (if present)

### Form Layout
- Consistent group spacing (24px between sections)
- Section headers:
  - 16px bottom margin
  - 14px medium weight text
  - Optional help text
- Field layout:
  - Stack layout with 16px spacing
  - Full width by default
  - Optional two-column layout for desktop

### Field Components
- Input Fields:
  - Consistent height (48px minimum)
  - Clear input areas with visible boundaries
  - Floating or fixed labels
  - Helper text below field
  - Error states with red highlight and message
- Selection Controls:
  - Radio buttons for single selection
  - Checkboxes for multiple selection
  - Toggle switches for binary settings
- Complex Inputs:
  - Date/time pickers
  - File uploads with preview
  - Rich text editors
  - Auto-complete fields
- Required Field Indicators:
  - Asterisk (*) next to label
  - Clear visual distinction

### Read-Only Mode
- Clear visual distinction from editable fields
- No input borders or backgrounds
- Optional copy buttons for important data
- Actions available through contextual buttons

### Action Buttons
- Primary Actions:
  - Save/Update: Right-aligned in header
  - Edit: Right-aligned in header for view mode
- Secondary Actions:
  - Delete: Bottom of form or overflow menu
  - Cancel: Left-aligned in header
- Floating Action Button (optional):
  - Fixed position bottom right
  - 16px margin from edges
  - Elevated above content

### State Management
- Loading State:
  - Skeleton screens for initial load
  - Shimmer effect on fields
  - Disabled inputs during load
- Save/Submit State:
  - Disable form during submission
  - Progress indicator in submit button
  - Clear success/failure feedback
- Error State:
  - Field-level error messages
  - Form-level error summary
  - Clear recovery actions

## Interaction Patterns

### Navigation
- Back Button Behavior:
  - Prompt to save changes if dirty
  - Clear warning message
  - Save/Discard/Cancel options
- Form Navigation:
  - Logical tab order
  - Next field on return/enter
  - Optional keyboard shortcuts

### Validation
- Real-time Validation:
  - On field blur
  - Custom validation rules
  - Clear error messages
- Submit Validation:
  - Complete form check
  - Scroll to first error
  - Error summary at top
- Required Fields:
  - Clear visual indicators
  - Validation on submit
  - Optional validation on blur

### Data Management
- Auto-save:
  - Optional for long forms
  - Clear indication of save state
  - Recovery from failed saves
- Draft Support:
  - Save as draft option
  - Draft indicator in header
  - Resume editing flow
- Change Tracking:
  - Dirty state management
  - Optional undo/redo
  - Change indicators per field

### Delete Operations
- Confirmation Dialog:
  - Clear warning message
  - Explain consequences
  - Require explicit confirmation
- Optional Soft Delete:
  - Archive instead of delete
  - Restore capability
  - Status indicator

## Best Practices

### Performance
- Progressive form loading
- Efficient validation
- Optimistic updates
- Smart field dependencies
- Cached form state

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Error announcements
- Focus management
- Clear reading order

### Responsive Behavior
- Adapt to screen sizes
- Reflow for mobile
- Touch-friendly targets
- Maintain readability
- Smart keyboard handling

### User Experience
- Clear feedback
- Consistent behaviors
- Predictable navigation
- Error prevention
- Data preservation

## Form Variations

### Simple Forms
- Login/Registration
- Basic settings
- Quick create/edit

### Complex Forms
- Multi-step workflows
- Dynamic field sets
- Nested data structures
- File upload handling

### Specialized Forms
- Split-view edit/preview
- Side-by-side comparison
- Wizard interfaces
- Inline editing

## Field Types

### Text Inputs
- Single line text
- Multi-line text
- Rich text editor
- Password field
- Email field
- URL field

### Number Inputs
- Integer
- Decimal
- Currency
- Percentage
- Range slider

### Selection Inputs
- Dropdown select
- Multi-select
- Radio group
- Checkbox group
- Tag selection

### Date/Time Inputs
- Date picker
- Time picker
- Date range
- DateTime picker

### Special Inputs
- File upload
- Image upload
- Location picker
- Color picker
- Auto-complete

## Common Patterns

### Two-Panel Layout
- List view on left
- Detail view on right
- Responsive collapse to single view
- Clear selection indication

### Master-Detail Flow
- Navigate to detail view
- Full-screen on mobile
- Clear navigation path
- State preservation

### Inline Editing
- Toggle edit mode
- Immediate feedback
- Smart field focus
- Cancel/Save per field
