# Campaigns Submodule

## Table of Contents

1. [Overview](#overview)
2. [Campaigns List Page](#campaigns-list-page)
3. [New/Detail Campaign Pages](#newdetail-campaign-pages)

---

## Overview

**Submodule Name**: Campaigns
**Route**: `/vendor-management/campaigns`
**Status**: 🚧 Prototype
**Purpose**: RFP/RFQ campaign management for collecting vendor pricing through coordinated invitations

**Key Features**:
- Campaign creation and editing
- Multi-vendor invitation management
- Email template customization
- Response tracking
- Campaign scheduling
- Result export and comparison

---

## Campaigns List Page

**Path**: `/vendor-management/campaigns`
**File**: `app/(main)/vendor-management/campaigns/page.tsx`

![Campaigns List](screenshots/vm-campaigns-list.png)
*RFP Campaigns List - Campaign management and tracking*

**Status**: 🚧 Prototype

### Table Columns
- Campaign Name
- Template Used
- Start Date
- End Date
- Vendors Invited
- Responses Received
- Status
- Actions

### Campaign Status Options
- Draft
- Active
- Completed
- Cancelled

### Actions
- Create Campaign
- Edit Campaign
- View Responses
- Send Reminders
- Close Campaign
- Export Results

### Action Flows

**Create Campaign**:
```mermaid
flowchart LR
    Click["Click Create Campaign"] --> Navigate["Navigate to New Campaign Form"]
    Navigate --> Display["Display Campaign Form"]
```

**Edit Campaign**:
```mermaid
flowchart LR
    Click["Click Edit Campaign"] --> Navigate["Navigate to Edit Campaign Page"]
    Navigate --> Display["Display Pre-populated Form"]
```

**View Responses**:
```mermaid
flowchart LR
    Click["Click View Responses"] --> Navigate["Navigate to Campaign Detail Page"]
    Navigate --> Display["Display Vendor Responses"]
```

**Send Reminders**:
```mermaid
flowchart LR
    Click["Click Send Reminders"] --> Modal["Show Reminder Confirmation"]
    Modal --> Send["Send Email Reminders to Vendors"]
```

**Close Campaign**:
```mermaid
flowchart LR
    Click["Click Close Campaign"] --> Modal["Show Close Confirmation Modal"]
    Modal --> Update["Update Campaign Status to Completed"]
```

**Export Results**:
```mermaid
flowchart LR
    Click["Click Export Results"] --> Generate["Generate Comparison Report"]
    Generate --> Download["Download Excel File"]
```

---

## New/Detail Campaign Pages

**Path**: `/vendor-management/campaigns/new` or `/vendor-management/campaigns/:id`
**Files**:
- `app/(main)/vendor-management/campaigns/new/page.tsx`
- `app/(main)/vendor-management/campaigns/[id]/page.tsx`

![New Campaign](screenshots/vm-campaign-new.png)
*New Campaign Creation - Vendor selection and invitation management*

### Form Sections

**1. Campaign Information**
- Campaign Name
- Description
- Template Selection
- Start Date
- End Date

**2. Vendor Selection**
- Multi-select vendor list
- Filter by category
- Bulk select options

**3. Invitation Settings**
- Email template
- Send immediately or schedule
- Reminder schedule

**4. Response Tracking** (Detail view only)
- Vendors invited
- Responses received
- Pending responses
- Response deadline

### Actions
- Save Campaign
- Send Invitations
- Schedule Campaign
- Cancel Campaign
- View Vendor Responses
- Send Reminder

### Modals
- Vendor Selection Dialog
- Email Preview
- Schedule Confirmation
- Response Detail View

### Action Flows

**Save Campaign**:
```mermaid
flowchart LR
    Click["Click Save Campaign"] --> Validate["Validate Form"]
    Validate --> Create["Create Campaign Record"]
    Create --> Navigate["Navigate to Campaigns List"]
```

**Send Invitations**:
```mermaid
flowchart LR
    Click["Click Send Invitations"] --> Modal["Show Email Preview Modal"]
    Modal --> Send["Send Invitations to Selected Vendors"]
```

**Schedule Campaign**:
```mermaid
flowchart LR
    Click["Click Schedule Campaign"] --> Modal["Show Schedule Confirmation Modal"]
    Modal --> Schedule["Schedule Campaign for Future Date"]
```

**Select Vendors**:
```mermaid
flowchart LR
    Click["Click Select Vendors"] --> Open["Open Vendor Selection Dialog"]
    Open --> Add["Add Selected Vendors to Campaign"]
```

**Preview Email**:
```mermaid
flowchart LR
    Click["Click Preview Email"] --> Open["Open Email Preview Modal"]
    Open --> Display["Display Email Template"]
```

**View Vendor Responses**:
```mermaid
flowchart LR
    Click["Click View Response"] --> Open["Open Response Detail Modal"]
    Open --> Display["Display Vendor Submission"]
```

**Send Reminder**:
```mermaid
flowchart LR
    Click["Click Send Reminder"] --> Modal["Show Reminder Confirmation"]
    Modal --> Send["Send Reminder Email to Vendors"]
```

**Template Selection**:
```mermaid
flowchart LR
    Click["Click Template Dropdown"] --> Open["Open Template Options"]
    Open --> Select["Select Template"]
```

---

**Last Updated**: 2025-10-02
**Status**: Complete
**Module**: Vendor Management
**Submodule**: Campaigns
