# Purchase Request Split Items Feature: Requirements Document

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Draft - Pending Implementation  
**Author**: System Analysis Team  

This document outlines the product requirements, technical specifications, and functional design for the Purchase Request (PR) Split Items feature, enabling users to divide existing PRs into multiple independent requests for optimized workflow management.

## 1. Product Overview & Business Objectives

### 1.1. Feature Definition

The PR Split Items feature allows users to select specific items from an existing Purchase Request and create a new PR containing those items, while removing them from the original PR. This enables independent workflow progression for different groups of items based on urgency, vendor, department, or approval requirements.

### 1.2. Business Justification

**Primary Business Problems Solved:**
- **Mixed Priority Items**: Items with different urgency levels delay critical procurements
- **Vendor Dependencies**: Single PR with multiple vendors creates procurement bottlenecks  
- **Approval Efficiency**: Items requiring different approval paths block overall PR progression
- **Department Flexibility**: Cross-departmental PRs need independent processing
- **Workflow Optimization**: Enable parallel processing of related but separate procurement needs

### 1.3. Success Metrics & KPIs

**Key Performance Indicators:**
- 30% reduction in average PR approval cycle time
- 25% increase in urgent item processing speed
- 40% reduction in workflow bottlenecks
- 95% user satisfaction with split functionality
- 100% data integrity maintenance across split operations

**Usage Metrics:**
- Number of PRs split per month
- Split success rate (completed vs. failed operations)
- User adoption rate across different roles
- Time saved per split operation

## 2. Business Logic & Rules

### 2.1. Split Eligibility Rules

**PR-Level Requirements:**
- Original PR must be in "Draft", "Submitted", or early workflow stages
- PR must contain at least 2 items (minimum 1 item remains after split)
- User must have "Create PR" permissions for the relevant department
- Original PR cannot be in "Completed", "Cancelled", or "Rejected" status

**Item-Level Requirements:**
- Selected items must be in compatible workflow statuses
- Items cannot be partially received or in active purchase orders
- Items with dependencies (parent-child relationships) must be split together
- Financial commitments (approved budgets) must be transferable

### 2.2. Data Integrity Rules

**Original PR Changes:**
- Remove selected items from original PR
- Recalculate totals and budget allocations
- Update item counts and summary information
- Maintain audit trail of split operation
- Preserve remaining workflow state and approvals

**New PR Creation:**
- Inherit basic metadata from original PR (requestor, department, location)
- Generate new PR reference number
- Set initial workflow status based on item statuses
- Create audit trail linking to original PR
- Initialize new approval workflow if required

### 2.3. Financial Rules

**Budget Allocation:**
- Transfer budget allocations proportionally to new PR
- Update budget tracking for both PRs
- Maintain financial approval status where applicable
- Recalculate tax, discount, and total amounts
- Preserve currency and exchange rate information

### 2.4. Workflow Impact Rules

**Approval Status Preservation:**
- Approved items retain approval status in new PR
- Pending items maintain pending status
- Rejected items cannot be split (business rule)
- Review items can be split with review status

## 3. User Experience Specification

### 3.1. User Interface Requirements

**Split Items Modal Interface:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Split Items to New PR                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Selected Items (5 of 12 items):                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☑ Office Chair - Qty: 10 - $1,200.00                   │ │
│ │ ☑ Desk Lamp - Qty: 5 - $150.00                         │ │
│ │ ☑ Printer Paper - Qty: 100 - $250.00                   │ │
│ │ ☑ Monitor Stand - Qty: 8 - $320.00                     │ │
│ │ ☑ Mouse Pad - Qty: 20 - $80.00                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ New PR Details:                                             │
│ Description: [Office Equipment - Urgent Items        ]     │
│ Priority:    [● Normal ○ High ○ Urgent             ]     │
│ Notes:       [Items split for expedited processing   ]     │
│              [                                      ]     │
│                                                             │
│ Financial Summary:                                          │
│ Total Value: $2,000.00                                     │
│ Budget Impact: ✓ Sufficient budget available               │
│                                                             │
│ [Cancel]                           [Split Items] [Create PR] │
└─────────────────────────────────────────────────────────────┘
```

**Required Modal Elements:**
- Selected items preview with remove option
- New PR basic information form
- Financial impact summary
- Validation feedback area
- Progress indicator during operation
- Success/error message display

### 3.2. User Interaction Flow

**Step 1: Item Selection**
1. User selects items in ItemsTab using checkboxes
2. System validates selection eligibility
3. Split button becomes enabled when valid items selected

**Step 2: Split Configuration**
1. User clicks "Split" button
2. Split Items Modal opens with selected items preview
3. User provides new PR description and optional details
4. System displays financial impact and validation results

**Step 3: Split Execution**
1. User confirms split operation
2. System performs validation and creates new PR
3. Success message displays with new PR number
4. User navigation options presented

**Step 4: Post-Split Navigation**
1. Option to view new PR
2. Option to remain on original PR
3. Clear indication of split operation completion

### 3.3. Error Handling & User Feedback

**Validation Errors:**
- "Insufficient permissions to create PR"
- "Selected items cannot be split due to workflow status"
- "Budget allocation exceeds available limit"
- "Original PR must retain at least one item"

**System Errors:**
- "Split operation failed - no changes made"
- "Network error - please try again"
- "Concurrent modification detected - please refresh"

**Success Messages:**
- "Items successfully split to PR #[Number]"
- "New PR created and ready for processing"
- "Original PR updated with remaining items"

## 4. Technical Requirements

### 4.1. API Specifications

**Split Items Endpoint:**
```typescript
POST /api/purchase-requests/{prId}/split

