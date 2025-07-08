# Purchase Order Module: RBAC (Role-Based Access Control) Documentation

## 1. Overview

This document defines the comprehensive Role-Based Access Control (RBAC) implementation for the Purchase Order module, including role definitions, permission matrices, field-level security, and dynamic access control rules.

## 2. Role Definitions

### 2.1 Core Roles

#### 2.1.1 Procurement Officer
**Primary Responsibilities**: Day-to-day procurement operations, PO creation and management

**Scope**: 
- Own department's procurement activities
- PRs assigned for processing
- Vendors within authorization level

**Key Characteristics**:
- Operational-level procurement tasks
- Limited approval authority
- Focus on order processing and vendor coordination

#### 2.1.2 Procurement Manager
**Primary Responsibilities**: Oversight of procurement operations, high-value approvals

**Scope**:
- Cross-departmental procurement oversight
- All procurement officers' activities
- Strategic vendor relationships

**Key Characteristics**:
- Managerial-level oversight
- Higher approval limits
- Exception handling authority

#### 2.1.3 Department Head
**Primary Responsibilities**: Department budget oversight, departmental procurement approval

**Scope**:
- Own department's procurement requests
- Department budget compliance
- Team member procurement activities

**Key Characteristics**:
- Department-focused authority
- Budget responsibility
- First-level approval for department requests

#### 2.1.4 Finance Officer
**Primary Responsibilities**: Financial compliance, budget validation, payment processing

**Scope**:
- Financial aspects of all POs
- Budget compliance verification
- Payment term negotiations

**Key Characteristics**:
- Financial oversight focus
- Cross-departmental visibility
- Budget and compliance authority

#### 2.1.5 Finance Manager
**Primary Responsibilities**: Financial oversight, budget management, financial approvals

**Scope**:
- Enterprise-wide financial oversight
- Budget allocation management
- High-value financial approvals

**Key Characteristics**:
- Strategic financial oversight
- Budget authority
- Enterprise-wide financial visibility

#### 2.1.6 Inventory Manager
**Primary Responsibilities**: Inventory oversight, goods receipt, stock management

**Scope**:
- Inventory-affecting POs
- Goods receipt processes
- Stock level management

**Key Characteristics**:
- Inventory-focused operations
- Receipt and closure authority
- Stock optimization responsibility

#### 2.1.7 System Administrator
**Primary Responsibilities**: System configuration, user management, system maintenance

**Scope**:
- System-wide configuration
- All user activities (read-only for business operations)
- System maintenance and troubleshooting

**Key Characteristics**:
- Technical system access
- User management authority
- System configuration control

## 3. Permission Matrix

### 3.1 Core Permissions Matrix

| Action/Permission | Proc Officer | Proc Manager | Dept Head | Finance Officer | Finance Manager | Inventory Manager | System Admin |
|-------------------|--------------|--------------|-----------|-----------------|-----------------|-------------------|--------------|
| **View PO List** | ✓ (Filtered) | ✓ (All) | ✓ (Dept) | ✓ (All) | ✓ (All) | ✓ (Inventory) | ✓ (All) |
| **View PO Details** | ✓ (Own/Assigned) | ✓ (All) | ✓ (Dept) | ✓ (All) | ✓ (All) | ✓ (Inventory) | ✓ (All) |
| **Create Blank PO** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Create from PRs** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Edit Draft PO** | ✓ (Own) | ✓ (All) | ✓ (Dept) | ✗ | ✗ | ✗ | ✗ |
| **Edit Sent PO** | ✗ | ✓ (Limited) | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Edit Financial Fields** | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ | ✗ |
| **Send PO** | ✓ (Own) | ✓ (All) | ✓ (Dept) | ✗ | ✗ | ✗ | ✗ |
| **Approve PO** | ✗ | ✓ | ✓ (Dept) | ✓ | ✓ | ✗ | ✗ |
| **Void PO** | ✗ | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| **Delete Draft PO** | ✓ (Own) | ✓ (All) | ✓ (Dept) | ✗ | ✗ | ✗ | ✓ |
| **Receive Goods** | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| **Close PO** | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ | ✗ |
| **Export Data** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Bulk Operations** | ✓ (Limited) | ✓ (All) | ✓ (Dept) | ✗ | ✗ | ✗ | ✗ |
| **View PR Sources** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Export PR Breakdown** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Adjust Source Quantities** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Split PO Items** | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 3.2 Approval Authority Matrix

