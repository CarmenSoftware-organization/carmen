# Purchase Order Detail Screen Specification

**Module**: Procurement  
**Function**: Purchase Orders  
**Component**: Detail Screen  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Implementation Overview

**Purpose**: This specification documents the Purchase Order detail screen implementation, providing comprehensive viewing, editing, and management capabilities for individual purchase orders. The interface supports complete PO lifecycle management from creation to fulfillment with sophisticated state management and user workflow integration.

**Implementation Files**:
- Main detail page: purchase-orders/[id]/page.tsx (simple route delegation)
- Detail component: components/PODetailPage.tsx (960 lines - main implementation)
- Items tab: components/tabs/EnhancedItemsTab.tsx (351 lines - advanced items management)
- General info tab: components/tabs/GeneralInfoTab.tsx
- Related documents tab: components/tabs/RelatedDocumentsTab.tsx
- Item details: components/tabs/item-details.tsx

**Current Status**: Complete detail screen implementation with sophisticated PO creation workflows, comprehensive edit capabilities, tabbed interface design, collapsible sidebar with comments/attachments, and extensive status management. Supports both viewing existing POs and creating new POs from Purchase Requests with localStorage-based data transfer.

---

## Screen Architecture

### **Component Hierarchy**
- **Route Wrapper**: Simple Next.js dynamic route delegation to PODetailPage component
- **Detail Page Component**: Main PODetailPage with comprehensive state management (960 lines)
- **Tabbed Interface**: General Info, Items, and Related Documents tabs with conditional rendering
- **Collapsible Sidebar**: Comments/Attachments and Activity Log sections with expand/collapse controls
- **Modal Dialogs**: Status change confirmations, item editing, and validation messages

### **State Management Architecture**
- **PO Data State**: Complete purchase order data with complex nested objects
- **Edit Mode State**: Global edit mode affecting all tabs and form controls
- **Active Tab State**: Tab navigation state with URL parameter synchronization
- **Sidebar State**: Individual section collapse state with localStorage persistence
- **Dialog State**: Status change confirmations and modal form management
- **LocalStorage Integration**: Creation workflow data persistence and auto-save functionality

### **Data Flow Patterns**
- **Route Parameter Processing**: Dynamic PO ID extraction with validation and fallback handling
- **Mock Data Integration**: Mock_purchaseOrders lookup with comprehensive error handling
- **Creation Workflow**: LocalStorage-based data transfer from list screen PR grouping
- **State Synchronization**: Real-time state updates across tabs and sidebar components

---

## User Interface Components

### **Header Section Architecture**

#### **Dynamic Title and Breadcrumb**
- **Breadcrumb Navigation**: "Purchase Orders > [PO Number or 'New Purchase Order']" with clickable navigation
- **Conditional Title**: Displays actual PO number for existing orders, "New Purchase Order" for creation workflow
- **Status Integration**: Real-time status badge with color coding and automatic updates
- **Metadata Display**: Last modified timestamp and user attribution for existing orders

#### **Responsive Action Button Group**
- **Primary Actions**: Save/Update (edit mode), Edit (view mode) with conditional visibility
- **Secondary Actions**: Print, Export PDF, Clone, Delete with permission-based availability
- **Status Actions**: Send to Vendor, Mark as Received, Cancel Order with workflow validation
- **Layout Strategy**: Responsive button group with priority-based hiding on mobile devices

#### **Edit Mode Control System**
```typescript
Edit Mode Features:
  - Global edit mode toggle affecting all tabs and form elements
  - Individual tab edit mode inheritance with parent state control
  - Unsaved changes detection with browser navigation warnings
  - Auto-save functionality with configurable intervals
  - Cancel with confirmation dialog and change rollback
  - Permission-based edit access control
```

### **Advanced Tabbed Interface**

#### **Tab Navigation System**
- **General Info Tab**: Basic PO information, vendor details, financial summary with comprehensive form controls
- **Items Tab**: Enhanced items management with bulk operations, search, and inline editing
- **Related Documents Tab**: Associated documents, attachments, and reference management
- **Tab State Management**: Active tab persistence with URL parameter integration and browser back support

