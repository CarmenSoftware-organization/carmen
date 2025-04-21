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
  - Restock Level
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
- Items requiring lot numbers must have them assigned before committing
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
