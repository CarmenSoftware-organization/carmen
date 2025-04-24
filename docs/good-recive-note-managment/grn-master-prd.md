# Product Requirements Document: Good Receive Note Module

## 1. Overview

### 1.1 Product Description
The Good Receive Note (GRN) Module is a web-based component within the larger procurement system that enables users to create, view, edit, and manage the receipt of goods against purchase orders. The module provides functionality for creating GRNs from purchase orders, manually creating GRNs, tracking partial deliveries, managing inventory transactions, assigning lot numbers, and facilitating the commit process that updates inventory levels.

### 1.2 Objectives
- Streamline the process of creating Good Receive Notes from purchase orders
- Enable manual creation of GRNs for cases without purchase orders
- Provide a responsive web interface for managing the full lifecycle of received goods
- Enable efficient tracking of received goods, partial deliveries, and canceled items
- Support inventory updating and lot number assignment for received items
- Implement proper workflow transitions between Draft (Received) and Committed states

### 1.3 User Roles
- **Receiving Clerks**: Primary users who create and manage GRNs
- **Store Managers**: Users who reconcile Receive Notes with actual stock received and finalize entries
- **AP Clerks**: Users who adjust and finalize GRN entries before they are posted to AP
- **Procurement Officers**: Users who need to review receiving information related to their purchase orders

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
- Efficient loading of GRN lists and details
- Responsive UI with minimal loading times
- Capable of handling concurrent users and operations

## 3. Functional Requirements

### 3.1 Good Receive Note List Screen

#### 3.1.1 Core Functionality
- Display a paginated list of GRNs with filterable/sortable columns
- Support searching by various attributes (date, vendor, reference number, etc.)
- Include refresh functionality to update with latest data
- Provide view selection for different predefined filters (All Receiving, Pending Receiving, etc.)

#### 3.1.2 Action Buttons
- **Create**: Dropdown menu with options:
  - From Purchase Order: Create GRN based on existing POs
  - Create Manually: Create GRN without reference to a PO
  - Commit by Batch: Process or finalize transactions in batch mode ## Commit will be optional 
- **Print**: Support printing functionality for GRN list and reports
- **Search**: Text search across GRN records