| PO Value Range | Dept Head | Finance Officer | Proc Manager | Finance Manager | General Manager |
|----------------|-----------|-----------------|--------------|-----------------|-----------------|
| $0 - $1,000 | ✓ | ✓ | ✓ | ✓ | ✓ |
| $1,001 - $5,000 | ✓ | ✓ | ✓ | ✓ | ✓ |
| $5,001 - $25,000 | ✗ | ✓ | ✓ | ✓ | ✓ |
| $25,001 - $100,000 | ✗ | ✗ | ✓ | ✓ | ✓ |
| $100,001 - $500,000 | ✗ | ✗ | ✗ | ✓ | ✓ |
| $500,001+ | ✗ | ✗ | ✗ | ✗ | ✓ |

**Notes**:
- Department Heads can only approve POs from their own department
- Finance Officers have cross-departmental approval authority within their limits
- Self-approval is prohibited for all roles
- Emergency POs may have reduced limits requiring higher authority

## 4. Field-Level Security

### 4.1 PO Header Fields Security

| Field | Proc Officer | Proc Manager | Dept Head | Finance Officer | Finance Manager | Inventory Manager |
|-------|--------------|--------------|-----------|-----------------|-----------------|-------------------|
| **PO Number** | Read-only | Read-only | Read-only | Read-only | Read-only | Read-only |
| **Vendor** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Read-only |
| **Date** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Read-only |
| **Delivery Date** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Edit (Receiving) |
| **Currency** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Edit | Read-only |
| **Payment Terms** | Read-only | Edit | Read-only | Edit | Edit | Read-only |
| **Credit Limit** | Read-only | Read-only | Read-only | Read-only | Edit | Read-only |
| **Description** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Read-only |
| **Department** | Edit (Own) | Edit (All) | Edit (Own) | Read-only | Read-only | Read-only |
| **Budget Code** | Read-only | Edit | Read-only | Edit | Edit | Read-only |
| **Internal Notes** | Hidden | Edit | Hidden | Edit | Edit | Hidden |

### 4.2 Item-Level Fields Security

| Field | Proc Officer | Proc Manager | Dept Head | Finance Officer | Finance Manager | Inventory Manager |
|-------|--------------|--------------|-----------|-----------------|-----------------|-------------------|
| **Item** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Read-only |
| **Quantity** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Edit (Receiving) |
| **Unit Price** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Edit | Read-only |
| **Discount Rate** | Limited | Edit | Limited | Read-only | Edit | Read-only |
| **Tax Rate** | Read-only | Edit | Read-only | Edit | Edit | Read-only |
| **Location** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Edit |
| **Delivery Point** | Edit (Draft) | Edit (All) | Edit (Dept Draft) | Read-only | Read-only | Edit |
| **Received Qty** | Read-only | Read-only | Read-only | Read-only | Read-only | Edit |

### 4.3 Financial Fields Security

| Field | Proc Officer | Proc Manager | Dept Head | Finance Officer | Finance Manager | Inventory Manager |
|-------|--------------|--------------|-----------|-----------------|-----------------|-------------------|
| **Subtotal** | Read-only | Read-only | Read-only | Read-only | Read-only | Read-only |
| **Discount Amount** | Read-only | Edit | Read-only | Edit | Edit | Read-only |
| **Net Amount** | Read-only | Read-only | Read-only | Read-only | Read-only | Read-only |
| **Tax Amount** | Read-only | Read-only | Read-only | Edit | Edit | Read-only |
| **Total Amount** | Read-only | Read-only | Read-only | Read-only | Read-only | Read-only |
| **Exchange Rate** | Read-only | Read-only | Read-only | Edit | Edit | Read-only |
| **Base Currency Amounts** | Hidden | View | Hidden | View | View | Hidden |

### 4.4 PR Source Information Security

| Information Type | Proc Officer | Proc Manager | Dept Head | Finance Officer | Finance Manager | Inventory Manager |
|------------------|--------------|--------------|-----------|-----------------|-----------------|-------------------|
| **PR Numbers** | View | View | View | View | View | View |
| **Requestor Names** | View | View | View (Dept) | View | View | View |
| **Requested Quantities** | View | View | View | View | View | View |
| **Approved Quantities** | View | View | View | View | View | View |
| **Variance Reasons** | View | View | View (Dept) | View | View | Hidden |
| **Original Prices** | View | View | View | View | View | Hidden |
| **Requestor Notes** | Limited | View | View (Dept) | View | View | Hidden |
| **Approval History** | Limited | View | View (Dept) | View | View | Hidden |
| **Budget Impact** | Hidden | View | Hidden | View | View | Hidden |
| **Department Analysis** | Own Dept | View | Own Dept | View | View | Hidden |

