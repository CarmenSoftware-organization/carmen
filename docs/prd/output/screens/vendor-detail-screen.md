# Vendor Detail Screen Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
```yaml
Title: Vendor Detail Screen Specification
Module: Vendor Management
Function: Vendor Profile Management
Screen: Vendor Detail View
Version: 1.0
Date: 2025-01-14
Status: Based on Actual Source Code Analysis
```

## Implementation Overview

**Purpose**: Comprehensive vendor profile management screen that allows users to view, edit, and manage detailed vendor information including basic details, contact information, addresses, certifications, tax configuration, and price lists.

**File Locations**: 
- Main component: `app/(main)/vendor-management/manage-vendors/[id]/page.tsx`
- Price management variant: `app/(main)/vendor-management/vendors/[id]/page.tsx`
- Supporting components: Various section components for addresses, contacts, certifications

**User Types**: All authenticated users can view vendor details; editing capabilities may be restricted based on role permissions

**Current Status**: Fully implemented with comprehensive vendor profile management, edit capabilities, status management, and tabbed interface for different data categories


## Visual Interface

![Vendor Detail Profile View](./images/vendor-detail/vendor-detail-default.png)
*Comprehensive vendor profile management interface showing contact details, certifications, pricing information, and relationship management*

## Layout & Navigation

**Header/Title Area**: 
- Back navigation button (chevron left) that returns to vendor list
- Vendor company name as primary heading
- Status badge showing active/inactive state with color coding (green for active, gray for inactive)
- Status toggle switch allowing quick status changes
- Action buttons: Print, Edit Vendor, Delete Vendor (layout changes based on edit mode)

**Action Buttons**:
- **View Mode**: Print button with printer icon, Edit Vendor button (primary), Delete Vendor button (outline with red styling)
- **Edit Mode**: Save Changes button (primary), Cancel button (outline)
- All buttons have appropriate hover states and disabled states during operations

**Layout Structure**: 
- Summary card at top with vendor overview information and rating display
- Tabbed interface below with four main sections: Overview, Price Lists, Contacts & Addresses, Certifications
- Two-column grid layout for detail cards within tabs
- Responsive design that adapts to mobile and desktop screens

## Data Display

**Summary Card Information**:
- Primary address with map pin icon (street, city, state, postal code)
- Primary contact with phone icon (email and phone number)
- Registration and tax information with document icon (company registration number, tax ID, tax rate percentage)
- Establishment date with calendar icon
- Vendor rating displayed as circular badge with award icon (calculated from quality score, shown as X.X/5 format)

**Overview Tab Fields**:
- Basic Information section: Company name, contact email, business type
- Tax Configuration section: Tax ID (editable), Tax Profile dropdown (None VAT, VAT Thailand, GST, Sales Tax, Custom), Tax Rate percentage (editable), Company Registration number (editable)
- Primary Address card: Street address, city, state, postal code
- Primary Contact card: Email address, phone number

**Status Indicators**:
- Vendor status badge with color coding (green for active, gray for inactive)
- Status toggle switch with immediate feedback
- Loading states during status updates
- Success/error toast notifications for status changes

**Tables/Lists**:
- Certification badges displayed as secondary styled badges
- Address and contact information in structured card format
- Price Lists tab shows dedicated component for price list management

## User Interactions

**Edit Mode Functionality**:
- Toggle between view and edit modes using Edit Vendor button
- In edit mode, Tax ID becomes editable input field
- Tax Profile becomes dropdown with predefined options (None VAT, VAT Thailand, GST, Sales Tax, Custom)
- Tax Rate becomes numeric input with min/max validation (0-100, step 0.01)
- Company Registration becomes editable input field
- Auto-population of tax rates based on selected tax profile

**Status Management**:
- Toggle switch immediately updates vendor status
- Confirmation feedback through toast notifications
- Error handling with reversion to previous state on failure
- Visual feedback during status change processing

**Form Elements**:
- Text inputs for tax ID and company registration
- Dropdown select for tax profile with automatic rate setting
- Numeric input for tax rate with decimal precision
- All form fields have proper labels and placeholder text
- Validation prevents invalid tax rate values

**Modal Dialogs**:
- Delete confirmation dialog with vendor details
- Proper confirmation workflow before vendor deletion
- Cancel and confirm options with appropriate styling

**Bulk Operations**: 
- Currently not implemented on this detail screen
- Focused on individual vendor management

## Role-Based Functionality

**All Authenticated Users**:
- View vendor basic information, contact details, addresses
- Access summary information and vendor rating
- View certifications and tax configuration
- Navigate between different information tabs
- Print vendor information

**Users with Edit Permissions**:
- Toggle between view and edit modes
- Modify tax configuration (Tax ID, Tax Profile, Tax Rate, Company Registration)
- Update vendor status (active/inactive) with immediate effect
- Save changes with validation
- Cancel edit operations to revert changes

**Users with Administrative Permissions**:
- Delete vendor records with confirmation dialog
- Access to all vendor management functions
- Manage vendor relationships and price lists

**Price List Management**:
- Dedicated tab for price list management
- Integration with vendor price list components
- Role-based access to price list modification

## Business Rules & Validation

**Tax Configuration Rules**:
- Tax rate must be between 0 and 100 percent
- Tax profile selection automatically sets default tax rates:
  - None VAT: 0%
  - VAT (Thailand): 7%
  - GST: 10%
  - Sales Tax (USA): 8.5%
  - Custom: User-defined rate
- Tax ID format validation for proper tax identification

**Status Change Validation**:
- Status changes require confirmation
- Immediate feedback for successful/failed status updates
- Automatic reversion on API failure
- Toast notifications for all status change outcomes

**Field Requirements**:
- Company name is displayed as read-only identifier
- Contact email is required for vendor operations
- Tax configuration fields are optional but validated when provided
- Address information is optional but formatted consistently

**Delete Operations**:
- Delete confirmation dialog prevents accidental deletion
- Confirmation required with vendor name context
- Navigation to vendor list after successful deletion
- Error handling for failed deletion attempts

## Current Limitations

**Placeholder Features**:
- "Add Address" and "Add Contact" buttons in edit mode show but functionality not implemented
- "Add Certification" button appears but certification management not fully implemented
- Multi-address and multi-contact management not currently functional

**Missing Integration**:
- Price Lists tab delegates to separate component but integration may be limited
- Vendor rating calculation based on mock performance metrics
- Print functionality uses browser print without custom formatting
- API integration for some operations may use mock data

**Known Issues**:
- Status dropdown implementation uses manual DOM manipulation instead of controlled components
- Some form validation may rely on browser validation rather than custom validation
- Edit mode validation feedback could be more comprehensive
- No auto-save functionality for partially completed edits

**Navigation Limitations**:
- Back navigation is hardcoded to vendor list, no breadcrumb support
- No support for navigating between vendor records without returning to list
- Print view not optimized for vendor detail formatting

**Data Persistence**:
- Some edit operations may use optimistic updates without proper rollback
- Form state not preserved during navigation away from page
- No draft save functionality for extended edit sessions