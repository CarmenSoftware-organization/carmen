# Page Content: Inventory Settings

## Document Information
- **Module**: System Administration
- **Sub-Module**: Inventory Configuration
- **Page**: Inventory Settings
- **Route**: `/system-administration/settings/inventory`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-02
- **Owner**: Finance & Operations Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-02 | System Architect | Initial version |
| 1.1.0 | 2025-11-03 | Architecture Team | **Schema Alignment**: Updated references to match actual Prisma schema (`schema.prisma`) |

---

## Overview

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Page Purpose**: Configure company-wide inventory costing method and view audit history of configuration changes. This page allows authorized administrators to set whether the entire system uses FIFO or AVG (Periodic Average) costing for all inventory valuations.

**Database Enum**: `enum_calculation_method` with values `FIFO` and `AVG` (see schema.prisma:42-45)

**User Personas**:
- System Administrator
- Financial Manager
- CFO/Finance Director

**Related Documents**:
- [Business Requirements](BR-inventory-valuation.md) (to be created)
- [Use Cases](UC-inventory-valuation.md) (to be created)
- [Shared Method Specification](SM-inventory-valuation.md)
- [Data Definition](DD-inventory-valuation.md)

---

## Page Header

### Page Title
**Text**: Inventory Settings
**Style**: H1, bold, foreground color
**Location**: Top left of page

### Breadcrumb
**Text**: System Administration / Settings / Inventory
**Location**: Below header
**Interactive**: Links to System Administration and Settings pages

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| View Audit History | Open audit history dialog | Secondary | Always visible |
| Save Changes | Save modified settings | Primary | Only when changes are unsaved |

---

## Page Description/Instructions

**Instructional Text**:
```
Configure how inventory costs are calculated throughout the system. The costing method you select will apply to all inventory items across all locations. Changing this setting will affect all future inventory transactions but will not recalculate historical data.
```

**Help Text/Tooltip**:
```
ℹ️ The costing method determines how inventory values are calculated for:
• Credit notes and returns
• Stock adjustments
• Inventory reports and analytics
• Cost of goods sold calculations

Choose carefully - changing this setting impacts financial reporting.
```

---

## Form Sections

### Section 1: Current Configuration

#### Section Header
**Title**: Costing Method
**Description**: Select the inventory costing method to use system-wide
**Help Icon**: ℹ️ Hover text: "This setting applies to all inventory items and locations. Historical transactions remain unchanged."

#### Form Fields

| Field Label | Type | Placeholder | Help Text | Required | Validation |
|-------------|------|-------------|-----------|----------|------------|
| Costing Method | Radio Group | N/A | Select one method | Yes | Must select FIFO or AVG (Periodic Average) |
| Period Type | Read-only Text | N/A | Calendar Month (fixed) | N/A | N/A |
| Last Updated | Read-only DateTime | N/A | Shows when setting was last changed | N/A | N/A |
| Last Updated By | Read-only Text | N/A | Shows who made the last change | N/A | N/A |

#### Radio Group Options: Costing Method

**Option 1: FIFO (First-In-First-Out)**
```
Radio Button: ○ FIFO (First-In-First-Out)

Description below radio:
Inventory costs are calculated by consuming the oldest stock first. Each receipt creates a separate cost layer, and costs are taken from the oldest layers when inventory is consumed.

Best for:
• Products with expiration dates
• Perishable goods
• When physical flow matches FIFO assumption
• Regulatory compliance requiring FIFO

Impact:
• More accurate cost tracking per batch/lot
• Requires tracking individual receipt layers
• May show higher profits in periods of rising costs
```

**Option 2: AVG (Periodic Average)**
```
Radio Button: ○ Periodic Average (Database value: AVG)

Description below radio:
Inventory costs are calculated using the average cost for the calendar month. All receipts in a month are averaged together, and that average cost is used for all transactions in that period.

Best for:
• High-volume, low-value items
• When individual batch tracking is not required
• Simplified accounting processes
• Stable pricing environments

Impact:
• Simplified cost calculations
• Better performance for high transaction volumes
• Costs are smoothed within each month
• Recalculates monthly based on all receipts
```

