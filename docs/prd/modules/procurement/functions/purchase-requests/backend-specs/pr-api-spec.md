# Purchase Requests Backend API Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Document**: Backend API & Data Model Specification  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Production Implementation Documented

---

## 📋 Backend Architecture Overview

This document defines the complete backend API specifications, data models, and integration points for Purchase Request management. The implementation includes sophisticated data structures, workflow services, and comprehensive API endpoints.

### Current Implementation Status: ✅ **PRODUCTION-READY DATA MODELS**

**Source Files**:
- Core Types: `/lib/types.ts` (Comprehensive PR data models)
- Mock Data: `/mockPRListData.ts` (Production-ready data structures)
- Services: `/services/workflow-decision-engine.ts`, `/services/rbac-service.ts`

---

## 🎯 API Architecture Components

### 1. RESTful API Endpoints
- CRUD operations for Purchase Requests
- Workflow management endpoints
- File upload and attachment handling
- Reporting and analytics endpoints

### 2. Data Models & Schema
- Core Purchase Request entity
- Related entities (Items, Attachments, Comments)
- Workflow and approval tracking
- Audit trail and history

### 3. Service Layer
- Business logic services
- Workflow decision engine
- Permission and security services
- Integration services

### 4. Data Access Layer
- Database entity mappings
- Repository patterns
- Query optimization
- Caching strategies

---

## 🗄️ Core Data Models

### 1. Purchase Request Entity

```typescript
interface PurchaseRequest {
  // Core Identification
  id: string;                          // Unique identifier (UUID)
  refNumber: string;                   // Business reference (PR-YYYY-NNN)
  date: Date;                         // PR creation date
  type: PRType;                       // PR type classification
  
  // Description & Context
  description: string;                 // PR description (10-500 chars)
  location: string;                   // Location/site identifier
  department: string;                 // Department code
  jobCode?: string;                   // Optional job code reference
  
  // Requestor Information
  requestorId: string;                // User ID of requestor
  requestor: Requestor;               // Populated requestor details
  
  // Vendor Information
  vendor?: string;                    // Preferred vendor name
  vendorId?: number;                  // Vendor master data ID
  
  // Financial Information
  currency: CurrencyCode;             // Transaction currency
  baseCurrencyCode: CurrencyCode;     // System base currency (USD)
  exchangeRate?: number;              // Exchange rate if not base
  
  // Amount Fields (Original Currency)
  subTotalPrice: number;              // Sum of item totals
  discountAmount: number;             // Total discount amount
  taxAmount: number;                  // Total tax amount
  netAmount: number;                  // Net amount after discount
  totalAmount: number;                // Final total amount
  estimatedTotal: number;             // Estimated total (may differ from final)
  
  // Amount Fields (Base Currency)
  baseSubTotalPrice: number;          // Base currency subtotal
  baseDiscAmount: number;             // Base currency discount
  baseTaxAmount: number;              // Base currency tax
  baseNetAmount: number;              // Base currency net amount
  baseTotalAmount: number;            // Base currency total
  
  // Status & Workflow
  status: DocumentStatus;             // Document status
  workflowStatus: WorkflowStatus;     // Workflow approval status
  currentWorkflowStage: WorkflowStage; // Current workflow stage
  
  // Dates
  deliveryDate?: Date;                // Requested delivery date
  requiredDate?: Date;                // Required by date
  createdAt: Date;                    // System creation timestamp
  updatedAt: Date;                    // Last update timestamp
  
  // Related Data
  items: PurchaseRequestItem[];       // PR line items
  attachments: Attachment[];          // File attachments
  comments: Comment[];                // Comments and notes
  activityLog: ActivityLogEntry[];    // Activity history
  workflowHistory: WorkflowStep[];    // Workflow step history
  approvalHistory: ApprovalHistoryItem[]; // Approval decisions
  
  // System Fields
  createdBy: string;                  // User ID who created
  updatedBy?: string;                 // User ID who last updated
  version: number;                    // Optimistic concurrency control
  isDeleted: boolean;                 // Soft delete flag
}
```

### 2. Purchase Request Item Entity

