# Product Requirements Document: Purchase Order Module

## 1. Overview

### 1.1 Product Description
The Purchase Order (PO) Module is a web-based component within a larger procurement system that enables users to create, view, edit, and manage purchase orders. The module provides functionality for generating purchase orders from purchase requisitions (PRs), tracking partial receipts, conducting quality control checks, and facilitating communication with vendors through printing and emailing capabilities.

### 1.2 Objectives
- Streamline the process of creating purchase orders from purchase requisitions
- Provide a responsive web interface for managing the full lifecycle of purchase orders
- Enable efficient tracking of received goods and partial deliveries
- Support export and reporting functions for procurement analysis
- Facilitate vendor communication through printing and emailing features

### 1.3 User Roles
The Purchase Order module supports the following user roles:

- **Procurement Officer**: Primary users who create and manage purchase orders
- **Procurement Manager**: Users who oversee procurement activities and have additional permissions beyond Procurement Officers
- **Finance Officer**: Users who review financial aspects of purchase orders
- **Finance Manager**: Users who oversee financial aspects and have expanded viewing rights
- **Department Manager**: Users who review purchase orders related to their departments
- **Inventory Manager**: Users who manage goods receipt processes
- **General User**: Users with limited access to view assigned purchase orders
- **Vendor**: External stakeholders who receive completed purchase order documents via email (not a system user role)

Detailed permissions for each role are defined in the Role-Based Access Control (RBAC) Matrix in section 6.3.1.

## 2. Technical Requirements

### 2.1 Technology Stack
- **Frontend**: Next.js 14, Shadcn UI components
- **Backend**: Node.js with appropriate APIs
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Reporting**: Integration with Fast Report System for document formatting and export

### 2.2 Design Requirements
- Responsive web design to support various device sizes
- Adherence to organization's design system and UI patterns
- Accessibility compliance for all features

### 2.3 Performance Requirements
- Efficient loading of purchase order lists and details
- Responsive UI with minimal loading times
- Capable of handling concurrent users and operations

## 3. Functional Requirements

### 3.1 Purchase Order List Screen

#### 3.1.1 Core Functionality
- Display a paginated list of purchase orders with filterable/sortable columns
- Support searching by various attributes (date, vendor, reference number, etc.)
- Include refresh functionality to update with latest data
- Provide view selection for different predefined filters or custom views

#### 3.1.2 Action Buttons
- **Create**: Open a form to manually create a new purchase order
- **Export**: Generate exports in various formats (CSV, Excel, PDF) with configurable fields and filters
- **Print**: Support printing functionality
  - Print by Date: Generate prints filtered by date range
  - Print multiple POs simultaneously
  - Print POs sorted by delivery date

#### 3.1.3 Data Columns
- Date
- Description 
- Reference Number
- Vendor
- Total Amount
- Pending Amount
- Status (Draft, Sent, Partial, Fully Received, Closed, Voided)
- Delivery Date

### 3.2 Create PO from PR Feature

#### 3.2.1 Workflow
1. User selects currency for the Purchase Order
2. System displays a list of valid Purchase Requisitions in a tabular format, filtered by the selected currency
3. User selects PRs to convert into POs
4. System creates POs grouped by vendors and delivery dates
5. System displays a confirmation screen with the generated POs

#### 3.2.2 Confirmation Screen
- Display reference numbers, vendors, email information, and totals for each generated PO
- Provide options to:
  - Print the generated POs
  - Send email to vendors
  - Confirm and return to the previous screen

#### 3.2.3 Grouping Logic
- Multiple PRs can be used to create multiple POs
- POs are separated by vendors and delivery dates
- System handles the appropriate grouping automatically

### 3.3 Purchase Order Detail View Screen

#### 3.3.1 Header Section
- PO Reference Number
- Date
- Delivery Date
- Description
- Buyer
- Vendor
- Currency
- Credit Term
- Status
- Remarks fields

