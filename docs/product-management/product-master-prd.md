# Product Requirements Document (PRD)
# Product Master Module for ERP System

## 1. Overview
### 1.1 Purpose
The Product Master module is a critical component of the ERP system that serves as the central repository for all product information. It provides comprehensive product data management capabilities that are utilized by various other modules including Purchasing, Goods Receipt Notes (GRN), Purchase Orders (PO), Credit Notes (CN), Sales Returns (SR), and Inventory Management.

### 1.2 Scope
This PRD covers the requirements for the Product Master module's list and detail pages, focusing on product information management, unit conversions, store assignments, and purchase history tracking.

### 1.3 Business Objectives
- Centralize product data management to ensure consistency across the ERP system
- Streamline product information access for all users involved in the procurement and inventory processes
- Provide flexible product categorization and assignment capabilities
- Track product purchase history for better decision-making
- Enable efficient product data maintenance with comprehensive editing capabilities

## 2. Target Users
The Product Master module will be used by various stakeholders within the organization:
- Procurement team
- Inventory managers
- Store/location managers
- Finance team (for tax and cost information)
- Operations staff

## 3. User Interface Requirements

### 3.1 Product List Page
The list page will display all products in a tabular format with the following features:
- Sortable columns for efficient data browsing
- Search functionality for quick product lookup
- Filtering options by product attributes (category, active status, etc.)
- Action buttons for creating new products, editing, and deleting existing ones
- Pagination for handling large product catalogs
- Responsive design that adapts to different screen sizes

### 3.2 Product Detail Page
The detail page will display comprehensive information about a single product and allow for data management.

#### 3.2.1 Action Buttons
- **Create**: For creating a new product record
- **Edit**: For making changes to existing product details
- **Delete**: For removing the product record from the system
- **Print**: For printing the product details
- **Back**: For returning to the product list


#### 3.2.2 Product Header
- **Product Code**: Prominently displayed as the primary identifier
- **Active Status**: Toggle indicating whether the product is currently active
- **Creation Information**: Timestamp and method of product record creation

#### 3.2.3 Product Information
- **Category/Sub Category**: Classification fields for organizational purposes
- **Item Group**: Additional categorization field
- **English Description/Local Description**: Multilingual product descriptions
- **Tax Type**:  (Add Master Tax Type Lookup)  ## Move to Pricelist and Vendor  
  - Three options for tax handling:
  - ID
  - Code
  - Description of Type
    - Added Tax: Tax is added on top of the product price
    - Include Tax: Tax is included in the product price
    - None: No tax applies to the product
  - Tax Rate**: Applicable tax rate percentage
- **Bar Code**: Field for product barcode information
- **Standard Cost/Receiving Cost**: Cost tracking fields   ## net value without tax
- **Quantity/Price Deviation**: Percentage deviations allowed (Min: 0%, Max: 100%)
  - Note: These deviations trickle down to child records

#### 3.2.4 Additional Attribute(s)
Key-value pairs for additional product attributes:
- **Weight**: Product weight in kilograms
- **Shelf Life**: Product shelf life in days
- **Storage Instructions**: Specific storage requirements or guidelines
- **Barcode**: Product barcode information
- **Size**: Product size specifications
- **Color**: Product color information
Each attribute includes:
- Clear label (key)
- Appropriate input type (number/text/textarea/calendar)
- Default values from product data
- Edit state handling
- Data change tracking

#### 3.2.5 Default Units
- **Inventory Unit**: Standard unit of measure for inventory tracking
- **Order Unit**: Standard unit of measure for ordering

#### 3.2.6 Conversion Rates
- **Order Unit**: Configurable units for ordering with conversion rates to inventory units
- **Recipe Unit**: Configurable units for recipes with conversion rates to inventory units

#### 3.2.7 Store/Location Assignment
- Assignment grid showing all applicable stores/locations
- Minimum and maximum inventory threshold settings for each location
- Ability to add or remove store/location assignments

#### 3.2.8 Product Types
- Checkbox options to indicate if the product is used in recipes and/or sold directly