```typescript
interface PurchaseRequestItem {
  // Core Identification
  id: string;                         // Unique item identifier
  prId: string;                      // Parent PR identifier
  lineNumber: number;                 // Line sequence number
  
  // Item Information
  itemId?: string;                   // Inventory item ID (if cataloged)
  itemCode?: string;                 // Item code from inventory
  description: string;               // Item description (required)
  specification?: string;            // Detailed specifications
  
  // Quantity & Measurement
  quantity: number;                  // Quantity requested
  unit: string;                      // Unit of measure
  unitPrice: number;                 // Price per unit
  totalPrice: number;                // Extended price (qty * unit price)
  
  // Currency Information
  currency: CurrencyCode;            // Item currency
  baseCurrency: CurrencyCode;        // System base currency
  exchangeRate?: number;             // Exchange rate for conversion
  baseTotalPrice: number;            // Total in base currency
  
  // Vendor Information
  preferredVendor?: string;          // Preferred vendor name
  vendorId?: number;                 // Vendor master data ID
  vendorItemCode?: string;           // Vendor's item code
  vendorPrice?: number;              // Vendor quoted price
  
  // Delivery Information
  deliveryDate?: Date;               // Item-specific delivery date
  leadTime?: number;                 // Lead time in days
  deliveryLocation?: string;         // Delivery location
  
  // Budget & Accounting
  budgetCode?: string;               // Budget/GL account code
  costCenter?: string;               // Cost center allocation
  projectCode?: string;              // Project code (if applicable)
  
  // Status & Workflow
  status: PurchaseRequestItemStatus; // Item approval status
  approvalComments?: string;         // Approver comments
  rejectionReason?: string;          // Reason for rejection
  
  // System Fields
  createdAt: Date;                   // Creation timestamp
  updatedAt: Date;                   // Last update timestamp
  createdBy: string;                 // Created by user ID
  updatedBy?: string;                // Updated by user ID
}

enum PurchaseRequestItemStatus {
  PENDING = "PENDING",               // Awaiting review
  APPROVED = "APPROVED",             // Approved for purchase
  REJECTED = "REJECTED",             // Rejected
  REVIEW = "REVIEW",                 // Requires review/clarification
  CANCELLED = "CANCELLED"            // Cancelled
}
```

### 3. Supporting Entities

**Requestor Information**:
```typescript
interface Requestor {
  id: string;                        // User unique identifier
  name: string;                      // Full name
  email?: string;                    // Email address
  department: string;                // Department name
  title?: string;                    // Job title
  phone?: string;                    // Phone number
  managerId?: string;                // Manager's user ID
}
```

**Comment Entity**:
```typescript
interface Comment {
  id: string;                        // Unique comment ID
  prId: string;                      // Related PR ID
  userId: string;                    // User who made comment
  userName: string;                  // User display name
  text: string;                      // Comment text
  content: string;                   // Rich content (may include formatting)
  timestamp: Date;                   // Comment timestamp
  isInternal: boolean;               // Internal vs external comment
  attachments?: Attachment[];        // Comment attachments
}
```

**Attachment Entity**:
```typescript
interface Attachment {
  id: string;                        // Unique attachment ID
  prId: string;                      // Related PR ID
  fileName: string;                  // Original file name
  displayName: string;               // Display name
  fileSize: number;                  // File size in bytes
  mimeType: string;                  // MIME type
  filePath: string;                  // Storage path/URL
  uploadedBy: string;                // User who uploaded
  uploadedAt: Date;                  // Upload timestamp
  category?: string;                 // Attachment category
  description?: string;              // Optional description
}
```

**Activity Log Entry**:
```typescript
interface ActivityLogEntry {
  id: string;                        // Unique log entry ID
  prId: string;                      // Related PR ID
  userId: string;                    // User who performed action
  userName: string;                  // User display name
  action: string;                    // Action performed
  description: string;               // Action description
  timestamp: Date;                   // Action timestamp
  oldValue?: any;                    // Previous value (for changes)
  newValue?: any;                    // New value (for changes)
  ipAddress?: string;                // User IP address
  userAgent?: string;                // User agent string
}
```

---

## 🔌 API Endpoints Specification

### 1. Purchase Request CRUD Operations

**GET /api/procurement/purchase-requests**
```typescript
// List Purchase Requests with filtering and pagination
GET /api/procurement/purchase-requests?
  page={number}&
  limit={number}&
  status={DocumentStatus}&
  department={string}&
  requestor={string}&
  dateFrom={date}&
  dateTo={date}&
  minAmount={number}&
  maxAmount={number}&
  search={string}

Response: {
  data: PurchaseRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: FilterMetadata;
}
```

