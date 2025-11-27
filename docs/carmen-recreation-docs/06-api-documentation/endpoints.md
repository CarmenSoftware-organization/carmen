# API & Backend Services Documentation

**Document Type**: Backend Architecture Specification  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Purpose**: Complete backend implementation guide for Carmen ERP

---

## 🏗️ Backend Architecture Overview

Carmen ERP utilizes **Next.js 14 Server Actions** instead of traditional REST API endpoints. This modern approach provides type safety, better performance, and simplified data flow patterns.

### Architecture Pattern
```
Frontend Component → Server Action → Business Logic → Data Layer → Response
     ↓                    ↓              ↓              ↓           ↓
React Hook Form → createPurchaseRequest() → Validation → Mock Data → Success
```

### Key Benefits
- **Type Safety**: Full TypeScript integration from frontend to backend
- **Performance**: Optimized data fetching and caching
- **Simplified State**: No REST endpoint management needed
- **Modern Pattern**: Next.js 14 App Router best practices

---

## 📡 Server Actions Architecture

### Action Organization Pattern
```typescript
// Module-based server actions structure
app/(main)/[module]/actions.ts

// Example: Procurement actions
app/(main)/procurement/purchase-requests/actions.ts
app/(main)/procurement/purchase-orders/actions.ts
app/(main)/procurement/goods-received-note/actions.ts
```

### Standard Action Patterns
```typescript
// CRUD operations pattern
async function create[Entity](data: Create[Entity]Data): Promise<[Entity]>
async function get[Entity](id: string): Promise<[Entity] | null>
async function update[Entity](id: string, data: Update[Entity]Data): Promise<[Entity]>
async function delete[Entity](id: string): Promise<void>
async function list[Entities](filters?: [Entity]Filters): Promise<[Entity][]>

// Business logic actions
async function approve[Entity](id: string, approval: ApprovalData): Promise<void>
async function convert[Entity]To[Entity](id: string, data: ConversionData): Promise<[NewEntity]>
async function process[Workflow](id: string, data: WorkflowData): Promise<void>
```

---

## 📋 Procurement Module API

### Purchase Request Actions
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { PurchaseRequest, CreatePRData, UpdatePRData, ApprovalData } from '@/lib/types'

/**
 * Create a new purchase request
 */
export async function createPurchaseRequest(data: CreatePRData): Promise<PurchaseRequest> {
  // Validation
  const validatedData = validatePurchaseRequestData(data);
  
  // Generate PR number
  const prNumber = await generatePRNumber();
  
  // Create PR
  const purchaseRequest: PurchaseRequest = {
    id: generateId(),
    number: prNumber,
    ...validatedData,
    status: 'draft',
    approvals: [],
    totalAmount: calculateTotalAmount(validatedData.items),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: getCurrentUser().id
  };
  
  // Determine approval routing
  purchaseRequest.approvals = determineApprovalRoute(purchaseRequest);
  
  // Save to data layer
  await savePurchaseRequest(purchaseRequest);
  
  // Revalidate cache
  revalidatePath('/procurement/purchase-requests');
  
  return purchaseRequest;
}

/**
 * Get purchase requests with filtering
 */
export async function getPurchaseRequests(filters?: PRFilters): Promise<PurchaseRequest[]> {
  const user = getCurrentUser();
  
  // Apply role-based filtering
  let query = buildPRQuery(filters);
  query = applyRoleBasedFilter(query, user);
  
  const purchaseRequests = await queryPurchaseRequests(query);
  
  // Apply additional security filtering
  return purchaseRequests.filter(pr => canUserViewPR(user, pr));
}

/**
 * Approve a purchase request
 */
export async function approvePurchaseRequest(
  id: string, 
  approval: ApprovalData
): Promise<void> {
  const user = getCurrentUser();
  const pr = await getPurchaseRequest(id);
  
  if (!pr) {
    throw new Error('Purchase request not found');
  }
  
  // Check approval permissions
  if (!canUserApprovePR(user, pr)) {
    throw new Error('Insufficient permissions to approve this request');
  }
  
  // Add approval
  const approvalStep: ApprovalStep = {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    role: user.context.currentRole.name,
    action: approval.action, // 'approve' | 'reject' | 'request_changes'
    comments: approval.comments,
    timestamp: new Date().toISOString()
  };
  
  pr.approvals.push(approvalStep);
  
  // Update status based on approval workflow
  pr.status = calculateNewStatus(pr);
  pr.updatedAt = new Date().toISOString();
  
  // Save changes
  await savePurchaseRequest(pr);
  
  // Send notifications
  await sendApprovalNotification(pr, approvalStep);
  
  // Revalidate
  revalidatePath('/procurement/purchase-requests');
  revalidatePath('/procurement/my-approvals');
}