#### **Tab Status Indicators**
- **Validation State**: Visual indicators for tab completion status and required field validation
- **Edit State**: Modified tab highlighting with unsaved changes indicators and change counts
- **Error State**: Error badges for tabs with validation issues and field-specific error highlighting
- **Mobile Optimization**: Tab overflow handling with scroll controls and responsive design

### **Enhanced Items Tab Implementation**

#### **Items Management Header Interface**
- **Selection Controls**: Master checkbox for bulk selection with smart indeterminate state and count display
- **Search Functionality**: Real-time item search across name and description fields with highlighting
- **Add Item Integration**: Modal-based item addition with comprehensive form and validation
- **Bulk Operations**: Coordinated edit, expand/collapse, export, and delete operations with progress feedback

#### **Advanced Item Row Interface**
- **Expandable Row System**: Click-to-expand functionality with smooth animations and detailed information display
- **Inline Edit Mode**: Row-level editing with validation, auto-save, and parent form integration
- **Selection Management**: Individual item selection with visual feedback and selection state persistence
- **Status Indicators**: Item-specific status badges (Pending, Partial, Received, Cancelled) with color coding

#### **Comprehensive Item Details Structure**
```typescript
Item Information Architecture:
  Basic Information:
    - Item name and detailed description
    - Ordered quantity with unit conversion
    - Unit price with currency formatting
    - Line totals with real-time calculation
  
  Financial Details:
    - Tax rate and calculated tax amount
    - Discount rate and calculated discount amount
    - Subtotal price (base and order currency)
    - Net amount with complex calculations
    - Total amount including tax and discount
    - Currency conversion with exchange rate display
  
  Inventory Integration:
    - Current on-hand quantity
    - On-ordered quantity from other POs
    - Reorder and restock level thresholds
    - Average monthly usage statistics
    - Last price and order date history
    - Last vendor information and comparison
  
  Receiving Information:
    - Received quantity tracking
    - Remaining quantity calculations
    - Receiving status and history
    - Quality control notes and issues
```

#### **Sophisticated Bulk Operations Interface**
- **Dynamic Selection Bar**: Shows selected item count with contextual action availability
- **Comprehensive Actions**: Edit selected, expand all, collapse all, export selected, delete selected
- **Smart Confirmations**: Context-aware confirmation dialogs for destructive actions with impact preview
- **Progress Feedback**: Visual progress indicators for bulk operations with cancellation capability

### **Collapsible Sidebar System**

#### **Sidebar Architecture and Layout**
- **Comments & Attachments Section**: File upload, comment threading, and document management
- **Activity Log Section**: Chronological activity tracking with detailed audit trail
- **Independent Controls**: Individual expand/collapse controls for each sidebar section
- **Responsive Behavior**: Auto-collapse on mobile with gesture support, persistent state on desktop

#### **Comments and Attachments Management**
- **Advanced Comment System**: Threaded comments with user attribution, timestamps, and rich text support
- **File Attachment Handling**: Drag-and-drop file upload with preview capabilities and file type validation
- **Document Management**: Download, preview, delete operations with version control and access logging
- **Permission Integration**: Role-based comment and attachment permissions with fine-grained access control

#### **Comprehensive Activity Log**
- **Timeline Display**: Chronological activity feed with user information, timestamps, and action descriptions
- **Activity Categories**: Creation, modification, status changes, approvals, system events, and user interactions
- **Detail Expansion**: Expandable activity entries with field-level change tracking and before/after values
- **Export Integration**: Activity log export functionality for audit compliance and reporting purposes

---

## Creation and Edit Workflows

### **PO Creation from Purchase Requests**

