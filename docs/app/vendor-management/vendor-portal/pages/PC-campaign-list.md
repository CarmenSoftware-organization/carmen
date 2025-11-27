# Page Content: Price Collection Campaigns List Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Vendor Portal / Price Collection
- **Page**: Campaign List (Staff-Facing)
- **Route**: `/vendor-management/campaigns`
- **Version**: 2.0.0
- **Last Updated**: 2025-01-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-23 | System | Initial version based on UC v2.0, TS v2.0 |

---

## Overview

**Page Purpose**: Display all price collection campaigns with filtering, sorting, and search capabilities for procurement staff to create, manage, and monitor vendor pricing submissions.

**User Personas**: Procurement Staff, Purchasing Managers, Department Managers

**Related Documents**:
- [Business Requirements](../BR-vendor-portal.md)
- [Use Cases](../UC-vendor-portal.md)
- [Technical Specification](../TS-vendor-portal.md)
- [Data Dictionary](../DD-vendor-portal.md)
- [Flow Diagrams](../FD-vendor-portal.md)

---

## Page Header

### Page Title
**Text**: Price Collection Campaigns
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Breadcrumb
**Text**: Home / Vendor Management / Campaigns
**Location**: Above page title
**Interactive**: Home and Vendor Management are clickable links

### Action Buttons (Header)
| Button Label | Purpose | Style | Visibility Rules | Icon |
|--------------|---------|-------|------------------|------|
| Create Campaign | Navigate to create campaign form | Primary (blue, solid) | All users with create permission | ➕ |
| Campaign Templates | Manage reusable campaign templates | Secondary (white with border) | Always visible | 📋 |
| Export | Export filtered list to Excel/CSV | Secondary (white with border) | Always visible when list has data | 📊 |

---

## Page Description/Instructions

**Instructional Text**:
```
Manage price collection campaigns to gather pricing from vendors. Create one-time or recurring campaigns, invite vendors, and track submission progress.
```

**Help Text/Tooltip**: Hover on ℹ️ icon
```
Price collection campaigns allow you to systematically gather pricing from multiple vendors. You can create campaigns from scratch or use templates for common scenarios.
```

---

## Filter Section

### Quick Stats Cards

**Layout**: 4 cards in horizontal row, responsive grid on mobile

#### Card 1: Active Campaigns
```
┌─────────────────────┐
│  🟢 Active          │
│      12             │
│  Campaigns running  │
└─────────────────────┘
```
**Click Action**: Filter to active campaigns only

#### Card 2: Pending Submissions
```
┌─────────────────────┐
│  ⏳ Pending         │
│      28             │
│  Vendor submissions │
└─────────────────────┘
```
**Click Action**: Navigate to pending submissions view

#### Card 3: Completed This Month
```
┌─────────────────────┐
│  ✅ Completed       │
│       8             │
│  This month         │
└─────────────────────┘
```
**Click Action**: Filter to completed campaigns this month

#### Card 4: Response Rate
```
┌─────────────────────┐
│  📊 Response Rate   │
│      78%            │
│  Average overall    │
└─────────────────────┘
```
**Click Action**: Navigate to analytics view

---

### Filter Bar

#### Primary Filter Toggle (Mutually Exclusive Buttons)
| Button Label | Filter Criteria | Default | Badge Count |
|--------------|-----------------|---------|-------------|
| Active | Status = active | ✓ | Yes (e.g., "12") |
| All Campaigns | All campaigns based on user permissions | | No |

#### Secondary Filter Dropdowns
| Dropdown Label | Options | Multi-Select | Default |
|----------------|---------|--------------|---------|
| Campaign Type | All Types / One-Time / Recurring | No | All Types |
| Priority | All / Low / Medium / High / Urgent | Yes | All |
| Created By | All Users / [List of users] | Yes | All Users |
| Date Range | Last 7 days / Last 30 days / Last 90 days / Custom | No | Last 30 days |

