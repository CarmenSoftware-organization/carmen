# Business Logic & Rules Documentation

**Document Type**: Business Rules Specification  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
**Purpose**: Complete business logic implementation for Carmen ERP

---

## 🎯 Business Logic Overview

Carmen ERP implements sophisticated business logic to manage hospitality operations across procurement, inventory, vendor management, and financial processes. This documentation provides complete business rules, validation logic, and workflow patterns required for recreation.

### Core Business Domains
- **Procurement Workflows**: PR → PO → GRN approval chains
- **Inventory Management**: Stock control, count processes, movement tracking
- **Vendor Relationships**: Performance tracking, pricing, contract management
- **Financial Controls**: Budget validation, approval limits, cost allocation
- **User Permissions**: Role-based access control with context switching
- **Document Workflows**: Status progression and approval routing

---

## 🔄 Procurement Business Rules

### Purchase Request Workflow
```typescript
// PR Status Progression Rules
const PRStatusFlow = {
  'draft': ['inprogress', 'void'],
  'inprogress': ['approved', 'rejected', 'void'],
  'approved': ['converted', 'void'],
  'rejected': ['draft'],
  'converted': [], // Terminal status
  'void': []       // Terminal status
}

// Business Rule: PR Approval Routing
function determineApprovalRoute(pr: PurchaseRequest): ApprovalStep[] {
  const steps: ApprovalStep[] = [];
  const totalAmount = pr.totalAmount.amount;
  const department = pr.department;
  const requestor = pr.requestor;
  
  // Rule 1: Department Manager approval required for all PRs
  // Exception: If requestor is the department manager
  const deptManager = getDepartmentManager(department);
  if (requestor !== deptManager.id) {
    steps.push({
      role: 'department-manager',
      department: department,
      required: true,
      order: 1,
      status: 'pending',
      thresholds: { maxAmount: null } // No amount limit
    });
  }
  
  // Rule 2: Financial Manager approval for PRs > $1,000
  if (totalAmount > 1000) {
    steps.push({
      role: 'financial-manager',
      required: true,
      order: steps.length + 1,
      status: 'pending',
      thresholds: { maxAmount: null } // Can approve any amount
    });
  }
  
  // Rule 3: Additional approval for PRs > $10,000
  if (totalAmount > 10000) {
    steps.push({
      role: 'general-manager',
      required: true,
      order: steps.length + 1,
      status: 'pending',
      thresholds: { maxAmount: null }
    });
  }
  
  // Rule 4: Purchasing approval for all PRs (final step)
  steps.push({
    role: 'purchasing-staff',
    required: true,
    order: steps.length + 1,
    status: 'pending',
    thresholds: { maxAmount: null }
  });
  
  return steps;
}
```

### Purchase Request Validation Rules
```typescript
// Business Rule: PR Item Validation
function validatePurchaseRequestItems(items: PurchaseRequestItem[]): ValidationResult {
  const errors: string[] = [];
  
  // Rule: Minimum one item required
  if (items.length === 0) {
    errors.push('At least one item is required');
    return { isValid: false, errors };
  }
  
  // Rule: Maximum 50 items per PR
  if (items.length > 50) {
    errors.push('Maximum 50 items allowed per purchase request');
  }
  
  items.forEach((item, index) => {
    // Rule: Item description minimum length
    if (!item.description || item.description.trim().length < 5) {
      errors.push(`Item ${index + 1}: Description must be at least 5 characters`);
    }
    
    // Rule: Quantity must be positive
    if (item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than zero`);
    }
    
    // Rule: Unit of measure required
    if (!item.unitOfMeasure || item.unitOfMeasure.trim().length === 0) {
      errors.push(`Item ${index + 1}: Unit of measure is required`);
    }
    
    // Rule: Estimated price validation (if provided)
    if (item.estimatedPrice && item.estimatedPrice.amount < 0) {
      errors.push(`Item ${index + 1}: Estimated price cannot be negative`);
    }
    
    // Rule: Total price calculation consistency
    if (item.estimatedPrice && item.totalPrice) {
      const calculatedTotal = item.quantity * item.estimatedPrice.amount;
      const providedTotal = item.totalPrice.amount;
      
      if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
        errors.push(`Item ${index + 1}: Total price doesn't match quantity × unit price`);
      }
    }
  });
  
  return { isValid: errors.length === 0, errors };
}

