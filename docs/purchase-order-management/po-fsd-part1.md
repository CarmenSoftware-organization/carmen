# Purchase Order Module - Functional Specification Document (FSD) - Part 1: Overview and Architecture

## 1. Introduction

### 1.1 Purpose
This document provides detailed specifications for the implementation of the Purchase Order module within the Carmen F&B Management System. Part 1 focuses on the system overview and architecture.

### 1.2 Document Scope
Part 1 of this document covers:
- Introduction and purpose
- System overview
- Architecture principles
- Component architecture
- Database architecture

### 1.3 Related Documents
- Purchase Order Product Requirements Document (PRD)
- Purchase Order Functional Specification Document (FSD) - Part 2: Implementation Details
- Purchase Order Functional Specification Document (FSD) - Part 3: Quality Assurance and Deployment
- System Architecture Document
- Database Schema Documentation

## 2. System Overview

### 2.1 Module Description
The Purchase Order module is a core component of the Carmen F&B Management System that enables users to create, manage, and track purchase orders throughout their lifecycle. The module facilitates the procurement process by providing tools for creating purchase orders, managing approval workflows, tracking goods receipt, and integrating with financial systems.

### 2.2 Key Features
The Purchase Order module SHALL provide the following key features:

1. **Purchase Order Management**
   - Creation of purchase orders with vendor selection
   - Editing and updating purchase order details
   - Viewing purchase order history and status
   - Cancellation and deletion of purchase orders

2. **Item Management**
   - Adding items to purchase orders
   - Specifying quantities, units, and prices
   - Managing free-of-charge (FOC) items
   - Tracking received quantities

3. **Financial Management**
   - Calculation of subtotals, taxes, and totals
   - Currency conversion for multi-currency operations
   - Budget tracking and financial validation
   - Cost allocation to departments or cost centers

4. **Workflow and Approvals**
   - Configurable approval workflows
   - Role-based approval processes
   - Status tracking and notifications
   - Audit trail of approval actions

5. **Integration**
   - Connection to vendor management
   - Integration with goods receipt
   - Financial system integration
   - Inventory management integration

6. **Reporting and Analytics**
   - Purchase order status reporting
   - Vendor performance analysis
   - Spending analysis by category
   - Budget variance reporting

### 2.3 User Roles and Permissions
The Purchase Order module SHALL support the following user roles and permissions:

| Role | Description | Key Permissions |
|------|-------------|----------------|
| Procurement Officer | Creates and manages purchase orders | Create, edit, view POs; add items; request approval |
| Procurement Manager | Oversees procurement operations | All Procurement Officer permissions; approve/reject POs; delete POs |
| Finance Officer | Reviews financial aspects | View POs; review financial details; export reports |
| Finance Manager | Approves financial aspects | Finance Officer permissions; financial approval of POs |
| Department Manager | Approves departmental purchases | View department POs; approve/reject department POs |
| General User | Basic access to relevant POs | View assigned POs; add comments |

## 3. Architecture Principles

### 3.1 Design Principles
The Purchase Order module SHALL adhere to the following design principles:

1. **Modularity**
   - Components should be loosely coupled and highly cohesive
   - Changes to one component should minimize impact on others
   - Features should be organized into logical modules

2. **Scalability**
   - The system should handle increasing loads without performance degradation
   - Architecture should support horizontal and vertical scaling
   - Database design should optimize for high-volume operations

3. **Maintainability**
   - Code should be well-structured and documented
   - Consistent patterns and practices should be applied
   - Technical debt should be minimized

4. **Reliability**
   - The system should handle errors gracefully
   - Data integrity should be maintained at all times
   - Critical operations should be transactional

5. **Security**
   - Sensitive data should be protected
   - Access control should be enforced at all levels
   - Security best practices should be followed

6. **Performance**
   - The system should respond quickly to user interactions
   - Resource usage should be optimized
   - Long-running operations should be asynchronous

### 3.2 Architectural Patterns
The Purchase Order module SHALL implement the following architectural patterns:

1. **Layered Architecture**
   - Presentation Layer: User interface components
   - Application Layer: Business logic and workflows
   - Data Access Layer: Database operations and data mapping
   - Domain Layer: Core business entities and rules

2. **Repository Pattern**
   - Abstract data access behind repository interfaces
   - Centralize data access logic
   - Enable unit testing through repository mocks

