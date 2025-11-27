# Purchase Request Item Actions: RBAC Fixes

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document summarizes the fixes made to correct the item action labels and RBAC inconsistencies in the Purchase Request details.

## 🚨 **Issues Identified**

### **1. Incorrect Item Action Labels**
- **Found**: "Approved", "Accept", "Review"
- **Should be**: "Approve", "Reject", "Review"

### **2. Status Inconsistencies**
- **Mixed Status Terms**: "Accepted" vs "Approved"
- **RBAC Mismatch**: Documentation showed "Accepted" status that wasn't properly implemented

### **3. RBAC Logic Issues**
- **Purchasing Staff** permissions referenced non-existent "Accepted" status
- **Inconsistent status handling** across components

## ✅ **Fixes Applied**

### **1. Enhanced Order Card Component** (`enhanced-order-card.tsx`)

#### **Fixed Action Labels**
```typescript
// BEFORE: Mixed and incorrect labels
{ action: "approve", label: "Approved", ... }  // Wrong label

// AFTER: Correct action labels
{ action: "approve", label: "Approve", icon: CheckCircle, variant: "default" }
{ action: "reject", label: "Reject", icon: XCircle, variant: "destructive" }
{ action: "review", label: "Review", icon: RotateCcw, variant: "outline" }
```

#### **Fixed Status Handling**
```typescript
// BEFORE: Inconsistent status
const updatedOrder = { ...editedOrder, status: "Accepted" as const }

// AFTER: Standardized status
const updatedOrder = { ...editedOrder, status: "Approved" as const }
```

#### **Fixed Status Configuration**
```typescript
// BEFORE: Mixed status terms
Accepted: {
  color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // ...
}

// AFTER: Consistent status terms
Approved: {
  color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  // ...
}
```

#### **Fixed RBAC Logic**
```typescript
// BEFORE: Referenced non-existent "Accepted" status
if (roleName === "Purchasing Staff") {
  if (status === "approved" || status === "Accepted" || status === "Review") {
    // ...
  }
}

// AFTER: Correct status references
if (roleName === "Purchasing Staff") {
  if (status === "Approved" || status === "Review") {
    // ...
  }
}
```

#### **Fixed Field Editing Permissions**
```typescript
// BEFORE: Case inconsistency
if (roleName === "Purchasing Staff" && (status === "approved" || status === "Review")) {

// AFTER: Consistent casing
if (roleName === "Purchasing Staff" && (status === "Approved" || status === "Review")) {
```

### **2. Items Tab Component** (`ItemsTab.tsx`)

#### **Fixed Bulk Action Types**
```typescript
// BEFORE: Incorrect status type
function handleBulkAction(action: "Accepted" | "Rejected" | "Review") {

// AFTER: Correct status type
function handleBulkAction(action: "Approved" | "Rejected" | "Review") {
```

### **3. RBAC Documentation** (`pr-rbac.md`)

#### **Fixed Item-Level Action Permissions**
```markdown
<!-- BEFORE: Inconsistent status references -->
| Approve | Purchasing Staff | `Approved`, `Accepted`, `Review` | Yes |
| Reject | Purchasing Staff | `Approved`, `Accepted`, `Review` | Yes |
| Review | Purchasing Staff | `Approved`, `Accepted`, `Review` | Yes |

<!-- AFTER: Consistent status references -->
| Approve | Purchasing Staff | `Approved`, `Review` | Yes |
| Reject | Purchasing Staff | `Approved`, `Review` | Yes |
| Review | Purchasing Staff | `Approved`, `Review` | Yes |
```

### **4. Business Logic Documentation** (`pr-business-logic.md`)

#### **Fixed Item-Level Workflow**
```markdown
<!-- BEFORE: Referenced non-existent status -->
* **Purchasing Staff**:
  * Can **Approve**, **Reject**, or set to **Review** any item with a status of `Approved`, `Accepted`, or `Review`.

<!-- AFTER: Correct status references -->
* **Purchasing Staff**:
  * Can **Approve**, **Reject**, or set to **Review** any item with a status of `Approved` or `Review`.
```

## 🎯 **Corrected Item Action Flow**

### **Department Manager Actions**
- **Available on**: Items with status `Pending` or `Review`
- **Actions**: 
  - ✅ **Approve** → Changes status to `Approved`
  - ✅ **Reject** → Changes status to `Rejected`
  - ✅ **Review** → Changes status to `Review`

### **Purchasing Staff Actions**
- **Available on**: Items with status `Approved` or `Review`
- **Actions**: 
  - ✅ **Approve** → Changes status to `Approved` (final approval)
  - ✅ **Reject** → Changes status to `Rejected`
  - ✅ **Review** → Changes status to `Review`

### **Requester Actions**
- **Available on**: Items with status `Pending`
- **Actions**: 
  - ✅ **Review** → Changes status to `Review`

## 📊 **Status Flow Diagram**

```
Pending → [Department Manager] → Approved → [Purchasing Staff] → Final Approved
   ↓                              ↓                            ↓
Review ← [Any Role] ←------------- Review ← [Any Role] ←------- Review
   ↓                              ↓                            ↓
Rejected ← [Department Manager] ← Rejected ← [Purchasing Staff] ← Rejected
```

## 🔧 **Implementation Impact**

### **User Interface**
- ✅ Correct action button labels displayed
- ✅ Consistent status badges
- ✅ Proper action availability based on role and status

### **Business Logic**
- ✅ Consistent status transitions
- ✅ Proper RBAC enforcement
- ✅ Standardized status terminology

### **Data Integrity**
- ✅ No more "Accepted" status confusion
- ✅ Consistent status values across system
- ✅ Proper workflow progression

## 🚀 **Verification Steps**

1. **Test Item Actions**: Verify correct labels show for each role
2. **Test Status Transitions**: Ensure statuses change correctly
3. **Test RBAC**: Verify actions are available only to authorized roles
4. **Test Bulk Actions**: Ensure bulk operations use correct status values
5. **Test Documentation**: Verify all docs reflect actual implementation

## 📝 **Files Modified**

1. `app/(main)/procurement/purchase-requests/components/tabs/enhanced-order-card.tsx`
2. `app/(main)/procurement/purchase-requests/components/tabs/ItemsTab.tsx`
3. `docs/pages/pr/pr-rbac.md`
4. `docs/pages/pr/pr-business-logic.md`

All item actions now correctly display **"Approve", "Reject", "Review"** with proper RBAC enforcement and consistent status handling throughout the system.