**Custom Date Range Modal**:
```
┌─────────────────────────────────┐
│  Select Date Range              │
│                                 │
│  From: [DD/MM/YYYY]            │
│  To:   [DD/MM/YYYY]            │
│                                 │
│  [Cancel]  [Apply]             │
└─────────────────────────────────┘
```

#### Advanced Filters (Expandable)
**Toggle**: [Show Advanced Filters ▼] / [Hide Advanced Filters ▲]

**Advanced Filter Fields**:
| Filter Field | Type | Options |
|--------------|------|---------|
| Vendor Count | Range slider | 1-50 vendors |
| Response Rate | Range slider | 0-100% |
| Quality Score | Range slider | 0-100 |
| Template Used | Dropdown | All / [List of templates] |
| Has Recurring Pattern | Checkbox | Yes/No |

### Filter Buttons
| Button Label | Purpose | Style |
|--------------|---------|-------|
| Apply Filters | Apply selected filters to list | Primary (blue) |
| Clear All | Reset all filters to default values | Secondary (gray outline) |
| Save Filter | Save current filter combination | Tertiary (text link) |

---

## Search Section

### Search Bar
**Placeholder Text**: Search by campaign name, description, or vendor...
**Help Text**: Search across campaign names, descriptions, and invited vendor names
**No Results Text**: No campaigns match your search. Try different keywords or clear filters.

**Search Suggestions** (as you type):
```
┌─────────────────────────────────────┐
│  Recent Searches:                   │
│  • Q1 2024 Kitchen Equipment        │
│  • Weekly Produce                   │
│                                     │
│  Suggestions:                       │
│  • Q1 2024 Kitchen Equipment Pricing│
│  • Q2 2024 Beverage Collection      │
└─────────────────────────────────────┘
```

---

## Data Table/List

### View Toggle
**Layout**: Tab-style toggle above table
| View Option | Icon | Default |
|-------------|------|---------|
| Table View | ☰ | ✓ |
| Card View | ▦ | |
| Calendar View | 📅 | |

---

### Table View

#### Table Headers
| Column Header | Sortable | Default Sort | Tooltip | Width |
|---------------|----------|--------------|---------|-------|
| Campaign Name | Yes | Desc | Campaign identifier and description | 250px |
| Type | Yes | - | One-time or recurring | 120px |
| Priority | Yes | - | Campaign urgency level | 100px |
| Vendors | No | - | Number of invited vendors | 100px |
| Progress | No | - | Submission completion status | 200px |
| Start Date | Yes | - | Campaign start date | 120px |
| End Date | Yes | - | Campaign end date | 120px |
| Status | Yes | - | Current campaign status | 120px |
| Actions | No | - | Available actions | 80px |

#### Column Content Formats

**Campaign Name Column**:
```
Q1 2024 Kitchen Equipment Pricing
Created by John Doe • 5 days ago
```
- **Primary**: Campaign name (bold, text-gray-900)
- **Secondary**: Creator and creation date (text-sm, text-gray-500)

**Type Column**:
- **One-Time**: Badge with gray background
- **Recurring**: Badge with blue background + frequency
  ```
  🔄 Recurring
  Quarterly
  ```

**Priority Column**:
| Priority | Badge Color | Icon |
|----------|-------------|------|
| Low | Gray | 📋 |
| Medium | Blue | 📊 |
| High | Orange | ⚠️ |
| Urgent | Red | 🚨 |

**Vendors Column**:
```
12 invited
8 responded (67%)
```
- **Total invited**: Bold
- **Response rate**: Parentheses, color-coded:
  - <50%: Red
  - 50-79%: Yellow
  - ≥80%: Green

**Progress Column**:
```
┌─────────────────────────────────┐
│ ████████░░░░░░░░ 45%            │
│ 5 of 12 submissions completed   │
└─────────────────────────────────┘
```
**Progress Bar Colors**:
- 0-30%: Red (bg-red-500)
- 31-60%: Yellow (bg-yellow-500)
- 61-89%: Blue (bg-blue-500)
- 90-100%: Green (bg-green-500)

