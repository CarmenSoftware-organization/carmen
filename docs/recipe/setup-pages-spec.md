# Setup Pages Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. POS Configuration Page

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header                                      │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ POS Selection                           │ │
│ ├─────────────────────────────────────────┤ │
│ │ Connection Settings                     │ │
│ ├─────────────────────────────────────────┤ │
│ │ Data Format Settings                    │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Header Section
Height: 64px
Components:
- Left: "POS Configuration" title (24px, bold)
- Right: Save Button
  * Text: "Save Configuration"
  * Type: Primary button
  * State: Disabled until changes made

### Content Sections

#### 1. POS Selection Section
Card layout with:
- Section Title: "POS System Selection"
- Required field indicators (*)

Components:
1. POS Type Dropdown
   - Label: "Select POS System"
   - Options:
     * Comanche
     * Soraso
     * Easy POS
     * HotelTime
     * Infrasys
   - Default: None (placeholder: "Select POS System")

2. Interface Type Selection
   - Label: "Interface Type"
   - Type: Radio buttons
   - Options:
     * API
     * Text File
   - Shows/hides relevant settings based on selection

#### 2. Connection Settings
Conditional display based on Interface Type:

For API Interface:
- URL Input Field
  * Label: "API Endpoint URL"
  * Validation: Valid URL format
  * Placeholder: "https://api.example.com"

- Security Token Input
  * Label: "Security Token"
  * Type: Password field with show/hide toggle
  * Placeholder: "Enter security token"

- Test Connection Button
  * Text: "Test Connection"
  * Shows loading state during test
  * Displays success/error message

For Text Interface:
- File Path Configuration
  * Label: "File Drop Location"
  * Input type: Text
  * Placeholder: "/path/to/files"

- File Pattern
  * Label: "File Name Pattern"
  * Placeholder: "pos_data_*.txt"

#### 3. Data Format Settings
Card with tabs or sections:

1. Field Mapping Grid
   - Columns:
     * POS Field (dropdown)
     * System Field (dropdown)
     * Data Type (dropdown)
     * Required (checkbox)
   - Add/Remove row buttons
   - Validation indicators

2. Sample Data Preview
   - Preview table showing mapped data
   - Refresh button
   - Error highlighting
   - Scrollable container

## 2. System Settings Page

### Layout Structure
```
┌─────────────────────────────────────────────┐
│ Header                                      │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Stock-out Settings                      │ │
│ ├─────────────────────────────────────────┤ │
│ │ Notification Settings                   │ │
│ ├─────────────────────────────────────────┤ │
│ │ User Access Control                     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Header Section
Height: 64px
Components:
- Left: "System Settings" title (24px, bold)
- Right: Save Button
  * Text: "Save Settings"
  * Type: Primary button
  * State: Disabled until changes made

### Content Sections

#### 1. Stock-out Settings
Card layout containing:

1. Creation Mode Toggle
   - Label: "Stock-out Creation"
   - Options:
     * Automatic: "Create stock-outs automatically"
     * Manual: "Require manual creation"
   - Helper text explaining each option

2. Approval Workflow Toggle
   - Label: "Approval Process"
   - Type: Switch/Toggle
   - Options:
     * Enabled: "Require approval for stock-outs"
     * Disabled: "No approval required"
   - Conditional settings when enabled:
     * Approval levels
     * Approver roles

#### 2. Notification Settings
Card with sections:

1. Email Notifications
   - Recipients configuration
     * Add/remove email addresses
     * Role-based recipients
   - Notification types checkboxes:
     * New unmapped items
     * Failed transactions
     * Stock-out approvals
     * System errors

2. Alert Thresholds
   - Numerical inputs with units
   - Threshold types:
     * Transaction failure rate
     * Unmapped items count
     * Processing delay time
   - Severity levels (Warning/Critical)

#### 3. User Access Control Grid
Interactive table with:

Columns:
- User/Role Name
- Access Level dropdown
- Module Permissions (multi-select)
- Actions (Edit/Delete)

Features:
- Search/Filter functionality
- Bulk actions
- Add new user/role button
- Permission templates

### Common Components

#### Action Buttons
Save Button:
- Position: Top right
- State: Disabled until changes
- Loading state while saving
- Success/Error feedback

Cancel Button:
- Position: Next to Save
- Confirms if changes exist
- Returns to previous page

#### Form Validation
- Required field indicators
- Inline validation messages
- Error summary at top
- Validation on save attempt

#### Responsive Behavior
Desktop (>1024px):
- Full layout as specified
- Side-by-side fields where appropriate

Tablet (768px-1024px):
- Stack sections vertically
- Full width inputs
- Condensed grids

Mobile (<768px):
- Single column layout
- Collapsible sections
- Simplified grids
- Touch-friendly inputs