## 5. Dynamic Access Control Rules

### 5.1 Status-Based Access Control

```javascript
function getStatusBasedPermissions(po, user) {
  const status = po.status;
  const basePermissions = getRolePermissions(user.role);
  
  switch (status) {
    case 'Draft':
      return {
        ...basePermissions,
        canEdit: basePermissions.canEdit && (
          po.createdBy === user.id || 
          hasEditPermission(user, po)
        ),
        canDelete: basePermissions.canDelete && (
          po.createdBy === user.id ||
          user.role === 'Procurement Manager'
        ),
        canSend: basePermissions.canSend
      };
      
    case 'Sent':
      return {
        ...basePermissions,
        canEdit: user.role === 'Procurement Manager' && basePermissions.canEdit,
        canDelete: false,
        canSend: false,
        canApprove: basePermissions.canApprove && po.createdBy !== user.id,
        canVoid: user.role === 'Procurement Manager'
      };
      
    case 'Approved':
      return {
        ...basePermissions,
        canEdit: false,
        canDelete: false,
        canSend: false,
        canApprove: false,
        canVoid: ['Procurement Manager', 'Finance Manager'].includes(user.role)
      };
      
    case 'Voided':
    case 'Closed':
      return {
        ...basePermissions,
        canEdit: false,
        canDelete: false,
        canSend: false,
        canApprove: false,
        canVoid: false
      };
      
    default:
      return basePermissions;
  }
}
```

### 5.2 Department-Based Access Control

```javascript
function getDepartmentBasedAccess(po, user) {
  // System-wide roles have full access
  if (['System Administrator', 'Procurement Manager', 'Finance Officer', 'Finance Manager']
      .includes(user.role)) {
    return { hasAccess: true, scope: 'full' };
  }
  
  // Department heads can access their department's POs
  if (user.role === 'Department Head') {
    return {
      hasAccess: po.department === user.department,
      scope: 'department'
    };
  }
  
  // Procurement officers can access POs they created or are assigned to
  if (user.role === 'Procurement Officer') {
    return {
      hasAccess: po.createdBy === user.id || 
                 po.assignedTo === user.id ||
                 (po.department === user.department && user.permissions.includes('view_dept_pos')),
      scope: 'limited'
    };
  }
  
  // Inventory managers can access inventory-affecting POs
  if (user.role === 'Inventory Manager') {
    return {
      hasAccess: po.items.some(item => item.affectsInventory),
      scope: 'inventory'
    };
  }
  
  return { hasAccess: false, scope: 'none' };
}
```

### 5.3 Amount-Based Access Control

```javascript
function getAmountBasedPermissions(po, user) {
  const amount = po.totalAmount;
  const approvalLimits = getApprovalLimits(user.role);
  
  return {
    canApprove: amount <= approvalLimits.standard,
    canApproveUrgent: amount <= approvalLimits.urgent,
    canApproveEmergency: amount <= approvalLimits.emergency,
    requiresEscalation: amount > approvalLimits.standard,
    nextApprover: amount > approvalLimits.standard ? 
      getNextApproverRole(user.role, amount) : null
  };
}
```

## 6. UI Component Security

### 6.1 Action Button Visibility

```javascript
function getVisibleActionButtons(po, user) {
  const permissions = getEffectivePermissions(po, user);
  const buttons = [];
  
  // Edit button
  if (permissions.canEdit) {
    buttons.push({
      id: 'edit',
      label: 'Edit',
      icon: 'Edit',
      variant: 'outline',
      show: true
    });
  }
  
  // Send button
  if (permissions.canSend && po.status === 'Draft') {
    buttons.push({
      id: 'send',
      label: 'Send to Vendor',
      icon: 'Send',
      variant: 'default',
      show: true
    });
  }
  
  // Approve button
  if (permissions.canApprove && ['Sent', 'Pending'].includes(po.status)) {
    buttons.push({
      id: 'approve',
      label: 'Approve',
      icon: 'Check',
      variant: 'default',
      show: po.createdBy !== user.id
    });
  }
  
  // Void button
  if (permissions.canVoid && ['Sent', 'Approved'].includes(po.status)) {
    buttons.push({
      id: 'void',
      label: 'Void',
      icon: 'X',
      variant: 'destructive',
      show: true,
      confirmRequired: true
    });
  }
  
  // Delete button
  if (permissions.canDelete && po.status === 'Draft') {
    buttons.push({
      id: 'delete',
      label: 'Delete',
      icon: 'Trash',
      variant: 'destructive',
      show: true,
      confirmRequired: true
    });
  }
  
  return buttons;
}
```

