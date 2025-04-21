# Purchase Order Module - Functional Specification Document (FSD) - Part 2: Implementation Details

## 1. Introduction

### 1.1 Purpose
This document provides detailed specifications for the implementation of the Purchase Order module within the Carmen F&B Management System. Part 2 focuses on implementation details including technology stack, development standards, API specifications, and data models.

### 1.2 Document Scope
Part 2 of this document covers:
- Technology stack
- Development standards and conventions
- API specifications
- Data models and validation
- State management
- Error handling

### 1.3 Related Documents
- Purchase Order Product Requirements Document (PRD)
- Purchase Order Functional Specification Document (FSD) - Part 1: Overview and Architecture
- Purchase Order Functional Specification Document (FSD) - Part 3: Quality Assurance and Deployment
- System Architecture Document
- Coding Standards Document

## 2. Technology Stack

### 2.1 Frontend Technology Stack

#### 2.1.1 Core Technologies
The Purchase Order module SHALL use the following core frontend technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | React framework for server-side rendering and static site generation |
| React | 18.x | JavaScript library for building user interfaces |
| TypeScript | 5.x | Typed superset of JavaScript for improved developer experience |
| Tailwind CSS | 3.x | Utility-first CSS framework for rapid UI development |

#### 2.1.2 UI Component Libraries
The Purchase Order module SHALL use the following UI component libraries:

| Library | Version | Purpose |
|---------|---------|---------|
| Shadcn UI | Latest | Component library built on Radix UI and Tailwind CSS |
| Radix UI | Latest | Unstyled, accessible UI components for React |
| Lucide React | Latest | Icon library for React applications |
| React Hook Form | Latest | Form handling library for React |
| Zod | Latest | TypeScript-first schema validation library |
| React Table | Latest | Headless UI for building powerful tables and datagrids |

#### 2.1.3 State Management
The Purchase Order module SHALL use the following state management solutions:

| Library | Version | Purpose |
|---------|---------|---------|
| React Context | Built-in | For component-level state management |
| React Query | Latest | For server state management and data fetching |
| Zustand | Latest | For global state management when needed |

### 2.2 Backend Technology Stack

#### 2.2.1 Core Technologies
The Purchase Order module SHALL use the following core backend technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.x | Full-stack framework for API routes and server actions |
| Node.js | 18.x+ | JavaScript runtime for server-side code |
| TypeScript | 5.x | Typed superset of JavaScript for improved developer experience |

#### 2.2.2 API and Server Actions
The Purchase Order module SHALL use the following technologies for API and server actions:

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.x | RESTful API endpoints |
| Next.js Server Actions | 14.x | Server-side functions callable from client components |
| next-safe-action | Latest | Type-safe server actions with validation |
| Zod | Latest | Request and response validation |

#### 2.2.3 Database and ORM
The Purchase Order module SHALL use the following database and ORM technologies:

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15.x+ | Relational database management system |
| Prisma | Latest | Next-generation ORM for Node.js and TypeScript |
| Prisma Client | Latest | Auto-generated and type-safe query builder |
| Prisma Migrate | Latest | Database migration tool |

## 3. Development Standards and Conventions

### 3.1 TypeScript Coding Standards

#### 3.1.1 Type Definitions
The Purchase Order module SHALL follow these conventions for type definitions:

1. **Prefer interfaces over types** for object definitions
2. **Use types for unions, intersections, and simple aliases**
3. **Use descriptive names** for types and interfaces
4. **Define explicit return types** for functions
5. **Use readonly modifier** for immutable properties

#### 3.1.2 Null and Undefined Handling
The Purchase Order module SHALL follow these conventions for null and undefined handling:

1. **Use undefined for optional parameters**
2. **Use null for intentional absence of value**
3. **Use non-null assertion operator sparingly**

#### 3.1.3 Error Handling
The Purchase Order module SHALL follow these conventions for error handling:

1. **Use typed error classes**
2. **Handle errors at the appropriate level**
3. **Use discriminated unions for result types**

### 3.2 React Component Standards

#### 3.2.1 Component Structure
The Purchase Order module SHALL follow these conventions for component structure:

1. **Use function declarations for components**
2. **Use explicit return types for complex components**
3. **Use destructuring for props**
4. **Define component props interface above the component**
5. **Define subcomponents within the same file for closely related components**
6. **Extract complex logic into custom hooks**

#### 3.2.2 Server Components vs. Client Components
The Purchase Order module SHALL follow these conventions for server and client components:

1. **Use server components for:**
   - Data fetching
   - Static content
   - SEO-critical content
   - Content that doesn't require client-side interactivity

