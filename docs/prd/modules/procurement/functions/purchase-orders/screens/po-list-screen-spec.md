# Purchase Order List Screen Specification

**Module**: Procurement  
**Function**: Purchase Orders  
**Component**: List Screen  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

---

## Implementation Overview

**Purpose**: This specification documents the Purchase Order list screen implementation, providing comprehensive listing, filtering, searching, and management capabilities for purchase orders. The interface supports both table and card view modes with advanced filtering and quick action access.

**Implementation Files**:
- Main page: purchase-orders/page.tsx
- Data table: components/purchase-orders-data-table.tsx
- Table columns: components/purchase-orders-columns.tsx
- Card view: components/purchase-orders-card-view.tsx
- Quick filters: components/po-quick-filters.tsx
- Advanced filters: components/po-filter-builder.tsx

**Current Status**: Complete list screen implementation with dual view modes, comprehensive filtering system, bulk operations support, and PO creation workflows. Uses mock data with sophisticated state management and user interaction patterns.

---

## Screen Architecture

### **Component Hierarchy**
- **Page Container**: Main layout with header and action controls
- **Data Management Layer**: React Table integration with filtering and sorting
- **View Layer**: Toggle between table and card views
- **Filter System**: Quick filters and advanced filter builder
- **Action System**: Create workflows and bulk operations

### **State Management**
- **View Mode**: Table/card view toggle state
- **Selection State**: Multi-select row/card selection
- **Filter State**: Applied filters and quick filter state
- **Dialog State**: Create PO from PR dialog management

### **Data Flow**
- **Mock Data Source**: Mock_purchaseOrders from lib/mock/mock_purchaseOrder.tsx
- **Filtering Pipeline**: Quick filters → Advanced filters → Search → Display
- **Navigation Flow**: List → Detail pages via router.push()

---

## User Interface Components

### **Header Section**

#### **Title and Description**
- **Primary Title**: "Purchase Orders" (text-3xl font-bold)
- **Description**: "Manage and track all purchase orders from creation to fulfillment"
- **Layout**: Responsive flex layout with space-y-2 spacing

#### **Action Button Group**
- **Primary Action**: "New Purchase Order" dropdown button
- **Secondary Actions**: Export (Download icon), Print (Printer icon)
- **Layout**: Horizontal flex layout with space-x-2 spacing

#### **New PO Dropdown Menu**
```typescript
Menu Options:
  - "Create Blank PO" → /procurement/purchase-orders/create
  - "Create from Purchase Requests" → Opens PR selection dialog
  - "Create from Template" → Placeholder action
  - "Create Recurring PO" → Placeholder action
```

### **Data Table Interface**

#### **Toolbar Components**
- **Global Search**: Input field with search icon and placeholder "Search purchase orders..."
- **Quick Filters**: Status and delivery date dropdown filters
- **Advanced Filter**: Filter builder with active filter count badge
- **Column Visibility**: Dropdown for showing/hiding columns
- **View Mode Toggle**: Table/card view switch buttons

#### **Table Columns**
```typescript
Column Structure:
  1. Select: Checkbox for multi-selection
  2. PO Number: Sortable, clickable link to detail page
  3. Vendor: Sortable, vendor name display
  4. Order Date: Sortable, formatted date display
  5. Delivery Date: Sortable, formatted date or "N/A"
  6. Status: Status badge with color coding
  7. Amount: Right-aligned, formatted currency
  8. Currency: Currency code display
  9. Actions: Dropdown menu (Print, Download PDF, Delete)
```

#### **Table Features**
- **Sorting**: All columns sortable with visual indicators
- **Selection**: Individual and bulk selection with checkboxes
- **Click Handling**: Row click navigation to detail pages
- **Responsive Design**: Adaptive layout for mobile devices

### **Card View Interface**

#### **Card Layout**
- **Grid System**: Responsive grid (1 column mobile, 2 tablet, 3 desktop)
- **Card Structure**: Header with selection and status, content with vendor and metrics
- **Hover Effects**: Shadow and border transitions on card hover

#### **Card Content Structure**
```typescript
Card Components:
  Header:
    - Checkbox selection
    - PO number (clickable link)
    - Order date
    - Status badge
  
  Content:
    - Vendor information section
    - Delivery date and currency grid
    - Financial information (Net Amount, Tax Amount, Total Amount)
    - Action dropdown menu
```

#### **Financial Display**
- **Net Amount**: Formatted with 2 decimal places
- **Tax Amount**: Formatted with 2 decimal places  
- **Total Amount**: Larger, bold text formatting
- **Currency**: Consistent currency code display

