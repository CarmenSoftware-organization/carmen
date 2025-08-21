# Purchase Request Creation & Management - Action/Wired Flow

**Module**: Procurement  
**Function**: Purchase Requests  
**Document**: Action/Wired Flow Specification  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Production Implementation Documented

---

## 📋 Flow Overview

This document defines the complete user interaction flows for Purchase Request management, including creation workflows, approval processes, and status management. The implementation includes sophisticated workflow decision engines and RBAC-based access control.

### Current Implementation Status: ✅ **PRODUCTION-READY**

**Source Files**:
- Workflow Engine: `/services/workflow-decision-engine.ts` (Priority-based approval logic)
- RBAC Service: `/services/rbac-service.ts` (Role-based access control)
- Main Flow Controller: `/PRDetailPage.tsx` (600+ lines of workflow logic)

---

## 🎯 Primary User Flows

### Flow Categories
1. **Creation Flows**: New PR creation, template usage, bulk import
2. **Approval Flows**: Multi-stage approval with decision logic
3. **Management Flows**: Edit, clone, delete, export operations  
4. **Workflow Flows**: Status transitions and stage management

---

## 🚀 Flow 1: Purchase Request Creation Flow

### 1.1 Standard PR Creation Flow

```
START: Purchase Requests List Page
    ↓
[Click "New Purchase Request" Dropdown]
    ↓
[Select "Create Blank PR"]
    ↓
NAVIGATE: /procurement/purchase-requests/new?mode=add
    ↓
[PR Creation Form Loads]
    ├── Header Information Entry
    ├── Items Addition (Line-by-line)
    ├── Budget Validation
    └── Attachment Upload
    ↓
[Submit Button Clicked]
    ↓
VALIDATION: Form Validation & Business Rules Check
    ├── SUCCESS → Save PR → Navigate to View Mode
    └── FAILURE → Show Validation Errors → Return to Form
    ↓
END: PR Created Successfully
```

### 1.2 Template-Based Creation Flow

```
START: Purchase Requests List Page
    ↓
[Click "New Purchase Request" Dropdown]
    ↓
[Select Template Option]
    ├── Office Supplies
    ├── IT Equipment  
    ├── Kitchen Supplies
    └── Maintenance
    ↓
NAVIGATE: /procurement/purchase-requests/new?mode=add&template={type}
    ↓
[Pre-populated Form Loads]
    ├── Template Items Auto-loaded
    ├── Default Categories Applied
    └── Standard Approval Workflow Assigned
    ↓
[User Modifications (Optional)]
    ├── Edit Items
    ├── Adjust Quantities/Prices
    └── Add Custom Items
    ↓
[Submit Template-Based PR]
    ↓
END: Template PR Created
```

### 1.3 Creation Flow State Management

**Form State Tracking**:
- `mode` parameter: "add" | "edit" | "view"
- `isAddMode`: Boolean flag for creation mode
- `isDirty`: Tracks unsaved changes
- `validationErrors`: Real-time validation feedback

**Navigation Logic**:
```typescript
// Route Construction
const createRoute = `/procurement/purchase-requests/new?mode=add`
const templateRoute = `${createRoute}&template=${templateType}`

// State Management
const [formData, setFormData] = useState(defaultPRData)
const [isDirty, setIsDirty] = useState(false)
```

---

## ⚡ Flow 2: Purchase Request Approval Workflow

### 2.1 Multi-Stage Approval Flow

```
START: PR Created (Status: Draft)
    ↓
STAGE 1: Requester Submission
    [Requester Reviews & Submits]
    ├── canSubmit: true
    ├── Action: "Submit for Approval" 
    └── Next: Department Head Approval
    ↓
STAGE 2: Department Head Approval  
    [Department Head Reviews PR]
    ├── APPROVE → Next: Finance Approval (if required)
    ├── REJECT → Status: Rejected, End Flow
    └── SEND BACK → Return to Requester
    ↓
STAGE 3: Finance Approval (Budget-Dependent)
    [Finance Manager Reviews PR]
    ├── APPROVE → Status: Approved, Ready for PO Creation  
    ├── REJECT → Status: Rejected, End Flow
    └── SEND BACK → Return to Previous Stage
    ↓
STAGE 4: Purchasing Processing
    [Purchasing Staff Converts to PO]
    ├── CREATE PO → Status: Converted to PO
    └── CLOSE PR → Status: Completed
    ↓
END: PR Workflow Complete
```