**GET /api/procurement/purchase-requests/{id}**
```typescript
// Get single Purchase Request with full details
GET /api/procurement/purchase-requests/{id}

Response: {
  data: PurchaseRequest;
  permissions: UserPermissions;
  availableActions: string[];
}
```

**POST /api/procurement/purchase-requests**
```typescript
// Create new Purchase Request
POST /api/procurement/purchase-requests
Content-Type: application/json

Request Body: {
  type: PRType;
  description: string;
  department: string;
  location: string;
  deliveryDate?: Date;
  items: CreatePurchaseRequestItemInput[];
  attachments?: FileUpload[];
}

Response: {
  data: PurchaseRequest;
  message: string;
  refNumber: string;
}
```

**PUT /api/procurement/purchase-requests/{id}**
```typescript
// Update existing Purchase Request
PUT /api/procurement/purchase-requests/{id}
Content-Type: application/json

Request Body: {
  description?: string;
  deliveryDate?: Date;
  items?: UpdatePurchaseRequestItemInput[];
  version: number; // For optimistic concurrency
}

Response: {
  data: PurchaseRequest;
  message: string;
  version: number;
}
```

**DELETE /api/procurement/purchase-requests/{id}**
```typescript
// Soft delete Purchase Request (admin only)
DELETE /api/procurement/purchase-requests/{id}

Response: {
  message: string;
  deletedAt: Date;
}
```

### 2. Workflow Management Endpoints

**POST /api/procurement/purchase-requests/{id}/submit**
```typescript
// Submit PR for approval
POST /api/procurement/purchase-requests/{id}/submit

Request Body: {
  comments?: string;
}

Response: {
  data: PurchaseRequest;
  nextStage: WorkflowStage;
  assignedApprovers: User[];
  message: string;
}
```

**POST /api/procurement/purchase-requests/{id}/approve**
```typescript
// Approve PR at current stage
POST /api/procurement/purchase-requests/{id}/approve

Request Body: {
  comments?: string;
  itemApprovals?: ItemApprovalInput[];
}

Response: {
  data: PurchaseRequest;
  nextStage?: WorkflowStage;
  decision: WorkflowDecision;
  message: string;
}
```

**POST /api/procurement/purchase-requests/{id}/reject**
```typescript
// Reject PR at current stage
POST /api/procurement/purchase-requests/{id}/reject

Request Body: {
  reason: string; // Required for rejection
  comments?: string;
  rejectedItems?: string[]; // Item IDs to reject
}

Response: {
  data: PurchaseRequest;
  message: string;
}
```

**POST /api/procurement/purchase-requests/{id}/send-back**
```typescript
// Send PR back to previous stage
POST /api/procurement/purchase-requests/{id}/send-back

Request Body: {
  reason: string;
  targetStage: WorkflowStage;
  comments?: string;
}

Response: {
  data: PurchaseRequest;
  message: string;
}
```

### 3. Item Management Endpoints

**POST /api/procurement/purchase-requests/{id}/items**
```typescript
// Add item to PR
POST /api/procurement/purchase-requests/{id}/items

Request Body: {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  preferredVendor?: string;
  deliveryDate?: Date;
  budgetCode?: string;
}

Response: {
  data: PurchaseRequestItem;
  message: string;
}
```

**PUT /api/procurement/purchase-requests/{id}/items/{itemId}**
```typescript
// Update PR item
PUT /api/procurement/purchase-requests/{id}/items/{itemId}

Request Body: Partial<PurchaseRequestItem>

Response: {
  data: PurchaseRequestItem;
  message: string;
}
```

**DELETE /api/procurement/purchase-requests/{id}/items/{itemId}**
```typescript
// Remove item from PR
DELETE /api/procurement/purchase-requests/{id}/items/{itemId}

Response: {
  message: string;
}
```

### 4. File Attachment Endpoints

**POST /api/procurement/purchase-requests/{id}/attachments**
```typescript
// Upload attachment to PR
POST /api/procurement/purchase-requests/{id}/attachments
Content-Type: multipart/form-data

Request Body: {
  file: File;
  description?: string;
  category?: string;
}

Response: {
  data: Attachment;
  message: string;
}
```

**GET /api/procurement/purchase-requests/{id}/attachments/{attachmentId}**
```typescript
// Download attachment
GET /api/procurement/purchase-requests/{id}/attachments/{attachmentId}

Response: File stream with appropriate headers
```

