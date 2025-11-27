# Vendor List Screen Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
```yaml
Title: Vendor List Screen Specification
Module: Vendor Management
Function: Vendor Directory Management
Screen: Vendor List & Search
Version: 1.0
Date: 2025-01-14
Status: Based on Actual Source Code Analysis
```

## Implementation Overview

### Purpose
The Vendor List Screen serves as the central directory for managing vendor price collection settings and performance tracking. Users can search, filter, sort, and perform bulk operations on vendor records while monitoring their price submission performance and data quality metrics.

### File Locations
- Main component: `app/(main)/vendor-management/vendors/page.tsx`
- Type definitions: `lib/types/vendor-price-management.ts`

### User Types
- All authorized users can view vendor listings
- Users with vendor management permissions can perform edit operations
- Administrative users can perform bulk operations and vendor creation

### Current Status
Fully implemented with search, filtering, sorting, and pagination capabilities. Bulk operations show placeholder implementations requiring backend integration.


## Visual Interface

![Vendor List Management View](./images/vendor-list/vendor-list-populated.png)
*Vendor directory interface showing populated data with first record selected, featuring search, filtering, and management capabilities for supplier relationship management*

## Layout & Navigation

### Header Area
- **Page Title**: "Vendor Management" displayed prominently at the top left
- **Primary Action**: "Add New Vendor" button positioned at top right for creating new vendor records
- **Navigation Context**: Accessed through vendor management module navigation

### Action Buttons
- **Add New Vendor**: Creates new vendor record, redirects to vendor creation form
- **View**: Opens detailed vendor information in read-only mode
- **Edit**: Opens vendor record for modification
- **Search**: Executes search query across vendor records
- **Status Filter Checkboxes**: Toggle filters for active, inactive, and suspended vendors

### Layout Structure
- **Single Card Layout**: All content contained within main card component
- **Card Header**: Contains title "Vendor List" and description about managing vendors and pricelist settings
- **Filter Section**: Horizontal layout with search bar, pagination controls, and status filters
- **Data Table**: Sortable columns with vendor information and performance metrics
- **Footer Controls**: Pagination and bulk operation controls when vendors are selected

## Data Display

### Search Functionality
- **Search Input**: Text field with placeholder "Search vendors..." for general vendor search
- **Search Button**: Executes search queries across vendor data
- **Real-time Query**: Search automatically triggers on form submission

### Vendor Table Columns
- **Selection Checkbox**: Individual vendor selection with header checkbox for select all
- **Vendor ID**: Clickable vendor identifier that navigates to detail view
- **Status Badge**: Color-coded status indicators (green for active, gray for inactive, red for suspended)
- **Response Rate**: Percentage display of vendor response rate to price requests
- **Quality Score**: Visual progress bar with numerical score (0-100) showing data quality metrics
- **Last Submission**: Date of most recent price submission or "Never" if no submissions
- **Categories**: Badge display showing first two assigned categories with count indicator for additional categories
- **Actions**: View and Edit buttons for each vendor record

### Performance Indicators
- **Response Rate**: Displayed as percentage with one decimal place precision
- **Quality Score**: Visual progress bar filled proportionally with numerical score
- **Submission Tracking**: Date formatting for last submission with fallback to "Never"

### Pagination Controls
- **Items Per Page**: Dropdown selector with options for 5, 10, 25, or 50 items per page
- **Page Navigation**: Previous/Next buttons with numbered page buttons
- **Results Summary**: Shows "Showing X to Y of Z vendors" with current page range
- **Smart Pagination**: Displays up to 5 page numbers with ellipsis for large result sets

## User Interactions

### Search and Filtering
- **Text Search**: Users can search across vendor records using the search input field
- **Status Filtering**: Multiple checkbox filters for vendor status (active, inactive, suspended)
- **Filter Combination**: Status filters work in combination with search queries
- **Filter Reset**: Changing filters automatically resets to first page

### Sorting Capabilities
- **Sortable Columns**: Vendor ID, Response Rate, and Quality Score columns support sorting
- **Sort Indicators**: Arrow indicators show current sort field and direction (ascending/descending)
- **Toggle Sorting**: Clicking same column header reverses sort direction
- **Default Sort**: Initial sort by vendor name in ascending order