#### 3.3.2 Action Bar - View Mode
- **Edit Button**: Enable modification of PO details
- **Void Button**: Allow voiding of POs (only when status is "Sent", "Partial", or "Fully Received")
- **Close PO Button**: Mark PO as completed
- **Print Button**: Generate physical document or PDF
- **Email Button**: Send PO to vendor with CC options
- **Back Button**: Navigate to previous screen

#### 3.3.3 Action Bar - Edit Mode
- **Save Button**: Commit changes to the PO
- **Cancel Button**: Discard changes
- **Back to List Button**: Return to PO list with prompt to save changes

#### 3.3.4 Item List
- Item descriptions (English and Thai)
- Order quantities and units
- Received quantities
- FOC (Free of Charge) quantities
- Cancelled quantities
- Unit prices (configurable to show 4 decimal places)
- Line item totals

#### 3.3.5 Item Detail Expanded Section
- Financial Details
  - Conversion rates and base quantities
  - Discount percentages and adjustments
  - Tax information and adjustments
  - Financial totals in transaction and base currencies
- Inventory Status
  - On-hand quantities
  - On-order quantities
  - Min/Max levels (replacing Reorder/Restock)
  - Last price and vendor information
  - Store location and business unit
  - Integrated receiving details for Good Received notes

#### 3.3.6 Purchase Order Total Section
- Currency information
- Total purchase amount
- Total discount amount
- Total tax amount
- Grand total

#### 3.3.7 Collapsable Sidebar
- Comment section
- Attachment section
- Activity log section

### 3.4 Good Receive Note Integration

#### 3.4.1 Receiving Functionality
- Create Good Receive Notes from Purchase Orders
- Track partial receipts against purchase orders
- Support quality control check processes
- Update item inventory status based on receipts
- Link receiving reference numbers to purchase orders

#### 3.4.2 Unit Conversion Handling
- Support different units for receiving vs. ordering
- Convert between units using base unit comparisons
- Allow manual adjustments for conversion rates when necessary

### 3.5 Item Detail View and Edit

#### 3.5.1 Item Detail View Mode
- Display comprehensive information about individual line items
- Show all financial details including:
  - Conversion rates and base quantities
  - Discount percentages
  - Tax information
  - Financial totals in transaction and base currencies
- Display inventory status information including:
  - On-hand quantities
  - On-order quantities
  - Min/Max levels
  - Last price and vendor information
- Show related Good Receive Note information when available
- Provide a clear visual differentiation between view and edit modes

#### 3.5.2 Item Detail Edit Mode
- **Add Item Details**: Allow adding new items to the PO
- **Edit Existing Items**: Enable modification of item details including:
  - Item descriptions
  - Order quantities and units
  - Unit prices (with 4 decimal place configuration)
  - Discount percentages
  - Tax rates and types
- **Receive Action**: Enable input of received quantities
- **Adjustments**:
  - Allow manual adjustments to conversion rates and base quantities
  - Support adjustment for discount percentages to correct rounding errors
  - Provide adjustment capability for tax rates
- **Cancel Item**: Allow procurement managers to edit canceled item quantities
- **Action Buttons**:
  - Save button to commit item changes
  - Cancel button to discard changes without saving
- Validate all entries to ensure data consistency

#### 3.5.3 Item Detail Information Lookup
- **Inventory Lookup**: Provide real-time access to current inventory information
  - On-hand quantities across all locations
  - Available quantities (on-hand minus allocated)
  - Reserved quantities for other orders
  - Historical consumption patterns
  - Trend analysis of usage over time
- **Pricing History Lookup**: Display historical pricing information
  - Last purchase price from various vendors
  - Price trend analysis over time
  - Variance from standard or expected cost
  - Currency conversion history if applicable
- **Vendor Performance Lookup**: Show vendor-specific information
  - Delivery performance metrics
  - Quality ratings from previous orders
  - Returns and rejection history
  - Vendor-specific pricing agreements