### 2.2 Workflow Decision Engine Logic

**Priority-Based Decision Making**:
```typescript
// Workflow Decision Priority
1. All Rejected → Submit & Reject (Destructive Button)
2. Any Review → Submit & Return (Orange Button)  
3. Any Pending → Review Required (Disabled Button)
4. Any Approved → Submit & Approve (Green Button)
5. No Items → No Items (Disabled Button)
```

**Decision Engine Implementation**:
```typescript
interface WorkflowDecision {
  canSubmit: boolean;
  action: 'approve' | 'reject' | 'return' | 'blocked';
  buttonText: string;
  buttonVariant: 'default' | 'destructive' | 'outline';
  buttonColor?: string;
  reason: string;
  itemsSummary: ItemStatusSummary;
}

// Example Decision Logic
if (summary.rejected === summary.total && summary.total > 0) {
  return {
    canSubmit: true,
    action: 'reject',
    buttonText: 'Submit & Reject',
    buttonVariant: 'destructive',
    reason: 'All items have been rejected'
  };
}
```

### 2.3 Item-Level Approval Flow

```
PR Items List View
    ↓
[Select Item for Review]
    ↓
ITEM STATUS OPTIONS:
    ├── APPROVE → Mark item as approved
    ├── REJECT → Mark item as rejected  
    ├── REVIEW → Mark item for review
    └── PENDING → Keep item in pending state
    ↓
[Overall PR Status Calculation]
    ├── Workflow Decision Engine Analyzes All Items
    ├── Determines Available Actions
    └── Updates Submit Button State
    ↓
[Submit Workflow Decision]
    ├── Priority Logic Applied
    ├── Next Stage Determined
    └── Notifications Sent
    ↓
END: Item-Level Approval Complete
```

---

## 🔐 Flow 3: Role-Based Access Control (RBAC) Flow

### 3.1 User Permission Evaluation Flow

```
USER ACCESSES PR
    ↓
[Load User Profile & Role]
    ↓
RBAC SERVICE EVALUATION:
    ├── Get Role Configuration
    ├── Check Workflow Stage Assignment  
    ├── Evaluate PR Ownership/Department
    └── Calculate Available Actions
    ↓
PERMISSION MATRIX APPLIED:
    ├── canView: boolean
    ├── canEdit: boolean  
    ├── canDelete: boolean
    ├── canApprove: boolean
    ├── canReject: boolean
    └── availableActions: WorkflowAction[]
    ↓
UI ELEMENTS RENDERED:
    ├── Show/Hide Action Buttons
    ├── Enable/Disable Form Fields
    ├── Display Appropriate Status
    └── Filter Available Data
    ↓
END: Permission-Based UI Displayed
```

### 3.2 Role-Specific Action Flows

**Requester Role Flow**:
```
LOGIN as Requester
    ↓
DASHBOARD ACCESS:
    ├── widgetAccess: { myPR: true, myApproval: false, myOrder: false }
    ├── visibilitySetting: 'department'  
    └── Can only see own department PRs
    ↓
PR ACTIONS AVAILABLE:
    ├── CREATE: New PRs
    ├── EDIT: Own PRs in Draft status
    ├── SUBMIT: Submit for approval
    └── VIEW: Own submitted PRs
    ↓
END: Requester Actions Complete
```

**Department Head Role Flow**:
```
LOGIN as Department Head
    ↓
DASHBOARD ACCESS:
    ├── widgetAccess: { myPR: true, myApproval: true, myOrder: false }
    ├── visibilitySetting: 'department'
    └── Can see all department PRs + approval queue
    ↓
PR ACTIONS AVAILABLE:
    ├── VIEW: All department PRs
    ├── APPROVE: PRs assigned to department head stage
    ├── REJECT: PRs in approval queue
    ├── SEND BACK: Return PRs to requesters
    └── COMMENT: Add approval comments
    ↓
END: Department Head Actions Complete
```