3. **Service Pattern**
   - Encapsulate business logic in service classes
   - Coordinate operations across multiple repositories
   - Implement transaction boundaries

4. **Command Query Responsibility Segregation (CQRS)**
   - Separate read and write operations
   - Optimize read operations for performance
   - Ensure consistency for write operations

## 4. Component Architecture

### 4.1 High-Level Architecture
The Purchase Order module SHALL follow a client-server architecture with the following layers:

1. **Presentation Layer**
   - Next.js frontend with React components
   - Server-side rendering for initial page loads
   - Client-side rendering for dynamic interactions

2. **Application Layer**
   - Next.js API routes for server-side logic
   - Server actions for form submissions and data mutations
   - Business logic services for complex operations

3. **Data Access Layer**
   - Prisma ORM for database access
   - Repository pattern for data access abstraction
   - Caching mechanisms for frequently accessed data

4. **Database Layer**
   - PostgreSQL relational database
   - Database schema with proper relationships and constraints
   - Indexes for performance optimization

### 4.2 Frontend Components

#### 4.2.1 Page Components
The Purchase Order module SHALL include the following page components:
- **PurchaseOrderListPage**: Displays a list of purchase orders with filtering and sorting
- **PurchaseOrderDetailPage**: Displays details of a specific purchase order
- **PurchaseOrderCreatePage**: Allows creation of a new purchase order
- **PurchaseOrderEditPage**: Allows editing of an existing purchase order

#### 4.2.2 UI Components
The Purchase Order module SHALL include the following UI components:
- **PurchaseOrderList**: Displays purchase orders in a table with sorting and pagination
- **PurchaseOrderFilter**: Provides filtering options for purchase orders
- **PurchaseOrderForm**: Form for creating and editing purchase orders
- **PurchaseOrderItemList**: Displays items in a purchase order
- **PurchaseOrderItemForm**: Form for adding and editing items in a purchase order
- **PurchaseOrderSummary**: Displays financial summary of a purchase order
- **PurchaseOrderStatusBadge**: Displays the status of a purchase order
- **PurchaseOrderActions**: Provides action buttons for a purchase order

#### 4.2.3 Client-Side Services
The Purchase Order module SHALL include the following client-side services:
- **PurchaseOrderService**: Handles API calls for purchase order operations
- **ValidationService**: Validates purchase order data on the client side
- **NotificationService**: Displays notifications to the user
- **StateManagementService**: Manages client-side state for purchase orders

### 4.3 Backend Components

#### 4.3.1 API Routes
The Purchase Order module SHALL include the following API routes:
- **GET /api/purchase-orders**: Retrieves a list of purchase orders
- **GET /api/purchase-orders/:id**: Retrieves a specific purchase order
- **POST /api/purchase-orders**: Creates a new purchase order
- **PUT /api/purchase-orders/:id**: Updates an existing purchase order
- **DELETE /api/purchase-orders/:id**: Deletes a purchase order
- **POST /api/purchase-orders/:id/status**: Updates the status of a purchase order
- **GET /api/purchase-orders/:id/items**: Retrieves items for a purchase order
- **POST /api/purchase-orders/:id/items**: Adds an item to a purchase order
- **PUT /api/purchase-orders/:id/items/:itemId**: Updates an item in a purchase order
- **DELETE /api/purchase-orders/:id/items/:itemId**: Removes an item from a purchase order

#### 4.3.2 Server Actions
The Purchase Order module SHALL include the following server actions:
- **createPurchaseOrder**: Creates a new purchase order
- **updatePurchaseOrder**: Updates an existing purchase order
- **deletePurchaseOrder**: Deletes a purchase order
- **changePurchaseOrderStatus**: Changes the status of a purchase order
- **addPurchaseOrderItem**: Adds an item to a purchase order
- **updatePurchaseOrderItem**: Updates an item in a purchase order
- **removePurchaseOrderItem**: Removes an item from a purchase order
- **generatePurchaseOrderPdf**: Generates a PDF version of a purchase order
- **emailPurchaseOrder**: Sends a purchase order via email