### 3.3 Latest Purchase Tab Table
When the "Latest Purchase" Tab is clicked, a modal window will display with two sections:
- **Latest Purchase**: For displaying the 10 most recent purchase orders and receiving notes associated with the selected product

#### 3.3.1 Purchase Order (PO) Section
Table displaying:
- **No.**: Purchase order identification number
- **Delivery Date**: Expected or actual delivery date
- **Vendor**: Supplier information
- **Location**: Internal location code
- **Description**: Purchase order details
- **Status**: Current state of the purchase order
- **Document#**: Reference number
- **Qty**: Ordered quantity
- **Unit**: Unit of measure
- **Price**: Unit price
- **Currency**: Transaction currency

#### 3.3.2 Receiving Section
Table displaying:
- **No.**: Receiving record identification number
- **Receiving Date**: Date of goods receipt
- **Vendor**: Supplier information
- **Location**: Receiving location
- **Description**: Additional details
- **Status**: Current status of the receiving record
- **Document#**: Unique identifier
- **Qty**: Received quantity
- **Unit**: Unit of measure
- **Price**: Cost per unit
- **Currency**: Transaction currency

#### 3.3.3 Close Button
Button to close the pop-up and return to the product detail page

### 3.4 Activity Log Section
- Comprehensive log of all activities related to the product
- Details including date, time, user, and action type
- Captures creation, modifications, and other significant events

## 4. Functional Requirements

### 4.1 Product Management
- FR-1.1: The system shall allow users to create new product records with all required fields
- FR-1.2: The system shall allow users to edit existing product information
- FR-1.3: The system shall allow users to delete product records
- FR-1.4: The system shall allow users to mark products as active or inactive
- FR-1.5: The system shall maintain creation timestamp and method information

### 4.2 Product Categorization
- FR-2.1: The system shall support hierarchical categorization with category and subcategory
- FR-2.2: The system shall support additional classification via item group
- FR-2.3: The system shall support product type classification (recipe use, direct sale) triggle down to items

### 4.3 Unit Management
- FR-3.1: The system shall maintain default inventory and order units for each product
- FR-3.2: The system shall support multiple order units with conversion rates to inventory units
- FR-3.3: The system shall support multiple recipe units with conversion rates to inventory units
- FR-3.4: The system shall support creation of unit at all unit lookup

### 4.4 Store/Location Assignment
- FR-4.1: The system shall allow products to be assigned to multiple stores/locations
- FR-4.2: The system shall maintain minimum and maximum inventory thresholds for each assigned location
- FR-4.3: The system shall allow users to add or remove store/location assignments

### 4.5 Purchase History
- FR-5.1: The system shall track and display the 10 most recent purchase orders for a product
- FR-5.2: The system shall track and display the 10 most recent receiving records for a product
- FR-5.3: The system shall display comprehensive information for each purchase and receiving record

### 4.6 Activity Logging
- FR-6.1: The system shall log all activities related to product data management
- FR-6.2: The system shall capture user information, timestamp, and action type for each logged activity

## 5. Technical Requirements

### 5.1 General
- TR-1.1: The module shall be implemented as a web application
- TR-1.2: The interface shall be responsive and compatible with various screen sizes
- TR-1.3: The module shall integrate seamlessly with other ERP modules

### 5.2 Data Model
The core product data model will include:

**Product**
- ProductID (Primary Key)
- ProductCode (Unique)
- IsActive (Boolean)
- CreatedDate (DateTime)
- CreationMethod (String)
- CategoryID (Foreign Key)
- SubCategoryID (Foreign Key)
- ItemGroupID (Foreign Key)
- EnglishDescription (String)
- LocalDescription (String)
- TaxTypeID (Foreign Key) ##
- TaxRate (Decimal)  ##
- BarCode (String)
- StandardCost (Decimal)
- Last Receiving Cost (Decimal) ## Display only add Date and Vendor
- QuantityDeviation (Decimal) - Range: 0-100%
- PriceDeviation (Decimal) - Range: 0-100%
- DefaultInventoryUnitID (Foreign Key)
- DefaultOrderUnitID (Foreign Key)
- IsUsedInRecipes (Boolean)
- IsSoldDirectly (Boolean)