### 6.2 Tab Visibility Control

```javascript
function getVisibleTabs(po, user) {
  const permissions = getEffectivePermissions(po, user);
  const tabs = [];
  
  // Items tab - always visible
  tabs.push({
    id: 'items',
    label: 'Items',
    visible: true,
    editable: permissions.canEdit
  });
  
  // Financial tab - role-based visibility
  if (['Procurement Manager', 'Finance Officer', 'Finance Manager'].includes(user.role)) {
    tabs.push({
      id: 'financial',
      label: 'Financial',
      visible: true,
      editable: permissions.canEditFinancial
    });
  }
  
  // Documents tab - always visible
  tabs.push({
    id: 'documents',
    label: 'Documents',
    visible: true,
    editable: permissions.canEdit
  });
  
  // Activity tab - always visible
  tabs.push({
    id: 'activity',
    label: 'Activity',
    visible: true,
    editable: false
  });
  
  // Comments tab - always visible
  tabs.push({
    id: 'comments',
    label: 'Comments',
    visible: true,
    editable: true
  });
  
  // GRN tab - inventory managers and procurement managers only
  if (['Inventory Manager', 'Procurement Manager'].includes(user.role)) {
    tabs.push({
      id: 'grn',
      label: 'Goods Receipt',
      visible: true,
      editable: user.role === 'Inventory Manager'
    });
  }
  
  return tabs;
}
```

### 6.3 Field-Level UI Security

```javascript
function getFieldConfiguration(fieldName, po, user) {
  const permissions = getEffectivePermissions(po, user);
  const fieldPermissions = getFieldPermissions(user.role, fieldName);
  
  const config = {
    visible: fieldPermissions.visible,
    editable: fieldPermissions.editable && permissions.canEdit,
    required: fieldPermissions.required,
    placeholder: fieldPermissions.placeholder,
    helpText: fieldPermissions.helpText
  };
  
  // Apply status-based restrictions
  if (po.status !== 'Draft') {
    config.editable = config.editable && fieldPermissions.editableAfterDraft;
  }
  
  // Apply role-specific restrictions
  if (fieldName.startsWith('financial.') && !permissions.canEditFinancial) {
    config.editable = false;
  }
  
  // Apply department-based restrictions
  if (fieldName === 'department' && user.role === 'Department Head') {
    config.editable = config.editable && po.department === user.department;
  }
  
  return config;
}
```

## 7. Data Filtering Rules

### 7.1 PO List Filtering

```javascript
function filterPOsForUser(pos, user) {
  switch (user.role) {
    case 'System Administrator':
    case 'Procurement Manager':
    case 'Finance Manager':
      // Full access to all POs
      return pos;
      
    case 'Finance Officer':
      // All POs for financial oversight, but filtered for sensitive information
      return pos.map(po => ({
        ...po,
        internalNotes: undefined // Hide internal notes
      }));
      
    case 'Department Head':
      // Only department POs
      return pos.filter(po => po.department === user.department);
      
    case 'Procurement Officer':
      // POs created by user, assigned to user, or department POs if authorized
      return pos.filter(po => 
        po.createdBy === user.id ||
        po.assignedTo === user.id ||
        (user.permissions.includes('view_dept_pos') && po.department === user.department)
      );
      
    case 'Inventory Manager':
      // POs affecting inventory
      return pos.filter(po => 
        po.items.some(item => item.affectsInventory)
      );
      
    default:
      // Default: only own POs
      return pos.filter(po => po.createdBy === user.id);
  }
}
```

### 7.2 Vendor Filtering

