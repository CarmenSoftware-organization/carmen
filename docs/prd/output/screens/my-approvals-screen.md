# My Approvals Dashboard Screen Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
```yaml
Title: My Approvals Dashboard Screen Specification
Module: Procurement
Function: Approval Management
Screen: Department Approval Dashboard
Version: 1.0
Date: 2025-01-14
Status: Based on Actual Source Code Analysis
```

## Implementation Overview

**Purpose**: This screen provides department managers and approvers with a centralized dashboard to review, approve, and track procurement requests submitted by their staff members. It enables efficient approval workflow management with clear visibility into pending items, flagged requests, and approval history.

**File Locations**: 
- Main component: `app/(main)/procurement/my-approvals/page.tsx`
- Primary dashboard: `app/(main)/procurement/purchase-requests/components/dashboard-approval.tsx`

**User Types**: Department managers, procurement approvers, and supervisors with approval authority for purchase requests within their departments.

**Current Status**: Fully implemented with mock data for demonstration purposes. Approval actions currently show console logging rather than backend integration.


## Visual Interface

![My Approvals Workflow View](./images/my-approvals/my-approvals-default.png)
*Personal approval dashboard displaying pending approvals, workflow status, and decision-making interface across all modules*

## Layout & Navigation

**Header Area**: The screen displays "Department Approval" as the main page title with clear typography to establish the approval context for users.

**Main Layout Structure**: Three-column responsive layout design with the primary approval queue taking up two-thirds of the screen width on larger displays, and supporting information panels occupying the remaining space on the right side.

**Content Organization**: Information is organized into distinct card-based sections that visually separate different types of approval-related data and activities.

## Data Display

**Procurement Request Queue**: Central card displaying staff requests awaiting approval, organized in a tabbed interface with scrollable content areas to accommodate varying numbers of pending items.

**Request Information Fields**: Each pending request shows item name, quantity, total cost, requester name, department, and urgency level with clear formatting and appropriate visual hierarchy.

**Status Indicators**: Color-coded urgency badges using green for low priority, yellow for medium priority, and red for high priority items, providing immediate visual assessment of request importance.

**Department Badges**: Gray-colored badges with user icons showing the originating department for each request, helping approvers quickly identify the source.

**Recent Approvals History**: Right-side panel showing chronological log of recent approval decisions with action type, request details, department, cost, and timestamp information.

**Activity Tracking**: Each approval history entry displays color-coded badges (green for approved, red for rejected, yellow for approved with changes) along with action icons for quick visual recognition.

**Notifications Panel**: Bottom right section showing system notifications and alerts with bell icons, providing updates on urgent requests, reports, and system changes.

## User Interactions

**Tab Navigation**: Two-tab system allowing users to switch between "Pending Approval" and "Flagged for Review" views to organize different types of requests requiring attention.

**Approval Actions**: Each pending request provides "Details" and "Approve" buttons, with the Details button navigating to the full purchase request detail page for comprehensive review.

**Flagged Review Actions**: Flagged items display "Details" and "Review" buttons, with the Review button specifically designed for items requiring additional scrutiny before approval decisions.

**Scrollable Content**: All content areas include scroll functionality to handle varying volumes of requests, approvals, and notifications without overwhelming the interface.

**Request Details Navigation**: Clicking the Details button navigates users to the purchase request detail page in edit mode, allowing full review of request specifications and history.

## Role-Based Functionality

**Department Manager Permissions**: Can view and approve requests from their assigned departments, access approval history, and receive notifications relevant to their approval authority.

**Approval Authority**: Users can approve requests within their department scope, with the system displaying only requests requiring their level of approval authority.

**Review Capabilities**: Ability to review flagged items that require additional scrutiny due to high values, unusual quantities, or other business rule triggers.

**Notification Access**: Receive system notifications about urgent requests, monthly reports, and supplier updates relevant to their approval responsibilities.

## Business Rules & Validation

**Approval Queue Organization**: Requests are automatically categorized into pending approval and flagged review sections based on predefined business rules and thresholds.

**Urgency Classification**: System assigns urgency levels (High, Medium, Low) to requests based on business rules, with appropriate color coding and priority handling.

**Flagging Logic**: High-value requests and items exceeding usual quantities are automatically flagged for special review, requiring additional attention before approval.

**Department Filtering**: Users only see requests from departments under their approval authority, ensuring proper segregation of approval responsibilities.

**Navigation Requirements**: Details button functionality requires request ID parameter for proper navigation to the purchase request detail page.

## Current Limitations

**Mock Data Implementation**: All displayed requests, approval history, and notifications currently use hardcoded mock data arrays rather than dynamic backend integration.

**Approval Action Placeholders**: Approve and Review buttons currently show placeholder functionality without actual backend processing or workflow advancement.

**Limited User Context**: The system does not currently integrate with user authentication to filter requests based on actual user department assignments and approval authority.

**Static Notification System**: Notifications are displayed as static content rather than dynamic system-generated alerts based on actual events and deadlines.

**No Bulk Operations**: The interface lacks bulk approval capabilities for processing multiple requests simultaneously, requiring individual item handling.

**Missing Search and Filtering**: No search functionality or advanced filtering options are available to help users locate specific requests or filter by criteria such as amount ranges or specific requesters.

**Approval Workflow Integration**: Limited integration with broader procurement workflow system for status updates, email notifications, and approval chain management.

**Real-time Updates**: The interface does not currently support real-time updates for new requests or status changes, requiring manual page refresh for current information.