**DELETE /api/procurement/purchase-requests/{id}/attachments/{attachmentId}**
```typescript
// Delete attachment
DELETE /api/procurement/purchase-requests/{id}/attachments/{attachmentId}

Response: {
  message: string;
}
```

### 5. Comment Management Endpoints

**POST /api/procurement/purchase-requests/{id}/comments**
```typescript
// Add comment to PR
POST /api/procurement/purchase-requests/{id}/comments

Request Body: {
  text: string;
  isInternal?: boolean;
}

Response: {
  data: Comment;
  message: string;
}
```

**GET /api/procurement/purchase-requests/{id}/comments**
```typescript
// Get PR comments
GET /api/procurement/purchase-requests/{id}/comments

Response: {
  data: Comment[];
  total: number;
}
```

---

## 🔄 Service Layer Specifications

### 1. Workflow Decision Engine Service

```typescript
class WorkflowDecisionEngine {
  /**
   * Analyze PR items and determine workflow decision
   */
  static analyzeWorkflowState(items: PurchaseRequestItem[]): WorkflowDecision;
  
  /**
   * Get summary count of items by status
   */
  static getItemsSummary(items: PurchaseRequestItem[]): ItemsSummary;
  
  /**
   * Determine next workflow stage based on current stage and PR properties
   */
  static getNextStage(
    currentStage: WorkflowStage, 
    pr: PurchaseRequest
  ): WorkflowStage | null;
  
  /**
   * Check if workflow decision can be submitted
   */
  static canSubmitDecision(
    decision: WorkflowDecision, 
    userPermissions: UserPermissions
  ): boolean;
}

interface WorkflowDecision {
  canSubmit: boolean;
  action: 'approve' | 'reject' | 'return' | 'blocked';
  buttonText: string;
  buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary';
  buttonColor?: string;
  reason: string;
  itemsSummary: ItemsSummary;
}
```

### 2. RBAC Service

```typescript
class PRRBACService {
  /**
   * Get role configuration for user
   */
  static getRoleConfiguration(userRole: string): RoleConfiguration;
  
  /**
   * Check if user can perform action on PR
   */
  static canPerformAction(
    user: User, 
    pr: PurchaseRequest, 
    action: WorkflowAction
  ): boolean;
  
  /**
   * Get user permissions for specific PR
   */
  static getPRPermissions(
    user: User, 
    pr: PurchaseRequest
  ): PurchaseRequestPermissions;
  
  /**
   * Filter PRs based on user visibility settings
   */
  static filterVisiblePRs(
    user: User, 
    prs: PurchaseRequest[]
  ): PurchaseRequest[];
}

interface PurchaseRequestPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canSendBack: boolean;
  canSubmit: boolean;
  availableActions: WorkflowAction[];
}
```

### 3. Validation Service

```typescript
class PRValidationService {
  /**
   * Validate complete PR before save/submit
   */
  static validatePurchaseRequest(pr: PurchaseRequest): ValidationResult;
  
  /**
   * Validate individual PR item
   */
  static validatePurchaseRequestItem(
    item: PurchaseRequestItem
  ): ValidationResult;
  
  /**
   * Validate workflow transition
   */
  static validateWorkflowTransition(
    fromStage: WorkflowStage,
    toStage: WorkflowStage,
    pr: PurchaseRequest
  ): ValidationResult;
  
  /**
   * Validate business rules
   */
  static validateBusinessRules(pr: PurchaseRequest): ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
}
```

---

## 💾 Database Schema Design

### 1. Core Tables