2. **Use client components for:**
   - Interactive UI elements
   - Form handling
   - Client-side state management
   - Animations and transitions

3. **Minimize the use of 'use client' directive**

### 3.3 CSS and Styling Standards

#### 3.3.1 Tailwind CSS Conventions
The Purchase Order module SHALL follow these conventions for Tailwind CSS:

1. **Group related classes together**
2. **Use consistent ordering of classes**
3. **Extract common patterns to components**
4. **Use mobile-first approach**
5. **Use consistent breakpoints**
6. **Implement responsive typography**

#### 3.3.2 Component Styling
The Purchase Order module SHALL follow these conventions for component styling:

1. **Use Shadcn UI components for consistent UI**
2. **Extend Shadcn UI components with consistent styling**
3. **Use consistent styling patterns**
4. **Use CSS variables for theming**

### 3.4 Documentation Standards

#### 3.4.1 Code Comments
The Purchase Order module SHALL follow these conventions for code comments:

1. **Use JSDoc for functions and components**
2. **Use inline comments for complex logic**
3. **Use TODO comments for future improvements**
4. **Document component props with JSDoc**
5. **Document complex state management**

#### 3.4.2 API Documentation
The Purchase Order module SHALL follow these conventions for API documentation:

1. **Document server actions with JSDoc**
2. **Document validation schemas**
3. **Document API endpoints with JSDoc**
4. **Document request and response types**

## 4. API Specifications

### 4.1 RESTful API Endpoints

#### 4.1.1 Purchase Order Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/purchase-orders` | GET | Get list of purchase orders | N/A | Array of purchase orders with pagination |
| `/api/purchase-orders/:id` | GET | Get purchase order by ID | N/A | Purchase order object |
| `/api/purchase-orders` | POST | Create new purchase order | Purchase order data | Created purchase order |
| `/api/purchase-orders/:id` | PUT | Update purchase order | Updated purchase order data | Updated purchase order |
| `/api/purchase-orders/:id` | DELETE | Delete purchase order | N/A | Success message |
| `/api/purchase-orders/:id/status` | POST | Update purchase order status | Status data | Updated purchase order |

#### 4.1.2 Purchase Order Item Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/purchase-orders/:id/items` | GET | Get items for a purchase order | N/A | Array of purchase order items |
| `/api/purchase-orders/:id/items` | POST | Add item to purchase order | Item data | Created purchase order item |
| `/api/purchase-orders/:id/items/:itemId` | PUT | Update purchase order item | Updated item data | Updated purchase order item |
| `/api/purchase-orders/:id/items/:itemId` | DELETE | Remove item from purchase order | N/A | Success message |

#### 4.1.3 Additional Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/purchase-orders/:id/attachments` | GET | Get attachments for a purchase order | N/A | Array of attachments |
| `/api/purchase-orders/:id/attachments` | POST | Add attachment to purchase order | Attachment data | Created attachment |
| `/api/purchase-orders/:id/comments` | GET | Get comments for a purchase order | N/A | Array of comments |
| `/api/purchase-orders/:id/comments` | POST | Add comment to purchase order | Comment data | Created comment |
| `/api/purchase-orders/:id/pdf` | GET | Generate PDF for a purchase order | N/A | PDF file |
| `/api/purchase-orders/:id/email` | POST | Email purchase order | Email data | Success message |

### 4.2 Server Actions

#### 4.2.1 Purchase Order Actions

| Action | Description | Parameters | Return Value |
|--------|-------------|------------|--------------|
| `createPurchaseOrder` | Creates a new purchase order | Purchase order data | Result with created purchase order or error |
| `updatePurchaseOrder` | Updates an existing purchase order | ID, updated data | Result with updated purchase order or error |
| `deletePurchaseOrder` | Deletes a purchase order | ID | Result with success or error |
| `changePurchaseOrderStatus` | Changes the status of a purchase order | ID, status, reason | Result with updated purchase order or error |
| `generatePurchaseOrderPdf` | Generates a PDF version of a purchase order | ID | Result with PDF URL or error |
| `emailPurchaseOrder` | Sends a purchase order via email | ID, email options | Result with success or error |

#### 4.2.2 Purchase Order Item Actions

| Action | Description | Parameters | Return Value |
|--------|-------------|------------|--------------|
| `addPurchaseOrderItem` | Adds an item to a purchase order | PO ID, item data | Result with created item or error |
| `updatePurchaseOrderItem` | Updates an item in a purchase order | PO ID, item ID, updated data | Result with updated item or error |
| `removePurchaseOrderItem` | Removes an item from a purchase order | PO ID, item ID | Result with success or error |

### 4.3 API Request and Response Formats

#### 4.3.1 Purchase Order List Request