**Hover Tooltip on Progress**:
```
Submission Status:
✅ Completed: 5
⏳ Pending: 4
📝 Draft: 2
❌ Failed: 1
```

**Start Date / End Date Columns**:
- Format: DD MMM YYYY
- Example: 15 Jan 2024
- If recurring: Show next instance date

**Status Column**:
| Status Value | Badge Color | Badge Text | Icon |
|--------------|-------------|------------|------|
| Draft | Gray | Draft | 📝 |
| Active | Green | Active | 🟢 |
| Paused | Yellow | Paused | ⏸️ |
| Completed | Blue | Completed | ✅ |
| Cancelled | Red | Cancelled | ❌ |

**Status with Additional Context**:
```
🟢 Active
Ends in 5 days
```

**Actions Column**:
- **Icon buttons**: Eye (view), Pencil (edit), More (...)
- **Dropdown menu on "More" click**:
  ```
  View Details
  Edit Campaign
  Pause Campaign
  Send Reminders
  Download Report
  ────────────────
  Cancel Campaign
  ```

---

### Card View

**Card Layout**: 3 columns on desktop, 2 on tablet, 1 on mobile

#### Campaign Card
```
┌─────────────────────────────────────────────┐
│ 🚨 URGENT                                   │
│                                             │
│ Q1 2024 Kitchen Equipment Pricing          │
│ One-time • Created by John Doe              │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ Progress: ████████░░ 67%            │    │
│ │ 8 of 12 submissions                 │    │
│ └─────────────────────────────────────┘    │
│                                             │
│ 📅 15 Jan - 15 Apr 2024                     │
│ 👥 12 vendors • 67% response rate           │
│                                             │
│ 🟢 Active • Ends in 5 days                  │
│                                             │
│ [View Details]        [⋮ More]             │
└─────────────────────────────────────────────┘
```

**Card Sections**:
1. **Header**: Priority badge (top right)
2. **Title**: Campaign name (bold, large)
3. **Metadata**: Type, creator (text-sm, gray)
4. **Progress**: Visual progress bar with stats
5. **Dates**: Start and end dates with icon
6. **Stats**: Vendor count and response rate
7. **Status**: Current status with days remaining
8. **Actions**: View details button + more menu

**Card Hover Effect**: Shadow lift, subtle scale (scale-102)

---

### Calendar View

**Layout**: Monthly calendar grid

**Calendar Header**:
```
← January 2024 →
[Today] [Month] [Week]
```

**Day Cell**:
```
┌──────────────────┐
│  15              │
│                  │
│  🟢 Kitchen Eq.  │
│  ⏳ Produce Col. │
│  ✅ Beverage     │
└──────────────────┘
```

**Campaign Indicators**:
- **Start date**: Colored dot on left
- **End date**: Colored dot on right
- **Ongoing**: Highlighted background
- **Multiple campaigns**: Show count + tooltip

**Click Day**: Show campaigns for that day in modal

---

### Empty State
**Icon**: 📋 Clipboard icon
**Message**:
```
No Price Collection Campaigns Yet
```
**Secondary Message**:
```
Create your first campaign to start collecting pricing from vendors.
Campaigns help you systematically gather competitive pricing and build vendor relationships.
```
**Action Button**: Create Your First Campaign (primary blue)

---

### Loading State
**Message**: Loading campaigns...
**Animation**: Skeleton loading with shimmer effect showing 20 placeholder rows

---

## Row Actions