// Business Rule: PR Budget Validation
function validatePRBudget(pr: PurchaseRequest): ValidationResult {
  const errors: string[] = [];
  
  if (!pr.budgetCode) {
    errors.push('Budget code is required for all purchase requests');
    return { isValid: false, errors };
  }
  
  const budget = getBudgetByCode(pr.budgetCode);
  if (!budget) {
    errors.push('Invalid budget code');
    return { isValid: false, errors };
  }
  
  // Rule: Check budget availability
  const remainingBudget = budget.totalAmount - budget.spentAmount - budget.committedAmount;
  if (pr.totalAmount.amount > remainingBudget) {
    errors.push(`Insufficient budget. Available: ${formatCurrency(remainingBudget)}, Required: ${formatCurrency(pr.totalAmount.amount)}`);
  }
  
  // Rule: Department budget access
  if (budget.department && budget.department !== pr.department) {
    errors.push('Budget code not accessible by requesting department');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### Purchase Order Business Rules
```typescript
// Business Rule: PO Creation from PR
function validatePRToPOConversion(pr: PurchaseRequest, vendorId: string): ValidationResult {
  const errors: string[] = [];
  
  // Rule: PR must be approved
  if (pr.status !== 'approved') {
    errors.push('Purchase request must be approved before creating purchase order');
  }
  
  // Rule: Vendor must be active
  const vendor = getVendor(vendorId);
  if (!vendor || vendor.status !== 'active') {
    errors.push('Selected vendor is not active or does not exist');
  }
  
  // Rule: Check vendor capabilities
  if (vendor) {
    const incompatibleItems = pr.items.filter(item => 
      !vendor.capabilities.includes(item.category)
    );
    
    if (incompatibleItems.length > 0) {
      errors.push(`Vendor cannot supply items in categories: ${incompatibleItems.map(i => i.category).join(', ')}`);
    }
  }
  
  // Rule: Check delivery timeframes
  const urgentItems = pr.items.filter(item => {
    const daysDiff = getDaysBetween(new Date(), new Date(item.deliveryDate || pr.requiredDate));
    return daysDiff < 3; // Less than 3 days
  });
  
  if (urgentItems.length > 0 && vendor && vendor.leadTime > 3) {
    errors.push('Vendor lead time exceeds required delivery timeframe for urgent items');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 📦 Inventory Management Rules

### Stock Level Business Rules
```typescript
// Business Rule: Stock Movement Validation
function validateStockMovement(movement: StockMovement): ValidationResult {
  const errors: string[] = [];
  const currentStock = getCurrentStockLevel(movement.itemId);
  
  // Rule: Stock-out validation for outbound movements
  if (movement.type === 'out' && movement.quantity > currentStock) {
    errors.push('Insufficient stock for outbound movement');
  }
  
  // Rule: Negative stock prevention
  if (movement.type === 'out' && (currentStock - movement.quantity) < 0) {
    errors.push('Movement would result in negative stock');
  }
  
  // Rule: Maximum single movement quantity
  if (movement.quantity > 10000) {
    errors.push('Single movement cannot exceed 10,000 units');
  }
  
  // Rule: Reason required for adjustments
  if (movement.type === 'adjustment' && !movement.reason) {
    errors.push('Reason is required for inventory adjustments');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Business Rule: Reorder Point Calculation
function calculateReorderPoint(item: InventoryItem): number {
  const averageDailyUsage = calculateAverageDailyUsage(item.id);
  const leadTimeDays = getVendorLeadTime(item.preferredVendorId) || 7;
  const safetyStockDays = getSafetyStockDays(item.category) || 3;
  
  return Math.ceil(averageDailyUsage * (leadTimeDays + safetyStockDays));
}

// Business Rule: Physical Count Variance Tolerance
function validatePhysicalCountVariance(countItem: PhysicalCountItem): ValidationResult {
  const errors: string[] = [];
  const variance = Math.abs(countItem.countedQty - countItem.expectedQty);
  const variancePercentage = (variance / countItem.expectedQty) * 100;
  
  // Rule: High variance threshold (requires investigation)
  if (variancePercentage > 10) {
    errors.push('Variance exceeds 10% threshold - investigation required');
  }
  
  // Rule: Complete variance (100% difference)
  if (variancePercentage >= 100) {
    errors.push('Complete variance detected - requires manager approval');
  }
  
  // Rule: Expensive item variance (stricter tolerance)
  const item = getInventoryItem(countItem.itemId);
  if (item && item.averageCost.amount > 100 && variancePercentage > 5) {
    errors.push('High-value item variance exceeds 5% tolerance');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 🤝 Vendor Management Rules

### Vendor Performance Calculation
```typescript
// Business Rule: Vendor Rating Calculation
function calculateVendorRating(vendor: Vendor, metrics: VendorPerformanceMetrics): number {
  const weights = {
    qualityScore: 0.3,     // 30% weight
    deliveryScore: 0.25,   // 25% weight
    serviceScore: 0.2,     // 20% weight
    priceScore: 0.15,      // 15% weight
    complianceScore: 0.1   // 10% weight
  };
  
  const weightedScore = 
    (metrics.qualityScore * weights.qualityScore) +
    (metrics.deliveryScore * weights.deliveryScore) +
    (metrics.serviceScore * weights.serviceScore) +
    (metrics.priceScore * weights.priceScore) +
    (metrics.complianceScore * weights.complianceScore);
  
  return Math.round(weightedScore * 10) / 10; // Round to 1 decimal place
}

// Business Rule: Vendor Status Management
function evaluateVendorStatus(vendor: Vendor): VendorStatus {
  const rating = vendor.rating || 0;
  const daysSinceLastOrder = getDaysBetween(vendor.lastOrderDate, new Date());
  const totalOrders = vendor.totalOrders || 0;
  
  // Rule: Automatic suspension for poor performance
  if (rating < 3.0 && totalOrders > 5) {
    return 'suspended';
  }
  
  // Rule: Inactive status for no recent orders
  if (daysSinceLastOrder > 365) {
    return 'inactive';
  }
  
  // Rule: Active status criteria
  if (rating >= 3.5 || (rating >= 3.0 && totalOrders < 5)) {
    return 'active';
  }
  
  return 'under-review';
}

// Business Rule: Vendor Payment Terms Validation
function validateVendorPaymentTerms(vendor: Vendor): ValidationResult {
  const errors: string[] = [];
  
  // Rule: Payment terms must be defined
  if (!vendor.paymentTerms) {
    errors.push('Payment terms are required');
    return { isValid: false, errors };
  }
  
  // Rule: Credit limit validation
  if (vendor.creditLimit && vendor.creditLimit.amount <= 0) {
    errors.push('Credit limit must be positive if specified');
  }
  
  // Rule: Payment terms format validation
  const validTerms = ['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', '2/10 Net 30'];
  if (!validTerms.includes(vendor.paymentTerms)) {
    errors.push(`Payment terms must be one of: ${validTerms.join(', ')}`);
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 👥 User Access Control Rules

### Role-Based Permission Matrix
```typescript
// Business Rule: Permission Checking System
const PERMISSION_MATRIX: Record<string, Record<string, boolean>> = {
  'staff': {
    'view-own-pr': true,
    'create-pr': true,
    'view-department-inventory': true,
    'view-pricing': false,
    'approve-pr': false,
    'manage-vendors': false,
    'system-admin': false
  },
  'department-manager': {
    'view-own-pr': true,
    'view-department-pr': true,
    'create-pr': true,
    'approve-department-pr': true,
    'view-department-inventory': true,
    'view-department-budget': true,
    'view-pricing': true,
    'approve-pr': true,
    'manage-vendors': false,
    'system-admin': false
  },
  'financial-manager': {
    'view-all-pr': true,
    'create-pr': true,
    'approve-pr': true,
    'view-all-inventory': true,
    'view-all-budgets': true,
    'view-pricing': true,
    'manage-budgets': true,
    'manage-vendors': true,
    'system-admin': false
  },
  'purchasing-staff': {
    'view-all-pr': true,
    'create-pr': true,
    'approve-pr': true,
    'create-po': true,
    'manage-vendors': true,
    'view-all-inventory': true,
    'view-pricing': true,
    'process-grn': true,
    'system-admin': false
  },
  'counter': {
    'view-inventory': true,
    'process-stock-movements': true,
    'process-physical-counts': true,
    'view-grn': true,
    'create-inventory-pr': true,
    'view-pricing': false,
    'system-admin': false
  },
  'chef': {
    'view-recipe-ingredients': true,
    'create-ingredient-pr': true,
    'view-ingredient-inventory': true,
    'view-ingredient-costs': true,
    'manage-recipes': true,
    'view-consumption-reports': true,
    'system-admin': false
  }
};

// Business Rule: Dynamic Permission Checking
function hasPermission(user: User, permission: string, resource?: any): boolean {
  const role = user.context.currentRole.name;
  const basePermission = PERMISSION_MATRIX[role]?.[permission] || false;
  
  if (!basePermission) return false;
  
  // Apply context-specific rules
  switch (permission) {
    case 'view-department-pr':
      return resource?.department === user.context.currentDepartment.id;
      
    case 'approve-department-pr':
      return resource?.department === user.context.currentDepartment.id && 
             resource?.totalAmount?.amount <= 5000; // Department limit
      
    case 'view-department-inventory':
      return resource?.location === user.context.currentLocation.id;
      
    case 'view-ingredient-costs':
      return role === 'chef' && resource?.category === 'ingredients';
      
    default:
      return basePermission;
  }
}
```

### Context Switching Rules
```typescript
// Business Rule: User Context Validation
function validateContextSwitch(user: User, newContext: Partial<UserContext>): ValidationResult {
  const errors: string[] = [];
  
  // Rule: Role must be available to user
  if (newContext.currentRole) {
    const hasRole = user.availableRoles.some(role => role.id === newContext.currentRole.id);
    if (!hasRole) {
      errors.push('User does not have access to selected role');
    }
  }
  
  // Rule: Department must be available to user
  if (newContext.currentDepartment) {
    const hasDepartment = user.availableDepartments.some(dept => dept.id === newContext.currentDepartment.id);
    if (!hasDepartment) {
      errors.push('User does not have access to selected department');
    }
  }
  
  // Rule: Location must be available to user
  if (newContext.currentLocation) {
    const hasLocation = user.availableLocations.some(loc => loc.id === newContext.currentLocation.id);
    if (!hasLocation) {
      errors.push('User does not have access to selected location');
    }
  }
  
  // Rule: Role-specific context restrictions
  if (newContext.currentRole?.name === 'counter') {
    // Counter staff restricted to warehouse/storage locations
    const location = newContext.currentLocation || user.context.currentLocation;
    if (location && !['warehouse', 'storage'].includes(location.type)) {
      errors.push('Counter staff can only access warehouse and storage locations');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 💰 Financial Business Rules

### Budget Control Rules
```typescript
// Business Rule: Budget Allocation and Control
function validateBudgetAllocation(
  budgetCode: string, 
  amount: Money, 
  department: string,
  period: string
): ValidationResult {
  const errors: string[] = [];
  const budget = getBudget(budgetCode, period);
  
  if (!budget) {
    errors.push('Budget code not found for specified period');
    return { isValid: false, errors };
  }
  
  // Rule: Budget must be active
  if (budget.status !== 'active') {
    errors.push('Budget is not active for the specified period');
  }
  
  // Rule: Department access validation
  if (budget.departments.length > 0 && !budget.departments.includes(department)) {
    errors.push('Department does not have access to this budget');
  }
  
  // Rule: Available budget check
  const availableAmount = budget.totalAmount - budget.spentAmount - budget.committedAmount;
  if (amount.amount > availableAmount) {
    errors.push(`Insufficient budget. Available: ${formatCurrency(availableAmount)}, Requested: ${formatCurrency(amount.amount)}`);
  }
  
  // Rule: Monthly spending limit
  const monthlySpent = getMonthlySpending(budgetCode, department);
  const monthlyLimit = budget.monthlyLimit || (budget.totalAmount / 12);
  
  if ((monthlySpent + amount.amount) > monthlyLimit) {
    errors.push(`Monthly spending limit exceeded. Limit: ${formatCurrency(monthlyLimit)}, Current + Requested: ${formatCurrency(monthlySpent + amount.amount)}`);
  }
  
  return { isValid: errors.length === 0, errors };
}

// Business Rule: Currency Conversion Rules
function validateCurrencyConversion(
  fromCurrency: string,
  toCurrency: string,
  amount: number
): ValidationResult {
  const errors: string[] = [];
  
  // Rule: Same currency validation
  if (fromCurrency === toCurrency) {
    return { isValid: true, errors }; // No conversion needed
  }
  
  // Rule: Supported currency check
  const supportedCurrencies = getSupportedCurrencies();
  if (!supportedCurrencies.includes(fromCurrency)) {
    errors.push(`Source currency ${fromCurrency} is not supported`);
  }
  
  if (!supportedCurrencies.includes(toCurrency)) {
    errors.push(`Target currency ${toCurrency} is not supported`);
  }
  
  // Rule: Exchange rate availability
  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  if (!exchangeRate) {
    errors.push(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
  }
  
  // Rule: Exchange rate freshness (not older than 24 hours)
  if (exchangeRate) {
    const rateAge = getDaysBetween(exchangeRate.lastUpdated, new Date());
    if (rateAge > 1) {
      errors.push('Exchange rate is outdated (older than 24 hours)');
    }
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 📋 Document Workflow Rules

### Status Progression Rules
```typescript
// Business Rule: Document Status Transitions
const DOCUMENT_STATUS_TRANSITIONS: Record<string, Record<DocumentStatus, DocumentStatus[]>> = {
  'PurchaseRequest': {
    'draft': ['inprogress', 'void'],
    'inprogress': ['approved', 'rejected', 'void'],
    'approved': ['converted', 'void'],
    'rejected': ['draft', 'void'],
    'converted': [],
    'void': []
  },
  'PurchaseOrder': {
    'draft': ['sent', 'void'],
    'sent': ['acknowledged', 'void'],
    'acknowledged': ['partially-received', 'completed', 'cancelled'],
    'partially-received': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
    'void': []
  },
  'GoodsReceivedNote': {
    'draft': ['completed', 'void'],
    'completed': [],
    'void': []
  }
};

// Business Rule: Status Transition Validation
function validateStatusTransition(
  documentType: string,
  currentStatus: DocumentStatus,
  newStatus: DocumentStatus,
  user: User
): ValidationResult {
  const errors: string[] = [];
  
  // Rule: Check if transition is allowed
  const allowedTransitions = DOCUMENT_STATUS_TRANSITIONS[documentType]?.[currentStatus] || [];
  if (!allowedTransitions.includes(newStatus)) {
    errors.push(`Invalid status transition from ${currentStatus} to ${newStatus}`);
  }
  
  // Rule: User permission check for status changes
  const requiredPermission = getStatusChangePermission(documentType, newStatus);
  if (!hasPermission(user, requiredPermission)) {
    errors.push(`Insufficient permissions to change status to ${newStatus}`);
  }
  
  return { isValid: errors.length === 0, errors };
}

// Business Rule: Document Numbering
function generateDocumentNumber(documentType: string, department?: string): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const prefix = {
    'PurchaseRequest': 'PR',
    'PurchaseOrder': 'PO',
    'GoodsReceivedNote': 'GRN',
    'Invoice': 'INV'
  }[documentType];
  
  const sequence = getNextSequenceNumber(documentType, year, month);
  const departmentCode = department ? `-${department.substring(0, 3).toUpperCase()}` : '';
  
  return `${prefix}-${year}${month}-${String(sequence).padStart(4, '0')}${departmentCode}`;
}
```

---

## 🔧 Data Validation Rules

### Field Validation Rules
```typescript
// Business Rule: Email Validation
function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const errors: string[] = [];
  
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }
  
  // Rule: Block disposable email domains
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (domain && disposableDomains.includes(domain)) {
    errors.push('Disposable email addresses are not allowed');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Business Rule: Phone Number Validation
function validatePhoneNumber(phone: string, country: string = 'US'): ValidationResult {
  const errors: string[] = [];
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  const validationRules = {
    'US': { length: 10, pattern: /^\d{10}$/ },
    'UK': { length: 11, pattern: /^\d{11}$/ },
    'AU': { length: 10, pattern: /^\d{10}$/ }
  };
  
  const rule = validationRules[country];
  if (!rule) {
    errors.push('Country not supported for phone validation');
    return { isValid: false, errors };
  }
  
  if (digitsOnly.length !== rule.length) {
    errors.push(`Phone number must be ${rule.length} digits for ${country}`);
  }
  
  if (!rule.pattern.test(digitsOnly)) {
    errors.push('Invalid phone number format');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Business Rule: Date Range Validation
function validateDateRange(startDate: string, endDate: string): ValidationResult {
  const errors: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  // Rule: Start date must be before end date
  if (start >= end) {
    errors.push('Start date must be before end date');
  }
  
  // Rule: Date range cannot exceed 1 year
  const daysDifference = getDaysBetween(start, end);
  if (daysDifference > 365) {
    errors.push('Date range cannot exceed 365 days');
  }
  
  // Rule: Start date cannot be more than 30 days in the past
  const daysFromNow = getDaysBetween(start, now);
  if (daysFromNow > 30) {
    errors.push('Start date cannot be more than 30 days in the past');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## ✅ Business Rules Implementation Checklist

### Procurement Rules (Required)
- [ ] Purchase request approval routing logic
- [ ] PR item validation and calculation rules
- [ ] Budget validation and allocation checks
- [ ] PO creation and vendor validation
- [ ] GRN processing and variance rules

### Inventory Rules (Required)
- [ ] Stock movement validation
- [ ] Reorder point calculations
- [ ] Physical count variance tolerance
- [ ] Inventory aging and valuation rules
- [ ] Location-based stock controls

### Vendor Rules (Required)
- [ ] Vendor performance rating calculation
- [ ] Status management rules
- [ ] Payment terms validation
- [ ] Capability and compliance checks
- [ ] Contract and pricing rules

### User Access Rules (Required)
- [ ] Role-based permission matrix
- [ ] Context switching validation
- [ ] Department and location access controls
- [ ] Action-level permission checks
- [ ] Approval authority limits

### Financial Rules (Required)
- [ ] Budget control and allocation
- [ ] Currency conversion rules
- [ ] Spending limit enforcement
- [ ] Cost center validation
- [ ] Financial approval thresholds

### Document Workflow Rules (Required)
- [ ] Status progression validation
- [ ] Document numbering schemes
- [ ] Approval workflow routing
- [ ] Version control rules
- [ ] Archive and retention policies

### Data Validation Rules (Required)
- [ ] Field format validation
- [ ] Range and limit checks
- [ ] Cross-field validation
- [ ] Business rule constraints
- [ ] Data integrity checks

---

**Next Steps**: Implement [Development Environment Setup](../09-setup-guide/environment.md) to configure the development environment for Carmen ERP recreation.

*This business logic documentation provides complete implementation guidance for all business rules, validation logic, and workflow patterns in Carmen ERP.*