**Finance Manager Role Flow**:
```
LOGIN as Finance Manager  
    ↓
DASHBOARD ACCESS:
    ├── widgetAccess: { myPR: true, myApproval: true, myOrder: false }
    ├── visibilitySetting: 'full'
    └── Can see all PRs across locations
    ↓
PR ACTIONS AVAILABLE:
    ├── VIEW: All PRs system-wide
    ├── APPROVE: PRs requiring finance approval
    ├── REJECT: High-value PRs
    ├── BUDGET REVIEW: Budget compliance checking
    └── FINAL APPROVAL: Budget-dependent approval
    ↓
END: Finance Manager Actions Complete
```

---

## 🔄 Flow 4: PR Status Management Flow

### 4.1 Status Transition Flow

```
PR LIFECYCLE STATUS FLOW:

DRAFT → SUBMITTED → DEPARTMENT_APPROVAL → FINANCE_APPROVAL → APPROVED → CONVERTED_TO_PO → COMPLETED
   ↓         ↓              ↓                    ↓             ↓            ↓              ↓
[EDIT]   [SEND_BACK]   [SEND_BACK]        [SEND_BACK]     [CLONE]      [CLOSE]       [ARCHIVE]
   ↓         ↓              ↓                    ↓             ↓            ↓              ↓
DRAFT    SUBMITTED      SUBMITTED           DEPARTMENT     APPROVED    COMPLETED     ARCHIVED
          ↓              ↓                 _APPROVAL        ↓
      [REJECT]       [REJECT]                 ↓           [REJECT]
          ↓              ↓                 [REJECT]          ↓
      REJECTED       REJECTED                 ↓          REJECTED
                                          REJECTED
```

### 4.2 Status-Specific Action Availability

**Status: DRAFT**
```
Available Actions:
├── EDIT: Full editing capabilities
├── DELETE: Can delete draft PRs
├── SUBMIT: Submit for approval workflow
└── SAVE_AS_TEMPLATE: Save as reusable template
```

**Status: SUBMITTED** 
```
Available Actions (Role-Dependent):
├── VIEW: All users can view
├── APPROVE: Assigned approvers only
├── REJECT: Assigned approvers only  
├── SEND_BACK: Return to previous stage
└── COMMENT: Add approval comments
```

**Status: APPROVED**
```
Available Actions:
├── VIEW: Read-only access
├── CONVERT_TO_PO: Create purchase order
├── CLONE: Create similar PR
└── CLOSE: Mark as completed
```

### 4.3 Workflow Stage Management

**Stage Assignment Logic**:
```typescript
// Dynamic Stage Assignment
const getAssignedApprovers = (pr: PurchaseRequest, stage: WorkflowStage) => {
  switch (stage.name) {
    case 'departmentHeadApproval':
      return getDepartmentHeads(pr.department);
    case 'financeApproval':  
      return getFinanceManagers(pr.budgetCategory);
    case 'generalManagerApproval':
      return getGeneralManagers(pr.location);
    default:
      return [];
  }
};
```

**Stage Transition Logic**:
```typescript
// Next Stage Calculation
const getNextWorkflowStage = (currentStage: string, pr: PurchaseRequest) => {
  const stageFlow = {
    'requester': 'departmentHeadApproval',
    'departmentHeadApproval': pr.totalAmount > FINANCE_THRESHOLD 
      ? 'financeApproval' : 'completed',
    'financeApproval': pr.totalAmount > GM_THRESHOLD 
      ? 'generalManagerApproval' : 'completed',
    'generalManagerApproval': 'completed'
  };
  
  return stageFlow[currentStage] || 'completed';
};
```

---

## 📱 Flow 5: User Interface Interaction Flows

### 5.1 List View Navigation Flow