#### **Advanced Data Transfer Workflow**
```typescript
Sophisticated Creation Process:
  1. LocalStorage Data Retrieval and Validation
     - Grouped PR data from list screen selection
     - Vendor and currency grouping validation
     - Item aggregation and deduplication logic
     - Relationship preservation and tracking
  
  2. Intelligent PO Data Population
     - Vendor information auto-population with validation
     - Delivery address inheritance with override capability
     - Item details transfer with quantity aggregation
     - Financial calculations with tax and discount consolidation
     - Exchange rate application and currency conversion
  
  3. User Customization and Enhancement
     - Edit vendor and delivery details with validation
     - Modify item quantities and pricing with business rules
     - Add additional items with catalog integration
     - Apply discounts and tax adjustments with approval workflows
     - Configure payment terms and special instructions
  
  4. Comprehensive Validation and Save
     - Multi-level data validation with business rules
     - Financial calculation verification and accuracy checks
     - Status setting and workflow initiation
     - Relationship tracking and audit trail creation
```

#### **Data Grouping and Consolidation Logic**
- **Vendor Grouping**: Automatic grouping by vendor ID and currency code with conflict resolution
- **Item Aggregation**: Quantity summation for identical items from multiple PRs with unit conversion
- **Financial Consolidation**: Tax rate and discount consolidation across items with weighted averages
- **Address Handling**: Primary address selection with manual override capability and validation

### **Status Change Management System**

#### **Comprehensive Status Transition Workflow**
```typescript
Status Change Process Architecture:
  1. Status Change Trigger and Validation
     - User action validation (Send to Vendor, Mark Received, Cancel)
     - System validation of transition validity with business rules
     - Permission check for status change authority with role verification
     - Prerequisites validation (required fields, approvals, etc.)
  
  2. Interactive Confirmation Dialog
     - Clear description of status change impact and consequences
     - Warning messages for irreversible actions with risk assessment
     - Additional required information collection with validation
     - Business rule explanation and compliance requirements
  
  3. Status Update Processing and Integration
     - Database status update with transaction handling
     - Related entity status updates (items, approvals, workflows)
     - Notification and email triggers with template selection
     - Activity log entry creation with detailed change tracking
     - External system integration and synchronization
  
  4. UI State Refresh and Synchronization
     - Header status badge update with animation
     - Action button availability update with permission check
     - Item status synchronization across all tabs
     - Related document status updates and visibility
```

#### **Available Status Transitions and Business Rules**
- **Draft → Open**: Complete PO information validation and business rule compliance
- **Open → Sent**: Send PO to vendor with email notification and delivery confirmation
- **Sent → Partial Received**: Mark items as partially received with quantity tracking
- **Partial Received → Received**: Complete receiving process with final validation
- **Any Status → Cancelled**: Cancel PO with mandatory reason tracking and approval requirements

### **Comprehensive Edit Mode Functionality**

#### **Global Edit Mode Management**
- **Edit Mode Activation**: Single toggle affecting entire PO interface with permission validation
- **Field Enablement**: All editable fields become active simultaneously with validation rules
- **Real-time Validation**: Continuous validation with error highlighting and guidance messages
- **Save State Management**: Unsaved changes tracking with browser navigation warnings and auto-save

#### **Tab-Specific Edit Capabilities**
- **General Info Editing**: Vendor selection, dates, financial terms, notes, and delivery information
- **Items Editing**: Quantities, prices, tax rates, discount rates, and item-specific configurations
- **Documents Editing**: Reference numbers, attachment uploads, comments, and relationship management
- **Permission-Based Access**: Role-based field edit permissions with granular access control

---

## Data Management and Validation

### **Mock Data Integration and Management**

#### **Comprehensive Data Source Management**
- **Primary Source**: Mock_purchaseOrders array with 7 comprehensive PO records covering diverse scenarios
- **Fallback Handling**: Graceful handling of missing or invalid PO IDs with user-friendly error messages
- **Data Completeness**: All PO fields populated including complex nested objects and relationships
- **Relationship Data**: Vendor information, items array, financial calculations, and audit trail data

#### **Complex Financial Data Structure and Calculations**
```typescript
Comprehensive Financial Calculations:
  Item Level Calculations:
    - Unit price × ordered quantity = subtotal amount
    - Discount amount = subtotal × discount rate (with business rule limits)
    - Taxable amount = subtotal - discount amount
    - Tax amount = taxable amount × tax rate (with jurisdiction rules)
    - Total amount = taxable amount + tax amount
  
  PO Level Aggregations:
    - Net amount = sum of all item net amounts
    - Total discount = sum of all item discount amounts
    - Total tax = sum of all item tax amounts
    - Grand total = net amount + total tax
  
  Multi-Currency Handling:
    - Base currency amounts (THB) with conversion
    - Order currency amounts (USD, EUR, etc.) with precision
    - Exchange rate application with rate date tracking
    - Dual currency display with formatting rules
    - Currency conversion audit trail and rate locking
```