**ProductUnit**
- ProductUnitID (Primary Key)
- ProductID (Foreign Key)
- UnitID (Foreign Key)
- UnitType (Enum: Inventory, Order, Recipe)
- ConversionRate (Decimal)

**ProductStoreAssignment**
- AssignmentID (Primary Key)
- ProductID (Foreign Key)
- StoreID (Foreign Key)
- MinimumQuantity (Decimal)
- MaximumQuantity (Decimal)

**ProductActivityLog**
- LogID (Primary Key)
- ProductID (Foreign Key)
- UserID (Foreign Key)
- ActivityDate (DateTime)
- ActivityType (String)
- ActivityDetails (String)

### 5.3 Integration Points
The Product Master module will integrate with:
- Purchasing module
- GRN (Goods Receipt Note) module
- PO (Purchase Order) module
- CN (Credit Note) module
- SR (Sales Return) module
- Inventory Issue module

### 5.4 Performance Requirements
- TR-4.1: The product list page shall load within 3 seconds with up to 100 records displayed
- TR-4.2: The product detail page shall load within 2 seconds
- TR-4.3: The Latest Purchase popup shall load within 3 seconds

## 6. Development Guidelines

### 6.1 Technology Stack
- Frontend: HTML5, CSS3, JavaScript with a responsive framework
- Backend: To align with the existing ERP system architecture
- Database: To align with the existing ERP system database

### 6.2 Development Phases

#### Phase 1: Core Module Development
- Product list page implementation
- Basic product detail page with create, edit, delete functionality
- Core data model implementation

#### Phase 2: Advanced Features
- Unit conversion functionality
- Store/location assignment capabilities
- Purchase history tracking

#### Phase 3: Integration & Testing
- Integration with other ERP modules
- Comprehensive testing
- UI refinement and responsive design optimization

### 6.3 Mock Data
The development will utilize existing mock data to represent:
- Product records
- Unit conversions
- Store/location assignments
- Purchase orders and receiving records

## 7. Acceptance Criteria

### 7.1 Product List Page
- AC-1.1: The list page displays all products with sortable columns
- AC-1.2: Search functionality correctly filters products
- AC-1.3: Action buttons function as expected
- AC-1.4: The list page is responsive on different screen sizes

### 7.2 Product Detail Page
- AC-2.1: All product information is correctly displayed
- AC-2.2: Create, Edit, Delete, Print, and Back buttons function as expected
- AC-2.3: Unit conversion rates are correctly managed
- AC-2.4: Store/location assignments can be added, modified, and removed
- AC-2.5: Product type checkboxes function correctly

### 7.3 Latest Purchase Popup
- AC-3.1: The popup displays the 10 most recent purchase orders
- AC-3.2: The popup displays the 10 most recent receiving records
- AC-3.3: All data fields are correctly populated
- AC-3.4: The Close button returns to the product detail page

### 7.4 Responsiveness
- AC-4.1: All pages display correctly on desktop browsers
- AC-4.2: All pages display correctly on tablet devices
- AC-4.3: All pages display correctly on mobile devices
- AC-4.4: All functionality remains accessible across device types

## 8. Future Considerations
- Integration with barcode scanning capabilities
- Advanced inventory forecasting based on product threshold settings
- Product image management
- Extended product attributes for specialized product types
- Integration with supplier management for automated purchase ordering
- Multi-language support for product descriptions
- Historical cost tracking and analysis

## 9. Appendix

### 9.1 Glossary
- **ERP**: Enterprise Resource Planning
- **GRN**: Goods Receipt Note
- **PO**: Purchase Order
- **CN**: Credit Note
- **SR**: Sales Return
- **Product Master**: Central repository of product information

### 9.2 References
- Existing product detail mockups provided in the system specification
- Current ERP module architecture
- Mock data specifications

### 9.3 Approval
This PRD requires approval from:
- Product Owner
- Development Team Lead
- UX/UI Designer
- Integration Specialist