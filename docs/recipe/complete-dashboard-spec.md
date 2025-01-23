# Dashboard UI Specification

## 1. Overview

### Purpose
The dashboard serves as the main control center for the POS Mapping System, providing:
- Real-time alerts for system issues
- Key performance metrics
- Recent activity monitoring
- Quick access to common tasks

### Primary Users
- System Administrators
- Cost Controllers
- F&B Managers
- Management Staff

## 2. Layout Structure

```
┌─────────────────────────────────────────────┐
│ Global Header                               │
├───────────┬─────────────────────────────────┤
│           │ ┌─────────────────────────────┐ │
│           │ │ Alert Section               │ │
│           │ ├─────────────────────────────┤ │
│           │ │ Quick Stats                 │ │
│  Side     │ ├─────────────────────────────┤ │
│  Nav      │ │ Recent Activity             │ │
│           │ │                             │ │
│           │ │                             │ │
│           │ └─────────────────────────────┘ │
└───────────┴─────────────────────────────────┘
```

### 2.1 Global Header
Height: 64px
Components:
- Left: System Logo and Name
- Center: Global Search Bar
- Right: 
  * Notification Bell with Counter
  * User Profile Menu
  * Settings Button

### 2.2 Side Navigation
Width: 240px
Content:
- Dashboard (active)
- POS Configuration
- Mapping
- Transactions
- Reports
- Settings

### 2.3 Main Content Area
- Padding: 24px
- Background: Light gray
- Scrollable content
- Responsive width

## 3. Content Sections

### 3.1 Alert Section
Layout: Three equal-width cards
Spacing: 16px gap between cards

#### Unmapped Items Alert
Visual:
- Icon: Warning triangle (orange)
- Counter: Large number
- Status text below
- Action link at bottom

Content:
- Title: "Unmapped Items"
- Counter: Number of unmapped elements
- Status Text Options:
  * "No unmapped items"
  * "{X} items need mapping"
- Action: "View Unmapped Items"

#### Failed Transactions Alert
Visual:
- Icon: Error circle (red)
- Counter: Large number
- Status text below
- Action link at bottom

Content:
- Title: "Failed Transactions"
- Counter: Number of failures
- Status Text Options:
  * "All transactions successful"
  * "{X} transactions failed"
- Action: "View Failed Transactions"

#### Pending Approvals Alert
Visual:
- Icon: Clock (blue)
- Counter: Large number
- Status text below
- Action link at bottom

Content:
- Title: "Pending Approvals"
- Counter: Number of pending items
- Status Text Options:
  * "No pending approvals"
  * "{X} items need approval"
- Action: "Review Pending Items"

### 3.2 Quick Stats Section
Layout: Four equal-width cards
Spacing: 16px gap between cards

#### Stats Cards Structure
Each card contains:
- Label text
- Primary value
- Trend indicator
- Secondary comparison

#### Total Sales Today
Content:
- Label: "Total Sales Today"
- Primary: Currency value
- Trend: Up/down arrow
- Secondary: Percentage vs yesterday

#### Pending Mappings
Content:
- Label: "Pending Mappings"
- Primary: Total count
- Breakdown (on hover):
  * New items count
  * Modified items count
  * New outlets count

#### Failed Transactions
Content:
- Label: "Failed Transactions"
- Primary: Total count
- Breakdown (on hover):
  * Sync failures
  * Mapping errors
  * System errors

#### Pending Stock-outs
Content:
- Label: "Pending Stock-outs"
- Primary: Total count
- Breakdown (on hover):
  * New requests
  * In review
  * Rejected

### 3.3 Recent Activity Section
Layout: Vertical stack of three sections
Spacing: 16px between sections

#### Latest Transactions
Format:
- Section title
- List of 5 most recent transactions
- Each item shows:
  * Time (relative format)
  * Transaction ID
  * Outlet name
  * Amount
  * Status indicator

#### Recent Mapping Changes
Format:
- Section title
- List of 5 most recent changes
- Each item shows:
  * Time (relative format)
  * User name
  * Change type
  * Item affected
  * Status

#### Failed Transactions Log
Format:
- Section title
- List of 5 most recent failures
- Each item shows:
  * Time of failure
  * Error type
  * Error message
  * Status
  * Action buttons

## 4. Responsive Behavior

### Desktop (>1024px)
- Full layout as specified
- All sections visible
- Side nav expanded

### Tablet (768px-1024px)
- Collapsible side nav
- Alert section: 2 columns
- Stats section: 2 columns
- Activity sections stack vertically

### Mobile (<768px)
- Hidden side nav (hamburger menu)
- Single column layout
- Scrollable sections
- Simplified headers

## 5. Interaction Specifications

### Click/Tap Actions
- Alert cards link to respective sections
- Stat cards expand to show details
- Activity items link to full details
- Action buttons trigger immediate actions

### Hover States
- Cards: Slight elevation increase
- Links: Underline
- Buttons: Background color change
- Icons: Opacity change

### Loading States
- Skeleton loaders for initial load
- Spinners for data updates
- Fade transitions for content changes

## 6. Data Updates

### Real-time Updates
- Alert counters
- Failed transactions
- New mappings
- Activity feed

### Periodic Updates
- Sales figures (5 min)
- Performance stats (15 min)

### Manual Updates
- Refresh button in header
- Pull-to-refresh on mobile

## 7. Error Handling

### Connection Issues
- Offline indicator in header
- Retry buttons on failed sections
- Last updated timestamp shown

### Empty States
- "No alerts" message
- "No recent activity" message
- Clear call-to-action buttons

### Error Messages
- Toast notifications for failures
- Inline error messages
- Error details in logs

## 8. Accessibility Features

### Navigation
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators

### Visual
- High contrast text
- Color-blind friendly indicators
- Multiple state indicators

### ARIA Labels
- Clear section labels
- Status descriptions
- Action descriptions

## 9. Typography & Colors

### Typography
- Headers: 20px/24px, Semi-bold
- Body text: 14px/20px, Regular
- Labels: 12px/16px, Medium
- Numbers: 24px/28px, Bold

### Colors
- Primary: Blue (#1E40AF)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)
- Text: Dark (#111827)
- Background: Light (#F9FAFB)