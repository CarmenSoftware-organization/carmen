# Purchase Request ItemsTab: Enhanced Business Logic

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document outlines the comprehensive business logic for the enhanced Purchase Request ItemsTab implementation, including three-tier information architecture, role-based expandable panels, and advanced bulk operations.

## 1. Three-Tier Information Architecture

### 1.1. Tier Structure Overview

The ItemsTab implements a sophisticated three-tier information disclosure system designed to optimize screen real estate while providing comprehensive item management capabilities.

#### **Tier 1: Compact Row (Always Visible)**
```typescript
interface CompactRowDisplay {
  alwaysVisible: [
    'selectionCheckbox',
    'itemSequence',
    'productName', 
    'statusBadge',
    'expandToggle'
  ];
  conditionalElements: {
    editButton: 'visible when user has edit permissions',
    actionButtons: 'role-based action availability'
  };
}
```

**Business Rules:**
- **Universal Access**: All roles see compact row information
- **Status Visualization**: Color-coded status badges for quick identification
- **Selection Management**: Checkbox-driven selection for bulk operations
- **Progressive Disclosure**: Expand/collapse toggle for detailed information

#### **Tier 2: Essential Details Row**
```typescript
interface EssentialDetailsRow {
  displayElements: [
    'locationIcon + location',
    'packageIcon + quantity + unit',
    'calendarIcon + requiredDate',
    'expandedActionButtons'
  ];
  conditionalDisplay: {
    pricing: 'hidden from Staff/Requestor roles',
    vendor: 'hidden from Staff/Requestor roles',
    approvalInfo: 'shown when item has approval history'
  };
}
```

**Business Rules:**
- **Role-based Filtering**: Financial information automatically filtered
- **Icon Consistency**: Standardized iconography for quick recognition
- **Responsive Layout**: Adapts to screen size while maintaining readability
- **Action Context**: Action buttons adapt to item status and user permissions

#### **Tier 3: Expandable Panel (Role-Specific)**
```typescript
interface ExpandablePanelStructure {
  sections: {
    inventoryInfo: InventorySection;
    businessDimensions: BusinessDimensionsSection;
    vendorPricing: VendorPricingSection;
    taxDiscountOverrides: TaxDiscountSection;
  };
  sectionVisibility: RoleBasedSectionAccess;
  editableFields: RoleBasedEditAccess;
}
```

## 2. Role-Based Section Visibility

### 2.1. Inventory Information Section (Universal Access)

**Section Purpose**: Provide real-time inventory context for procurement decisions

**Components:**
```typescript
interface InventoryInfoSection {
  colorCodedTiles: [
    {
      label: 'On Hand',
      value: 'number',
      colorScheme: 'green|yellow|red based on stock levels'
    },
    {
      label: 'On Order', 
      value: 'number',
      colorScheme: 'blue for positive values'
    },
    {
      label: 'Reorder Level',
      value: 'number', 
      colorScheme: 'orange warning threshold'
    },
    {
      label: 'Restock Level',
      value: 'number',
      colorScheme: 'purple target threshold'  
    }
  ];
  businessLogic: {
    stockAlerts: 'visual warnings when requested > available',
    locationBreakdown: 'stock levels per storage location',
    averageUsage: 'historical consumption data display'
  };
}
```

**Access Control**: Visible to all roles
**Business Purpose**: Enable informed quantity decisions across all user types

### 2.2. Business Dimensions Section (Requestor/Approver Access)

**Section Purpose**: Capture business context and project allocation information

**Components:**
```typescript
interface BusinessDimensionsSection {
  selectFields: [
    {
      field: 'jobNumber',
      label: 'Job Number',
      dataSource: 'active jobs API',
      validation: 'required for certain PR types'
    },
    {
      field: 'events',
      label: 'Events', 
      dataSource: 'upcoming events API',
      validation: 'optional but tracked for cost allocation'
    },
    {
      field: 'projects',
      label: 'Projects',
      dataSource: 'active projects API',
      validation: 'required for project-specific purchases'
    },
    {
      field: 'marketSegments',
      label: 'Market Segments',
      dataSource: 'market segments master data',
      validation: 'required for segment-specific allocations'
    }
  ];
  editAccess: ['Staff', 'Requestor', 'Department Manager', 'Financial Manager'];
  viewAccess: ['Purchasing Staff']; // Read-only for purchasing
}
```