---

## Filtering and Search System

### **Global Search**
- **Search Scope**: Searches across all PO data fields
- **Implementation**: React Table globalFilter with "includesString" function
- **UI Design**: Input with search icon, 250px-300px width responsive
- **Real-time**: Immediate filtering as user types

### **Quick Filters**

#### **Status Filter**
```typescript
Status Options:
  - "All Status" (default)
  - "Draft", "Open", "Sent"
  - "Partial Received", "Received"
  - "Closed", "Cancelled"
```

#### **Delivery Date Filter**
```typescript
Date Range Options:
  - "All Delivery Dates" (default)
  - "Overdue" (past due date)
  - "Due Today" (today's date)
  - "Due This Week" (next 7 days)
  - "Due Next Week" (days 8-14)
  - "Due This Month" (current month)
```

### **Advanced Filter System**
- **Filter Builder**: Visual interface for creating complex filters
- **Active Filter Display**: Badge display with remove buttons
- **Filter Operators**: equals, contains, startsWith, endsWith, greaterThan, lessThan, in, between, isNull, isNotNull
- **Clear All**: Single action to remove all applied filters

### **Filter Processing Logic**
```typescript
Filter Priority:
  1. Quick Filter Application
  2. Advanced Filter Application  
  3. Global Search Application
  4. React Table Processing
```

---

## Data Management

### **Mock Data Structure**
- **Source**: Mock_purchaseOrders array with 7 sample POs
- **Data Variety**: Different vendors, amounts, statuses, and dates
- **Comprehensive Fields**: All PO fields populated including items, financial data, and metadata

### **Purchase Order Data Model**
```typescript
Key PO Fields:
  - poId: Unique identifier
  - number: Display number (PO-2023-XXX)
  - vendorId/vendorName: Vendor information
  - orderDate/DeliveryDate: Date management
  - status: PurchaseOrderStatus enum
  - totalAmount: Financial totals
  - currencyCode: Currency information
  - items: Array of PurchaseOrderItem objects
```

### **Financial Data Structure**
```typescript
Financial Fields:
  - baseSubTotalPrice/subTotalPrice: Subtotals
  - baseNetAmount/netAmount: Net amounts
  - baseDiscAmount/discountAmount: Discount values
  - baseTaxAmount/taxAmount: Tax calculations
  - baseTotalAmount/totalAmount: Final totals
  - exchangeRate: Currency conversion rate
```

---

## Navigation and Routing

### **Page Navigation**
- **Detail Page**: `/procurement/purchase-orders/${po.poId}` via router.push()
- **Create Page**: `/procurement/purchase-orders/create` for new PO creation
- **Create from PR**: `/procurement/purchase-orders/create?mode=fromPR&grouped=true`

### **Link Handling**
- **PO Number Links**: Direct navigation to detail pages
- **Prevent Propagation**: Click events stop propagation for links and actions
- **Consistent Routing**: Unified routing pattern across table and card views

### **Browser Integration**
- **Back Button**: Native browser back button support
- **Deep Linking**: Direct URL access to filtered views
- **History Management**: Proper browser history handling

---

## User Interactions

### **Selection Management**
- **Individual Selection**: Checkbox per row/card
- **Bulk Selection**: "Select All" checkbox in table header
- **Selection State**: Tracked via React Table rowSelection state
- **Visual Feedback**: Selected state styling for rows and cards

### **Action Menus**
```typescript
Row/Card Actions:
  - Print: PO document printing
  - Download PDF: Export PO as PDF
  - Delete: Remove PO with confirmation
```

### **Create PO from PR Workflow**
```typescript
Workflow Steps:
  1. Open PR selection dialog
  2. Select multiple PRs for PO creation
  3. Group PRs by vendor and currency
  4. Store grouped data in localStorage
  5. Navigate to creation page with grouped data
```

### **View Mode Toggle**
- **Table View**: List icon, traditional data table display
- **Card View**: Grid icon, card-based display
- **State Persistence**: View mode maintained across sessions
- **Responsive Design**: Optimal experience on all devices

---

## Responsive Design

### **Breakpoint Behavior**
- **Mobile (< 768px)**: Single column layout, condensed toolbar
- **Tablet (768px-1024px)**: Two column card grid, full toolbar
- **Desktop (> 1024px)**: Three column card grid, expanded toolbar

### **Mobile Optimizations**
- **Touch Targets**: Minimum 44px touch targets for mobile
- **Compact Layout**: Reduced spacing and smaller text on mobile
- **Swipe Navigation**: Touch-friendly interaction patterns
- **Viewport Optimization**: Proper meta viewport configuration