### **Advanced Validation Framework**

#### **Comprehensive Data Validation Rules**
- **Required Field Validation**: Vendor, order date, delivery date, minimum one item with complete information
- **Business Rule Enforcement**: Delivery date after order date, positive quantities and prices, valid vendor relationships
- **Financial Validation**: Tax rate ranges, discount limits, currency consistency, calculation accuracy
- **Item Validation**: Unique items per PO, valid units and quantities, inventory availability checks

#### **Real-Time Validation System**
- **Field-Level Validation**: Immediate feedback on field blur and change events with specific error messages
- **Cross-Field Validation**: Date range validation, financial calculation verification, relationship consistency
- **Tab Validation Summary**: Visual indicators for tab completion status with error count and severity
- **Save Validation**: Comprehensive validation before save operation with blocking errors and warnings

### **State Persistence and Management**

#### **LocalStorage Management Strategy**
- **Creation Data**: Temporary storage of grouped PR data during PO creation workflow with expiration
- **Draft State**: Auto-save of unsaved changes to localStorage with conflict resolution
- **Session Recovery**: Restoration of unsaved changes on page reload with user confirmation
- **Data Cleanup**: Automatic cleanup of expired localStorage data with retention policies

#### **Browser State Management Integration**
- **URL Parameters**: Active tab and mode parameters in URL with bookmark support
- **Navigation State**: Proper browser back/forward button handling with state preservation
- **Page Refresh**: State preservation across page refreshes with data integrity checks
- **Deep Linking**: Direct access to specific tabs and edit modes with parameter validation

---

## Navigation and User Experience

### **Navigation Patterns and User Flow**

#### **Inter-Page Navigation System**
- **Breadcrumb Navigation**: Clear path indication with clickable breadcrumbs and context preservation
- **Back to List**: Return to filtered list view with state preservation and scroll position
- **Related Record Access**: Direct navigation to related PRs, vendors, and documents with context
- **Deep Linking**: Shareable URLs for specific PO views and edit modes with parameter validation

#### **Tab Navigation and Management**
- **Keyboard Navigation**: Arrow key navigation between tabs with focus management
- **Tab Memory**: Last active tab persistence across sessions with user preference tracking
- **Validation Navigation**: Automatic navigation to tabs with validation errors and field focus
- **Mobile Navigation**: Swipe gestures for tab navigation on mobile devices with touch optimization

### **User Interaction Patterns and Responsiveness**

#### **Edit Mode Transitions and State Management**
- **Smooth Transitions**: Animated transitions between view and edit modes with performance optimization
- **Context Preservation**: Scroll position and expanded state preservation during mode changes
- **Unsaved Changes Warning**: Clear warnings before navigating away from unsaved changes with save options
- **Quick Save Options**: Keyboard shortcuts (Ctrl+S) and auto-save functionality with user feedback

#### **Responsive Interactions and Accessibility**
- **Touch Optimization**: Touch-friendly controls and gesture support with appropriate target sizes
- **Keyboard Shortcuts**: Power user keyboard navigation and action shortcuts with help system
- **Loading States**: Clear loading indicators during save and status change operations with progress feedback
- **Error Recovery**: Clear error messages with actionable recovery options and user guidance

---

## Export and Reporting Features

### **Export Capabilities and Document Generation**

#### **Professional Document Export**
- **PDF Generation**: Professional PO document generation with company branding and customizable templates
- **Print Optimization**: Print-friendly layouts with proper page breaks and header/footer management
- **Email Integration**: Direct email sending to vendors with PO attachments and customizable templates
- **Multiple Formats**: PDF, Excel, CSV export options for different use cases and system integration