**Business Rules:**
- **Cost Allocation**: Enables proper financial tracking and reporting
- **Project Accounting**: Links purchases to specific business initiatives  
- **Compliance**: Ensures proper categorization for audit and regulatory requirements
- **Budget Control**: Facilitates budget allocation and spending analysis

### 2.3. Vendor & Pricing Section (Approver/Purchaser Access)

**Section Purpose**: Manage vendor selection and pricing information

**Components:**
```typescript
interface VendorPricingSection {
  vendorManagement: {
    vendorSelect: {
      dataSource: 'approved vendors API',
      filtering: 'by product category and compliance status',
      validation: 'must be approved vendor',
      permissions: {
        view: ['Department Manager', 'Financial Manager'],
        edit: ['Purchasing Staff']
      }
    },
    vendorComparison: {
      availability: 'Purchasing Staff only',
      functionality: 'side-by-side vendor pricing analysis',
      integration: 'real-time price comparison engine'
    }
  };
  pricingManagement: {
    unitPrice: {
      sources: ['vendor catalog', 'historical average', 'manual entry'],
      validation: 'price variance alerts for significant deviations',
      permissions: {
        view: ['Department Manager', 'Financial Manager'],
        edit: ['Purchasing Staff']
      }
    },
    totalCalculation: {
      formula: 'quantity × unit price',
      realTimeUpdate: 'automatic calculation on field changes',
      currencySupport: 'multi-currency with exchange rate conversion'
    }
  };
  accessControl: {
    hiddenFrom: ['Staff', 'Requestor'],
    viewOnly: ['Department Manager', 'Financial Manager'],
    fullAccess: ['Purchasing Staff', 'Admin']
  };
}
```

**Business Rules:**
- **Financial Confidentiality**: Pricing hidden from requestors to prevent influence on vendor negotiations
- **Vendor Compliance**: Only approved vendors available for selection
- **Price Validation**: Automatic alerts for unusual price variations
- **Multi-currency Support**: Handles international vendor pricing with real-time conversion

### 2.4. Tax & Discount Overrides Section (Purchaser Only)

**Section Purpose**: Advanced financial controls for exceptional circumstances

**Components:**
```typescript
interface TaxDiscountOverridesSection {
  overrideControls: [
    {
      control: 'overrideTaxRate',
      type: 'checkbox + percentage input',
      defaultValue: 'system tax rate based on item category',
      validation: 'percentage between 0-50%',
      auditRequirement: 'justification comment required'
    },
    {
      control: 'applyDiscount',
      type: 'checkbox + percentage input', 
      defaultValue: 'no discount',
      validation: 'percentage between 0-100%',
      auditRequirement: 'discount reason required'
    }
  ];
  businessRules: {
    auditTrail: 'all overrides logged with user and timestamp',
    approvalRequired: 'manager approval for overrides > threshold',
    complianceCheck: 'tax overrides validated against regulatory limits'
  };
  accessControl: {
    availableTo: ['Purchasing Staff', 'Admin'],
    hiddenFrom: 'all other roles'
  };
}
```

**Business Rules:**
- **Exception Management**: Handles non-standard tax and discount scenarios
- **Audit Compliance**: All overrides fully documented and tracked
- **Approval Thresholds**: Significant overrides require additional authorization
- **Regulatory Compliance**: Tax overrides validated against legal requirements

## 3. Enhanced Bulk Operations Logic

### 3.1. Mixed Status Intelligence

**Problem**: Traditional bulk operations fail when selected items have different statuses
**Solution**: Intelligent analysis and user-guided resolution