```javascript
function filterVendorsForUser(vendors, user) {
  // System admins and procurement managers see all vendors
  if (['System Administrator', 'Procurement Manager'].includes(user.role)) {
    return vendors;
  }
  
  // Filter vendors based on user's authorization level
  const userAuthLevel = getUserAuthorizationLevel(user);
  
  return vendors.filter(vendor => {
    // Check if user is authorized for this vendor
    if (vendor.authorizationRequired && 
        vendor.requiredAuthLevel > userAuthLevel) {
      return false;
    }
    
    // Check department-specific vendor restrictions
    if (user.role === 'Department Head') {
      return !vendor.departmentRestrictions || 
             vendor.departmentRestrictions.includes(user.department);
    }
    
    // Check if vendor is active
    return vendor.status === 'Active';
  });
}
```

## 8. Audit and Compliance

### 8.1 Action Logging

```javascript
function logUserAction(action, po, user, details = {}) {
  const auditEntry = {
    timestamp: new Date(),
    action,
    documentType: 'PurchaseOrder',
    documentId: po.id,
    documentNumber: po.number,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    userDepartment: user.department,
    ipAddress: getUserIPAddress(user),
    sessionId: user.sessionId,
    details: {
      oldValues: details.oldValues || {},
      newValues: details.newValues || {},
      reason: details.reason || '',
      ...details
    },
    securityContext: {
      permissionsUsed: details.permissionsUsed || [],
      authorizationLevel: getUserAuthorizationLevel(user),
      accessMethod: details.accessMethod || 'web'
    }
  };
  
  // Log to audit trail
  saveAuditLog(auditEntry);
  
  // Check for compliance violations
  checkComplianceViolations(auditEntry);
}
```

### 8.2 Permission Validation

```javascript
function validatePermissions(action, po, user) {
  const permissions = getEffectivePermissions(po, user);
  const requiredPermission = getRequiredPermission(action);
  
  // Check if user has required permission
  if (!permissions[requiredPermission]) {
    logSecurityViolation('PERMISSION_DENIED', action, po, user);
    throw new SecurityError(`Permission denied for action: ${action}`);
  }
  
  // Check business rule compliance
  const businessRuleCheck = validateBusinessRules(action, po, user);
  if (!businessRuleCheck.valid) {
    logSecurityViolation('BUSINESS_RULE_VIOLATION', action, po, user, {
      rule: businessRuleCheck.rule,
      reason: businessRuleCheck.reason
    });
    throw new BusinessRuleError(businessRuleCheck.reason);
  }
  
  // Check segregation of duties
  const sodCheck = validateSegregationOfDuties(action, po, user);
  if (!sodCheck.valid) {
    logSecurityViolation('SOD_VIOLATION', action, po, user, {
      conflict: sodCheck.conflict
    });
    throw new SecurityError(sodCheck.reason);
  }
  
  return true;
}
```

## 9. Security Configuration

### 9.1 Role Configuration

```javascript
const roleConfigurations = {
  'Procurement Officer': {
    basePermissions: [
      'view_po_list',
      'view_po_details',
      'create_po',
      'edit_draft_po',
      'send_po',
      'export_data'
    ],
    restrictions: [
      'cannot_approve_own_po',
      'department_scope_only',
      'amount_limit_5000'
    ],
    fieldAccess: {
      financial: 'read_only',
      vendor: 'edit_limited',
      items: 'full_access'
    }
  },
  
  'Procurement Manager': {
    basePermissions: [
      'view_all_pos',
      'edit_all_pos',
      'approve_po',
      'void_po',
      'delete_po',
      'bulk_operations',
      'admin_functions'
    ],
    restrictions: [
      'cannot_approve_own_po'
    ],
    fieldAccess: {
      financial: 'full_access',
      vendor: 'full_access',
      items: 'full_access'
    }
  }
  
  // Additional role configurations...
};
```

### 9.2 Dynamic Permission Assignment

```javascript
function assignDynamicPermissions(user, context) {
  const basePermissions = roleConfigurations[user.role].basePermissions;
  const dynamicPermissions = [];
  
  // Time-based permissions
  if (isBusinessHours()) {
    dynamicPermissions.push('urgent_approval');
  }
  
  // Location-based permissions
  if (user.location === 'headquarters') {
    dynamicPermissions.push('emergency_override');
  }
  
  // Temporary elevated permissions
  const tempPermissions = getTempPermissions(user.id);
  dynamicPermissions.push(...tempPermissions);
  
  // Context-specific permissions
  if (context.emergency) {
    dynamicPermissions.push('emergency_approval');
  }
  
  return [...basePermissions, ...dynamicPermissions];
}
```

This comprehensive RBAC documentation ensures secure, compliant, and role-appropriate access to all Purchase Order module functionality while maintaining operational efficiency and proper segregation of duties.