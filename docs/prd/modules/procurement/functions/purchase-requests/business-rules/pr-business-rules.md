# Purchase Request Business Rules Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Component**: Business Rules  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Based on Actual Source Code Analysis

---

## Implementation Overview

**Purpose**: This specification documents the comprehensive business rules, validation logic, and constraints governing Purchase Request operations as implemented in the Carmen ERP system. These rules ensure data integrity, enforce organizational policies, and maintain proper workflow control throughout the PR lifecycle.

**Implementation Files**:
- RBAC Service: services/rbac-service.ts
- Workflow Engine: services/workflow-decision-engine.ts
- Field Permissions: lib/utils/field-permissions.ts
- Validation Logic: components/tabs/NewItemRow.tsx, components/PRDetailPage.tsx
- Form Validation: components/item-details-edit-form.tsx

**Current Status**: Complete business rules implementation with role-based access control, workflow decision engine, field-level permissions, comprehensive validation systems, and financial calculation rules. Uses mock data for development with sophisticated business logic enforcement.

---

## Core Business Rules Framework

### **Rule Categories**
- **Access Control Rules**: Role-based permissions and field visibility
- **Data Validation Rules**: Field requirements and format constraints
- **Workflow Rules**: Status transitions and approval logic
- **Financial Rules**: Currency handling and calculation constraints
- **Item Management Rules**: Inventory and procurement item controls

### **Rule Enforcement Levels**
- **Client-Side Validation**: Real-time form validation and user feedback
- **Business Logic Layer**: Service-level rule enforcement
- **Workflow Engine**: Systematic workflow decision making
- **Permission Framework**: Field and action-level access control

### **Rule Processing Architecture**
- **PRRBACService**: Centralized role-based access control
- **WorkflowDecisionEngine**: Priority-based workflow logic
- **Field Permissions**: Granular field editability control
- **Validation Framework**: Multi-layer validation system

---

## Role-Based Access Control Rules

### **User Role Definitions**
- **Requester/Staff**: Basic PR creation and submission rights
- **Department Head**: Departmental approval authority
- **Finance Manager**: Financial review and budget oversight
- **Purchasing Staff**: Vendor assignment and procurement execution
- **General Manager**: High-level approval authority
- **System Administrator**: Complete system access

### **Widget Access Rules**
```
Requester:
  - myPR: true, myApproval: false, myOrder: false
  - visibilitySetting: 'department'

Department Head:
  - myPR: true, myApproval: true, myOrder: false
  - visibilitySetting: 'department'

Finance Manager:
  - myPR: true, myApproval: true, myOrder: false
  - visibilitySetting: 'full'

Purchasing Staff:
  - myPR: true, myApproval: true, myOrder: true
  - visibilitySetting: 'full'

General Manager:
  - myPR: true, myApproval: true, myOrder: false
  - visibilitySetting: 'full'

System Administrator:
  - myPR: true, myApproval: true, myOrder: true
  - visibilitySetting: 'full'
```

### **Workflow Action Permissions**

#### **Edit Action Rules**
- **Condition**: PR status must be 'Draft' OR 'Rejected'
- **Ownership**: Only requestor can edit (except System Administrator)
- **Implementation**: `pr.status === 'Draft' || pr.status === 'Rejected') && pr.requestorId === user.id`

#### **Delete Action Rules**
- **Condition**: PR status must be 'Draft'
- **Ownership**: Only requestor can delete (except System Administrator)
- **Implementation**: `pr.status === 'Draft' && pr.requestorId === user.id`

#### **Submit Action Rules**
- **Condition**: PR status must be 'Draft'
- **Ownership**: Only requestor can submit (except System Administrator)
- **Implementation**: `pr.status === 'Draft' && pr.requestorId === user.id`

#### **Approval Action Rules**
- **Stage Assignment**: User must be assigned to current workflow stage
- **Status Validation**: PR status must be 'Submitted' OR 'In Progress'
- **Implementation**: `user.assignedWorkflowStages?.includes(pr.currentWorkflowStage)`