```typescript
interface MixedStatusAnalysis {
  statusBreakdown: {
    [status: string]: {
      count: number;
      itemIds: string[];
      applicableActions: string[];
    };
  };
  actionOptions: [
    {
      option: 'processApplicableOnly',
      description: 'Process only items ready for this action',
      impact: 'skip non-applicable items'
    },
    {
      option: 'processAllWithStatusChange', 
      description: 'Process all items, changing status as needed',
      impact: 'may move some items to review status'
    },
    {
      option: 'cancelAndReselect',
      description: 'Cancel operation and manually select appropriate items',
      impact: 'return to selection state'
    }
  ];
}
```

**Business Logic Flow:**
1. **Analysis Phase**: System analyzes all selected items and their current statuses
2. **Option Presentation**: User presented with intelligent processing options
3. **Impact Preview**: Clear explanation of what will happen to each item
4. **User Decision**: User selects preferred processing approach
5. **Execution**: System processes items according to selected option
6. **Result Summary**: Detailed report of actions taken and any skipped items

### 3.2. Multi-Step Return Workflow

**Purpose**: Enable sophisticated return-to-stage functionality with audit trail

```typescript
interface ReturnWorkflowLogic {
  stageSelection: {
    availableStages: 'all previous stages in workflow',
    businessRules: {
      'cannot skip stages': 'must return to immediately previous or earlier',
      'approver permissions': 'can only return to stages user has authority over',
      'audit requirements': 'reason required for all return actions'
    }
  };
  returnProcess: [
    {
      step: 'stageSelection',
      userAction: 'select target workflow stage',
      validation: 'ensure user has permission to return to selected stage'
    },
    {
      step: 'reasonCapture',
      userAction: 'provide detailed reason for return',
      validation: 'minimum 10 characters, meaningful explanation'
    },
    {
      step: 'impactAnalysis',
      systemAction: 'analyze affected users and notifications',
      display: 'show who will be notified and what actions they need to take'
    },
    {
      step: 'confirmation',
      userAction: 'final confirmation of return action',
      systemAction: 'execute return and send notifications'
    }
  ];
}
```

**Business Benefits:**
- **Workflow Flexibility**: Enables returning items to any appropriate stage
- **Proper Authorization**: Ensures only authorized users can initiate returns
- **Clear Communication**: Affected parties automatically notified with context
- **Audit Compliance**: Complete trail of return actions and justifications

### 3.3. Intelligent Action Availability

**Logic**: Action buttons dynamically appear based on item status, user role, and business rules

```typescript
interface ActionAvailabilityLogic {
  universalActions: ['view', 'comment'];
  conditionalActions: {
    edit: {
      conditions: [
        'user has edit permissions',
        'item status allows editing',
        'PR not locked by another user'
      ]
    },
    approve: {
      conditions: [
        'user is current approver',
        'item status is pending approval',
        'no blocking dependencies'
      ]
    },
    reject: {
      conditions: [
        'user has approval authority',
        'item not already rejected',
        'rejection reason will be required'
      ]
    },
    return: {
      conditions: [
        'user has return authority',
        'item has progressed beyond initial stage',
        'return reason will be required'
      ]
    }
  };
  bulkActions: {
    availability: 'based on most restrictive permission among selected items',
    intelligence: 'system suggests optimal action based on selection'
  };
}
```

## 4. Performance and User Experience Logic

### 4.1. Progressive Loading Strategy

**Challenge**: Large PRs with many items can slow initial page load
**Solution**: Intelligent progressive loading with user feedback

```typescript
interface ProgressiveLoadingLogic {
  initialLoad: {
    priority1: 'first 10 items in compact view',
    priority2: 'status summary and counts',
    priority3: 'remaining items in background'
  };
  expandedPanels: {
    loadTrigger: 'user click to expand',
    caching: 'cache expanded data for 5 minutes',
    preloading: 'preload next likely expansion on hover'
  };
  bulkOperations: {
    batchSize: 'process items in batches of 25',
    progressFeedback: 'real-time progress indicator',
    errorHandling: 'continue processing, report failures at end'
  };
}
```

### 4.2. Real-time Synchronization Logic

**Purpose**: Keep all users synchronized on collaborative item editing