- **Item Specifications Lookup**: Access to detailed item specifications
  - Technical specifications and requirements
  - Alternative items or substitutes
  - Related items frequently ordered together
  - Attachments such as technical drawings or datasheets
- **Cross-Reference Lookup**: Provide mapping to different coding systems
  - Vendor item codes and descriptions
  - Manufacturer part numbers
  - Internal classification codes
  - Industry standard codes
- **Transaction History Lookup**: Display comprehensive transaction history
  - Previous purchase orders for this item
  - Receiving history with dates and quantities
  - Quality control results from previous deliveries
  - Payment history related to this item

#### 3.4.1 Receiving Functionality
- Create Good Receive Notes from Purchase Orders
- Track partial receipts against purchase orders
- Support quality control check processes
- Update item inventory status based on receipts
- Link receiving reference numbers to purchase orders

#### 3.4.2 Unit Conversion Handling
- Support different units for receiving vs. ordering
- Convert between units using base unit comparisons
- Allow manual adjustments for conversion rates when necessary

### 3.6 Related Information Tabs

#### 3.6.1 Tab Structure
- Implement a tabbed interface to organize related purchase order information
- Include the following tabs:
  - **Main**: Display the primary PO information including header and line items
  - **Receiving History**: Show all Good Receive Notes linked to this PO
  - **Payment History**: Display payment information and status for this PO
  - **Related Documents**: Show links to related documents such as original PRs, invoices, etc.
  - **Audit Trail**: Provide a complete history of changes made to the PO

#### 3.6.2 Tab Functionality
- Allow users to switch between tabs without losing context
- Maintain state when navigating between tabs
- Support data refresh for individual tabs when necessary
- Provide visual indicators for tabs with new or important information
- Ensure consistent UI patterns across all tabs

## 4. User Interface Specifications

### 4.1 Purchase Order List Screen
- Action buttons positioned at the top of the screen
- User interaction components (View dropdown, Refresh, Search, Pagination) located below action buttons
- Tabular data display with sortable columns
- Responsive design to accommodate different screen sizes

### 4.2 Purchase Order Detail View Screen
- Header section at the top with key PO information
- Action bar positioned prominently for easy access
- Item list in tabular format with expandable rows for detailed information
- Collapsable sidebar for comments, attachments, and activity logs
- Different visual indicators for view mode vs. edit mode

### 4.4 Item Detail View and Edit Interface
- Clear distinction between view and edit modes through visual cues
- Logical grouping of related fields (financial details, inventory status, etc.)
- Inline validation for edit fields with immediate feedback
- Appropriate input controls for different data types (e.g., numeric inputs for quantities)
- Responsive design that adapts to different screen sizes
- Clear action buttons for saving or canceling changes
- Visual indicators for adjusted fields (conversion rates, discounts, etc.)
- Information lookup panels with toggle controls to show/hide detailed information
- Context-sensitive help for complex fields or calculations
- Quick access buttons for information lookup features
- Clear currency selection dropdown
- Searchable/filterable PR list
- Confirmation screen with clearly presented generated POs
- Action buttons for print, email, and confirmation

### 4.5 Related Information Tabs Interface
- Clear, intuitive tab design following modern web UI patterns
- Consistent layout and interaction patterns across all tabs
- Visual indicators for active tab and tabs with important information
- Smooth transitions between tabs
- Responsive design that adjusts tab presentation based on screen size
- Accessibility considerations for tab navigation

## 5. Development Phases and Milestones

### 5.1 Phase 1: Core Functionality
- Implement Purchase Order List Screen
- Develop Purchase Order Detail View (View Mode)
- Create database schema and API endpoints

### 5.2 Phase 2: Edit and Create Features
- Implement Purchase Order Detail Edit Mode
- Develop "Create PO from PR" feature
- Implement Item Detail View and Edit functionality
- Integrate with Fast Report System for document formatting