### Action Buttons/Icons
| Icon/Button | Label | Tooltip | Visibility Rules | Keyboard |
|-------------|-------|---------|------------------|----------|
| 👁️ Eye icon | View | View campaign details | Always visible | Enter |
| ✏️ Pencil icon | Edit | Edit campaign | Status = Draft or Active AND user is creator | E |
| ⏸️ Pause icon | Pause | Pause active campaign | Status = Active | P |
| ▶️ Play icon | Resume | Resume paused campaign | Status = Paused | R |
| 📧 Email icon | Remind | Send reminder emails | Status = Active | M |

### Context Menu (Right-click or ... menu)
| Menu Item | Icon | Action | Divider After | Destructive |
|-----------|------|--------|---------------|-------------|
| View Details | 👁️ | Navigate to detail page | No | No |
| Edit Campaign | ✏️ | Navigate to edit form | No | No |
| Duplicate Campaign | 📋 | Create copy | No | No |
| Pause Campaign | ⏸️ | Pause active campaign | No | No |
| Send Reminders | 📧 | Send reminder emails to vendors | No | No |
| Download Report | 📊 | Export campaign analytics | No | No |
| View Submissions | 📥 | Navigate to submissions list | Yes | No |
| Cancel Campaign | ❌ | Cancel campaign permanently | Yes | Yes |
| Delete Campaign | 🗑️ | Delete draft campaign | No | Yes |

---

## Bulk Actions

### Selection Controls
**Location**: Above table, left side
**Checkbox**: Select all visible campaigns (header checkbox)

**Bulk Action Bar** (appears when 1+ campaigns selected):
```
┌─────────────────────────────────────────────────────────┐
│ 3 campaigns selected                                     │
│                                                          │
│ [Send Reminders] [Export Selected] [Cancel] [Deselect] │
└─────────────────────────────────────────────────────────┘
```

### Bulk Actions Available
| Action | Condition | Confirmation Required |
|--------|-----------|----------------------|
| Send Reminders | Status = Active | Yes |
| Export Selected | Any status | No |
| Pause Campaigns | Status = Active | Yes |
| Resume Campaigns | Status = Paused | No |
| Cancel Campaigns | Status = Active or Paused | Yes (destructive) |

---

## Pagination

### Pagination Controls
**Items Per Page Label**: Show
**Items Per Page Options**: 10, 20, 50, 100
**Default**: 20 items per page
**Page Info Text**: Showing {start} to {end} of {total} campaigns
**Navigation Buttons**:
- First | Previous | Page Numbers | Next | Last
- Disabled state when on first/last page

**Example**: "Showing 1 to 20 of 156 campaigns" | "Page 1 of 8"

**Jump to Page** (optional):
```
Go to page: [___] [Go]
```

---

## Status Messages

### Success Messages
| Trigger | Message | Duration | Position |
|---------|---------|----------|----------|
| Campaign created | ✓ Campaign "{name}" created successfully | 3s | Top right toast |
| Campaign updated | ✓ Campaign updated successfully | 3s | Top right toast |
| Campaign paused | ✓ Campaign paused. Vendor access disabled. | 3s | Top right toast |
| Campaign resumed | ✓ Campaign resumed. Vendor access restored. | 3s | Top right toast |
| Campaign cancelled | ✓ Campaign cancelled. Vendors notified via email. | 5s | Top right toast |
| Reminders sent | ✓ Reminders sent to {count} vendors | 3s | Top right toast |
| Export completed | ✓ Export completed. File downloaded. | 3s | Top right toast |
| Bulk action completed | ✓ Action completed for {count} campaigns | 3s | Top right toast |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Load failed | ✗ Unable to load campaigns. Please refresh the page. | [Retry] button |
| Create failed | ✗ Unable to create campaign. Please try again or contact support. | [Retry] [Contact Support] |
| Update failed | ✗ Unable to update campaign. Your changes were not saved. | [Retry] [Discard] |
| Permission denied | ✗ You don't have permission to perform this action. | [Dismiss] |
| Network error | ✗ Connection error. Please check your internet connection and try again. | [Retry] button |
| Reminder send failed | ✗ Unable to send reminders to some vendors. See details for more info. | [View Details] [Retry Failed] |
| Delete failed | ✗ Unable to delete campaign. It may be in use. | [Dismiss] |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Cancel active campaign | ⚠ Cancel Active Campaign? {count} vendors have pending submissions. Cancelling will disable their access. | [Cancel Campaign] [Keep Active] |
| Delete draft | ⚠ Delete Draft Campaign? This action cannot be undone. | [Delete] [Cancel] |
| Pause campaign | ⚠ Pause Campaign? Vendors will temporarily lose access to submit pricing. | [Pause] [Cancel] |
| Large export | ⚠ Exporting {count} campaigns may take a few moments. Continue? | [Export] [Cancel] |
| Unsaved filter | ⚠ You have unsaved filter changes. Save before leaving? | [Save] [Discard] [Stay] |
| Bulk cancel | ⚠ Cancel {count} Campaigns? This will affect {vendorCount} vendors. | [Proceed] [Cancel] |