```
PURCHASE REQUESTS LIST PAGE
    ↓
USER INTERACTIONS:
    ├── [Click PR Number] → Navigate to View Mode
    ├── [Click Edit Button] → Navigate to Edit Mode  
    ├── [Click Actions Menu] → Show Action Dropdown
    ├── [Select Multiple PRs] → Enable Bulk Actions
    └── [Click New PR Button] → Show Creation Options
    ↓
NAVIGATION OUTCOMES:
    ├── VIEW: /procurement/purchase-requests/{id}?mode=view
    ├── EDIT: /procurement/purchase-requests/{id}?mode=edit
    ├── BULK: Show bulk action modal
    └── CREATE: /procurement/purchase-requests/new?mode=add
    ↓
END: Navigation Complete
```

### 5.2 Detail View Mode Switching Flow

```
PR DETAIL PAGE LOAD
    ↓
URL PARAMETER ANALYSIS:
    ├── mode=view → Read-only mode
    ├── mode=edit → Edit mode (permission-dependent)
    └── mode=add → Creation mode
    ↓
PERMISSION CHECK:
    ├── Can User Access This Mode?
    ├── Does User Have Required Permissions?
    └── Is PR in Editable Status?
    ↓
UI RENDERING:
    ├── SUCCESS → Render Requested Mode
    └── FAILURE → Redirect to Appropriate Mode
    ↓
MODE-SPECIFIC ACTIONS:
    ├── VIEW → Display-only, Show Workflow Actions
    ├── EDIT → Form Fields, Save/Cancel Buttons
    └── ADD → Empty Form, Create Workflow
    ↓
END: Mode-Appropriate Interface Displayed
```

### 5.3 Form Interaction Flow

```
PR FORM INTERFACE
    ↓
FIELD INTERACTIONS:
    ├── [Basic Information] → Auto-save on blur
    ├── [Items Tab] → Real-time item management
    ├── [Budget Tab] → Budget validation & tracking
    ├── [Attachments] → File upload management
    └── [Comments] → Activity logging
    ↓
VALIDATION TRIGGERS:
    ├── Field Level → On blur validation
    ├── Form Level → On submit validation
    ├── Business Rules → Real-time rule checking
    └── Budget Constraints → Automatic budget verification
    ↓
SAVE OPERATIONS:
    ├── AUTO-SAVE → Periodic save in edit mode
    ├── MANUAL SAVE → User-initiated save
    ├── SUBMIT → Workflow submission
    └── SAVE AS DRAFT → Draft preservation
    ↓
END: Form Interaction Complete
```

---

## 🔔 Flow 6: Notification & Communication Flows

### 6.1 Approval Notification Flow

```
WORKFLOW ACTION TRIGGERED
    ↓
NOTIFICATION ENGINE:
    ├── Identify Affected Users
    ├── Determine Notification Type
    ├── Generate Message Content
    └── Select Delivery Channels
    ↓
NOTIFICATION DISPATCH:
    ├── EMAIL → Approvers and stakeholders
    ├── IN-APP → Dashboard notifications
    ├── SMS → Critical approvals (if configured)
    └── SYSTEM LOG → Audit trail entry
    ↓
RECIPIENT ACTIONS:
    ├── [Click Email Link] → Direct to PR
    ├── [View In-App] → Show notification details
    └── [Take Action] → Approve/Reject/Comment
    ↓
END: Notification Flow Complete
```

### 6.2 Escalation Flow

```
PR PENDING APPROVAL
    ↓
ESCALATION TIMER CHECK:
    ├── Time Since Last Action > Threshold
    ├── Business Rules Evaluation
    └── Escalation Rules Application
    ↓
ESCALATION TRIGGERS:
    ├── REMINDER → Send reminder to current approver
    ├── ESCALATE → Move to higher authority
    ├── AUTO-APPROVE → Automatic approval (if configured)
    └── TIMEOUT → Mark as overdue
    ↓
ESCALATION ACTIONS:
    ├── Notification to Manager
    ├── Update Workflow Stage
    ├── Log Escalation Event
    └── Adjust Approval Thresholds
    ↓
END: Escalation Complete
```