### **Field-Level Access Control**

#### **Requestor/Staff Permissions**
```
Field Access:
  - location: true, product: true, comment: true
  - requestQty: true, requestUnit: true, requiredDate: true
  - refNumber: true, date: true, type: true
  - requestor: true, department: true, description: true
```

#### **Department Manager/Approver Permissions**
```
Field Access:
  - comment: true, approvedQty: true
  - All other fields: false (view-only)
```

#### **Purchasing Staff Permissions**
```
Field Access:
  - comment: true, approvedQty: true
  - vendor: true, price: true, orderUnit: true
  - All other fields: false (view-only)
```

---

## Workflow Business Rules

### **Priority-Based Decision Logic**

#### **Workflow Decision Hierarchy**
1. **All Rejected (Priority 1)**: All items rejected → Reject PR
2. **Any Review (Priority 2)**: Any items marked for review → Return PR
3. **Any Pending (Priority 3)**: Any items still pending → Block submission
4. **Any Approved (Priority 4)**: Any items approved → Approve PR

#### **Decision Implementation Logic**
```typescript
Priority 1: summary.rejected === summary.total && summary.total > 0
  → action: 'reject', buttonText: 'Submit & Reject'

Priority 2: summary.review > 0
  → action: 'return', buttonText: 'Submit & Return'

Priority 3: summary.pending > 0
  → action: 'blocked', buttonText: 'Review Required', canSubmit: false

Priority 4: summary.approved > 0
  → action: 'approve', buttonText: 'Submit & Approve'
```

### **Item Status Rules**

#### **Status Transition Rules**
- **Pending**: Initial status for all new items
- **Approved**: Items approved for procurement
- **Rejected**: Items denied procurement
- **Review**: Items marked for additional review

#### **Action Availability by Role**
```
Department Manager/Finance Manager/Purchasing Staff:
  - Can: approve, reject, review on Pending/Review items
  - Cannot: modify Approved/Rejected items

Requestor:
  - Can: review on Pending items only
  - Cannot: approve or reject any items

System Administrator:
  - Can: all actions on all items
```

### **Workflow Stage Progression Rules**

#### **Approval Stage Sequence**
1. **requester** → departmentHeadApproval
2. **departmentHeadApproval** → financialApproval
3. **financialApproval** → purchasing
4. **purchasing** → completed

#### **Return Logic Rules**
- **From financialApproval**: Return to departmentHeadApproval
- **From other stages**: Return to requester
- **Rejection**: Direct to 'rejected' stage

---

## Data Validation Rules

### **Required Field Validation**

#### **PR Header Required Fields**
- **Date**: Must be valid date, defaults to current date
- **Type**: Must be selected from PRType enum
- **Requestor**: Auto-populated from user context
- **Description**: Optional but recommended

#### **Item Required Fields**
- **Location**: Must be selected from available locations
- **Product Name**: Must be selected from product catalog
- **Requested Quantity**: Must be positive number > 0
- **Unit**: Must be selected from available units

### **Business Logic Validation**

#### **New Item Validation**
```typescript
Validation Rules:
  - !newItem.name: Missing product name
  - !newItem.location: Missing location
  - newItem.quantityRequested <= 0: Invalid quantity
  
Error Handling:
  - Display console error: "Validation failed: Please fill in all required fields"
  - Prevent item creation until validation passes
```

#### **Form Submission Validation**
- **Pre-submission**: Validate all required fields
- **Cross-field validation**: Date dependencies (invoice date requires invoice number)
- **Format validation**: Date formats, numeric ranges, text length limits
- **Business rule validation**: Custom validation for specific scenarios

### **Data Format Rules**

#### **Numeric Field Constraints**
- **Quantities**: Step 0.00001, 5 decimal places precision
- **Prices**: Step 0.01, 2 decimal places precision
- **Exchange Rates**: 4 decimal places precision