Request Body:
{
  selectedItemIds: string[];
  newPrData: {
    description: string;
    priority?: string;
    notes?: string;
  };
}

Response:
{
  success: boolean;
  newPrId: string;
  newPrNumber: string;
  originalPrUpdated: boolean;
  message: string;
}
```

**Validation Endpoint:**
```typescript
POST /api/purchase-requests/{prId}/validate-split

Request Body:
{
  selectedItemIds: string[];
}

Response:
{
  valid: boolean;
  errors: string[];
  warnings: string[];
  budgetImpact: {
    totalValue: number;
    availableBudget: number;
    sufficient: boolean;
  };
}
```

### 4.2. Data Model Requirements

**PR Split History:**
```typescript
interface PRSplitHistory {
  id: string;
  originalPrId: string;
  newPrId: string;
  splitDate: Date;
  splitBy: string;
  itemIds: string[];
  reason?: string;
  totalValue: number;
}
```

**Enhanced PR Interface:**
```typescript
interface PurchaseRequest {
  // ... existing fields
  splitHistory?: PRSplitHistory[];
  relatedPRs?: {
    type: 'split_from' | 'split_to';
    prId: string;
    prNumber: string;
    relationship: string;
  }[];
}
```

### 4.3. Component Architecture

**New Components Required:**
- `SplitItemsModal.tsx` - Main split interface modal
- `SplitItemsPreview.tsx` - Selected items display component
- `SplitValidationResults.tsx` - Validation feedback component
- `SplitSuccessMessage.tsx` - Post-split success notification

**Modified Components:**
- `ItemsTab.tsx` - Enhanced `handleBulkSplit()` function
- `PRDetailPage.tsx` - Integration with split functionality
- `PRListPage.tsx` - Display split relationship indicators

### 4.4. State Management

**Split Operation State:**
```typescript
interface SplitState {
  isModalOpen: boolean;
  selectedItems: PurchaseRequestItem[];
  validationResults: SplitValidationResult;
  isValidating: boolean;
  isSplitting: boolean;
  splitResult?: SplitResult;
  errors: string[];
}
```

## 5. RBAC & Security Requirements

### 5.1. Permission Matrix

| Role | Can Split PR | Can Split All Items | View Financial Impact | Notes |
|------|-------------|-------------------|-------------------|-------|
| Requestor | ✓ (Own PRs) | ✓ | ✗ | Can split PRs they created |
| Department Manager | ✓ | ✓ | ✓ | Can split departmental PRs |
| Financial Manager | ✓ | ✓ | ✓ | Full split permissions |
| Purchasing Staff | ✓ | ✓ | ✓ | Can split any PR |
| System Administrator | ✓ | ✓ | ✓ | Full system access |

### 5.2. Security Controls

**Access Validation:**
- Verify user has "Create PR" permission
- Validate user can access original PR
- Ensure department-level access controls
- Check item-level permissions

**Data Protection:**
- Encrypt sensitive financial data in transit
- Maintain audit trail for all split operations
- Implement transaction rollback on failures
- Log all split attempts and outcomes

### 5.3. Audit Trail Requirements

**Required Audit Information:**
- Split operation timestamp
- User who performed split
- Original PR and new PR identifiers
- Items moved between PRs
- Financial impact details
- Reason for split (if provided)

## 6. Implementation Specifications

### 6.1. Development Phases

**Phase 1: Core Infrastructure (Week 1-2)**
- Create SplitItemsModal component
- Implement basic validation logic
- Develop API endpoints
- Set up state management

**Phase 2: Business Logic (Week 3-4)**
- Implement split validation rules
- Create PR creation logic
- Develop financial calculations
- Add workflow integration

**Phase 3: User Experience (Week 5-6)**
- Enhance modal interface
- Add error handling
- Implement success flows
- Create navigation logic

**Phase 4: Testing & Refinement (Week 7-8)**
- Unit and integration testing
- User acceptance testing
- Performance optimization
- Documentation completion

### 6.2. Testing Requirements

**Unit Tests:**
- Split validation logic
- Financial calculations
- Permission checking
- Error handling

**Integration Tests:**
- API endpoint functionality
- Database transaction integrity
- Workflow system integration
- RBAC enforcement

**User Acceptance Tests:**
- End-to-end split scenarios
- Cross-role permission testing
- Error recovery testing
- Performance benchmarking

### 6.3. Performance Considerations

**Response Time Targets:**
- Split validation: < 500ms
- Split operation: < 2000ms
- Modal load time: < 300ms
- Navigation after split: < 1000ms

**Scalability Requirements:**
- Support up to 100 items per split
- Handle 50 concurrent split operations
- Maintain performance with 10,000+ PRs
- Support multi-tenant architecture

## 7. Risk Assessment & Mitigation

### 7.1. Technical Risks

**Data Integrity Risk:**
- **Risk**: Transaction failure leaves PRs in inconsistent state
- **Mitigation**: Implement atomic transactions with rollback capability

**Performance Risk:**
- **Risk**: Large PRs cause split operation timeouts
- **Mitigation**: Implement chunked processing and progress indicators

**Concurrency Risk:**
- **Risk**: Multiple users modifying same PR during split
- **Mitigation**: Implement optimistic locking and conflict resolution

### 7.2. Business Risks

**User Adoption Risk:**
- **Risk**: Users don't understand or use split functionality
- **Mitigation**: Comprehensive training and intuitive UI design

**Workflow Disruption Risk:**
- **Risk**: Splits create approval process confusion
- **Mitigation**: Clear audit trails and relationship indicators

**Budget Control Risk:**
- **Risk**: Splits circumvent budget approval processes
- **Mitigation**: Maintain budget tracking and approval requirements

## 8. Success Criteria & Acceptance

### 8.1. Functional Acceptance Criteria

**Must Have:**
- ✓ Users can select and split items from existing PRs
- ✓ New PRs are created with proper metadata inheritance
- ✓ Original PRs are correctly updated after split
- ✓ Financial calculations are accurate and preserved
- ✓ Audit trails are complete and accessible
- ✓ RBAC controls are properly enforced

**Should Have:**
- ✓ Modal interface is intuitive and responsive
- ✓ Error messages are clear and actionable
- ✓ Performance meets specified targets
- ✓ Split relationships are clearly indicated
- ✓ Bulk operations work efficiently

### 8.2. Non-Functional Acceptance Criteria

**Performance:**
- Split operations complete within 2 seconds for typical PRs
- Modal loads within 300ms
- System supports 50 concurrent split operations

**Usability:**
- 95% of users can complete split operation without assistance
- Error recovery rate > 90%
- User satisfaction score > 4.5/5

**Reliability:**
- 99.9% split operation success rate
- Zero data loss incidents
- Complete transaction consistency

## 9. Future Enhancements

### 9.1. Advanced Features (Phase 2)

**Smart Split Suggestions:**
- AI-powered item grouping recommendations
- Vendor-based automatic splitting
- Urgency-based split suggestions

**Bulk Split Operations:**
- Split multiple PRs simultaneously
- Template-based splitting patterns
- Scheduled splits based on criteria

**Advanced Workflow Integration:**
- Custom approval paths for split PRs
- Conditional split rules
- Integration with external systems

### 9.2. Reporting & Analytics

**Split Analytics Dashboard:**
- Split operation metrics
- Workflow efficiency improvements
- User behavior analysis
- Financial impact tracking

**Audit Reporting:**
- Comprehensive split history reports
- Compliance tracking
- Performance metrics
- User activity summaries

---

**Document Approval:**
- [ ] Business Stakeholder Review
- [ ] Technical Architecture Review  
- [ ] Security Review
- [ ] UI/UX Review
- [ ] Final Approval for Implementation

**Next Steps:**
1. Stakeholder review and approval
2. Technical design document creation
3. Development sprint planning
4. Implementation timeline finalization