### Bulk Operations
- **Multi-Selection**: Checkbox selection for individual vendors or select all
- **Selection Counter**: Shows count of selected vendors when any are selected
- **Bulk Actions Bar**: Appears when vendors are selected with available actions
- **Available Operations**: Change Status, Assign Categories, and Delete options
- **Confirmation Dialogs**: Delete operations require user confirmation

### Navigation Actions
- **Vendor Details**: Clicking vendor ID or View button navigates to vendor detail screen
- **Edit Vendor**: Edit button redirects to vendor modification form
- **Create Vendor**: Add New Vendor button navigates to vendor creation form

## Role-Based Functionality

### All Authorized Users
- **View Access**: Can see vendor list with all displayed information
- **Search Capability**: Can search and filter vendor records
- **Basic Navigation**: Can access vendor detail views

### Vendor Management Staff
- **Edit Permissions**: Can modify vendor records through Edit buttons
- **Status Management**: Can view and understand vendor status indicators
- **Performance Monitoring**: Can access all performance metrics and data quality scores

### Administrative Users
- **Bulk Operations**: Can perform bulk status changes, category assignments, and deletions
- **Vendor Creation**: Can add new vendors to the system
- **Full Management**: Complete access to all vendor management capabilities

### System Administrators
- **Complete Access**: All vendor management functions available
- **Bulk Deletion**: Can perform bulk vendor removal operations
- **System Integration**: Access to underlying vendor performance data

## Business Rules & Validation

### Search Validation
- **Query Processing**: Search queries are processed across vendor identification and associated data
- **Real-time Results**: Search results update based on current filter selections
- **Empty States**: Appropriate messaging when no vendors match search criteria

### Status Management
- **Status Options**: Three defined statuses - active, inactive, and suspended
- **Visual Indicators**: Each status has distinct color coding for immediate recognition
- **Filter Logic**: Status filters work inclusively (multiple statuses can be selected)

### Performance Metrics
- **Response Rate Calculation**: Displayed as percentage with single decimal precision
- **Quality Score Range**: Scores displayed on 0-100 scale with visual progress indicators
- **Data Validation**: Performance metrics reflect actual vendor submission history

### Pagination Logic
- **Page Size Options**: Fixed options of 5, 10, 25, and 50 items per page
- **Page Boundary**: Prevents navigation beyond first and last pages
- **Results Calculation**: Accurate display of current page range within total results

### Selection Validation
- **Bulk Operation Requirements**: Bulk actions only available when vendors are selected
- **Selection Limits**: No maximum limit on vendor selection for bulk operations
- **Action Confirmation**: Destructive operations require explicit user confirmation

## Current Limitations

### Placeholder Implementations
- **Bulk Status Change**: Shows alert message "Bulk status change not implemented"
- **Bulk Category Assignment**: Shows alert message "Bulk category assignment not implemented"
- **Bulk Delete**: Shows alert message "Bulk delete not implemented" after confirmation

### Backend Integration Gaps
- **API Endpoint**: Vendor data fetched from `/api/price-management/vendors` endpoint
- **Real Data**: Currently relies on mock data structure defined in type definitions
- **Error Handling**: Basic error display implemented but may need enhanced error recovery

### Performance Considerations
- **Loading States**: Basic loading indicator during data fetch operations
- **Large Datasets**: Pagination implemented but performance with very large vendor lists untested
- **Filter Performance**: Multiple simultaneous filters may impact response times

### Enhanced Features Needed
- **Advanced Filtering**: No date range filtering for last submission dates
- **Export Functionality**: No capability to export vendor lists or performance data
- **Sorting Limitations**: Limited sortable columns compared to available data fields
- **Category Filtering**: Status filtering implemented but category-based filtering not available

### User Experience Gaps
- **Mobile Responsiveness**: Table layout may need optimization for mobile devices
- **Keyboard Navigation**: Full keyboard accessibility not verified for all interactive elements
- **Screen Reader Support**: Accessibility features may need enhancement for assistive technologies

This specification documents the current implementation of the Vendor List Screen as found in the source code, including both completed features and acknowledged limitations requiring future development.