#### 4.3.3 Business Logic Services
The Purchase Order module SHALL include the following business logic services:
- **PurchaseOrderService**: Handles business logic for purchase orders
- **PurchaseOrderItemService**: Handles business logic for purchase order items
- **PurchaseOrderWorkflowService**: Handles workflow and status transitions
- **PurchaseOrderCalculationService**: Handles financial calculations
- **PurchaseOrderValidationService**: Validates purchase order data
- **PurchaseOrderNotificationService**: Sends notifications for purchase order events
- **PurchaseOrderIntegrationService**: Handles integration with other modules

#### 4.3.4 Data Access Services
The Purchase Order module SHALL include the following data access services:
- **PurchaseOrderRepository**: Handles database operations for purchase orders
- **PurchaseOrderItemRepository**: Handles database operations for purchase order items
- **PurchaseOrderAttachmentRepository**: Handles database operations for attachments
- **PurchaseOrderCommentRepository**: Handles database operations for comments
- **PurchaseOrderHistoryRepository**: Handles database operations for history records

## 5. Database Architecture

### 5.1 Database Schema

#### 5.1.1 Purchase Order Table
The `purchase_orders` table SHALL have the following key fields:
- id (UUID, Primary Key)
- number (VARCHAR, Unique)
- vendor_id (UUID, Foreign Key)
- order_date (DATE)
- delivery_date (DATE)
- status (VARCHAR)
- currency_code (VARCHAR)
- exchange_rate (DECIMAL)
- created_by (UUID, Foreign Key)
- approved_by (UUID, Foreign Key)
- approval_date (TIMESTAMP)
- financial fields (subtotal, tax, total amounts in base and transaction currencies)
- metadata fields (created_at, updated_at, version)

#### 5.1.2 Purchase Order Item Table
The `purchase_order_items` table SHALL have the following key fields:
- id (UUID, Primary Key)
- purchase_order_id (UUID, Foreign Key)
- item_id (UUID, Foreign Key)
- name (VARCHAR)
- description (TEXT)
- ordered_quantity (DECIMAL)
- order_unit (VARCHAR)
- base_quantity (DECIMAL)
- base_unit (VARCHAR)
- received_quantity (DECIMAL)
- remaining_quantity (DECIMAL)
- unit_price (DECIMAL)
- status (VARCHAR)
- is_foc (BOOLEAN)
- tax_rate (DECIMAL)
- discount_rate (DECIMAL)
- financial fields (subtotal, tax, total amounts in base and transaction currencies)
- metadata fields (created_at, updated_at)

#### 5.1.3 Additional Tables
The Purchase Order module SHALL include the following additional tables:
- `purchase_order_status_history`: Tracks status changes
- `purchase_order_approvals`: Tracks approval workflow
- `purchase_order_attachments`: Stores document attachments
- `purchase_order_comments`: Stores user comments

### 5.2 Database Relationships

#### 5.2.1 Primary Relationships
- **One-to-Many**: A purchase order has many items
- **One-to-Many**: A purchase order has many status history records
- **One-to-Many**: A purchase order has many approvals
- **One-to-Many**: A purchase order has many attachments
- **One-to-Many**: A purchase order has many comments

#### 5.2.2 Foreign Key Relationships
- **purchase_orders.vendor_id** references **vendors.id**
- **purchase_orders.created_by** references **users.id**
- **purchase_orders.approved_by** references **users.id**
- **purchase_order_items.purchase_order_id** references **purchase_orders.id**
- **purchase_order_items.item_id** references **items.id**
- Additional foreign key relationships for history, approvals, attachments, and comments

### 5.3 Database Indexes and Constraints

#### 5.3.1 Key Indexes
- Primary key indexes on all tables
- Foreign key indexes for all relationships
- Performance indexes on frequently queried fields (status, dates, vendor)
- Unique index on purchase_orders.number

#### 5.3.2 Key Constraints
- Unique constraint on purchase_orders.number
- Check constraints on numeric fields (quantities, rates, amounts)
- Referential integrity constraints on all foreign keys
- Cascading deletes for child records when appropriate

## 6. Appendices

### 6.1 Glossary
- **PO**: Purchase Order
- **FOC**: Free of Charge
- **GRN**: Goods Received Note
- **ORM**: Object-Relational Mapping
- **API**: Application Programming Interface
- **CQRS**: Command Query Responsibility Segregation

### 6.2 References
- Next.js Documentation
- React Documentation
- TypeScript Documentation
- Prisma Documentation
- PostgreSQL Documentation 