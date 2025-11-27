# Purchase Request Creation Screen - Interface Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Screen**: New PR Creation Interface  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Production Implementation Documented

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 📋 Screen Overview

The Purchase Request Creation Screen provides a streamlined interface for creating new purchase requests with template support, real-time validation, and intelligent defaults. The interface supports both blank creation and template-based creation workflows.

### Current Implementation Status: ✅ **PRODUCTION-READY**

**Source Files**:
- Creation Page: `/new-pr/page.tsx` (Wrapper with loading states)
- Main Controller: `PRDetailPage.tsx` (Handles add mode)
- Form Component: `PRForm.tsx` (Core form fields)
- Template System: Integrated in dropdown selection

---

## 🎯 Creation Flow Architecture

### Entry Points
1. **From PR List**: "New Purchase Request" dropdown → Template selection
2. **Direct Navigation**: `/procurement/purchase-requests/new-pr?mode=add`
3. **Template-based**: `/procurement/purchase-requests/new-pr?mode=add&template={type}`

### Mode Detection & State
```typescript
const searchParams = useSearchParams();
const isAddMode = searchParams?.get("mode") === "add";
const templateType = searchParams?.get("template");
```

---

## 🖥️ Interface Layout

### Page Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to PR List                                               │
├─────────────────────────────────────────────────────────────────┤
│ Create New Purchase Request                                     │
│ [Template: Office Supplies ▼]                    [Save Draft]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  PR FORM INTERFACE                              │
│                  (Embedded PRForm)                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                  ITEMS SECTION                                  │
│                  [+ Add Item]                                   │
├─────────────────────────────────────────────────────────────────┤
│ [Save as Draft] [Submit for Approval] [Cancel]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Loading States
```typescript
function LoadingFallback() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-12 w-3/4" />     // Title skeleton
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />    // Form field skeletons
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-32 w-full" />   // Content skeletons
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
```

---

## 📋 Form Interface Details

### **Core PR Form** (`PRForm.tsx`)

#### Field Layout (4-Column Grid)
```
┌─────────────────────────────────────────────────────────────────┐
│ 📄 PR Number      │ 📅 Date          │ 💼 Type         │ 💰 Est Total │
│ [PR-2024-XXX]     │ [01/15/2024]     │ [General ▼]     │ [$0.00]      │
├─────────────────────────────────────────────────────────────────┤
│ 📄 Description (Full Width)                                    │
│ [Kitchen equipment for Grand Ballroom catering event...]        │
└─────────────────────────────────────────────────────────────────┘
```

#### Field Specifications

**PR Number Field**:
```typescript
Input Properties:
- id: "refNumber"
- name: "refNumber"  
- type: "text"
- disabled: true (auto-generated)
- value: "PR-2024-XXX" (placeholder until save)
- icon: FileIcon
```

**Date Field**:
```typescript
Input Properties:
- id: "date"
- name: "date"
- type: "date"
- required: true
- defaultValue: new Date().toISOString().split('T')[0]
- validation: Cannot be future dated
- icon: CalendarIcon
```

**PR Type Field**:
```typescript
Select Properties:
- id: "type"
- required: true
- options: Object.values(PRType)
- defaultValue: Based on template or PRType.GeneralPurchase
- onChange: May trigger business rule changes
- icon: BriefcaseIcon

PRType Options:
- GeneralPurchase: "General Purchase"
- MarketList: "Market List"
- AssetPurchase: "Asset Purchase" 
- CapitalExpenditure: "Capital Expenditure"
```

**Estimated Total Field**:
```typescript
Input Properties:
- id: "estimatedTotal"
- name: "estimatedTotal"
- type: "number"
- step: "0.01"
- min: "0"
- placeholder: "0.00"
- validation: Positive numbers only
- icon: DollarSignIcon
```

**Description Field**:
```typescript
Textarea Properties:
- id: "description"
- name: "description"
- required: true
- minLength: 10
- maxLength: 500
- rows: 3 (height: 80px)
- placeholder: "Describe the purpose and items for this purchase request..."
- icon: FileIcon
```

