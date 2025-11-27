# List Screen Layout Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview
This specification defines a standardized layout pattern for list-based screens that can be consistently applied across different content types and use cases.

## Core Components

### Header Section
- Primary header bar (60px height) containing:
  - Screen title aligned to left
  - Optional right-aligned action buttons (max 2)
  - Optional back/navigation button on left
- Optional secondary header (48px height) for:
  - Search bar
  - Filter controls
  - View toggles (e.g., list/grid)

### Bulk Action Mode
- Activation triggers:
  - Long press on list item
  - Dedicated "Select" button in header
  - Checkbox tap on individual items
- Header transforms to selection mode:
  - Left: "Select All" checkbox
  - Center: Selected item count (e.g., "3 Selected")
  - Right: Close selection mode button
- Bulk action bar appears at bottom:
  - Fixed position footer
  - Height: 56px
  - Contains relevant bulk actions (e.g., Delete, Move, Share)
  - Maximum 4 action buttons
  - Optional overflow menu for additional actions
- Visual feedback:
  - Selected items highlighted
  - Checkboxes visible on all items
  - Optional subtle background color change

### Selection Controls
- Select All checkbox in header:
  - Three states: unchecked, partial, checked
  - Affects all items in current view
  - Clear tap target (minimum 44x44px)
- Individual item selection:
  - Checkbox appears on leading edge
  - Maintains proper alignment with list content
  - Optional haptic feedback on selection

### List Container
- Full remaining viewport height (adjusted for bulk action bar when active)
- Scrollable content area
- Pull-to-refresh capability where applicable
- Standard padding: 16px horizontal, 8px vertical

### List Items
- Minimum touch target height: 48px
- Standard item padding: 16px horizontal, 12px vertical
- Visual separation between items:
  - Light divider line (1px) OR
  - 8px vertical spacing
- Consistent layout structure:
  - Checkbox (when in selection mode)
  - Primary content (left-aligned)
  - Optional metadata (right-aligned)
  - Optional thumbnail (leading)
  - Optional chevron/disclosure indicator (trailing)

### Item Content Structure
- Primary Text:
  - Single line or max 2 lines with ellipsis
  - 16px size, medium weight
- Secondary Text:
  - Single line or max 2 lines with ellipsis
  - 14px size, regular weight
  - 60% opacity for visual hierarchy
- Metadata:
  - Right-aligned
  - 14px size
  - Optional status indicators or badges

### Empty States
- Centered in list container
- Illustration or icon (120px x 120px recommended)
- Clear heading explaining empty state
- Optional supporting text
- Optional action button

### Loading States
- Skeleton screens matching list item layout
- Minimum 3 skeleton items visible
- Animated loading indicator for initial load
- Bottom loading indicator for pagination

### Error States
- Centered error message
- Clear error heading
- Supporting text explaining the issue
- Retry button or recommended action
- Optional illustration

## Interaction Patterns

### Selection
- Clear touch feedback (ripple or highlight)
- Multi-select mode:
  - Immediate visual feedback on selection
  - Maintain selection state during scroll
  - Clear indication of selected count
  - Easy way to deselect all (header close button)

### Bulk Actions
- Context-appropriate actions
- Disabled state for incompatible selections
- Confirmation dialogs for destructive actions
- Progress indication for bulk operations
- Success/failure feedback
- Automatic exit from selection mode on completion

### Gestures
- Swipe actions where applicable:
  - Maximum 2 actions per direction
  - Clear color coding for actions
  - Haptic feedback on reveal
- Long press for selection mode activation

### Navigation
- Standard tap behavior for item selection
- Optional infinite scroll for pagination
- Smooth scroll transitions
- Maintain scroll position on return
- Selection state preserved during navigation when appropriate

## Best Practices

### Performance
- Virtualized list rendering for large datasets
- Lazy loading of images
- Prefetch data for smooth pagination
- Cache results where appropriate
- Efficient bulk operation handling

### Accessibility
- Clear heading hierarchy
- Sufficient color contrast (WCAG AA)
- Screen reader support for all actions
- Focus indicators for keyboard navigation
- Announce selection state changes
- Clear bulk action labels

### Responsive Behavior
- Adapt to different screen sizes
- Optional grid view for larger screens
- Maintain touch targets across devices
- Adjust padding for tablet/desktop
- Responsive bulk action bar layout

### Content Guidelines
- Clear, concise item labels
- Consistent date/time formatting
- Status indicators with clear meaning
- Informative empty states
- Clear bulk action messaging

## Reference Examples

### List Types
- Single-line items
- Two-line items with metadata
- Three-line items with thumbnail
- Card-style items with actions
- Section headers with sticky behavior

### Common Variations
- Settings list
- Contact list
- Message/inbox list
- Media library
- Transaction history
- File manager with bulk operations
- Email inbox with message selection