### Info Messages
| Trigger | Message |
|---------|---------|
| No active campaigns | ℹ️ No active campaigns. Create a campaign to start collecting pricing. |
| Filter applied | ℹ️ Showing {count} campaigns matching your filters |
| Recurring campaign | ℹ️ This recurring campaign will automatically create new instances based on the schedule |
| Draft reminder | ℹ️ Draft campaigns are not visible to vendors until launched |
| Auto-refresh | ℹ️ Campaign list automatically refreshes every 60 seconds |

---

## Dialogs/Modals

### Dialog 1: Send Reminders Confirmation

#### Dialog Header
**Title**: Send Reminder Emails?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Send reminder emails to vendors who have not yet submitted their pricelists.
```

**Campaign Details**:
- **Campaign**: {Campaign Name}
- **Pending Submissions**: {count} vendors
- **Last Reminder Sent**: {date} or "Never"

**Vendor List Preview** (first 5):
```
Vendors who will receive reminders:
• ABC Suppliers (Last accessed: 2 days ago)
• XYZ Foods (Last accessed: 5 days ago)
• Global Produce (Never accessed)
• ...and {remaining} more
```

**Email Preview Link**: [Preview Email Template →]

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Send Reminders | Primary (blue solid) | Send emails and close |
| Cancel | Secondary (gray outline) | Close dialog without action |

---

### Dialog 2: Cancel Campaign Confirmation

#### Dialog Header
**Title**: Cancel Campaign?
**Icon**: ⚠️ Warning icon (red/yellow)
**Close Button**: X icon in top right

#### Dialog Body

**Warning Text**:
```
⚠️ This action cannot be undone

Cancelling this campaign will:
• Immediately disable vendor access to the portal
• Mark all pending submissions as "Cancelled"
• Send cancellation notification emails to vendors
• Archive the campaign (you can still view historical data)
```

**Campaign Details**:
- **Campaign**: {Campaign Name}
- **Active Vendors**: {count} with portal access
- **Pending Submissions**: {count} in progress
- **Completed Submissions**: {count} (will be preserved)

**Cancellation Reason** (optional):
```
Reason for cancellation (optional):
[_______________________________________]
[_______________________________________]
(This will be included in the vendor notification email)
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Cancel Campaign | Destructive (red solid) | Cancel campaign and send notifications |
| Keep Active | Secondary (gray outline) | Close dialog without action |

---

### Dialog 3: Pause Campaign

#### Dialog Header
**Title**: Pause Campaign?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Pausing will temporarily disable vendor access to the portal. You can resume the campaign at any time.
```

**Impact**:
```
When paused:
✓ Draft submissions are preserved
✓ Completed submissions remain accessible
✗ Vendors cannot access the portal
✗ Auto-save is disabled
✗ Scheduled reminders are suspended
```

**Resume Options**:
```
Resume this campaign:
( ) Manually (when I choose to resume)
( ) Automatically on: [DD/MM/YYYY] at [HH:MM]
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Pause Campaign | Primary (blue solid) | Pause and close |
| Cancel | Secondary (gray outline) | Close dialog |