### 5.3 Phase 3: Advanced Features
- Implement Good Receive Note integration
- Develop export and reporting capabilities
- Add email functionality
- Implement Related Information Tabs

### 5.4 Phase 4: Testing and Refinement
- Conduct user acceptance testing
- Refine UI/UX based on feedback
- Performance optimization

## 6. Technical Considerations

### 6.1 Data Model
- **Purchase Order**: Contains header information, references to items, vendor details, etc.
- **Purchase Order Items**: Line items with quantities, prices, unit information
- **Good Receive Notes**: Linked to POs with received quantities and quality checks
- **Vendors**: Contact information and related metadata
- **Purchase Requisitions**: Source documents for PO creation

### 6.2 API Requirements
- RESTful API endpoints for CRUD operations on POs
- Endpoints for generating POs from PRs
- Search and filter capabilities
- Integration with reporting system

### 6.3 Security Considerations
- Authentication for all API calls
- Authorization based on user roles
- Secure transmission of PO data to vendors
- Data validation to prevent injection attacks

#### 6.3.1 Role-Based Access Control (RBAC) Matrix

The Purchase Order module implements the following role-based access control matrix to ensure appropriate access to functionality:

**Role Definitions**

| Role | Description |
|------|-------------|
| Procurement Officer | Primary users who create and manage purchase orders |
| Procurement Manager | Users who oversee procurement activities and have additional permissions |
| Finance Officer | Users who review financial aspects of purchase orders |
| Finance Manager | Users who oversee financial aspects and have expanded viewing rights |
| Department Manager | Users who review purchase orders related to their departments |
| Inventory Manager | Users who manage goods receipt processes |
| General User | Users with limited access to view assigned purchase orders |

**Permission Matrix by Role**

| Role | PO Management | Item Management | Financial Data | GRN Integration | Reporting | Comments/Attachments |
|------|--------------|-----------------|----------------|-----------------|-----------|---------------------|
| Procurement Officer | Create, Read, Update, Delete (Draft), Void (Active) | Create, Read, Update, Delete | Read | Read | Read, Export | Create, Read |
| Procurement Manager | All Procurement Officer permissions + Delete Draft POs | All Procurement Officer permissions | Read, Update | Read | Read, Export, Admin Reports | Create, Read, Delete |
| Finance Officer | Read | Read | Read | Read | Read, Export | Create, Read |
| Finance Manager | Read | Read | Read, Update Budget Allocation | Read | Read, Export, Financial Reports | Create, Read |
| Department Manager | Read (Department POs) | Read | Read (Department POs) | Read | Read (Department Reports) | Create, Read |
| Inventory Manager | Read | Read | Read | Create, Read, Update | Read | Create, Read |
| General User | Read (Assigned) | Read | None | None | None | Create, Read |

**Status-Based Permission Matrix**

The following matrix defines which actions are permitted at each Purchase Order status:

| Action | Draft | Sent | Partial | Fully Received | Voided | Closed |
|--------|-------|------|---------|---------------|--------|--------|
| Edit PO | Yes | No | No | No | No | No |
| Delete PO | Yes | No | No | No | No | No |
| Void PO | No | Yes | Yes | Yes | N/A | No |
| Close PO | No | No | Yes | Yes | No | N/A |
| Edit Items | Yes | No | No | No | No | No |
| Receive Goods | No | Yes | Yes | No | No | No |
| Print/Email | Yes | Yes | Yes | Yes | No | Yes |
| Add Comments | Yes | Yes | Yes | Yes | Yes | Yes |

**Entity-Level Permissions**

For each entity in the data model, the following permissions apply:

**Purchase Order**
- Create: Procurement Officer, Procurement Manager
- Read: All roles (with scope limitations)
- Update: Procurement Officer, Procurement Manager (Draft only)
- Delete: Procurement Officer, Procurement Manager (Draft only)
- Void: Procurement Officer, Procurement Manager (Active only)
- Close: Procurement Officer, Procurement Manager, Inventory Manager