```typescript
interface RealTimeSyncLogic {
  conflictPrevention: {
    itemLocking: 'soft lock items being edited',
    visualIndicators: 'show who else is viewing/editing',
    autoSave: 'save changes every 30 seconds in edit mode'
  };
  updatePropagation: {
    statusChanges: 'immediate broadcast to all viewers',
    commentAdditions: 'real-time comment synchronization',
    quantityChanges: 'immediate update of affected calculations'
  };
  conflictResolution: {
    detectConflicts: 'compare timestamps on save',
    userChoice: 'present merge options to user',
    fallbackStrategy: 'last writer wins with user notification'
  };
}
```

## 5. Integration Business Logic

### 5.1. Inventory System Integration

**Purpose**: Provide real-time inventory context for procurement decisions

```typescript
interface InventoryIntegrationLogic {
  stockChecking: {
    trigger: 'item quantity change',
    validation: 'warn if requested > available',
    alternatives: 'suggest substitute items if available'
  };
  reservationManagement: {
    softReservation: 'on item approval',
    hardCommitment: 'on PO creation', 
    releaseReservation: 'on item rejection or PR cancellation'
  };
  reorderTriggers: {
    automaticDetection: 'trigger reorder when stock < reorder level',
    userNotification: 'alert purchasing staff of reorder needs',
    systemIntegration: 'create automatic purchase requisitions'
  };
}
```

### 5.2. Financial System Integration

**Purpose**: Ensure accurate cost tracking and budget management

```typescript
interface FinancialIntegrationLogic {
  budgetValidation: {
    realTimeChecking: 'validate against available budget on quantity change',
    multiCurrency: 'handle foreign vendor pricing with current exchange rates',
    commitmentTracking: 'update budget commitments on approval'
  };
  costCalculation: {
    automaticTotaling: 'real-time calculation of line and total amounts',
    taxCalculation: 'automatic tax calculation based on item category and location',
    discountApplication: 'apply vendor discounts and negotiated rates'
  };
  approvalRouting: {
    thresholdChecking: 'route to appropriate approver based on total amount',
    escalationRules: 'automatic escalation for overdue approvals',
    exceptionHandling: 'special routing for budget overruns'
  };
}
```

## 6. Audit and Compliance Logic

### 6.1. Comprehensive Audit Trail

**Purpose**: Maintain complete, tamper-proof record of all item-level changes

```typescript
interface AuditTrailLogic {
  mandatoryLogging: [
    'item creation and deletion',
    'quantity changes with before/after values',
    'status transitions with user and timestamp',
    'approval and rejection actions with reasons',
    'vendor and pricing changes',
    'bulk operations with affected item lists'
  ];
  auditDataStructure: {
    immutableLogs: 'audit entries cannot be modified after creation',
    cryptographicIntegrity: 'hash chains to detect tampering',
    userAttribution: 'complete user identification including IP and session',
    businessContext: 'capture business reason for each change'
  };
  complianceReporting: {
    regulatoryReports: 'automated generation of compliance reports',
    auditExports: 'exportable audit trails for external auditors',
    retentionManagement: 'automatic retention according to policy'
  };
}
```

### 6.2. Data Validation and Integrity

**Purpose**: Ensure data quality and prevent corruption

```typescript
interface DataValidationLogic {
  fieldValidation: {
    quantityRules: 'positive numbers only, reasonable maximums',
    dateValidation: 'required dates cannot be in past, logical sequence',
    vendorValidation: 'must be approved vendor, compliance status current',
    priceValidation: 'reasonable ranges, variance alerts'
  };
  businessRuleValidation: {
    workflowConsistency: 'ensure actions appropriate for current status',
    approvalSequence: 'validate proper approval progression',
    budgetCompliance: 'ensure spending within authorized limits',
    inventoryConstraints: 'validate against available stock'
  };
  crossFieldValidation: {
    quantityUnitConsistency: 'ensure unit matches product specifications',
    vendorPricingAlignment: 'validate prices against vendor contracts',
    deliveryDateRealism: 'check against vendor lead times',
    budgetAllocationAccuracy: 'verify cost center and project assignments'
  };
}
```

This comprehensive business logic framework ensures the Purchase Request ItemsTab operates as a sophisticated, role-aware, and audit-compliant procurement management tool while maintaining excellent user experience and system performance.