#### Form State Management
```typescript
interface FormState {
  formData: PurchaseRequest;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseRequest>>;
  isDirty: boolean;           // Tracks unsaved changes
  isValid: boolean;           // Form validation status
  validationErrors: string[]; // Validation error messages
  isSubmitting: boolean;      // Submission state
}

// Event Handlers
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  setIsDirty(true);
};

const handleSelectChange = (name: keyof PurchaseRequest) => (value: string) => {
  setFormData(prev => ({ ...prev, [name]: value }));
  setIsDirty(true);
};
```

---

## 🏷️ Template System Integration

### Template Selection Workflow
```
Template Dropdown Selected → Pre-populate Form Fields → Load Template Items → Apply Business Rules
```

### Template Types & Defaults
```typescript
interface PRTemplate {
  type: PRType;
  defaultDescription: string;
  preloadedItems: TemplateItem[];
  defaultVendors?: string[];
  budgetCategory?: string;
  approvalWorkflow?: WorkflowStage[];
}

const templates: Record<string, PRTemplate> = {
  "office-supplies": {
    type: PRType.GeneralPurchase,
    defaultDescription: "Office supplies and stationery requirements",
    preloadedItems: [
      { description: "Copy Paper (Letter)", quantity: 10, unit: "RM" },
      { description: "Black Ink Cartridge", quantity: 5, unit: "EA" },
      { description: "Blue Pens", quantity: 20, unit: "EA" }
    ],
    budgetCategory: "Office Expenses"
  },
  
  "it-equipment": {
    type: PRType.AssetPurchase,
    defaultDescription: "IT equipment and hardware requirements",
    preloadedItems: [
      { description: "Laptop Computer", quantity: 1, unit: "EA" },
      { description: "Monitor 24-inch", quantity: 1, unit: "EA" },
      { description: "Wireless Mouse", quantity: 1, unit: "EA" }
    ],
    budgetCategory: "IT Assets"
  },
  
  "kitchen-supplies": {
    type: PRType.GeneralPurchase,
    defaultDescription: "Kitchen supplies and food service equipment",
    preloadedItems: [
      { description: "Commercial Mixer", quantity: 1, unit: "EA" },
      { description: "Stainless Steel Bowls", quantity: 6, unit: "SET" },
      { description: "Chef Knives", quantity: 3, unit: "EA" }
    ],
    budgetCategory: "Kitchen Equipment"
  }
};
```

### Template Application Logic
```typescript
const applyTemplate = (templateType: string) => {
  const template = templates[templateType];
  if (template) {
    setFormData(prev => ({
      ...prev,
      type: template.type,
      description: template.defaultDescription,
      budgetCategory: template.budgetCategory,
      items: template.preloadedItems.map((item, index) => ({
        ...item,
        id: `template-${index}`,
        lineNumber: index + 1,
        unitPrice: 0,
        totalPrice: 0
      }))
    }));
  }
};
```

---

## ➕ Items Creation Interface

### New Item Row Component
```
┌─────────────────────────────────────────────────────────────────┐
│ Item #001                                          [Remove ×]    │
├─────────────────────────────────────────────────────────────────┤
│ Description: [Professional Stand Mixer - 20 Qt Capacity]        │
│ Qty: [2] Unit: [EA ▼] Unit Price: [$1,250.00] Total: [$2,500.00]│
│ Vendor: [ABC Restaurant Supply ▼] Delivery: [02/01/2024]        │
│ Budget Code: [FB-EQUIP-001 ▼] Notes: [For catering events]      │
└─────────────────────────────────────────────────────────────────┘
```

### Item Validation Rules
```typescript
interface ItemValidation {
  description: {
    required: true;
    minLength: 5;
    maxLength: 200;
  };
  quantity: {
    required: true;
    min: 0.0001;
    max: 9999.9999;
    decimals: 4;
  };
  unitPrice: {
    required: true;
    min: 0;
    max: 999999.99;
    decimals: 2;
  };
  unit: {
    required: true;
    validValues: UnitOfMeasure[];
  };
  deliveryDate: {
    optional: true;
    minDate: new Date();
    validation: "Cannot be past date";
  };
}
```