---

### Dialog 4: Export Options

#### Dialog Header
**Title**: Export Campaigns
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select export format and options
```

**Export Format**:
```
File Format:
( ) Excel (.xlsx) - Best for data analysis with formatting
( ) CSV (.csv) - Compatible with all spreadsheet applications
( ) PDF (.pdf) - Print-ready report with charts
```

**Export Scope**:
```
Include:
( ) Current page only ({count} campaigns)
( ) All filtered results ({count} campaigns)
( ) Selected campaigns ({count} campaigns)
( ) All campaigns ({totalCount} campaigns)
```

**Export Options** (checkboxes):
```
☑ Include vendor submission details
☑ Include progress metrics
☑ Include response rates
☐ Include quality scores
☐ Include historical data (recurring campaigns)
```

**Date Range** (if "All campaigns" selected):
```
Date Range:
From: [DD/MM/YYYY]
To:   [DD/MM/YYYY]
```

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Export | Primary (blue solid) | Start export and download |
| Cancel | Secondary (gray outline) | Close dialog |

---

## Campaign Status Indicators

### Status Badges with Context

**Draft**:
```
📝 Draft
Not visible to vendors
```

**Active**:
```
🟢 Active
{submissions} of {total} submitted
Ends in {days} days
```

**Paused**:
```
⏸️ Paused
Since {date}
```

**Completed**:
```
✅ Completed
{completionRate}% completion rate
```

**Cancelled**:
```
❌ Cancelled
Reason: {reason}
```

**Expired**:
```
⏰ Expired
Ended on {date}
```

---

## Progress Indicators

### Submission Progress Bar
**Visual**: Horizontal bar with percentage
**Color coding based on completion rate**:
- 0-30%: Red
- 31-60%: Yellow
- 61-89%: Blue
- 90-100%: Green

**Hover tooltip**:
```
Submission Breakdown:
✅ Completed: 8 (67%)
📝 In Progress: 2 (17%)
⏳ Not Started: 2 (17%)
───────────────────────
Average Quality Score: 82/100
Average Response Time: 3.2 days
```

### Response Rate Indicator
**Format**:
```
67% response rate
(8 of 12 vendors)
```

**Color coding**:
- <50%: Red text
- 50-79%: Yellow text
- ≥80%: Green text

---

## Notifications

### Toast Notifications
| Trigger | Type | Message | Duration | Position | Actions |
|---------|------|---------|----------|----------|---------|
| Campaign created | Success | Campaign created successfully. Invitations will be sent within 5 minutes. | 5s | Top right | [View Campaign] |
| Vendor invited | Success | Invitation sent to {vendor name} | 3s | Top right | [Dismiss] |
| Submission received | Info | New submission from {vendor name} for {campaign} | 5s | Top right | [Review Now] [Dismiss] |
| Campaign ending soon | Warning | {campaign name} ends in 24 hours | Sticky | Top right | [Send Reminders] [Extend Deadline] |
| All submissions received | Success | All vendors have submitted for {campaign name} | 5s | Top right | [Review All] |
| Campaign auto-launched | Info | Recurring campaign instance "{name}" launched automatically | 5s | Top right | [View Campaign] |

### Bell Icon Notifications (Top Right)
**Badge**: Red dot with count
**Dropdown List**:
```
┌─────────────────────────────────────────┐
│ Notifications (3)                       │
│                                         │
│ 🟢 New submission from ABC Suppliers    │
│    Q1 2024 Kitchen Equipment            │
│    2 minutes ago                        │
│                                         │
│ ⏰ Campaign ending in 24 hours          │
│    Weekly Produce Collection            │
│    1 hour ago                           │
│                                         │
│ ⚠️ Low response rate (30%)              │
│    Beverage Annual RFP                  │
│    3 hours ago                          │
│                                         │
│ [Mark All as Read]  [View All →]       │
└─────────────────────────────────────────┘
```

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| Create button | Create new price collection campaign | For screen readers |
| Export button | Export campaigns to file | For screen readers |
| Search input | Search price collection campaigns | For screen readers |
| Filter dropdown | Filter campaigns by {field} | For screen readers |
| Sort button | Sort by {column name} | For screen readers |
| Action button | Actions for campaign {campaign name} | For screen readers |
| Status badge | Status: {status name} | For screen readers |
| Progress bar | {percentage}% submissions completed | For screen readers |
| Pause button | Pause campaign {campaign name} | For screen readers |
| Resume button | Resume campaign {campaign name} | For screen readers |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Empty state icon | No campaigns illustration |
| Loading spinner | Loading data |
| Status active icon | Active status |
| Status paused icon | Paused status |
| Progress checkmark | Submission completed |
| Warning icon | Warning indicator |

---

## Keyboard Navigation

### Keyboard Shortcuts
| Shortcut | Action | Availability |
|----------|--------|--------------|
| N | Create new campaign | Always (if permission) |
| / | Focus search | Always |
| Tab | Navigate between elements | Always |
| Enter | Open selected campaign | When row focused |
| E | Edit campaign | When row focused + permission |
| P | Pause/Resume campaign | When row focused + permission |
| Delete | Delete draft campaign | When row focused + permission |
| Esc | Close dialog/modal | When dialog open |
| ← → | Navigate pages | Always (if multiple pages) |

### Tab Order
1. Create campaign button
2. Templates button
3. Export button
4. Quick stats cards (left to right)
5. Primary filter toggle buttons
6. Secondary filter dropdowns
7. Search bar
8. View toggle (table/card/calendar)
9. Table headers (sortable)
10. Campaign rows (each row is tabbable)
11. Pagination controls

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Primary action | Create Campaign | Clear, specific action |
| Export action | Export | Short and universally understood |
| Filter apply | Apply Filters | Explicit about multiple filters |
| Filter clear | Clear All | Indicates all filters reset |
| Pause action | Pause Campaign | Clear temporary suspension |
| Resume action | Resume Campaign | Clear restoration of activity |
| Bulk action | Send Reminders to Selected | Clear bulk action scope |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| Campaign name | {Campaign Name} | Campaign detail page |
| View submissions | View {count} Submissions | Submissions list filtered by campaign |
| Breadcrumb - Vendor Management | Vendor Management | Vendor management home |
| Breadcrumb - Home | Home | Application home |
| Show advanced | Show Advanced Filters ▼ | Expand advanced filters |
| Hide advanced | Hide Advanced Filters ▲ | Collapse advanced filters |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Search | "Search by..." | "Search by campaign name, description, or vendor..." |
| Select | "All {field}s" | "All Types", "All Priorities" |
| Date Range | "Select date range" | Date picker opens |
| Number Range | "Min - Max" | "0 - 100" |

---

## Error States

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | Unable to connect. Please check your internet connection and try again. | [Retry] button |
| Server error | Something went wrong on our end. Please try again in a few moments or contact support. | [Retry] button + [Contact Support] link |
| Permission error | You don't have permission to view campaigns. Contact your system administrator. | Redirect to home |
| Not found error | Campaign not found. It may have been deleted. | Redirect to list |
| Load timeout | Loading is taking longer than expected. Please check your connection. | [Retry] [Cancel] |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading campaigns... | Skeleton table with 20 rows |
| Filter apply | Applying filters... | Overlay spinner on table area |
| Export | Preparing export... Progress: {percentage}% | Progress bar in export dialog |
| Send reminders | Sending reminders... {count} of {total} | Progress bar in confirmation dialog |
| Bulk action | Processing {action}... {count} of {total} | Progress bar in bulk action bar |
| Refresh | Refreshing... | Small spinner in header |

---

## Empty States

### No Campaigns Exist
**Icon**: 📋 Clipboard icon
**Primary Message**:
```
No Price Collection Campaigns Yet
```
**Secondary Message**:
```
Create your first campaign to start collecting pricing from vendors.
Price collection campaigns help you systematically gather competitive pricing and maintain vendor relationships.
```
**Call-to-Action**: Create Your First Campaign (primary blue button)

### No Search Results
**Icon**: 🔍 Magnifying glass
**Primary Message**:
```
No Campaigns Found
```
**Secondary Message**:
```
No campaigns match "{search term}". Try different keywords or check your spelling.
```
**Call-to-Action**: [Clear Search] button

### No Filter Results
**Icon**: 📭 Empty inbox
**Primary Message**:
```
No Campaigns Match Your Filters
```
**Secondary Message**:
```
Try adjusting your filters or clearing them to see all campaigns you have access to.
```
**Call-to-Action**: [Clear All Filters] button

### No Active Campaigns
**Icon**: ⏸️ Pause icon
**Primary Message**:
```
No Active Campaigns
```
**Secondary Message**:
```
All your campaigns are currently in draft, paused, completed, or cancelled status.
```
**Call-to-Action**: [Create New Campaign] or [View All Campaigns]

---

## Recurring Campaign Indicators

### Recurring Badge
**Format**:
```
🔄 Recurring
Quarterly
```

**Hover Tooltip**:
```
Recurring Campaign
• Frequency: Quarterly
• Next Instance: 15 Apr 2024
• Instances Created: 2 of 4
• Recurring Until: 31 Dec 2024
```

### Next Instance Indicator
**Location**: Below campaign name in card view
**Format**:
```
📅 Next: 15 Apr 2024 (in 30 days)
```

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Price Collection Campaigns" | Page title, main heading | 40 characters |
| "Create Campaign" | Primary action button | 25 characters |
| "Active" / "Paused" / "Completed" | Status indicators | 15 characters each |
| Column headers | Table column names | 20 characters |
| "Send Reminders" | Action button | 20 characters |
| "Response Rate" | Metric label | 20 characters |
| Quick filter labels | Filter toggle buttons | 20 characters each |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| Campaign IDs | System-generated identifiers |
| Numbers and percentages | Universal numeric values |
| DD MMM YYYY | Standardized date format pattern |
| Email addresses | Contact information |
| URLs | System routes |

---

## Brand Voice Guidelines

### Tone
- Professional and efficient
- Clear and informative
- Action-oriented
- Data-driven

### Writing Style
- Active voice: "Create campaign" not "Campaign can be created"
- Second person: "your campaigns" not "user's campaigns"
- Present tense for actions: "Send" not "Will send"
- Clear terminology: Use "Campaign" not "Initiative" or "Project"

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Price Collection Campaign | Pricing Request, RFP | Campaign identifier |
| Vendor | Supplier, Partner | External party |
| Submission | Response, Entry | Vendor pricelist |
| Response Rate | Participation Rate | Vendor engagement metric |
| Quality Score | Rating, Grade | Submission quality metric |
| Pricelist | Price List, Price-List | Pricing document |

---

## Appendix

### Related Pages
- [PC-vendor-portal-submission.md](./PC-vendor-portal-submission.md) - Vendor price submission page
- PC-campaign-create.md - Campaign creation form (to be created)
- PC-campaign-detail.md - Campaign detail page (to be created)
- PC-template-builder.md - Pricelist template builder (to be created)
- PC-submission-review.md - Submission review page (to be created)

### Content Dependencies
- Campaign data from database
- Vendor data for invitation list
- User permissions for action visibility
- Template library for campaign creation
- Email templates for notifications
- Analytics service for metrics

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-01-23 | Initial version | Created from UC v2.0, TS v2.0 specifications | System |

---

**Document End**