```
GET /api/purchase-orders?status=draft&vendorId=123&page=1&limit=10
```

Query Parameters:
- `status`: Filter by status (optional)
- `vendorId`: Filter by vendor ID (optional)
- `fromDate`: Filter by date range start (optional)
- `toDate`: Filter by date range end (optional)
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)
- `sortBy`: Field to sort by (default: 'createdAt')
- `sortOrder`: Sort order ('asc' or 'desc', default: 'desc')

#### 4.3.2 Purchase Order List Response

```json
{
  "data": [
    {
      "id": "uuid-1",
      "number": "PO-2023-001",
      "vendorId": "vendor-uuid-1",
      "vendorName": "Vendor Name",
      "orderDate": "2023-01-15T00:00:00.000Z",
      "status": "draft",
      "totalAmount": 1500.00,
      "currencyCode": "USD",
      "createdAt": "2023-01-15T10:30:00.000Z",
      "updatedAt": "2023-01-15T10:30:00.000Z"
    },
    // More purchase orders...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### 4.3.3 Purchase Order Create Request

```json
{
  "vendorId": "vendor-uuid-1",
  "orderDate": "2023-01-15T00:00:00.000Z",
  "deliveryDate": "2023-01-30T00:00:00.000Z",
  "currencyCode": "USD",
  "exchangeRate": 1.0,
  "description": "Monthly grocery supplies",
  "items": [
    {
      "itemId": "item-uuid-1",
      "name": "Rice",
      "description": "Premium jasmine rice",
      "orderedQuantity": 100,
      "orderUnit": "kg",
      "unitPrice": 2.5,
      "taxRate": 7,
      "isFoc": false
    },
    // More items...
  ]
}
```

#### 4.3.4 Purchase Order Create Response

```json
{
  "success": true,
  "data": {
    "id": "new-po-uuid",
    "number": "PO-2023-046",
    "vendorId": "vendor-uuid-1",
    "vendorName": "Vendor Name",
    "orderDate": "2023-01-15T00:00:00.000Z",
    "deliveryDate": "2023-01-30T00:00:00.000Z",
    "status": "draft",
    "currencyCode": "USD",
    "exchangeRate": 1.0,
    "description": "Monthly grocery supplies",
    "subtotalPrice": 250.00,
    "taxAmount": 17.50,
    "totalAmount": 267.50,
    "items": [
      {
        "id": "new-item-uuid-1",
        "itemId": "item-uuid-1",
        "name": "Rice",
        "description": "Premium jasmine rice",
        "orderedQuantity": 100,
        "orderUnit": "kg",
        "unitPrice": 2.5,
        "subtotalPrice": 250.00,
        "taxRate": 7,
        "taxAmount": 17.50,
        "totalAmount": 267.50,
        "isFoc": false
      },
      // More items...
    ],
    "createdAt": "2023-01-15T10:30:00.000Z",
    "updatedAt": "2023-01-15T10:30:00.000Z"
  }
}
```

## 5. Data Models and Validation

### 5.1 Core Data Models

#### 5.1.1 Purchase Order Model

```typescript
interface PurchaseOrder {
  id: string;
  number: string;
  vendorId: string;
  vendorName?: string;
  orderDate: Date;
  deliveryDate?: Date;
  status: PurchaseOrderStatus;
  currencyCode: string;
  exchangeRate: number;
  description?: string;
  remarks?: string;
  email?: string;
  buyer?: string;
  creditTerms?: string;
  
  // PR Reference
  prId?: string;
  prNumber?: string;
  prRequestor?: string;
  
  // Financial fields
  baseCurrencyCode: string;
  baseSubtotalPrice: number;
  subtotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  
  // Metadata
  createdBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  
  // Relations
  items?: PurchaseOrderItem[];
  statusHistory?: PurchaseOrderStatusHistory[];
  approvals?: PurchaseOrderApproval[];
  attachments?: PurchaseOrderAttachment[];
  comments?: PurchaseOrderComment[];
}

type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
```

#### 5.1.2 Purchase Order Item Model

```typescript
interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  name: string;
  description?: string;
  
  // PR Item Reference for Traceability
  prItemId?: string;
  prNumber?: string;
  prRequestor?: string;
  prRequestDate?: Date;
  prDepartment?: string;
  
  convRate: number;
  orderedQuantity: number;
  orderUnit: string;
  baseQuantity: number;
  baseUnit: string;
  baseReceivingQty: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  status: string;
  isFoc: boolean;
  taxRate: number;
  discountRate: number;
  
  // Financial fields
  baseSubtotalPrice: number;
  subtotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
  
  // Additional fields
  comment?: string;
  taxIncluded: boolean;
  discountAdjustment: boolean;
  taxAdjustment: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Validation Schemas