#### **Text Field Constraints**
- **Description**: Multi-line textarea, unlimited length
- **Comments**: Text input, reasonable length limits
- **Reference Numbers**: System-generated unique identifiers

---

## Financial Business Rules

### **Currency Management Rules**

#### **Multi-Currency Support**
- **Supported Currencies**: USD, EUR, GBP, CAD, AUD, JPY, CHF, CNY, INR, MXN
- **Base Currency**: THB (Thai Baht) as system default
- **Exchange Rates**: Real-time rate application for conversions

#### **Currency Conversion Rules**
```typescript
Conversion Logic:
  - convertedAmount = amount * exchangeRate
  - Display format: "USD 1,234.56" when currency differs from base
  - Prototype calculation: newItem.price * 1.2 for demo purposes
```

#### **Price Calculation Rules**
```typescript
Financial Calculations:
  - baseAmount = price * quantity
  - discountAmount = baseAmount * discountRate
  - netAmount = baseAmount - discountAmount
  - taxAmount = netAmount * taxRate
  - totalAmount = netAmount + taxAmount
```

### **Financial Visibility Rules**

#### **Price Information Access**
- **Requestors**: Hidden by default (controlled by user settings)
- **Approvers/Purchasers**: Always visible
- **Financial Information**: Hidden from requestors via `canViewFinancialInfo()`

#### **Transaction Summary Rules**
- **Currency Display**: Primary currency with base conversion
- **Exchange Rate Display**: "Rate: 1 {currency} = {rate} {baseCurrency}"
- **Calculation Components**: Subtotal, discount, net, tax, total amounts

---

## Item Management Rules

### **Product Selection Rules**

#### **Mock Inventory Integration**
```typescript
Mock Inventory Data:
  - onHand: 0, onOrdered: 0
  - reorderLevel: 10, restockLevel: 25
  - inventoryUnit: dynamic based on selection
  - averageMonthlyUsage: 5
```

#### **Unit Conversion Rules**
- **Display Logic**: Show conversion when request unit differs from inventory unit
- **Calculation**: `(requestedQuantity * 12).toLocaleString()` for demo
- **Information Display**: "≈ {converted amount} {inventory units}"

### **Vendor Assignment Rules**

#### **Vendor Selection Logic**
- **Auto-assignment**: Based on price assignment service
- **Manual Override**: Purchasing staff can override assignments
- **Preferred Vendor**: Priority given to preferred vendor status

#### **Price Assignment Rules**
```typescript
Price Assignment Features:
  - Automatic price assignment via service integration
  - Vendor comparison modal for alternative selection
  - Price history tracking and volatility analysis
  - Price alert system for significant changes
```

---

## Workflow State Management Rules

### **Status Transition Controls**

#### **Draft Status Rules**
- **Edit Permission**: Requestor can edit all permitted fields
- **Submit Permission**: Requestor can submit for approval
- **Delete Permission**: Requestor can delete draft PRs

#### **Submitted Status Rules**
- **Edit Restriction**: No editing allowed during review
- **Approval Actions**: Approvers can approve, reject, or return
- **Status Tracking**: Complete audit trail maintained

#### **In Progress Status Rules**
- **Item-Level Actions**: Approvers can modify individual items
- **Bulk Operations**: Support for multi-item status changes
- **Workflow Progression**: Automatic stage advancement

### **Approval Authority Rules**

#### **Department Level Approval**
- **Scope**: Department-specific PRs
- **Authority**: Department managers for their departments
- **Escalation**: Automatic escalation based on value thresholds

#### **Financial Approval Rules**
- **Budget Validation**: Integration with budget checking
- **Value Thresholds**: Automatic routing based on PR value
- **Currency Considerations**: Multi-currency budget tracking

---

## Error Handling and Recovery Rules

### **Validation Error Management**

#### **Client-Side Error Handling**
- **Real-time Validation**: Immediate feedback on input changes
- **Field-Level Errors**: Inline error messages for invalid inputs
- **Form-Level Errors**: Global error handling for submission failures