#### Field-Level Messages
| Field | Message Type | Message Text |
|-------|--------------|--------------|
| Costing Method | Warning | ⚠️ Changing the costing method will affect all future inventory valuations. Historical transactions will retain their original costs. This change cannot be undone automatically. |
| Period Type | Info | ℹ️ Period type is fixed to Calendar Month and cannot be changed. All Periodic Average calculations use the 1st to last day of each calendar month. |

---

### Section 2: Change Impact Analysis

**Visibility**: Only shown when user selects a different costing method from the current setting

#### Section Header
**Title**: Impact of Changing Costing Method
**Description**: Review these implications before saving your changes
**Style**: Warning background color (light yellow/amber)

#### Impact Summary Display

**Current Method Display**:
```
Current Method: [FIFO / Periodic Average]
↓
New Method: [FIFO / Periodic Average]
```

**Impact Checklist** (read-only informational items):

```
What will happen:
✓ All new transactions will use the new costing method
✓ Audit log entry will be created recording this change
✓ Periodic Average cache will be recalculated if switching TO Periodic Average
✓ Users will be notified of the costing method change

What will NOT happen:
✗ Historical transactions will NOT be recalculated
✗ Existing credit notes will NOT change their costs
✗ Financial reports for past periods will NOT be affected
✗ Inventory balances will NOT be automatically revalued
```

**Warning Message Box**:
```
⚠️ IMPORTANT: Changing costing methods is a significant accounting decision

Before proceeding:
1. Consult with your financial team and auditors
2. Ensure all pending transactions are processed
3. Consider running period-end processes first
4. Plan for user training on the new method
5. Document the business reason for this change

This change will be logged in the audit trail and may require explanation during financial audits.
```

---

### Section 3: Change Justification

**Visibility**: Only shown when user selects a different costing method from the current setting

#### Section Header
**Title**: Change Justification
**Description**: Document the reason for this configuration change (required for audit trail)

#### Form Fields

| Field Label | Type | Placeholder | Help Text | Required | Validation |
|-------------|------|-------------|-----------|----------|------------|
| Reason for Change | Textarea | Enter the business reason for changing the costing method... | Explain why this change is necessary (minimum 20 characters) | Yes | Min 20 characters, max 500 characters |
| Approved By | Text | Enter name of approving authority | Name of CFO/Finance Director who approved this change | Yes | Min 3 characters, max 100 characters |

#### Field-Level Messages
| Field | Message Type | Message Text |
|-------|--------------|--------------|
| Reason for Change | Info | ℹ️ This information will be stored in the audit log and may be reviewed during financial audits. |
| Approved By | Info | ℹ️ Changing the costing method should only be done with proper financial authorization. |

---

## Action Buttons (Bottom)

### Primary Actions
| Button Label | Style | Position | Visibility Rules |
|--------------|-------|----------|------------------|
| Save Changes | Primary (Destructive style if changing method) | Right | Only when costing method has been changed |
| Cancel | Secondary | Right | Only when there are unsaved changes |

### Secondary Actions
| Button Label | Style | Position | Visibility Rules |
|--------------|-------|----------|------------------|
| Reset to Current | Text/Ghost | Left | Only when there are unsaved changes |

### Button States
| Button | Default Text | Loading Text | Success Text | Disabled State |
|--------|--------------|--------------|--------------|----------------|
| Save Changes | Save Changes | Saving... | Saved! | No changes made OR validation errors present |
| Cancel | Cancel | N/A | N/A | Never disabled |
| Reset to Current | Reset to Current | N/A | N/A | Never disabled |

---

## Confirmation Dialogs

### Confirmation 1: Save Costing Method Change

**Trigger**: User clicks "Save Changes" button after selecting a different costing method

**Dialog Content**:
```
⚠️ Confirm Costing Method Change

You are about to change the system-wide costing method from [Current Method] to [New Method].

This is a significant accounting change that will affect:
• All future inventory valuations
• Credit note cost calculations
• Stock adjustment costing
• Financial reporting accuracy
```

**Details**:
```
Current Method: [FIFO / Periodic Average]
New Method: [FIFO / Periodic Average]
Effective Date: Immediately upon saving
Reason: [User-entered reason]
Approved By: [User-entered approver name]

⚠️ This change cannot be automatically undone. Reverting will require another configuration change.
```

**Action Buttons**:
| Button Label | Style | Action |
|--------------|-------|--------|
| Confirm Change | Destructive (Red) | Save new costing method and create audit log entry |
| Review Settings | Secondary | Close dialog and return to settings page |