### Dynamic Item Management
```typescript
const [items, setItems] = useState<PurchaseRequestItem[]>([]);

const addItem = () => {
  const newItem: PurchaseRequestItem = {
    id: `item-${Date.now()}`,
    lineNumber: items.length + 1,
    description: "",
    quantity: 1,
    unit: "EA",
    unitPrice: 0,
    totalPrice: 0,
    currency: "USD"
  };
  setItems(prev => [...prev, newItem]);
};

const removeItem = (itemId: string) => {
  setItems(prev => prev.filter(item => item.id !== itemId));
  // Recalculate line numbers
  setItems(prev => prev.map((item, index) => ({ 
    ...item, 
    lineNumber: index + 1 
  })));
};
```

---

## 💰 Real-time Calculations

### Total Calculation Engine
```typescript
const calculateTotals = (items: PurchaseRequestItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = 0.08; // 8% tax rate
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  
  return {
    subTotalPrice: subtotal,
    taxAmount: taxAmount,
    totalAmount: totalAmount,
    netAmount: totalAmount,
    baseSubTotalPrice: subtotal, // Assuming USD base
    baseTotalAmount: totalAmount
  };
};

// Update form data when items change
useEffect(() => {
  const totals = calculateTotals(items);
  setFormData(prev => ({ ...prev, ...totals }));
}, [items]);
```

---

## ✅ Validation & Business Rules

### Real-time Form Validation
```typescript
interface ValidationState {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  businessRuleViolations: string[];
  warnings: string[];
}

const validateForm = (formData: PurchaseRequest): ValidationState => {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];
  
  // Required field validation
  if (!formData.description || formData.description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  }
  
  if (!formData.type) {
    errors.type = "PR Type is required";
  }
  
  if (formData.items.length === 0) {
    errors.items = "At least one item is required";
  }
  
  // Business rule validation
  if (formData.totalAmount > 50000 && formData.type !== PRType.CapitalExpenditure) {
    warnings.push("Large purchase amount may require Capital Expenditure type");
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    fieldErrors: errors,
    businessRuleViolations: [],
    warnings
  };
};
```

### Visual Validation Feedback
```typescript
// Error styling for invalid fields
const getFieldClassName = (fieldName: string, hasError: boolean) => {
  return cn(
    "default-field-classes",
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-500"
  );
};

// Error message display
{fieldErrors.description && (
  <p className="text-sm text-red-600 mt-1">
    {fieldErrors.description}
  </p>
)}
```

---

## 🔄 Auto-save & Draft Management

### Auto-save Implementation
```typescript
const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout>();

// Auto-save every 30 seconds when form is dirty
useEffect(() => {
  if (isDirty && !isSubmitting) {
    const timer = setTimeout(() => {
      saveDraft();
    }, 30000);
    
    setAutoSaveTimer(timer);
    return () => clearTimeout(timer);
  }
}, [isDirty, formData]);

const saveDraft = async () => {
  try {
    const draftData = {
      ...formData,
      status: DocumentStatus.Draft,
      lastSaved: new Date()
    };
    
    // API call to save draft
    await api.savePRDraft(draftData);
    setIsDirty(false);
    
    // Show save confirmation
    toast.success("Draft saved automatically");
  } catch (error) {
    console.error("Auto-save failed:", error);
    toast.error("Auto-save failed");
  }
};
```

### Draft Recovery
```typescript
// Check for existing drafts on page load
useEffect(() => {
  const checkForDraft = async () => {
    try {
      const drafts = await api.getUserDrafts();
      if (drafts.length > 0) {
        setShowDraftRecovery(true);
        setAvailableDrafts(drafts);
      }
    } catch (error) {
      console.error("Draft check failed:", error);
    }
  };
  
  checkForDraft();
}, []);
```

---

## 🎯 Action Buttons & Navigation

### Button Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [← Cancel] [💾 Save as Draft] [📤 Submit for Approval] [⚙️ Settings] │
└─────────────────────────────────────────────────────────────────┘
```

### Button States & Logic
```typescript
interface ButtonStates {
  canSaveDraft: boolean;      // Always true if form has content
  canSubmit: boolean;         // True if validation passes
  isSubmitting: boolean;      // True during submission
  canCancel: boolean;         // Always true
}