**Purchase Order Items**
- Create: Procurement Officer, Procurement Manager
- Read: All roles (with scope limitations)
- Update: Procurement Officer, Procurement Manager (Draft PO only)
- Delete: Procurement Officer, Procurement Manager (Draft PO only)

**Comments and Attachments**
- Create: All roles
- Read: All roles (with scope limitations)
- Update: Author only
- Delete: Author, Procurement Manager

## 7. Potential Challenges and Solutions

### 7.1 Complex PO Generation Logic
- **Challenge**: Creating multiple POs from multiple PRs with correct grouping by vendor and delivery date
- **Solution**: Implement robust business logic layer with thorough validation and testing

### 7.2 Unit Conversion Complexity
- **Challenge**: Handling different units between PO and receiving
- **Solution**: Create a comprehensive unit conversion system with a base unit for comparison and manual adjustment capabilities

### 7.3 Performance with Large Data Sets
- **Challenge**: Maintaining performance with large numbers of POs or line items
- **Solution**: Implement pagination, lazy loading, and database optimizations

### 7.4 Information Lookup Integration
- **Challenge**: Integrating multiple data sources for comprehensive information lookup
- **Solution**: Implement a caching strategy for frequently accessed data and asynchronous loading for detailed lookups
- **Challenge**: Ensuring lookup data is current and accurate
- **Solution**: Develop real-time data synchronization with underlying systems and clear timestamp indicators for data freshness
- **Challenge**: Managing performance with extensive lookup capabilities
- **Solution**: Implement progressive loading of lookup data and optimize database queries for lookup operations

## 8. Future Expansion Possibilities

### 8.1 Manual PO Creation
- Add complete functionality for creating POs without PRs

### 8.2 Enhanced Reporting
- Develop additional export formats and reporting capabilities

### 8.3 Mobile Optimization
- Create mobile-specific interfaces for on-the-go procurement management

### 8.4 Vendor Portal Integration
- Allow vendors to directly interact with POs through a dedicated portal

## 9. Acceptance Criteria

### 9.1 Purchase Order List Screen
- Must display all POs with correct pagination and sorting
- Search functionality must filter results accurately
- Export and print features must generate correctly formatted documents

### 9.2 Create PO from PR
- Must correctly group PRs by vendor and delivery date
- Generated POs must contain all line items from source PRs
- Confirmation screen must accurately display all created POs

### 9.3 Purchase Order Detail View
- Must display all PO information accurately in view mode
- Edit mode must allow modification of permitted fields only
- Changes must be saved correctly when using Save button

### 9.4 Good Receive Note Integration
- Must allow partial receipts against POs
- Must update PO status based on received quantities
- Must maintain historical record of all receipts

### 9.5 Item Detail View and Edit
- Must correctly display all item details in view mode
- Must allow modification of permitted fields in edit mode
- Adjustments to conversion rates, discounts, and tax rates must calculate correctly
- Changes must be validated before saving
- Received quantities must update the PO status appropriately
- Information lookup features must provide accurate and current data
- Lookup functionality must be responsive with minimal loading times
- Historical data in lookups must be properly date-stamped for context

### 9.6 Related Information Tabs
- All tabs must display relevant information accurately
- Tab navigation must maintain context and state when switching between tabs
- Information in each tab must be properly linked to the main PO data
- Tabs must be responsive and adapt to different screen sizes
- Visual indicators must correctly show tabs with important information

## 10. Documentation Requirements

### 10.1 User Documentation
- Detailed instructions for creating POs from PRs
- Explanation of PO statuses and workflow
- Guidelines for printing and emailing POs

### 10.2 Technical Documentation
- API specifications and endpoints
- Database schema and relationships
- Integration points with other system components