---

### Confirmation 2: Unsaved Changes Warning

**Trigger**: User attempts to navigate away from page with unsaved changes

**Dialog Content**:
```
⚠️ Unsaved Changes

You have unsaved changes to the inventory settings. If you leave this page, your changes will be lost.
```

**Action Buttons**:
| Button Label | Style | Action |
|--------------|-------|--------|
| Save Changes | Primary | Save settings and then navigate away |
| Discard Changes | Destructive | Discard changes and navigate away |
| Stay on Page | Secondary | Close dialog and remain on page |

---

## Dialogs/Modals

### Dialog 1: Audit History

**📌 Schema Reference**: Audit data from `tb_activity` table (schema.prisma:721-732)

**Trigger**: User clicks "View Audit History" button in page header

#### Dialog Header
**Title**: Costing Method Change History
**Subtitle**: Complete audit trail of all configuration changes
**Close Button**: X icon in top right

#### Dialog Body

**Filter Section**:
| Filter Field | Label | Placeholder Text | Tooltip |
|--------------|-------|------------------|---------|
| Date Range | Date Range | Select date range... | Filter by when change was made |
| Changed By | Changed By | All users | Filter by who made the change |

**Table Headers**:
| Column Header | Sortable | Tooltip |
|---------------|----------|---------|
| Date & Time | Yes | When the change was made |
| Previous Method | No | Costing method before change |
| New Method | No | Costing method after change |
| Changed By | Yes | User who made the change |
| Reason | No | Business justification for change |
| Approved By | No | Approving authority |

**Column Content Formats**:
| Column | Display Format | Example |
|--------|----------------|---------|
| Date & Time | DD MMM YYYY HH:mm | 15 Jan 2024 14:30 |
| Previous Method | Badge with color | FIFO (blue), Periodic Average (purple) |
| New Method | Badge with color | FIFO (blue), Periodic Average (purple) |
| Changed By | User name with avatar | John Smith |
| Reason | Text (truncated with "..." if > 50 chars) | Switching to periodic average for... |
| Approved By | Full name | Jane Doe (CFO) |

**Row Actions**:
| Icon/Button | Label | Tooltip | Action |
|-------------|-------|---------|--------|
| Eye icon | View Details | View full details | Opens detail view with complete reason text |

**Empty State**:
```
Icon: 📋
Primary Message: "No configuration changes yet"
Secondary Message: "This is the initial system configuration. Changes will appear here."
```

**Pagination**:
- Items Per Page: 10, 20, 50
- Page Info: "Showing 1 to 10 of 25 entries"

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export to CSV | Secondary | Download audit history as CSV file |
| Close | Secondary | Close dialog |

---

### Dialog 2: Audit Entry Details

**Trigger**: User clicks "View Details" on an audit history row

#### Dialog Header
**Title**: Configuration Change Details
**Close Button**: X icon in top right

#### Dialog Body

**Display Sections**:

**Change Summary**:
```
Change Date: [DD MMM YYYY HH:mm:ss]
Change ID: [UUID]
```

**Costing Method Change**:
```
Previous Method: [Badge: FIFO / Periodic Average]
↓
New Method: [Badge: FIFO / Periodic Average]
```

**Authorization Details**:
```
Changed By: [Full Name]
User ID: [User ID]
Role: [User Role]
Department: [User Department]

Approved By: [Approving Authority Name]
Approval Role: [e.g., CFO, Finance Director]
```

**Business Justification**:
```
[Full reason text, no truncation]

[Multi-line display if reason is lengthy]
```