**purchase_requests**
```sql
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_number VARCHAR(20) NOT NULL UNIQUE,
    date DATE NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_code VARCHAR(50),
    
    requestor_id UUID NOT NULL,
    requestor_name VARCHAR(255) NOT NULL,
    
    vendor VARCHAR(255),
    vendor_id INTEGER,
    
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    base_currency_code CHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rate DECIMAL(10,6),
    
    sub_total_price DECIMAL(15,4) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    net_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    estimated_total DECIMAL(15,4) NOT NULL DEFAULT 0,
    
    base_sub_total_price DECIMAL(15,4) NOT NULL DEFAULT 0,
    base_disc_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    base_tax_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    base_net_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    base_total_amount DECIMAL(15,4) NOT NULL DEFAULT 0,
    
    status VARCHAR(50) NOT NULL,
    workflow_status VARCHAR(50) NOT NULL,
    current_workflow_stage VARCHAR(100) NOT NULL,
    
    delivery_date DATE,
    required_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_by UUID,
    version INTEGER NOT NULL DEFAULT 1,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_pr_requestor FOREIGN KEY (requestor_id) REFERENCES users(id),
    CONSTRAINT fk_pr_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    CONSTRAINT fk_pr_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_pr_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

**purchase_request_items**
```sql
CREATE TABLE purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL,
    line_number INTEGER NOT NULL,
    
    item_id UUID,
    item_code VARCHAR(50),
    description TEXT NOT NULL,
    specification TEXT,
    
    quantity DECIMAL(12,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(15,4) NOT NULL,
    total_price DECIMAL(15,4) NOT NULL,
    
    currency CHAR(3) NOT NULL,
    base_currency CHAR(3) NOT NULL,
    exchange_rate DECIMAL(10,6),
    base_total_price DECIMAL(15,4) NOT NULL,
    
    preferred_vendor VARCHAR(255),
    vendor_id INTEGER,
    vendor_item_code VARCHAR(100),
    vendor_price DECIMAL(15,4),
    
    delivery_date DATE,
    lead_time INTEGER,
    delivery_location VARCHAR(255),
    
    budget_code VARCHAR(50),
    cost_center VARCHAR(50),
    project_code VARCHAR(50),
    
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approval_comments TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_by UUID,
    
    CONSTRAINT fk_pri_pr FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_pri_item FOREIGN KEY (item_id) REFERENCES inventory_items(id),
    CONSTRAINT fk_pri_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    CONSTRAINT fk_pri_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_pri_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT unique_pr_line UNIQUE (pr_id, line_number)
);
```

### 2. Supporting Tables

**pr_comments**
```sql
CREATE TABLE pr_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    
    CONSTRAINT fk_comment_pr FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**pr_attachments**
```sql
CREATE TABLE pr_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50),
    description TEXT,
    
    CONSTRAINT fk_attachment_pr FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

**pr_activity_log**
```sql
CREATE TABLE pr_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    
    CONSTRAINT fk_activity_pr FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**pr_workflow_history**
```sql
CREATE TABLE pr_workflow_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pr_id UUID NOT NULL,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    step_name VARCHAR(100),
    assigned_user_id UUID,
    completed_by UUID,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    
    CONSTRAINT fk_workflow_pr FOREIGN KEY (pr_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
    CONSTRAINT fk_workflow_assigned FOREIGN KEY (assigned_user_id) REFERENCES users(id),
    CONSTRAINT fk_workflow_completed FOREIGN KEY (completed_by) REFERENCES users(id)
);
```

---

## 🔍 Query Optimization & Indexing

### 1. Essential Indexes

```sql
-- Performance indexes for common queries
CREATE INDEX idx_pr_ref_number ON purchase_requests(ref_number);
CREATE INDEX idx_pr_status ON purchase_requests(status);
CREATE INDEX idx_pr_workflow_status ON purchase_requests(workflow_status);
CREATE INDEX idx_pr_requestor ON purchase_requests(requestor_id);
CREATE INDEX idx_pr_department ON purchase_requests(department);
CREATE INDEX idx_pr_date ON purchase_requests(date);
CREATE INDEX idx_pr_created_at ON purchase_requests(created_at);

-- Composite indexes for complex queries
CREATE INDEX idx_pr_status_department ON purchase_requests(status, department);
CREATE INDEX idx_pr_workflow_requestor ON purchase_requests(workflow_status, requestor_id);
CREATE INDEX idx_pr_date_status ON purchase_requests(date, status);

-- Item table indexes
CREATE INDEX idx_pri_pr_id ON purchase_request_items(pr_id);
CREATE INDEX idx_pri_status ON purchase_request_items(status);
CREATE INDEX idx_pri_item_code ON purchase_request_items(item_code);

-- Activity log indexes
CREATE INDEX idx_activity_pr_id ON pr_activity_log(pr_id);
CREATE INDEX idx_activity_timestamp ON pr_activity_log(timestamp);
CREATE INDEX idx_activity_user ON pr_activity_log(user_id);
```

### 2. Optimized Queries