### **Adaptive Components**
- **Search Bar**: 250px mobile, 300px desktop width
- **Filter Buttons**: Size adjustments for mobile
- **Action Buttons**: Icon-only on mobile, icon+text on desktop

---

## Performance Optimizations

### **Data Processing**
- **Memoized Filtering**: useMemo for expensive filter operations
- **Virtual Scrolling**: Large dataset handling via React Table
- **Efficient Re-renders**: Optimized state updates and component renders

### **Component Optimization**
- **Code Splitting**: Lazy loading of non-critical components
- **Bundle Optimization**: Tree shaking for unused code
- **Image Optimization**: Optimized icons and assets

### **State Management**
- **Minimal State**: Only necessary state in components
- **Efficient Updates**: Batched state updates where possible
- **Memory Management**: Proper cleanup of event listeners and timers

---

## Accessibility Features

### **Keyboard Navigation**
- **Tab Order**: Logical keyboard navigation through interface
- **Enter/Space**: Activation of buttons and links
- **Arrow Keys**: Table navigation support
- **Escape**: Close modals and dropdowns

### **Screen Reader Support**
- **ARIA Labels**: Comprehensive aria-label attributes
- **Screen Reader Text**: sr-only spans for context
- **Role Attributes**: Proper ARIA roles for complex components

### **Visual Accessibility**
- **Color Contrast**: WCAG 2.1 AA compliant color ratios
- **Focus Indicators**: Visible focus states for all interactive elements
- **Text Scaling**: Support for browser text zoom up to 200%

---

## Error Handling

### **Data Loading Errors**
- **Empty State**: "No purchase orders found" message with guidance
- **Search No Results**: Helpful message suggesting filter adjustment
- **Loading States**: Skeleton loading during data fetch

### **User Action Errors**
- **Selection Errors**: Clear feedback for invalid selections
- **Navigation Errors**: Fallback handling for broken links
- **Filter Errors**: Error messages for invalid filter values

### **Network Errors**
- **Connection Issues**: Offline state handling
- **Timeout Handling**: Request timeout with retry options
- **Error Recovery**: Graceful degradation when services unavailable

---

## Integration Points

### **Purchase Request Integration**
- **PR to PO Creation**: Workflow for converting PRs to POs
- **Grouping Logic**: Automatic grouping by vendor and currency
- **Data Transfer**: localStorage-based data transfer between pages

### **Vendor Management Integration**
- **Vendor Data**: Integration with vendor information
- **Vendor Filtering**: Filter POs by specific vendors
- **Vendor Performance**: Link to vendor performance metrics

### **Financial System Integration**
- **Currency Management**: Multi-currency support with exchange rates
- **Amount Calculations**: Consistent financial calculations
- **Reporting Integration**: Data export for financial reporting

---

## Current Implementation Status

### **Completed Features**
- **Complete List Interface**: Full table and card view implementation
- **Comprehensive Filtering**: Quick filters and advanced filter builder
- **Multi-Selection Support**: Bulk operations with row selection
- **PO Creation Workflows**: Multiple creation paths including PR conversion
- **Responsive Design**: Mobile-first responsive implementation

### **Mock Data Dependencies**
- **Sample PO Data**: 7 comprehensive purchase order records
- **Vendor Information**: Mock vendor data with varied characteristics
- **Financial Data**: Complete financial calculations and currency handling
- **Status Variations**: All PO statuses represented in sample data

### **Development Features**
- **Hot Reloading**: Development server with live updates
- **Type Safety**: Full TypeScript implementation with type checking
- **Component Testing**: React Testing Library integration
- **Performance Monitoring**: Development performance profiling

---

## Future Enhancement Opportunities

### **Advanced Features**
- **Real-time Updates**: Live data updates via WebSocket
- **Advanced Analytics**: PO performance analytics and reporting
- **Bulk Operations**: Enhanced bulk editing and management
- **Workflow Integration**: Purchase approval workflow integration

### **User Experience Improvements**
- **Saved Views**: User-defined view configurations
- **Custom Columns**: User-configurable column display
- **Advanced Search**: Full-text search with highlighting
- **Export Options**: Multiple export formats (Excel, CSV, PDF)

### **Integration Enhancements**
- **ERP Integration**: Real-time ERP system synchronization
- **Vendor Portal**: Direct vendor access to relevant POs
- **Mobile App**: Native mobile application
- **API Integration**: RESTful API for external system integration

---

*This list screen specification documents the actual implementation as found in the source code. Features marked as mock or template indicate areas designed for production enhancement through backend integration and real-time data sources.*