#### **Flexible Data Export Options**
- **Items Export**: Selected items or complete item list export with filtering and customization
- **Financial Export**: Financial summary and detailed calculation export with audit trail
- **Activity Export**: Complete activity log export for audit purposes and compliance reporting
- **Custom Export**: User-configurable export templates and formats with field selection

### **Reporting Integration and Analytics**

#### **Real-Time Reporting and Dashboards**
- **Financial Dashboard**: Live financial summary with currency conversion and trend analysis
- **Status Reporting**: Real-time status tracking and progress indicators with milestone tracking
- **Vendor Performance**: Integration with vendor performance metrics and comparative analysis
- **Compliance Reporting**: Audit trail and compliance status reporting with regulatory requirements

---

## Accessibility and Performance

### **Accessibility Features and Compliance**

#### **Keyboard Navigation and Screen Reader Support**
- **Comprehensive Tab Order**: Logical tab order through all interactive elements with skip links
- **Focus Management**: Clear focus indicators and proper focus management during state changes
- **Keyboard Shortcuts**: Standard keyboard shortcuts for common actions with customizable bindings
- **Screen Reader Support**: Comprehensive ARIA labels, roles, and properties for full screen reader compatibility

#### **Visual Accessibility and User Experience**
- **Color Contrast**: WCAG 2.1 AA compliant color contrast ratios with high contrast mode support
- **Text Scaling**: Support for browser text zoom up to 200% with layout preservation
- **Motion Sensitivity**: Respect for prefers-reduced-motion settings with alternative interactions
- **Clear Visual Hierarchy**: Consistent visual hierarchy and information architecture with logical flow

### **Performance Optimizations and Scalability**

#### **Component Optimization Strategies**
- **Lazy Loading**: Lazy loading of non-critical tab content and heavy components
- **Memoization**: React.memo and useMemo for expensive calculations and complex data processing
- **Virtual Scrolling**: Virtual scrolling for large item lists with thousands of entries
- **Bundle Optimization**: Code splitting and tree shaking for optimal bundle size and loading performance

#### **State Management Optimization**
- **Efficient Updates**: Batched state updates and minimal re-renders with dependency optimization
- **Memory Management**: Proper cleanup of event listeners, timers, and component subscriptions
- **Cache Strategy**: Intelligent caching of computed values and API responses with invalidation
- **Load Time Optimization**: Fast initial load with progressive enhancement and skeleton loading

---

## Error Handling and Edge Cases

### **Data Error Handling and Recovery**

#### **Missing Data Scenarios and Fallbacks**
- **Invalid PO ID**: Graceful handling with user-friendly error messages and navigation options
- **Corrupted Data**: Fallback data structures and recovery mechanisms with data repair
- **Network Errors**: Offline capability and retry mechanisms with queue management
- **Validation Errors**: Clear error messages with field-specific guidance and correction suggestions

#### **User Error Prevention and Recovery**
- **Proactive Validation**: Real-time validation to prevent errors before submission with smart suggestions
- **Clear Feedback**: Immediate feedback for user actions and state changes with progress indicators
- **Confirmation Dialogs**: Confirmation dialogs for destructive actions with impact preview
- **Undo Functionality**: Undo capability for reversible actions with action history and rollback

### **Edge Case Handling and Robustness**

#### **Data Boundary Conditions and Scalability**
- **Large Item Lists**: Performance optimization for POs with hundreds of items using virtualization
- **Complex Financial Calculations**: Precision handling for financial calculations with decimal accuracy
- **Multiple Currency Scenarios**: Proper handling of currency conversion edge cases and rate fluctuations
- **Concurrent Edit Scenarios**: Conflict resolution for simultaneous edits with merge strategies

---

## Integration Points

### **Purchase Request Integration and Workflow**

#### **PR to PO Conversion System**
- **Data Mapping**: Comprehensive mapping of PR fields to PO fields with transformation rules
- **Business Rule Application**: PR approval status validation and business rule enforcement
- **Relationship Tracking**: Maintenance of PR-to-PO relationship tracking with audit trail
- **Status Synchronization**: Automatic PR status updates when PO is created with notification

### **Vendor Management Integration**