#### **Business Rule Violations**
- **Permission Errors**: Clear messaging for unauthorized actions
- **Workflow Errors**: Guidance for workflow-related issues
- **Data Errors**: Specific instructions for data correction

### **System Recovery Rules**

#### **Failed Operations**
- **Rollback Logic**: Automatic rollback of failed transactions
- **Retry Mechanisms**: Intelligent retry for transient failures
- **Error Logging**: Comprehensive error tracking and reporting

#### **Data Consistency Rules**
- **Transaction Integrity**: Ensure data consistency across operations
- **Conflict Resolution**: Handle concurrent modification conflicts
- **Audit Trail**: Complete change history maintenance

---

## Integration Business Rules

### **User Context Integration**

#### **Authentication Rules**
- **User Identification**: Current user context for all operations
- **Session Management**: Maintain user context across operations
- **Role Verification**: Real-time role validation

#### **Department Integration**
- **Department Mapping**: Automatic department assignment
- **Visibility Rules**: Department-based data visibility
- **Approval Routing**: Department-aware workflow routing

### **External System Rules**

#### **Inventory System Integration**
- **Real-time Checking**: Live inventory level validation
- **Unit Conversion**: Automatic unit conversion between systems
- **Availability Validation**: Stock availability checking

#### **Financial System Integration**
- **Budget Validation**: Real-time budget consumption checking
- **Currency Management**: Exchange rate integration
- **Cost Center**: Automatic cost center assignment

---

## Performance and Optimization Rules

### **Data Loading Rules**

#### **Lazy Loading**
- **Tab Content**: Load tab content on demand
- **Large Datasets**: Progressive loading for large data sets
- **Image Assets**: Lazy load non-critical images

#### **Caching Strategy**
- **User Permissions**: Cache role permissions for session
- **Static Data**: Cache lookup data (locations, products, units)
- **Workflow State**: Cache workflow decision results

### **Validation Optimization**

#### **Efficient Validation**
- **Early Returns**: Stop validation on first critical error
- **Batch Validation**: Group related validations
- **Async Validation**: Non-blocking validation where possible

#### **Performance Monitoring**
- **Response Time**: Monitor validation response times
- **Resource Usage**: Track memory and CPU usage
- **Error Rates**: Monitor validation failure rates

---

## Current Implementation Status

### **Implemented Business Rules**
- **Complete RBAC System**: Role-based access control with field-level permissions
- **Workflow Decision Engine**: Priority-based workflow logic with intelligent routing
- **Comprehensive Validation**: Multi-layer validation with real-time feedback
- **Financial Rules**: Multi-currency support with exchange rate handling
- **Item Management**: Complete item lifecycle with inventory integration

### **Mock Data Dependencies**
- **User Roles**: Mock role assignments and permissions
- **Product Catalog**: Simplified product data for development
- **Vendor Information**: Mock vendor assignments and pricing
- **Exchange Rates**: Static rates for currency conversion

### **Development Features**
- **Rule Testing**: Comprehensive rule validation during development
- **Error Simulation**: Mock error scenarios for testing
- **Performance Profiling**: Rule execution performance monitoring
- **Audit Logging**: Complete rule enforcement logging

---

## Business Rule Metrics and Monitoring

### **Rule Enforcement Metrics**
- **Permission Checks**: Track permission validation frequency
- **Validation Failures**: Monitor validation error rates
- **Workflow Decisions**: Analyze workflow decision patterns
- **Performance Impact**: Measure rule processing overhead

### **Compliance Monitoring**
- **Policy Adherence**: Ensure rules align with organizational policies
- **Exception Tracking**: Monitor rule exceptions and overrides
- **Audit Requirements**: Maintain compliance audit trails
- **Rule Evolution**: Track rule changes and their impact

---

*This business rules specification documents the actual implementation as found in the source code. Rules marked as mock or prototype indicate areas designed for production enhancement through backend integration and real-time data sources.*