#### 3.1.3 Data Columns
- Date
- Description
- Reference Number (Ref#)
- Vendor
- Invoice Number
- Invoice Date
- Total Amount
- Status (Received/Draft, Committed, Voided)
#### Row Action 
- View - Link to Detil view mode
- Edit - Link to Detil Edit mode
- Delete  
### 3.2 Create GRN from PO Feature

#### 3.2.1 Workflow
1. User selects "From Purchase Order" from the Create dropdown
2. System displays a list of open Purchase Orders with items pending delivery
3. User selects one or more POs to create GRNs
4. System prepopulates the GRN with PO information
5. User can modify quantities and add additional information as needed
6. User saves the GRN in "Received" (Draft) status

#### 3.2.2 Data Population
- Automatically pull vendor information, delivery point, and line items from the PO
- Allow adjustments to received quantities if they differ from ordered quantities
- Support partial deliveries with appropriate tracking of remaining quantities
- Enable adding extra costs related to the receipt (shipping, handling, etc.)

#### 3.2.3 Multiple PO Selection
- Allow users to select multiple Purchase Orders to include in a single GRN
- Support multi-select functionality in the PO selection interface
- Implement vendor validation to ensure all selected POs are from the same vendor
- Consolidate line items from multiple POs into a single GRN
- Automatically link each GRN item back to its source PO for traceability
- Display source PO reference for each line item
- Update remaining quantities for all source POs when GRN is created or committed
- Allow filtering and searching of POs by various criteria (date, vendor, items, etc.)
- Support different views of POs (list view, grid view) for efficient selection
- Provide summary information of selected POs before GRN creation

### 3.3 Create Manual GRN Feature

#### 3.3.1 Workflow
1. User selects "Create Manually" from the Create dropdown
2. System presents an empty GRN form
3. User inputs all required information manually:
   - Vendor information
   - Item details
   - Quantities
   - Extra costs
   - Invoice information
4. User saves the GRN in "Received" (Draft) status

#### 3.3.2 Required Fields
- Date
- Vendor
- Delivery Point
- Item information
- Quantities
- Unit prices
- Option to mark items as consignment goods

### 3.4 Good Receive Note Detail View Screen

#### 3.4.1 Header Section
- GRN Reference Number
- Date
- Invoice Date
- Invoice Number
- Description
- Receiver
- Vendor
- Consignment checkbox
- Cash checkbox
- Delivery Point
- Extra Cost indicator
- Currency information
- Status (Received/Draft, Committed, Voided)

#### 3.4.2 Action Bar - View Mode
- **Edit Button**: Enable modification of GRN details (only when in Received/Draft status)
- **Void Button**: Allow voiding of GRNs (only when in Received/Draft status)
- **Print Button**: Generate physical document or PDF
- **Back Button**: Navigate to previous screen
- **Commit Button**: Update inventory and change status to "Committed"

#### 3.4.3 Action Bar - Edit Mode
- **Save Button**: Commit changes to the GRN
- **Cancel Button**: Discard changes
- **Back Button**: Return to previous screen with prompt to save changes

#### 3.4.4 Item List
- Item descriptions
- Store location
- Ordered quantities (from PO if applicable)
- Received quantities
- Free of Charge (FOC) quantities
- FOC Unit (configurable unit of measure for FOC items)
- Price
- Extra Cost
- Total Amount
- Status
- Expiry Date (if applicable)

#### 3.4.5 Item Detail Expanded Section
- Receiving Information
  - Received Quantity
  - Conversion Rate
  - Base Quantity
- Adjustment Information
  - Adjustment for Discount
  - Discount
  - Adjustment for Tax
  - Tax Type
  - Tax Rate
- Inventory and Procurement Information
  - On Hand
  - On Order
  - Reorder Threshold
  - Purchase Order Information
  - PO Reference Number
  - Last Price
  - Last Vendor
- Additional Information
  - Comments
  - Stock Movement details (when committed)
    - Commit Date
    - Location
    - Item Description
    - Inventory Unit
    - Stock In
    - Stock Out
    - Amount
    - Reference

#### 3.4.5.1 Item Detail Form UI Structure
The Item Detail form is organized into the following logical sections:

- **Header Bar**
  - Title (Edit Item/View Item/Add New Item based on mode)
  - Action buttons (Edit/Save/Cancel) that change based on current mode
  - Close button

- **Basic Information Section**
  - Location (required field)
  - Product Name
  - Description
  - PO Reference
  - Job Code

- **Quantity and Delivery Section**
  - Order Unit with conversion information
  - Order Quantity with base unit calculation
  - Receiving Quantity with base unit calculation
  - FOC (Free of Charge) checkbox
  - FOC Unit selection with conversion rate display
  - Delivery Point
  - Quick access buttons for inventory information:
    - On Hand button (opens dialog)
    - On Order button (opens dialog)
  - Inventory summary display (On Hand, On Order, Reorder Level)

- **Pricing Section**
  - Currency
  - Exchange Rate
  - Unit Price
  - Tax Included checkbox
  - Discount adjustment with rate and override options
  - Tax adjustment with rate and override options
  - Procurement history (Last Price, Last Order Date, Last Vendor)

- **Calculated Amounts Section**
  - Dual-currency display (transaction currency and base currency)
  - Subtotal Amount
  - Discount Amount
  - Net Amount
  - Tax Amount
  - Total Amount

#### 3.4.5.2 Item Detail View Modes
The Item Detail interface supports three distinct modes:

- **View Mode**
  - All fields are read-only
  - Only Edit button is displayed
  - Close button to exit the detail view

- **Edit Mode**
  - All fields are editable
  - Save and Cancel buttons are displayed
  - Save button updates the existing item
  - Cancel button returns to View mode

- **Add Mode**
  - All fields are editable with default values
  - Save and Cancel buttons are displayed
  - Save button creates a new item
  - Cancel button closes the form

#### 3.4.5.3 Inventory Information Dialogs

- **On Hand Dialog**
  - Displays current inventory levels across locations
  - Shows detailed inventory breakdown by location
  - Provides visibility into available quantities for reference during receiving
  - On Hand, On Order, Par, Reorder, Min, Max  

- **On Order Dialog**
  - Shows pending purchase orders for the item
  - Displays outstanding orders not yet received
  - Helps receiving staff coordinate with existing procurement activities

#### 3.4.5.4 Multi-currency Handling
- Support for transaction in foreign currencies with automatic conversion
- Exchange rate field for manual adjustment
- Dual display of all monetary values:
  - Transaction amount in document currency
  - Base amount in system base currency (e.g., USD)
- All calculations performed in both currencies

#### 3.4.5.5 Pricing and Amount Calculations
- Unit price entry with support for tax-inclusive pricing
- Automatic calculation of subtotal based on receiving quantity × unit price
- Adjustable discount rate with override option for discount amount
- Adjustable tax rate with override option for tax amount
- Automatic recalculation of:
  - Subtotal Amount = Receiving Quantity × Unit Price
  - Discount Amount = Subtotal × Discount Rate (or manual override)
  - Net Amount = Subtotal - Discount
  - Tax Amount = Net Amount × Tax Rate (or manual override)
  - Total Amount = Net Amount + Tax Amount

**Detailed Calculation Logic:**

The system performs calculations based on whether the price entered is tax-inclusive or tax-exclusive.

**1. Tax Inclusive Pricing (e.g., VAT is included in the Unit Price)**

-   **Price**: The unit price entered by the user (includes tax).
-   **Subtotal**: `Price * Received Quantity (excluding FOC)`
-   **Discount Amount**: Calculated based on Discount Rate or manual override.
-   **Tax Amount**: `round((Subtotal - Discount Amount) * Tax Rate / (100 + Tax Rate), 2)`
-   **Net Amount**: `Subtotal - Discount Amount - Tax Amount`
-   **Total Amount**: `Net Amount + Tax Amount` (Should equal Subtotal - Discount Amount)
-   **Last Price**: `Net Amount / Received Quantity (excluding FOC)`
-   **Last Cost**: `(Net Amount + Extra Costs) / (Received Quantity + FOC Quantity)`

*Example: Coke 2 cans at 25 THB each (includes 7% VAT), with a 5 THB discount.*

-   *Price = 25*
-   *Subtotal = 25 * 2 = 50*
-   *Discount Amount = 5*
-   *Tax Amount = round((50 - 5) * 7 / 107, 2) = round(45 * 7 / 107, 2) = round(2.9439..., 2) = 2.94*
-   *Net Amount = 50 - 5 - 2.94 = 42.06*
-   *Total Amount = 42.06 + 2.94 = 45*
-   *Last Price = 42.06 / 2 = 21.03*

**2. Tax Exclusive Pricing (e.g., VAT is added to the Unit Price)**

-   **Price**: The unit price entered by the user (excludes tax).
-   **Subtotal**: `Price * Received Quantity (excluding FOC)`
-   **Discount Amount**: Calculated based on Discount Rate or manual override.
-   **Net Amount**: `Subtotal - Discount Amount`
-   **Tax Amount**: `round(Net Amount * Tax Rate / 100, 2)`
-   **Total Amount**: `Net Amount + Tax Amount`
-   **Last Price**: `Net Amount / Received Quantity (excluding FOC)`
-   **Last Cost**: `(Net Amount + Extra Costs) / (Received Quantity + FOC Quantity)`

*Example: Coke 2 cans at 25 THB each (add 7% VAT), with a 5 THB discount.*

-   *Price = 25*
-   *Subtotal = 25 * 2 = 50*
-   *Discount Amount = 5*
-   *Net Amount = 50 - 5 = 45*
-   *Tax Amount = round(45 * 7 / 100, 2) = round(3.15, 2) = 3.15*
-   *Total Amount = 45 + 3.15 = 48.15*
-   *Last Price = 45 / 2 = 22.50*

**Handling Free of Charge (FOC) Items:**

-   FOC items do not contribute to the Subtotal calculation.
-   The quantity of FOC items is included when calculating the `Last Cost` but excluded for `Last Price`.

#### 3.4.6 Extra Cost Detail Section
- Item (service provider or cost type)
- Amount
- Option to allocate costs by quantity or amount

#### 3.4.7 Financial Summary Section
- Currency column (transaction currency)
- Base column (base/local currency)
- Net amounts
- Tax amounts
- Total amounts

### 3.5 Lot Number Assignment

#### 3.5.1 Functionality
- Automatically generate and assign lot numbers to all received items
- Support manual override of generated lot numbers
- Link lot numbers to inventory transactions for traceability
- Track expiry dates associated with lot numbers when applicable

#### 3.5.2 Lot Number Format
- Configurable format based on organizational requirements
- May include date components, item identifiers, and sequential numbers
- Ensure uniqueness within the system

### 3.6 Cancel Item Functionality

#### 3.6.1 Use Cases
- Vendor cancels part or all of an ordered item
- Need to adjust the remaining quantity to be received

#### 3.6.2 Implementation
- Allow users to specify canceled quantities for specific line items
- Update the PO to reflect canceled quantities
- Change PO status to "Partial" if some items are still to be received
- Change PO status to "Closed" if all remaining items are canceled or received
- Prevent further receiving against a PO once it is closed

### 3.7 Commit Process

#### 3.7.1 Individual Commit
- User reviews the GRN for accuracy
- User clicks "Commit" button
- System validates the GRN data
- System creates inventory transactions
- System updates item inventory levels
- System changes GRN status to "Committed"
- System prevents further edits to the GRN

#### 3.7.2 Batch Commit
- User selects multiple GRNs in "Received" status
- User selects "Commit by Batch" option
- System processes all selected GRNs
- System provides a summary of results

#### 3.7.3 End-of-Period Auto-Commit
- System automatically commits all uncommitted transactions at the end of the period
- System generates a report of auto-committed transactions

### 3.8 Inventory Transaction

#### 3.8.1 Transaction Creation
- Generate appropriate inventory transactions when GRN is committed
- Update item stock levels based on received quantities
- Maintain transaction history for audit purposes

#### 3.8.2 Transaction Types
- Stock In: For regular inventory items
- Consignment In: For consignment items (doesn't affect regular inventory)
- Non-Inventory: For items designated for immediate expensing

#### 3.8.3 Financial Impact
- Update inventory valuation based on received items and costs
- Support various costing methods (FIFO, Average Cost)
- Account for extra costs in item valuation

### 3.9 Related Information Tabs

#### 3.9.1 Tab Structure
- Implement a tabbed interface to organize related GRN information
- Include the following tabs:
  - **Main**: Display the primary GRN information including header and line items
  - **Comments**: Area for adding notes and comments
  - **Attachments**: Support for attaching related documents
  - **Activity Log**: Record of all actions taken on the GRN

#### 3.9.2 Tab Functionality
- Allow users to switch between tabs without losing context
- Maintain state when navigating between tabs
- Support data refresh for individual tabs when necessary

## 4. User Interface Specifications

### 4.1 Good Receive Note List Screen
- Action buttons positioned at the top of the screen
- View dropdown, refresh button, and search bar below action buttons
- Tabular data display with sortable columns
- Responsive design to accommodate different screen sizes

### 4.2 Good Receive Note Detail View Screen
- Header section at the top with key GRN information
- Action bar positioned prominently for easy access
- Item list in tabular format with expandable rows for detailed information
- Extra cost section with appropriate controls
- Financial summary section at the bottom
- Tabbed interface for related information
- Use FileText icon instead of eye icon for row action view in Item Tab

### 4.3 Create/Edit Screen
- Form layout with logical grouping of fields
- Clear distinction between required and optional fields
- Inline validation with immediate feedback
- Appropriate input controls for different data types

### 4.4 Item Management Interface
- Add PO button (when creating from PO)
- Add Item button (when creating manually)
- Edit and Delete buttons for item management
- Detail button for accessing expanded item information
- Save and Cancel buttons for item edit operations

## 5. Business Rules

### 5.1 Status Transitions
- GRNs are created in "Received" (Draft) status
- Once committed, GRNs change to "Committed" status
- Committed GRNs cannot be edited or voided
- Only GRNs in "Received" status can be edited or voided

### 5.2 Inventory Updates
- Inventory levels are updated when there are enough items and does not create negative in the store location 
  - Check all related transactions neeed to recaluclate the inventory 
  - If the inventory has related transaction change date need to check if will negative 
  - If the inventory has related transaction change quantity need to check if the remaining is enough   
- Consignment items are tracked separately and don't affect regular inventory
- Non-inventory items don't affect stock levels but are recorded for expense tracking

### 5.3 Integration
- BR-01: Unique Invoice Number + Vendor ID combination required for transaction sequence
- BR-02: Cancel by item functionality:
  - If vendor cancels items (e.g., orders 10 kg but cancels 2 kg)
  - System updates PO "Cancel" field with canceled quantity
  - System changes PO status to "Partial"
  - Only the remaining quantity (e.g., 8 kg) can be received
  - Once all items are received or canceled, PO status changes to "Closed"
  - Closed POs cannot receive additional items

### 5.4 Validation Rules
- Received quantities cannot exceed ordered quantities minus already received and canceled quantities
- Invoice information (number, date) required before committing
- Extra costs must be allocated before committing

## 6. Development Phases and Milestones

### 6.1 Phase 1: Core Functionality
- Implement Good Receive Note List Screen
- Develop Good Receive Note Detail View (View Mode)
- Create database schema and API endpoints

### 6.2 Phase 2: Create and Edit Features
- Implement Create GRN from PO feature
- Implement Manual GRN creation
- Develop Edit Mode functionality
- Implement Item Detail View and Edit

### 6.3 Phase 3: Advanced Features
- Implement Lot Number Assignment
- Develop Commit Process (Individual and Batch)
- Implement Inventory Transaction creation
- Integrate with Fast Report System for document formatting

### 6.4 Phase 4: Testing and Refinement
- Conduct user acceptance testing
- Refine UI/UX based on feedback
- Performance optimization

## 7. Technical Considerations

### 7.1 Data Model
- **Good Receive Note**: Contains header information, references to items, vendor details, etc.
- **GRN Items**: Line items with quantities, prices, lot numbers
- **Inventory Transactions**: Records of stock movements
- **Lot Numbers**: Tracking information for received items
- **Purchase Orders**: Source documents for GRN creation

### 7.2 API Requirements
- RESTful API endpoints for CRUD operations on GRNs
- Endpoints for committing GRNs and updating inventory
- Search and filter capabilities
- Batch processing endpoints
- Multi-PO selection and validation API endpoints
- APIs to retrieve compatible POs for selection (same vendor, currency, etc.)
- APIs to update multiple source POs when a GRN is created or committed

### 7.3 Security Considerations
- Authentication for all API calls
- Authorization based on user roles
- Audit logging for all GRN operations
- Data validation to prevent injection attacks

## 8. Potential Challenges and Solutions

### 8.1 Complex Inventory Valuation
- **Challenge**: Accurately calculating inventory value with extra costs
- **Solution**: Implement robust cost allocation algorithms with proper rounding and validation

### 8.2 Lot Number Management
- **Challenge**: Ensuring unique and traceable lot numbers
- **Solution**: Create a configurable lot number generation system with validation checks

### 8.3 Partial Deliveries and Cancellations
- **Challenge**: Correctly tracking partial deliveries and canceled items
- **Solution**: Implement comprehensive status tracking and quantity management

### 8.4 Concurrent Processing
- **Challenge**: Handling multiple users working on the same GRNs
- **Solution**: Implement optimistic concurrency control and appropriate locking mechanisms

### 8.5 Multi-PO Consolidation
- **Challenge**: Consolidating items from multiple POs that may have different terms, conditions, or pricing
- **Solution**: Implement smart validation rules that prevent incompatible POs from being selected together while allowing reasonable grouping
- **Challenge**: Maintaining accurate traceability when items from multiple POs are combined
- **Solution**: Create a robust linking mechanism that preserves the relationship between each GRN line item and its source PO line item
- **Challenge**: Handling partial receipts across multiple POs
- **Solution**: Implement a system that tracks remaining quantities for each source PO independently
- **Challenge**: User interface complexity when managing multiple PO selections
- **Solution**: Develop an intuitive UI with clear visual cues and validation feedback to guide users through the multi-PO selection process

## 9. Future Expansion Possibilities

### 9.1 Quality Control Integration
- Add functionality for quality inspections of received goods
- Support rejection and return processes

### 9.2 Advanced Reporting
- Develop additional reporting capabilities for receiving analytics
- Implement dashboards for monitoring receiving performance

### 9.3 Mobile Optimization
- Create mobile-specific interfaces for warehouse receiving operations
- Support barcode scanning for efficient receiving

### 9.4 Vendor Performance Tracking
- Track and report on vendor delivery performance
- Implement scoring system for vendor reliability

## 10. Acceptance Criteria

### 10.1 Good Receive Note List Screen
- Must display all GRNs with correct pagination and sorting
- Search functionality must filter results accurately
- View selection must apply appropriate filters

### 10.2 Create GRN from PO
- Must correctly load PO information
- Must allow quantity adjustments for partial deliveries
- Must handle extra costs appropriately
- Must support selection of multiple POs from the same vendor
- Must properly merge and consolidate items from multiple POs
- Must maintain accurate traceability to source POs for each item
- Must validate that all selected POs belong to the same vendor
- Must update all selected source POs with appropriate remaining quantities
- Must prevent selection of incompatible POs (different currencies, terms, etc.)
- Must provide clear feedback about selection constraints and validation errors

### 10.3 Manual GRN Creation
- Must allow creation of GRNs without reference to POs
- Must validate all required fields
- Must support all item types (inventory, consignment, non-inventory)

### 10.4 Good Receive Note Detail View
- Must display all GRN information accurately in view mode
- Edit mode must allow modification of permitted fields only
- Changes must be saved correctly when using Save button

### 10.5 Lot Number Assignment
- Must generate unique lot numbers for all applicable items
- Must allow manual override when necessary
- Must link lot numbers to inventory transactions

### 10.6 Cancel Item Functionality
- Must update PO with canceled quantities
- Must adjust PO status appropriately
- Must prevent receiving against closed POs

### 10.7 Commit Process
- Must create accurate inventory transactions
- Must update item stock levels correctly
- Must handle batch processing efficiently
- Must prevent edits to committed GRNs

### 10.8 Inventory Transaction
- Must create the correct transaction types based on item classification
- Must update inventory valuation accurately
- Must maintain comprehensive transaction history

## 11. Documentation Requirements

### 11.1 User Documentation
- Detailed instructions for creating GRNs from POs
- Guidelines for manual GRN creation
- Explanation of workflow and statuses
- Instructions for committing and batch operations

### 11.2 Technical Documentation
- API specifications and endpoints
- Database schema and relationships
- Integration points with other system components
- Lot number generation algorithm

### 3.10 Inventory Information Dialogs

#### 3.10.1 On Hand Information Dialog

The On Hand dialog provides detailed visibility into current inventory levels for an item across all storage locations.

##### 3.10.1.1 Access Points
- Available from the Item Detail form via the "On Hand" button
- Available from the GRN item list via expandable row details
- Accessible in all GRN modes (view, edit, create)

##### 3.10.1.2 Functionality
- Displays a modal dialog with real-time inventory information
- Shows a breakdown of inventory by location using the `InventoryBreakdown` component
- Provides a tabular view with the following information:
  - Location/Store name
  - Current on-hand quantity
  - Reserved quantity
  - Available quantity (on-hand minus reserved)
  - Unit of measure
  - Last movement date
- Supports closing via an X button or clicking outside the dialog

##### 3.10.1.3 Purpose
- Enables receiving staff to verify current stock levels before receiving
- Aids in decision-making for allocating received items to appropriate locations
- Provides context for inventory management during the receiving process

#### 3.10.2 On Order Information Dialog

The On Order dialog shows all pending purchase orders for the item to provide visibility into the procurement pipeline.

##### 3.10.2.1 Access Points
- Available from the Item Detail form via the "On Order" button
- Available from the GRN item list via expandable row details
- Accessible in all GRN modes (view, edit, create)

##### 3.10.2.2 Functionality
- Displays a modal dialog showing all pending purchase orders
- Implemented using the `PendingPurchaseOrdersComponent`
- Shows a tabular view with the following information:
  - Purchase Order reference number
  - Order date
  - Vendor information
  - Ordered quantity
  - Already received quantity
  - Remaining quantity
  - Expected delivery date
  - Order status
- Supports close via X button or clicking outside the dialog

##### 3.10.2.3 Purpose
- Provides visibility into the procurement pipeline for the item
- Helps receiving staff coordinate the current receipt with other expected deliveries
- Enables verification of ordered quantities against the original purchase orders
- Assists in identifying partial deliveries from the same purchase order

#### 3.10.3 Technical Implementation
- Both dialogs use the same Dialog component from the UI library
- Dialogs are implemented with proper accessibility features
- State management for dialog visibility using React useState hooks
- Responsive design ensures usability on different screen sizes
- Data is fetched on-demand when dialogs are opened to ensure up-to-date information