**System Information**:
```
IP Address: [IP address of user who made change]
Session ID: [Session ID]
Browser: [Browser and version]
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Print | Secondary | Print audit entry details |
| Close | Secondary | Close dialog |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Settings saved successfully | ✓ Inventory settings updated successfully. New costing method is now active. | 5 seconds |
| Audit history exported | ✓ Audit history exported successfully | 3 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Validation failed | ✗ Please provide a reason for this change (minimum 20 characters required) | User must fill required fields |
| Save failed (network) | ✗ Unable to save settings. Please check your connection and try again. | User should retry |
| Save failed (server) | ✗ An error occurred while saving settings. Please try again or contact support. | User should retry or contact support |
| Unauthorized access | ✗ You do not have permission to modify inventory settings. Contact your administrator. | User must request permissions |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Unsaved changes on navigation | ⚠ You have unsaved changes. Save before leaving? | [Save] [Discard] [Cancel] |
| Selecting different method | ⚠ Changing costing method will affect all future transactions. Review impact before saving. | Informational only |

### Info Messages
| Trigger | Message |
|---------|---------|
| Page load | ℹ Current costing method: [FIFO / Periodic Average]. Last updated: [Date] by [User] |
| Method selected (same as current) | ℹ This is the current active costing method |

---

## Notifications

### Toast Notifications
| Trigger | Type | Message | Duration | Position |
|---------|------|---------|----------|----------|
| Settings saved | Success | ✓ Inventory settings updated successfully | 5 seconds | Top right |
| Save failed | Error | ✗ Failed to save settings. Please try again. | Until dismissed | Top right |
| Audit export started | Info | ℹ Exporting audit history... | 2 seconds | Top right |
| Audit export complete | Success | ✓ Audit history downloaded | 3 seconds | Top right |

### System Notifications (sent to users)
| Trigger | Recipients | Title | Message | Actions |
|---------|-----------|-------|---------|---------|
| Costing method changed | Finance Managers, Operations Managers, System Admins | Inventory Costing Method Changed | The inventory costing method has been changed from [Old] to [New] by [User]. This change is effective immediately and will apply to all future inventory transactions. | [View Settings] [View Audit Log] |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Page initial load | Loading inventory settings... | Full-page spinner |
| Saving changes | Saving settings... | Button shows spinner, form disabled |
| Loading audit history | Loading audit trail... | Dialog shows skeleton loading rows |
| Exporting audit data | Preparing export... | Progress indicator |

---

## Empty States

### No Data States
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| Audit history empty | 📋 | No configuration changes yet | This is the initial system configuration. Changes will appear here when settings are modified. | N/A |
| Audit history filtered (no results) | 🔍 | No changes found for selected filters | Try adjusting your filter criteria | [Clear Filters] |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| FIFO radio button | Select FIFO costing method | Screen reader announces option |
| Periodic Average radio button | Select Periodic Average costing method | Screen reader announces option |
| Save Changes button | Save inventory settings changes | Screen reader announces action |
| View Audit History button | View costing method change history | Screen reader announces action |
| Close audit dialog button | Close audit history dialog | Screen reader announces action |
| Reason textarea | Enter business reason for costing method change | Screen reader announces purpose |
| Approved By input | Enter name of approving authority | Screen reader announces purpose |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Warning triangle icon | Warning |
| Information icon | Information |
| Success checkmark | Success |
| Error cross | Error |
| Calendar icon | Calendar |
| User avatar | User profile picture |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Save settings with changes | Save Changes | Clear action, indicates changes will be persisted |
| Cancel editing | Cancel | Standard cancel terminology, familiar to users |
| Reset to original | Reset to Current | Clarifies that it resets to currently saved state |
| Export audit data | Export to CSV | Specifies export format clearly |
| View detailed audit entry | View Details | Clear indication of what action does |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| Related documentation | Learn more about costing methods | SM-costing-methods.md documentation |
| Business requirements | View business requirements | BR-inventory-valuation.md |
| Breadcrumb navigation | System Administration | /system-administration |
| Breadcrumb navigation | Settings | /system-administration/settings |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Reason textarea | "Enter the business reason for..." | "Enter the business reason for changing the costing method..." |
| Approver input | "Enter name of..." | "Enter name of approving authority" |
| Date range filter | "Select date range..." | "Select date range..." |
| User filter | "All users" | "All users" |

---

## Error States

### Validation Errors
| Field | Condition | Error Message |
|-------|-----------|---------------|
| Reason for Change | Empty when method changed | This field is required when changing costing method |
| Reason for Change | Less than 20 characters | Please provide a detailed reason (minimum 20 characters) |
| Reason for Change | More than 500 characters | Reason is too long (maximum 500 characters) |
| Approved By | Empty when method changed | Please enter the name of the approving authority |
| Approved By | Less than 3 characters | Please enter a valid name (minimum 3 characters) |
| Costing Method | No selection made | Please select a costing method |

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network timeout | Unable to save settings. Please check your internet connection and try again. | [Retry] button appears |
| Server error 500 | Something went wrong on our end. Please try again in a few moments. | [Retry] button appears |
| Unauthorized 403 | You do not have permission to modify these settings. Please contact your administrator. | User must request admin access |
| Concurrent modification | These settings were modified by another user. Please refresh and try again. | [Refresh Page] button appears |
| Database connection error | Unable to connect to the database. Please contact support if this problem persists. | Contact support information shown |

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| Ctrl/Cmd + S | Save changes | When changes exist and form is valid |
| Esc | Close dialog/Cancel | When dialog is open OR when unsaved changes exist |
| Tab | Navigate between form fields | Form navigation |
| Enter | Submit form/Confirm action | When focused on button |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Inventory Settings" | Page title | 50 |
| "Costing Method" | Section heading and field label | 30 |
| "FIFO (First-In-First-Out)" | Radio button option label | 60 |
| "Periodic Average" | Radio button option label | 40 |
| "Save Changes" | Primary action button | 20 |
| "View Audit History" | Header action button | 30 |
| Warning messages | User warnings about changes | 500 |
| Success messages | Confirmation messages | 100 |
| Error messages | Validation and system errors | 200 |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| FIFO | Standard accounting term (acronym) |
| UUID | Technical identifier format |
| IP Address | Technical term |
| CSV | File format acronym |
| DD MMM YYYY | Date format pattern (localize pattern, not text) |

---

## Brand Voice Guidelines

### Tone
- Professional and authoritative (dealing with financial settings)
- Clear and direct (avoiding ambiguity in important decisions)
- Supportive and informative (helping users make correct choices)
- Warning without being alarmist (appropriate for financial impact)

### Writing Style
- Active voice preferred: "You are about to change..." vs "The costing method will be changed..."
- Second person: Directly address the user ("You", "Your")
- Present tense for current states, future tense for impacts
- Use numbered lists for sequential steps
- Use bullet points for non-sequential information

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Costing Method | Cost Method, Pricing Method, Valuation Method | System setting name |
| FIFO (First-In-First-Out) | FIFO Costing, First In First Out | Costing method name |
| Periodic Average | Monthly Average, Average Cost, Avg Cost | Costing method name |
| Calendar Month | Month, Monthly Period | Period type |
| Audit History | Change Log, History, Audit Trail | Historical changes |
| Change Justification | Reason, Explanation | Business reason field |
| Approved By | Authorized By, Approver | Authorization field |
| Settings | Configuration, Setup, Preferences | System settings |
| Save Changes | Apply, Update, Submit | Save action |
| Company-wide | System-wide, Organization-wide, Enterprise-wide | Scope of setting |

---

## Appendix

### Related Pages
- System Administration Dashboard (PC-system-admin-dashboard.md) - to be created
- User Management (PC-user-management.md) - existing
- General Settings (PC-general-settings.md) - to be created
- Financial Settings (PC-financial-settings.md) - to be created

### Content Dependencies
- User context service: For retrieving current user permissions and details
- Audit service: For logging all configuration changes
- Notification service: For sending change notifications to relevant users
- Settings service: For CRUD operations on inventory settings

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-01-02 | Initial document creation | New centralized inventory valuation system | System Architect |

---

**Document End**

> 📝 **Note to Content Writers**:
> - This page handles critical financial configuration - all messaging should be clear and unambiguous
> - Warning messages should be prominent but not create unnecessary anxiety
> - Ensure all audit-related content supports compliance requirements
> - Test all error messages for clarity and actionability
> - Consider localization needs for financial terminology
> - Coordinate with UX team on warning dialog designs
> - Verify all terminology with Finance team before implementation

---

## Document Revision Notes

**✅ Schema Alignment Completed** (2025-11-03)

This document has been updated to accurately reflect the **actual Prisma database schema** defined in `/app/data-struc/schema.prisma`.

**Key Updates**:
- Costing method enum values clarified: Database uses `FIFO` and `AVG` (display as "Periodic Average")
- Added schema references throughout document with line number citations
- Updated audit trail references to use `tb_activity` table (schema.prisma:721-732)
- Enum reference: `enum_calculation_method` (schema.prisma:42-45)
- All data structures and references now align with actual Prisma models