---

## 🔍 Flow 7: Error Handling & Recovery Flows

### 7.1 Validation Error Flow

```
USER SUBMITS FORM/ACTION
    ↓
VALIDATION CHECKS:
    ├── Client-Side Validation
    ├── Server-Side Validation  
    ├── Business Rule Validation
    └── Permission Validation
    ↓
ERROR DETECTION:
    ├── Field-Level Errors → Highlight invalid fields
    ├── Form-Level Errors → Show form error summary
    ├── Business Rule Violations → Display rule violation messages
    └── Permission Errors → Show access denied message
    ↓
ERROR PRESENTATION:
    ├── Inline Field Errors → Red border + error text
    ├── Toast Notifications → Temporary error messages
    ├── Modal Dialogs → Critical error interruptions
    └── Status Messages → Persistent error states
    ↓
RECOVERY ACTIONS:
    ├── Fix Validation Errors → Re-enable submit
    ├── Request Permission → Escalate access request
    ├── Retry Operation → Auto-retry transient errors
    └── Cancel Operation → Return to safe state
    ↓
END: Error Recovery Complete
```

### 7.2 Network/System Error Flow

```
SYSTEM ERROR DETECTED
    ↓
ERROR CLASSIFICATION:
    ├── Network Timeout → Retry operation
    ├── Server Error → Show system error message
    ├── Permission Denied → Redirect to access request
    └── Data Conflict → Show conflict resolution
    ↓
ERROR RESPONSE:
    ├── AUTO-RETRY → Automatic retry with backoff
    ├── USER RETRY → Show retry button to user
    ├── FALLBACK MODE → Enable offline/degraded functionality
    └── GRACEFUL FAILURE → Save work and show error
    ↓
RECOVERY OPTIONS:
    ├── Retry Immediately → Re-attempt operation
    ├── Retry Later → Queue operation for later
    ├── Save Draft → Preserve user work
    └── Contact Support → Escalate to system administrator
    ↓
END: System Error Handled
```

---

## 📊 Performance & Optimization Flows

### 8.1 Data Loading Flow Optimization

```
PAGE LOAD REQUEST
    ↓
OPTIMIZATION STRATEGIES:
    ├── Code Splitting → Load only required components
    ├── Lazy Loading → Load components on demand
    ├── Data Prefetching → Preload likely-needed data
    └── Caching → Use cached data when available
    ↓
LOADING SEQUENCE:
    ├── Critical Path → Essential UI and data first
    ├── Secondary Data → Non-critical data second
    ├── Enhancement Data → Nice-to-have data last
    └── Background Updates → Update data in background
    ↓
PERFORMANCE MONITORING:
    ├── Load Time Tracking → Monitor page load performance
    ├── User Experience → Track user interaction metrics
    ├── Error Tracking → Monitor and log errors
    └── Performance Optimization → Continuous improvement
    ↓
END: Optimized Loading Complete
```

---

## 📈 Analytics & Tracking Flows

### 9.1 User Behavior Tracking Flow

```
USER INTERACTION EVENT
    ↓
EVENT CAPTURE:
    ├── Click Events → Button clicks, link clicks
    ├── Form Events → Field changes, submissions
    ├── Navigation Events → Page changes, route changes
    └── Workflow Events → Status changes, approvals
    ↓
EVENT PROCESSING:
    ├── Event Enrichment → Add context and metadata
    ├── Event Validation → Verify event integrity
    ├── Event Filtering → Remove sensitive data
    └── Event Batching → Batch events for efficiency
    ↓
ANALYTICS STORAGE:
    ├── Real-time Analytics → Immediate processing
    ├── Historical Analytics → Long-term storage
    ├── Aggregated Metrics → Summary statistics
    └── Custom Reporting → Business-specific analysis
    ↓
END: Analytics Tracking Complete
```

---

*This comprehensive flow documentation captures all major user interactions, system workflows, and business processes for the Purchase Request management system, providing detailed technical guidance for implementation and maintenance.*