// Save as Draft
const handleSaveDraft = async () => {
  try {
    setIsSubmitting(true);
    const draftData = { ...formData, status: DocumentStatus.Draft };
    const result = await api.createPR(draftData);
    
    toast.success("Draft saved successfully");
    router.push(`/procurement/purchase-requests/${result.id}?mode=edit`);
  } catch (error) {
    toast.error("Failed to save draft");
  } finally {
    setIsSubmitting(false);
  }
};

// Submit for Approval
const handleSubmit = async () => {
  const validation = validateForm(formData);
  if (!validation.isValid) {
    toast.error("Please fix validation errors before submitting");
    return;
  }
  
  try {
    setIsSubmitting(true);
    const submissionData = { 
      ...formData, 
      status: DocumentStatus.Submitted,
      workflowStatus: WorkflowStatus.pending,
      currentWorkflowStage: WorkflowStage.departmentHeadApproval
    };
    
    const result = await api.createPR(submissionData);
    
    toast.success("Purchase request submitted for approval");
    router.push(`/procurement/purchase-requests/${result.id}?mode=view`);
  } catch (error) {
    toast.error("Failed to submit purchase request");
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 📱 Mobile Optimization

### Responsive Form Layout
```css
/* Desktop: 4-column grid */
.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* Tablet: 2-column grid */
@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile: Single column */
@media (max-width: 480px) {
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

### Touch Interactions
- **Minimum Touch Targets**: 44px minimum for all buttons
- **Touch-friendly Dropdowns**: Large tap targets for select options
- **Gesture Support**: Swipe to navigate between sections
- **Keyboard Optimization**: Proper input types for mobile keyboards

---

## 🔐 Security & Permissions

### Creation Permissions
```typescript
// Check if user can create PRs
const canCreatePR = PRRBACService.canPerformAction(user, null, 'create');

if (!canCreatePR) {
  return <AccessDenied />;
}

// Template access control
const availableTemplates = templates.filter(template => 
  user.permissions.includes(`template:${template.type}`)
);
```

### Data Sanitization
```typescript
const sanitizeFormData = (data: PurchaseRequest): PurchaseRequest => {
  return {
    ...data,
    description: DOMPurify.sanitize(data.description),
    items: data.items.map(item => ({
      ...item,
      description: DOMPurify.sanitize(item.description),
      specification: item.specification ? DOMPurify.sanitize(item.specification) : undefined
    }))
  };
};
```

---

## ⚡ Performance Optimization

### Code Splitting & Lazy Loading
```typescript
// Lazy load heavy components
const VendorSelector = lazy(() => import('./VendorSelector'));
const BudgetValidator = lazy(() => import('./BudgetValidator'));

// Dynamic imports for templates
const loadTemplate = async (templateType: string) => {
  const template = await import(`./templates/${templateType}`);
  return template.default;
};
```

### Form Performance
- **Debounced Validation**: Validation runs after user stops typing (300ms delay)
- **Memoized Calculations**: Total calculations memoized with useMemo
- **Optimized Re-renders**: useCallback for event handlers
- **Field-level Updates**: Only re-render changed form fields

---

## ✅ Implementation Status Summary

### ✅ Production-Ready Features:
- **Template-based Creation**: Complete template system with pre-populated items
- **Real-time Validation**: Client-side validation with immediate feedback  
- **Auto-save Functionality**: Automatic draft saving every 30 seconds
- **Dynamic Item Management**: Add/remove items with real-time calculations
- **Responsive Interface**: Mobile-optimized creation flow
- **Loading States**: Comprehensive loading and skeleton states

### 🔄 Integration Ready:
- **API Integration**: Complete REST API integration prepared
- **Permission System**: RBAC-based creation permissions ready
- **Template Engine**: Extensible template system ready for customization
- **Validation Engine**: Business rule validation ready for backend integration

---

*This comprehensive creation screen specification documents the complete new PR creation workflow, demonstrating a sophisticated form interface with template support, real-time validation, and intelligent user experience optimization.*