**PR List Query with Filtering**:
```sql
SELECT 
    pr.id, pr.ref_number, pr.date, pr.type, pr.description,
    pr.requestor_name, pr.department, pr.status, pr.workflow_status,
    pr.total_amount, pr.currency, pr.created_at
FROM purchase_requests pr
WHERE pr.is_deleted = FALSE
    AND ($1::TEXT IS NULL OR pr.department = $1)
    AND ($2::TEXT IS NULL OR pr.status = $2)
    AND ($3::DATE IS NULL OR pr.date >= $3)
    AND ($4::DATE IS NULL OR pr.date <= $4)
    AND ($5::TEXT IS NULL OR (
        pr.ref_number ILIKE '%' || $5 || '%' OR
        pr.description ILIKE '%' || $5 || '%' OR
        pr.requestor_name ILIKE '%' || $5 || '%'
    ))
ORDER BY pr.created_at DESC
LIMIT $6 OFFSET $7;
```

---

## 🛡️ Security Specifications

### 1. Authentication & Authorization

**API Authentication**:
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  department: string;
  location: string;
  exp: number;
  iat: number;
}
```

**Authorization Middleware**:
```typescript
const authorize = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    
    if (!decoded.permissions.includes(requiredPermission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    req.user = decoded;
    next();
  };
};
```

### 2. Data Protection

**Sensitive Data Handling**:
- Encrypt financial amounts in database
- Hash and salt user credentials
- Sanitize all user inputs
- Validate file uploads for malicious content
- Log all access to sensitive data

**SQL Injection Prevention**:
- Use parameterized queries exclusively
- Validate all input parameters
- Implement query result sanitization
- Use ORM with built-in protections

---

## 📊 Performance Specifications

### 1. Response Time Targets

**API Endpoint Performance SLAs**:
- GET /purchase-requests (list): < 500ms
- GET /purchase-requests/{id}: < 200ms
- POST /purchase-requests: < 1000ms
- PUT /purchase-requests/{id}: < 800ms
- Workflow actions: < 1000ms

### 2. Scalability Requirements

**Database Performance**:
- Support 10,000+ PRs per month
- Handle 100+ concurrent users
- Maintain <500ms query response time
- Support 1M+ audit log entries

**Caching Strategy**:
```typescript
// Redis caching for frequently accessed data
const cacheKey = `pr:${prId}`;
const cachedPR = await redis.get(cacheKey);

if (cachedPR) {
  return JSON.parse(cachedPR);
}

const pr = await db.getPurchaseRequest(prId);
await redis.setex(cacheKey, 300, JSON.stringify(pr)); // 5 min cache
return pr;
```

---

## 🔗 Integration Specifications

### 1. External System Integration

**Vendor Management System**:
```typescript
interface VendorIntegration {
  validateVendor(vendorId: number): Promise<VendorValidationResult>;
  getVendorDetails(vendorId: number): Promise<Vendor>;
  checkCreditLimit(vendorId: number, amount: number): Promise<boolean>;
}
```

**Inventory Management System**:
```typescript
interface InventoryIntegration {
  validateItem(itemCode: string): Promise<ItemValidationResult>;
  getItemDetails(itemCode: string): Promise<InventoryItem>;
  checkAvailability(itemCode: string, quantity: number): Promise<boolean>;
}
```

### 2. Event Publishing

**Workflow Events**:
```typescript
interface WorkflowEvent {
  eventType: 'PR_CREATED' | 'PR_APPROVED' | 'PR_REJECTED' | 'PR_SUBMITTED';
  prId: string;
  userId: string;
  timestamp: Date;
  data: any;
}

// Event publisher
const publishWorkflowEvent = async (event: WorkflowEvent) => {
  await eventBus.publish('procurement.workflow', event);
};
```

---

## ✅ Implementation Status Summary

### ✅ Production-Ready Components:
- **Data Models**: Complete TypeScript interfaces with comprehensive field definitions
- **Mock Data**: Production-ready data structures with realistic business data
- **Services**: Workflow decision engine and RBAC service implementation
- **Validation**: Business rules and validation logic implemented

### 🔄 Ready for Implementation:
- **RESTful APIs**: Complete endpoint specifications ready for development
- **Database Schema**: Optimized table structures with proper indexes
- **Security**: Authentication and authorization specifications
- **Performance**: Caching and optimization strategies defined
- **Integration**: External system integration points specified

### 📈 Business Value:
The backend specification provides a comprehensive, scalable foundation for Purchase Request management that supports complex workflows, multi-currency operations, and enterprise-grade security requirements.

---

*This comprehensive backend specification documents the complete API design, data models, and technical architecture required to implement a production-ready Purchase Request management system in Carmen ERP.*