/**
 * Convert PR to PO
 */
export async function convertPRToPO(
  prId: string, 
  vendorId: string
): Promise<PurchaseOrder> {
  const pr = await getPurchaseRequest(prId);
  if (!pr || pr.status !== 'approved') {
    throw new Error('Purchase request must be approved before conversion');
  }
  
  const vendor = await getVendor(vendorId);
  if (!vendor) {
    throw new Error('Vendor not found');
  }
  
  const po: PurchaseOrder = {
    id: generateId(),
    number: await generatePONumber(),
    vendorId: vendor.id,
    vendorName: vendor.name,
    status: 'draft',
    orderDate: new Date().toISOString(),
    items: pr.items.map(convertPRItemToPOItem),
    totalAmount: pr.totalAmount,
    terms: vendor.paymentTerms || 'Net 30',
    createdFrom: pr.id,
    approvals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save PO
  await savePurchaseOrder(po);
  
  // Update PR status
  pr.status = 'converted';
  pr.updatedAt = new Date().toISOString();
  await savePurchaseRequest(pr);
  
  revalidatePath('/procurement/purchase-orders');
  revalidatePath('/procurement/purchase-requests');
  
  return po;
}
```

### Purchase Order Actions
```typescript
/**
 * Create purchase order
 */
export async function createPurchaseOrder(data: CreatePOData): Promise<PurchaseOrder> {
  const validatedData = validatePurchaseOrderData(data);
  
  const purchaseOrder: PurchaseOrder = {
    id: generateId(),
    number: await generatePONumber(),
    ...validatedData,
    status: 'draft',
    orderDate: new Date().toISOString(),
    totalAmount: calculateTotalAmount(validatedData.items),
    approvals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await savePurchaseOrder(purchaseOrder);
  revalidatePath('/procurement/purchase-orders');
  
  return purchaseOrder;
}

/**
 * Send PO to vendor
 */
export async function sendPOToVendor(id: string): Promise<void> {
  const po = await getPurchaseOrder(id);
  if (!po) throw new Error('Purchase order not found');
  
  // Generate PDF
  const pdfBuffer = await generatePOPDF(po);
  
  // Send email to vendor
  await sendVendorEmail({
    to: po.vendor.email,
    subject: `Purchase Order ${po.number}`,
    template: 'purchase-order',
    attachments: [{ filename: `PO-${po.number}.pdf`, content: pdfBuffer }]
  });
  
  // Update status
  po.status = 'sent';
  po.sentDate = new Date().toISOString();
  await savePurchaseOrder(po);
  
  revalidatePath('/procurement/purchase-orders');
}
```

---

## 📦 Inventory Management API

### Inventory Actions
```typescript
/**
 * Get stock overview with filtering
 */
export async function getStockOverview(filters?: StockFilters): Promise<InventoryItem[]> {
  const user = getCurrentUser();
  let query = buildStockQuery(filters);
  
  // Apply location-based filtering
  if (user.context.currentLocation) {
    query = query.where('location', user.context.currentLocation.id);
  }
  
  const items = await queryInventoryItems(query);
  
  // Calculate additional metrics
  return items.map(item => ({
    ...item,
    daysOfStock: calculateDaysOfStock(item),
    reorderSuggestion: shouldReorder(item),
    movementTrend: calculateMovementTrend(item)
  }));
}

/**
 * Create physical count
 */
export async function createPhysicalCount(data: CreateCountData): Promise<PhysicalCount> {
  const count: PhysicalCount = {
    id: generateId(),
    name: data.name,
    location: data.location,
    status: 'planning',
    countDate: data.countDate,
    items: data.itemIds.map(itemId => ({
      itemId,
      expectedQty: getCurrentStock(itemId),
      countedQty: null,
      variance: null,
      notes: null
    })),
    createdBy: getCurrentUser().id,
    createdAt: new Date().toISOString()
  };
  
  await savePhysicalCount(count);
  revalidatePath('/inventory-management/physical-count');
  
  return count;
}

/**
 * Process stock movement
 */
export async function processStockMovement(data: StockMovementData): Promise<StockMovement> {
  const movement: StockMovement = {
    id: generateId(),
    itemId: data.itemId,
    type: data.type,
    quantity: data.quantity,
    reference: data.reference,
    reason: data.reason,
    timestamp: new Date().toISOString(),
    userId: getCurrentUser().id
  };
  
  // Update stock levels
  await updateStockLevels(movement);
  
  // Save movement record
  await saveStockMovement(movement);
  
  revalidatePath('/inventory-management/stock-overview');
  
  return movement;
}
```

---

## 🤝 Vendor Management API

### Vendor Actions
```typescript
/**
 * Create new vendor
 */
export async function createVendor(data: CreateVendorData): Promise<Vendor> {
  const validatedData = validateVendorData(data);
  
  const vendor: Vendor = {
    id: generateId(),
    code: await generateVendorCode(),
    ...validatedData,
    status: 'active',
    rating: null,
    totalOrders: 0,
    lastOrderDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  await saveVendor(vendor);
  revalidatePath('/vendor-management/vendors');
  
  return vendor;
}

/**
 * Update vendor performance metrics
 */
export async function updateVendorPerformance(
  vendorId: string, 
  metrics: VendorPerformanceData
): Promise<void> {
  const vendor = await getVendor(vendorId);
  if (!vendor) throw new Error('Vendor not found');
  
  // Update performance metrics
  vendor.rating = calculateVendorRating(metrics);
  vendor.qualityScore = metrics.qualityScore;
  vendor.deliveryScore = metrics.deliveryScore;
  vendor.serviceScore = metrics.serviceScore;
  vendor.lastEvaluationDate = new Date().toISOString();
  vendor.updatedAt = new Date().toISOString();
  
  await saveVendor(vendor);
  revalidatePath('/vendor-management/vendors');
}
```

---

## 👥 User Management API

### Authentication & Authorization Actions
```typescript
/**
 * Authenticate user
 */
export async function authenticateUser(credentials: LoginCredentials): Promise<User> {
  const user = await validateCredentials(credentials);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Create session
  await createUserSession(user);
  
  return user;
}

/**
 * Switch user context (role/department/location)
 */
export async function switchUserContext(context: Partial<UserContext>): Promise<UserContext> {
  const user = getCurrentUser();
  
  // Validate context changes
  if (context.currentRole && !user.availableRoles.some(role => role.id === context.currentRole.id)) {
    throw new Error('Invalid role selection');
  }
  
  // Update user context
  const newContext = { ...user.context, ...context };
  await updateUserContext(user.id, newContext);
  
  // Revalidate all pages that depend on user context
  revalidatePath('/', 'layout');
  
  return newContext;
}
```

---

## 🔧 Utility Functions & Middleware

### Data Validation
```typescript
/**
 * Validate purchase request data
 */
function validatePurchaseRequestData(data: CreatePRData): CreatePRData {
  const schema = z.object({
    description: z.string().min(10, "Description must be at least 10 characters"),
    department: z.string().min(1, "Department is required"),
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
    requiredDate: z.string().refine(date => new Date(date) > new Date(), {
      message: "Required date must be in the future"
    }),
    items: z.array(z.object({
      description: z.string().min(5),
      quantity: z.number().min(0.01),
      unitOfMeasure: z.string().min(1),
      estimatedPrice: z.object({
        amount: z.number().min(0),
        currency: z.string()
      }).optional()
    })).min(1, "At least one item is required")
  });
  
  return schema.parse(data);
}
```

### Business Logic Helpers
```typescript
/**
 * Calculate total amount from items
 */
function calculateTotalAmount(items: PurchaseRequestItem[]): Money {
  const total = items.reduce((sum, item) => {
    const itemTotal = item.totalPrice?.amount || 0;
    return sum + itemTotal;
  }, 0);
  
  return {
    amount: total,
    currency: 'USD' // Default currency - should be configurable
  };
}

/**
 * Determine approval routing based on business rules
 */
function determineApprovalRoute(pr: PurchaseRequest): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  const totalAmount = pr.totalAmount.amount;
  
  // Department manager approval for all PRs
  if (pr.requestor !== getDepartmentManager(pr.department)) {
    steps.push({
      role: 'department-manager',
      department: pr.department,
      required: true,
      order: 1,
      status: 'pending'
    });
  }
  
  // Financial approval for amounts > $1000
  if (totalAmount > 1000) {
    steps.push({
      role: 'financial-manager',
      required: true,
      order: steps.length + 1,
      status: 'pending'
    });
  }
  
  // Purchasing approval for all PRs
  steps.push({
    role: 'purchasing-staff',
    required: true,
    order: steps.length + 1,
    status: 'pending'
  });
  
  return steps;
}
```

### Permission & Security
```typescript
/**
 * Check if user can view purchase request
 */
function canUserViewPR(user: User, pr: PurchaseRequest): boolean {
  const role = user.context.currentRole.name;
  
  switch (role) {
    case 'staff':
      return pr.requestor === user.id || pr.department === user.context.currentDepartment.id;
    
    case 'department-manager':
      return pr.department === user.context.currentDepartment.id;
    
    case 'financial-manager':
    case 'purchasing-staff':
      return true; // Can view all PRs
    
    case 'counter':
      return pr.items.some(item => item.category === 'inventory');
    
    case 'chef':
      return pr.items.some(item => item.category === 'ingredients' || item.category === 'kitchen-supplies');
    
    default:
      return false;
  }
}

/**
 * Check if user can approve purchase request
 */
function canUserApprovePR(user: User, pr: PurchaseRequest): boolean {
  const role = user.context.currentRole.name;
  const pendingApproval = pr.approvals.find(a => a.status === 'pending');
  
  if (!pendingApproval) return false;
  
  // Check if user has the required role for current approval step
  if (pendingApproval.role !== role) return false;
  
  // Additional checks based on role
  switch (role) {
    case 'department-manager':
      return pr.department === user.context.currentDepartment.id;
    
    case 'financial-manager':
    case 'purchasing-staff':
      return true;
    
    default:
      return false;
  }
}
```

---

## 📨 Notification System

### Email Notifications
```typescript
/**
 * Send approval notification
 */
async function sendApprovalNotification(pr: PurchaseRequest, approval: ApprovalStep): Promise<void> {
  // Find next approver
  const nextApproval = pr.approvals.find(a => a.status === 'pending');
  
  if (nextApproval) {
    const approvers = await getUsersByRole(nextApproval.role, nextApproval.department);
    
    for (const approver of approvers) {
      await sendEmail({
        to: approver.email,
        subject: `Purchase Request Approval Required: ${pr.number}`,
        template: 'pr-approval-required',
        data: {
          purchaseRequest: pr,
          approver: approver,
          approvalUrl: `${getBaseUrl()}/procurement/purchase-requests/${pr.id}`
        }
      });
    }
  } else if (pr.status === 'approved') {
    // Notify requestor of final approval
    const requestor = await getUser(pr.requestor);
    await sendEmail({
      to: requestor.email,
      subject: `Purchase Request Approved: ${pr.number}`,
      template: 'pr-approved',
      data: { purchaseRequest: pr }
    });
  }
}
```

---

## 📊 Data Layer Integration

### Mock Data Integration
```typescript
/**
 * Data layer abstraction for development
 */
class DataLayer {
  // In production, this would connect to actual database
  // For development, uses mock data with persistence simulation
  
  async savePurchaseRequest(pr: PurchaseRequest): Promise<void> {
    const existingPRs = await this.getAllPurchaseRequests();
    const index = existingPRs.findIndex(existing => existing.id === pr.id);
    
    if (index >= 0) {
      existingPRs[index] = pr;
    } else {
      existingPRs.push(pr);
    }
    
    await this.persistMockData('purchase-requests', existingPRs);
  }
  
  async queryPurchaseRequests(query: PRQuery): Promise<PurchaseRequest[]> {
    const allPRs = await this.getAllPurchaseRequests();
    return this.applyQuery(allPRs, query);
  }
  
  private async persistMockData(key: string, data: any): Promise<void> {
    // In development: persist to localStorage or file system
    // In production: use actual database operations
    if (typeof window !== 'undefined') {
      localStorage.setItem(`carmen-erp-${key}`, JSON.stringify(data));
    }
  }
}
```

---

## ✅ API Implementation Checklist

### Server Actions (Required)
- [ ] Procurement actions (PR, PO, GRN)
- [ ] Inventory management actions
- [ ] Vendor management actions  
- [ ] User management and authentication
- [ ] Product catalog actions
- [ ] Recipe management actions
- [ ] Financial operations actions

### Business Logic (Required)
- [ ] Approval workflow routing
- [ ] Permission checking functions
- [ ] Data validation schemas
- [ ] Document number generation
- [ ] Status calculation logic
- [ ] Price calculation functions

### Integration Systems (Required)
- [ ] Email notification system
- [ ] PDF generation services
- [ ] Data persistence layer
- [ ] File upload handling
- [ ] Search and filtering utilities
- [ ] Audit logging system

### Security & Validation (Required)
- [ ] Role-based access control
- [ ] Data validation with Zod schemas
- [ ] Input sanitization
- [ ] Permission middleware
- [ ] Session management
- [ ] CSRF protection

---

**Next Steps**: Implement [Frontend Integration Guide](../07-frontend-guide/implementation.md) to connect components with these server actions.

*This API documentation provides complete backend implementation guidance using Next.js 14 Server Actions pattern for Carmen ERP.*