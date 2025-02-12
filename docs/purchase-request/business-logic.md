# Purchase Request Module - Business Logic Documentation

## 1. Core Business Rules

### 1.1 PR Creation Rules
1. **Requestor Eligibility**
   - Must be an active employee
   - Must belong to an authorized department
   - Must have PR creation permission
   - Cannot exceed monthly PR limit

2. **Budget Validation**
   - Must have sufficient budget allocation
   - Must be within fiscal year
   - Must respect department budget limits
   - Must consider existing commitments

3. **Item Requirements**
   - Minimum 1 item per PR
   - Maximum 100 items per PR
   - Each item must have:
     - Valid item code/description
     - Quantity > 0
     - Unit price > 0
     - Valid budget category
     - Valid cost center

4. **Document Requirements**
   - Supporting documents required for:
     - PRs above $10,000
     - Non-catalog items
     - Special approvals
     - Budget overrides

5. **Vendor Requirements**
   - Must have active vendor status
   - Must be compliant with company policies
   - Must have valid certifications
   - Must not exceed vendor limits
   - Must match item categories
   - Must have valid quotations for:
     - Non-catalog items
     - Items above threshold
     - Special categories

### 1.2 Approval Rules

1. **Approval Levels**
   ```typescript
   interface ApprovalLevel {
     level: number
     threshold: number
     requiredApprovers: number
     skipConditions?: string[]
     overrideConditions?: string[]
   }
   
   const approvalLevels: ApprovalLevel[] = [
     {
       level: 1,
       threshold: 5000,
       requiredApprovers: 1,
       skipConditions: ['template-items-only']
     },
     {
       level: 2,
       threshold: 50000,
       requiredApprovers: 2,
       overrideConditions: ['emergency-purchase']
     },
     {
       level: 3,
       threshold: 100000,
       requiredApprovers: 3
     }
   ]
   ```

2. **Approval Routing**
   - Based on:
     - PR total amount
     - Department hierarchy
     - Item categories
     - Special conditions
   - Sequential approval flow
   - Parallel approvals allowed
   - Delegation rules apply

3. **Auto-Approval Conditions**
   - Template-based PRs under $1,000
   - Catalog items under $500
   - Recurring purchases within budget
   - Pre-approved vendors

### 1.3 Budget Control

1. **Budget Checking**
   ```typescript
   interface BudgetCheck {
     departmentId: string
     costCenter: string
     budgetCategory: string
     amount: number
     fiscalYear: number
     month: number
   }
   
   interface BudgetResult {
     isValid: boolean
     availableBudget: number
     commitments: number
     warningLevel: 'none' | 'low' | 'critical'
     overrideAllowed: boolean
   }
   ```

2. **Budget Allocation**
   - Monthly allocation checks
   - Quarterly budget limits
   - Annual budget constraints
   - Cross-fiscal year handling

3. **Budget Overrides**
   - Authority levels
   - Documentation requirements
   - Approval requirements
   - Audit trail requirements

### 1.4 Vendor Control

1. **Vendor Validation**
   ```typescript
   interface VendorValidation {
     vendorId: string
     status: 'active' | 'inactive' | 'blacklisted' | 'pending'
     complianceStatus: {
       isCompliant: boolean
       expiryDate: Date
       documents: string[]
     }
     categories: string[]
     limits: {
       maxOrderValue: number
       currentExposure: number
       availableLimit: number
     }
     performance: {
       rating: number
       deliveryScore: number
       qualityScore: number
       responseTime: number
     }
   }
   ```

2. **Vendor Assignment Rules**
   ```typescript
   interface VendorAssignment {
     primary: {
       vendorId: string
       terms: VendorTerms
       quotation?: string
     }
     alternates?: {
       vendorId: string
       priority: number
       terms: VendorTerms
       quotation?: string
     }[]
   }

   interface VendorTerms {
     payment: {
       terms: string
       days: number
       method: string
     }
     delivery: {
       terms: string
       leadTime: number
       method: string
     }
     warranty: {
       period: number
       conditions: string[]
     }
     sla?: {
       responseTime: number
       resolution: number
       penalties: string[]
     }
     pricing: {
       validity: Date
       specialConditions?: string[]
       discounts?: {
         type: string
         value: number
         conditions: string[]
       }[]
     }
   }
   ```

3. **Vendor Limits**
   ```typescript
   interface VendorLimits {
     monthly: {
       amount: number
       orders: number
     }
     quarterly: {
       amount: number
       orders: number
     }
     annual: {
       amount: number
       orders: number
     }
     category: {
       id: string
       limit: number
       utilized: number
     }[]
   }
   ```

## 2. Validation Rules

### 2.1 Data Validation

1. **Required Fields**
   ```typescript
   interface PRValidation {
     header: {
       department: string
       requestor: string
       currency: string
       deliveryDate: Date
       priority: 'low' | 'medium' | 'high'
     }
     items: {
       itemCode: string
       description: string
       quantity: number
       unitPrice: number
       budgetCategory: string
       costCenter: string
     }[]
     attachments?: {
       fileType: string
       fileName: string
       size: number
     }[]
   }
   ```

2. **Business Validation**
   - Date validations
   - Amount calculations
   - Currency conversions
   - Budget availability
   - User permissions

3. **Custom Validation Rules**
   ```typescript
   interface ValidationRule {
     field: string
     condition: string
     errorMessage: string
     severity: 'error' | 'warning'
     override?: boolean
   }
   ```

### 2.2 Workflow Validation