#### 5.2.1 Purchase Order Creation Schema

```typescript
const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  orderDate: z.date(),
  deliveryDate: z.date().optional(),
  currencyCode: z.string().length(3),
  exchangeRate: z.number().positive(),
  description: z.string().optional(),
  remarks: z.string().optional(),
  email: z.string().email().optional(),
  buyer: z.string().optional(),
  creditTerms: z.string().optional(),
  
  items: z.array(z.object({
    itemId: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    orderedQuantity: z.number().positive(),
    orderUnit: z.string(),
    unitPrice: z.number().min(0),
    taxRate: z.number().min(0).max(100),
    discountRate: z.number().min(0).max(100).optional().default(0),
    isFoc: z.boolean().optional().default(false),
    comment: z.string().optional(),
    taxIncluded: z.boolean().optional().default(false),
  })).min(1),
});
```

#### 5.2.2 Purchase Order Update Schema

```typescript
const updatePurchaseOrderSchema = z.object({
  orderDate: z.date().optional(),
  deliveryDate: z.date().optional(),
  description: z.string().optional(),
  remarks: z.string().optional(),
  email: z.string().email().optional(),
  buyer: z.string().optional(),
  creditTerms: z.string().optional(),
});
```

#### 5.2.3 Purchase Order Status Change Schema

```typescript
const changePurchaseOrderStatusSchema = z.object({
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'cancelled', 'completed']),
  reason: z.string().optional(),
});
```

## 6. State Management

### 6.1 Client-Side State Management

#### 6.1.1 Component-Level State
The Purchase Order module SHALL use React's built-in state management hooks for component-level state:

1. **useState**: For simple state values
2. **useReducer**: For complex state logic
3. **useContext**: For sharing state between components

#### 6.1.2 Form State Management
The Purchase Order module SHALL use React Hook Form for form state management:

1. **Form initialization**: Set up form with default values and validation schema
2. **Form validation**: Validate form data using Zod schemas
3. **Form submission**: Handle form submission with server actions

#### 6.1.3 Server State Management
The Purchase Order module SHALL use React Query for server state management:

1. **Data fetching**: Fetch data from API endpoints
2. **Caching**: Cache server responses
3. **Refetching**: Automatically refetch data when needed
4. **Mutations**: Update server data with optimistic updates

### 6.2 Server-Side State Management

#### 6.2.1 Database State
The Purchase Order module SHALL use Prisma ORM for database state management:

1. **CRUD operations**: Create, read, update, and delete database records
2. **Transactions**: Use transactions for operations that affect multiple records
3. **Optimistic concurrency control**: Use version field to prevent conflicts

#### 6.2.2 Session State
The Purchase Order module SHALL use NextAuth.js for session state management:

1. **Authentication**: Authenticate users
2. **Authorization**: Authorize user actions based on roles
3. **Session persistence**: Persist session state across requests

## 7. Error Handling

### 7.1 Error Types

#### 7.1.1 Validation Errors
The Purchase Order module SHALL handle validation errors as follows:

1. **Client-side validation**: Validate form data before submission
2. **Server-side validation**: Validate request data before processing
3. **Error response**: Return detailed validation errors to the client

#### 7.1.2 Business Logic Errors
The Purchase Order module SHALL handle business logic errors as follows:

1. **Precondition checks**: Verify business rules before processing
2. **Error response**: Return specific error codes and messages
3. **Error logging**: Log business logic errors for analysis

#### 7.1.3 System Errors
The Purchase Order module SHALL handle system errors as follows:

1. **Try-catch blocks**: Catch unexpected errors
2. **Error logging**: Log system errors with stack traces
3. **Graceful degradation**: Provide fallback behavior when possible
4. **Error boundaries**: Prevent UI crashes with React error boundaries

### 7.2 Error Response Format

```json
{
  "success": false,
  "error": {
    "type": "validation",
    "message": "Invalid input data",
    "details": [
      {
        "field": "orderDate",
        "message": "Order date is required"
      },
      {
        "field": "items[0].orderedQuantity",
        "message": "Quantity must be greater than 0"
      }
    ]
  }
}
```

## 8. Appendices

### 8.1 Glossary
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **ORM**: Object-Relational Mapping
- **REST**: Representational State Transfer
- **JSDoc**: JavaScript Documentation
- **UI**: User Interface
- **UUID**: Universally Unique Identifier
- **JSON**: JavaScript Object Notation

### 8.2 References
- Next.js Documentation
- React Documentation
- TypeScript Documentation
- Prisma Documentation
- React Hook Form Documentation
- Zod Documentation
- React Query Documentation 