#### **Vendor Data Integration and Management**
- **Vendor Information**: Real-time vendor information retrieval and display with caching
- **Payment Terms**: Automatic payment terms application from vendor profiles with override capability
- **Contact Management**: Integration with vendor contact information and communication preferences
- **Performance Tracking**: Integration with vendor performance metrics and ratings with trend analysis

### **Financial System Integration**

#### **Financial Data Management and Compliance**
- **Currency Management**: Real-time exchange rate integration and multi-currency support with rate locking
- **Tax Calculation**: Integration with tax calculation engines and compliance requirements with jurisdiction rules
- **Budget Integration**: Budget checking and approval workflow integration with spending limits
- **Accounting System**: Integration with accounting systems for financial record synchronization and posting

---

## Current Implementation Status

### **Completed Features and Capabilities**

#### **Core Functionality Implementation**
- **Complete Detail Interface**: Full PO detail view and edit capabilities with tabbed interface and responsive design
- **Sophisticated Creation Workflow**: PR-to-PO creation with data grouping, validation, and localStorage integration
- **Enhanced Items Management**: Comprehensive items tab with bulk operations, inline editing, and advanced search
- **Status Management System**: Complete status change workflow with confirmations, validation, and audit logging
- **Collapsible Sidebar**: Comments, attachments, and activity log with responsive design and state persistence

#### **Advanced Features and Integration**
- **Multi-Tab Architecture**: General Info, Items, and Related Documents tabs with validation and state management
- **LocalStorage Integration**: Seamless data transfer between list and detail screens with error handling
- **Comprehensive Validation**: Real-time validation with field-level and cross-field checks and business rules
- **Export Functionality**: PDF export, print capabilities, and data export options with customizable formats
- **Responsive Design**: Mobile-first responsive design with touch optimization and accessibility features

### **Mock Data Dependencies and Development Support**

#### **Data Completeness and Quality**
- **7 Sample PO Records**: Comprehensive purchase order data with all fields populated and realistic scenarios
- **Financial Data Integrity**: Complete financial calculations including tax, discount, and currency conversion
- **Vendor Information**: Diverse vendor data representing different business types and relationships
- **Item Variety**: Comprehensive item data including inventory information, pricing history, and status variations

### **Development Features and Tools**

#### **Development Environment and Quality**
- **TypeScript Integration**: Full type safety with comprehensive type definitions and strict mode
- **Component Testing**: React Testing Library integration for component testing and validation
- **Performance Monitoring**: Development performance profiling and optimization with metrics
- **Hot Reloading**: Live development with hot module replacement and fast refresh

---

## Future Enhancement Opportunities

### **Advanced Features and Workflow Integration**

#### **Workflow and Automation Enhancement**
- **Approval Workflows**: Multi-level approval workflow integration with role-based routing and escalation
- **Automated Processing**: Automated PO processing based on business rules, thresholds, and machine learning
- **Integration APIs**: RESTful API integration for external system connectivity and data synchronization
- **Real-Time Collaboration**: Multi-user editing with conflict resolution, real-time updates, and presence awareness

#### **Enhanced User Experience and Interface**
- **Advanced Search**: Full-text search across all PO data with highlighting, faceted search, and AI-powered suggestions
- **Custom Views**: User-configurable dashboard views, saved filter sets, and personalized layouts
- **Mobile App Integration**: Native mobile app support with offline capabilities and push notifications
- **Voice Interface**: Voice command integration for hands-free PO management and accessibility

### **Business Intelligence and Analytics**

#### **Analytics and Reporting Enhancement**
- **Advanced Analytics**: Purchase pattern analysis and spend analytics with machine learning insights
- **Predictive Analytics**: AI-powered demand forecasting, vendor performance prediction, and risk assessment
- **Custom Reporting**: User-configurable reporting with drill-down capabilities and interactive dashboards
- **Dashboard Integration**: Executive dashboard integration with real-time KPI monitoring and alert systems

---

*This detail screen specification documents the actual implementation as found in the source code. Features marked as mock or template indicate areas designed for production enhancement through backend integration, workflow engines, and real-time collaboration systems.*