1. **Status Transitions**
   ```typescript
   type PRStatus = 
     | 'draft'
     | 'submitted'
     | 'under_review'
     | 'approved'
     | 'rejected'
     | 'cancelled'
     | 'closed'
     | 'sent_back'
   
   interface StatusTransition {
     from: PRStatus
     to: PRStatus
     conditions: string[]
     requiredRole: string[]
   }
   ```

2. **Action Permissions**
   - Edit permissions
   - Approval permissions
   - Cancel permissions
   - Close permissions

## 3. Calculation Logic

### 3.1 Amount Calculations

1. **Item Level**
   ```typescript
   interface ItemCalculation {
     quantity: number
     unitPrice: number
     discount?: number
     tax?: number
     currency: string
     exchangeRate: number
   }
   ```

2. **PR Level**
   ```typescript
   interface PRCalculation {
     items: ItemCalculation[]
     totalBeforeTax: number
     totalTax: number
     totalAmount: number
     baseCurrency: string
   }
   ```

### 3.2 Budget Calculations

1. **Budget Consumption**
   ```typescript
   interface BudgetConsumption {
     allocated: number
     committed: number
     actual: number
     available: number
     currency: string
   }
   ```

2. **Forecast Impact**
   ```typescript
   interface BudgetForecast {
     currentMonth: BudgetConsumption
     nextMonth: BudgetConsumption
     quarterly: BudgetConsumption
     annual: BudgetConsumption
   }
   ```

## 4. Integration Rules

### 4.1 System Integration

1. **Master Data**
   - User data
   - Department data
   - Item master
   - Vendor master
   - Budget master

2. **Transaction Data**
   - Budget transactions
   - Approval history
   - Audit logs
   - Document storage

### 4.2 External Integration

1. **ERP Integration**
   ```typescript
   interface ERPIntegration {
     documentType: string
     documentNumber: string
     status: string
     payload: Record<string, unknown>
     timestamp: Date
   }
   ```

2. **Email Integration**
   ```typescript
   interface EmailNotification {
     template: string
     recipients: string[]
     cc?: string[]
     data: Record<string, unknown>
     attachments?: string[]
   }
   ```

## 5. Audit Rules

### 5.1 Audit Trail

1. **Change Tracking**
   ```typescript
   interface AuditLog {
     timestamp: Date
     user: string
     action: string
     field?: string
     oldValue?: unknown
     newValue?: unknown
     reason?: string
   }
   ```

2. **Version Control**
   ```typescript
   interface PRVersion {
     version: number
     timestamp: Date
     user: string
     changes: AuditLog[]
     snapshot: Record<string, unknown>
   }
   ```

### 5.2 Compliance Rules

1. **Documentation**
   - Required attachments
   - Approval evidence
   - Budget overrides
   - Special approvals

2. **Retention**
   - Document retention
   - Audit log retention
   - Version history
   - Archive rules

## 6. Error Handling

### 6.1 Business Errors

1. **Validation Errors**
   ```typescript
   interface ValidationError {
     field: string
     code: string
     message: string
     severity: 'error' | 'warning'
     resolution?: string[]
   }
   ```

2. **Process Errors**
   ```typescript
   interface ProcessError {
     step: string
     code: string
     message: string
     impact: 'low' | 'medium' | 'high'
     recovery: string[]
   }
   ```

### 6.2 System Errors

1. **Technical Errors**
   ```typescript
   interface SystemError {
     component: string
     errorCode: string
     message: string
     stack?: string
     timestamp: Date
   }
   ```

2. **Recovery Procedures**
   - Automatic retry
   - Manual intervention
   - Data recovery
   - System rollback

## 7. Business Metrics

### 7.1 Performance Metrics

1. **Processing Metrics**
   ```typescript
   interface ProcessingMetrics {
     avgProcessingTime: number
     avgApprovalTime: number
     errorRate: number
     successRate: number
   }
   ```

2. **Business Metrics**
   ```typescript
   interface BusinessMetrics {
     totalPRs: number
     totalValue: number
     avgValue: number
     rejectionRate: number
   }
   ```

### 7.2 Compliance Metrics

1. **Audit Metrics**
   ```typescript
   interface AuditMetrics {
     complianceRate: number
     violationCount: number
     overrideCount: number
     documentationRate: number
   }
   ```

2. **Budget Metrics**
   ```typescript
   interface BudgetMetrics {
     utilizationRate: number
     overBudgetCount: number
     savingsRate: number
     forecastAccuracy: number
   }
   ```

## 8. Configuration Parameters

### 8.1 System Parameters

```typescript
interface SystemConfig {
  approvalLevels: ApprovalLevel[]
  budgetRules: {
    checkFrequency: 'realtime' | 'daily' | 'weekly'
    warningThreshold: number
    overrideThreshold: number
  }
  workflow: {
    autoApprovalEnabled: boolean
    parallelApprovalEnabled: boolean
    delegationEnabled: boolean
  }
  integration: {
    erpEnabled: boolean
    emailEnabled: boolean
    documentStorageEnabled: boolean
  }
}
```

### 8.2 Business Parameters

```typescript
interface BusinessConfig {
  limits: {
    maxItemsPerPR: number
    maxPRsPerMonth: number
    maxAmountPerPR: number
  }
  thresholds: {
    documentationRequired: number
    specialApprovalRequired: number
    budgetOverrideLimit: number
  }
  timing: {
    approvalTimeout: number
    documentRetention: number
    archiveAfter: number
  }
}
```

## 9. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Analyst | | | |
| Technical Lead | | | |
| Product Owner | | | |
| Compliance Officer | | | | 