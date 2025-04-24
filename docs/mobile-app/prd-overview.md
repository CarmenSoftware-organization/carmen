# Hotel Supply Chain Mobile Application

## Overview

A comprehensive mobile solution for hotel supply chain management, designed to streamline approval, inventory management, receiving, and reporting processes.

## Key Modules

### 1. Authentication
- **Login**: Secure access with role-based permissions
- **Password Management**: Self-service password reset functionality 
- **Biometric Authentication**: Fingerprint and face recognition support

### 2. Dashboard
- **KPI Cards**: Real-time performance metrics
- **Activity Feed**: Recent transactions and approvals
- **Quick Actions**: Shortcuts to common tasks
- **Notifications**: Alert system for pending actions
- **Acess All BU**: Allow BU Sections

### 3. Purchase Request Approval Process 
- **Request List View**: Organized queue of pending approvals , with BU selections
- **Detailed Request Review**: Comprehensive examination of request details
- **Budget Impact Analysis**: Financial effects visualization
- **Approval Actions**:
  - One-click approve for straightforward requests
  - Conditional approval with specific requirements
  - Send back to originator with required changes
  - Rejection with mandatory justification
  - Split & Reject functionality for partial approvals
- **Approval History**: Complete audit trail of decisions
- **Delegation Controls**: Temporary transfer of approval authority
- **Mobile Notifications**: Real-time alerts for pending approvals
- **Offline Processing**: Review capability without connectivity
- **Bulk Actions**: Process multiple similar requests simultaneously
- **Priority Indicators**: Visual cues for urgent requests

### 4. Mobile Receiving
- **Barcode/QR Scanning**: Rapid item verification
- **PO Matching**: Automated comparison with purchase orders
- **Exception Handling**: Discrepancy documentation
- **Photo Documentation**: Visual evidence capture
- **Digital Signatures**: Electronic proof of delivery
- **Offline Mode**: Functionality without constant connectivity
- **Partial Receipt Processing**: Handling incomplete deliveries with:
  - Line-item acceptance/rejection
  - Quantity adjustment per item
  - Scheduled delivery tracking for remaining items
  - Partial invoice matching and payment authorization
  - Automated follow-up for outstanding items
- **Price Variance Handling**: Flagging and approval workflow for price discrepancies
- **Extra Cost Capture**: Documentation of unexpected charges at delivery time
- **Basic Lot Tracking**: Capture of lot numbers and expiration dates for relevant items

### 5. Good Receive Note (GRN) Management
- **GRN Status Workflow**:
  - Received/Draft status for initial creation and edits
  - Committed status after finalization (inventory updated)
  - Voided status for canceled documents
  - Visual indicators for current status
  - Role-based permissions for status transitions
- **Multi-step GRN Creation**:
  - Step 1: Creation method selection (From PO or Manual)
  - Step 2: Basic information entry (Supplier, Reference Number, Date, etc.)
  - Step 3: Item management and details
  - Step 4: Review and submission
- **Purchase Order Integration**:
  - PO search and selection
  - QR/Barcode scanning for rapid PO identification
  - Filter options (Today's Delivery, Date Range, Partial)
  - Support for partial deliveries with remaining quantity tracking
  - Cancel item functionality for handling vendor cancellations
- **Detailed Item Processing**:
  - Ordered, Received, and FOC (Free of Charge) quantity tracking
  - Inventory location assignment
  - Expiration date management
  - Extra cost allocation per item
  - Status tracking (Complete, Partial, Pending)
- **Item Details Management**:
  - Multi-tabbed item view (Basic, Quantity, Pricing, Summary, Notes)
  - Three distinct modes: View (read-only), Edit, and Add
  - Detailed inventory information access via dedicated dialogs
  - Lot tracking and expiration management
  - Price history comparison
  - Discounts and tax application
  - Multiple unit support and conversion
  - FileText icon (instead of eye icon) for row action view in Item Tab
- **Inventory Information Access**:
  - On Hand dialog showing current inventory across locations
  - On Order dialog displaying pending purchase orders
  - Quick access to inventory metrics (On Hand, On Order, Par, Reorder, Min, Max)
  - Real-time inventory verification during receiving
- **Lot Number Management**:
  - Automatic and manual lot number assignment
  - Expiration date tracking for lot numbers
  - Lot uniqueness validation
  - Lot traceability for inventory movements
- **Commit Process**:
  - Individual GRN commit functionality
  - Status transition from Received/Draft to Committed
  - Inventory level updates on commit
  - Validation checks before commit
  - Prevention of edits after commit
- **Extra Cost Management**:
  - Addition of supplementary costs (Delivery, Handling, etc.)
  - Cost allocation and distribution
  - Notes and descriptions for each cost
- **Multi-currency Handling**:
  - Support for transactions in foreign currencies
  - Exchange rate management with manual adjustment option
  - Dual-currency display (transaction and base currency)
  - All calculations performed in both currencies
  - 5-decimal precision for currency conversion
- **Financial Calculation**:
  - Detailed breakdown of pricing components
  - Tax-inclusive and tax-exclusive pricing support
  - Adjustable discount rates with override options
  - Adjustable tax rates with override options
  - Automatic recalculation of all financial values
- **Cancel Item Functionality**:
  - Support for vendor-initiated item cancellations
  - Update of remaining quantities on related POs
  - Automatic PO status updates (Partial/Closed)
  - Prevention of receiving against closed POs
- **Review and Submit**:
  - Complete order summary
  - Validation and error checking
  - Submission confirmation process

### 6. Inventory Management
- **Multi-location Tracking**: Centralized inventory visibility
- **Scan QR/Barcode**: for Item count  
- **Spot Checks**: Ad-hoc verification processes 
- **Physical Counts**: Scheduled comprehensive inventory verification 
- **Threshold Alerts**: Automatic notification of low stock
- **Usage Analytics**: Consumption pattern visualization
- **Item Selection**: Checkbox selection for bulk actions

### 7. Damage and Loss Reporting
- **Incident Documentation**: Standardized reporting workflow
- **Photo Evidence**: Visual documentation capabilities
- **Approval Workflow**: Write-off authorization process

### 8. User Profile and Settings
- **Personal Information**: User details management
- **Notification Preferences**: Alert customization
- **UI Preferences**: Display and interaction settings
- **Delegation Settings**: Temporary authority transfer

### 9. Financial Integration
- **Invoice Matching**: Reconciliation with partial receipts
- **Cost Allocation**: Distribution of extra charges across items
- **Price Update Management**: Approval workflow for price changes
- **Budget Impact Analysis**: Real-time calculation of financial effects
- **Variance Reporting**: Tracking of price and quantity discrepancies
- **Detailed Financial Calculations**:
  - Item subtotal calculations
  - Discount amount calculations
  - Tax amount calculations
  - Currency conversion with 5-decimal precision
  - Request total calculations
- **Tax Management**:
  - Support for tax-inclusive and tax-exclusive pricing
  - Tax type and rate configuration
  - Tax adjustments with checkbox indicators
- **Currency Management**:
  - Support for multiple currencies
  - Display of both transaction and base currency information
  - Real-time exchange rate application

### 11. Document Management
- **Comment Section**:
  - Comment creation and viewing
  - Comment threading and organization
  - Date and author tracking
- **Attachment Management**:
  - Upload documents and files
  - Capture and attach photos
  - File metadata tracking (name, description, date)
  - Public/private access controls
  - Uploader information
- **Activity Logging**:
  - Complete audit trail of all actions
  - Timestamp and user tracking
  - Action type categorization

### 12. Budget Control
- **Budget Information Display**: Show budget data during PR process
- **Allocation Tracking**: Monitor budget utilization
- **Warning Indicators**: Flag requests exceeding budget without blocking
- **Budget Impact Visualization**: Show effects of pending requests
- **Department Budget Status**: Real-time budget availability by department

## Technical Specifications

### Mobile Platforms
- iOS (version 14+)
- Android (version 10+)
- Responsive design for phones and tablets

### Integration Points
- Financial Management Systems
- Enterprise Authentication

### Security Features
- End-to-end encryption
- Role-based access control
- Audit logging
- Remote data wipe
- Compliance with data protection regulations

## Success Metrics

- 30% reduction in approval cycle time
- 25% decrease in inventory discrepancies
- 20% reduction in inventory carrying costs
- 40% decrease in emergency orders
- 90% user adoption rate
- 35% improvement in partial receipt processing time
- 50% reduction in price update processing time
- 45% reduction in request revision cycles
- 30% reduction in expired inventory waste
- ROI achievement within 12 months

## User Interface

Modern, intuitive interface with:
- Clean, card-based design
- Consistent navigation patterns
- Color-coded functional areas
- Accessibility compliance
- Offline capability indicators
- Real-time synchronization status
- Split-screen comparison for price changes
- Visual indicators for partial receipts
- Clear status indicators for sent back items
- Tax and currency indicators
- Budget status visualization
- Document attachment indicators
- Item selection checkboxes for bulk actions
