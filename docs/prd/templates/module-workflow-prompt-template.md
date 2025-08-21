# Module Workflow Prompt Template

Create a comprehensive Module Workflow Document (MWD) for [MODULE NAME] based strictly on actual source code implementation and observable user workflows. Follow these guidelines:

## CRITICAL REQUIREMENTS:

1. **Source Code Analysis**: Document ONLY workflows that exist in actual implementation - verify all process flows are functional
2. **Process-Focused Language**: Use clear workflow terminology, NO code snippets, component names, or technical routing references
3. **User Journey Mapping**: Describe complete end-to-end workflows from user perspective
4. **Role-Based Workflows**: Organize processes by user permissions and workflow participation
5. **Complete Traceability**: Every workflow step must be verifiable through actual system navigation and behavior

## DOCUMENT STRUCTURE:

### Header Section (Required):
```yaml
Title: [Module Name] Workflow Specification
Module: [Module Name]
Business Process: [Primary Business Process Area]
Workflow Scope: [Process Coverage - e.g., Request to Approval, Order to Delivery]
Version: 1.0
Date: [Current Date]
Status: Based on Source Code Analysis & User Journey Testing

Workflow Overview (Required):

- Business Purpose: What business processes this module supports
- Primary Stakeholders: Who participates in these workflows
- Process Boundaries: Where workflows start and end
- Integration Points: How this module connects to other business processes
- Success Metrics: How workflow effectiveness is measured

Content Sections (Adapt as needed):

Core Workflow Processes:

- Primary Process Flow: Main happy path from start to completion
- Alternative Paths: Different routes users can take to achieve goals
- Decision Points: Where workflows branch based on conditions or choices
- Process Triggers: What initiates different workflow sequences

User Role Workflows:

- [Role 1] Process Journey: Complete workflow from this user's perspective
- [Role 2] Process Journey: Different workflow path for this role
- [Role 3] Process Journey: Additional role-specific process flows
- Cross-Role Handoffs: How work moves between different users

Standard Operating Procedures:

- Daily Operations: Regular workflow patterns users follow
- Batch Processing: How multiple items are handled together
- Periodic Activities: Weekly, monthly, or scheduled workflow processes
- Maintenance Workflows: How users manage and update information

Approval & Review Workflows:

- Submission Process: How items enter the approval pipeline
- Review Stages: Sequential steps in the approval process
- Approval Authority: Who can approve at different stages and thresholds
- Rejection Handling: How disapproved items are managed and resubmitted

Exception & Error Workflows:

- Error Recovery: How users handle and correct workflow problems
- Override Procedures: When and how standard workflows can be bypassed
- Escalation Paths: How issues are elevated to higher authority
- Fallback Processes: Alternative workflows when standard paths fail

Status & State Management:

- Workflow States: Different stages items progress through
- Status Transitions: How and when items move between states
- State Dependencies: What must happen before status changes are allowed
- End States: How workflows conclude successfully or unsuccessfully

Data Flow Within Workflows:

- Information Requirements: What data is needed at each workflow stage
- Data Validation Points: Where information is checked and verified
- Information Handoffs: How data moves between workflow participants
- Audit Trail: How workflow history and changes are tracked

Integration Workflows:

- External System Interactions: How workflows connect to other systems
- Data Import/Export: How information flows in and out of the module
- Synchronization Points: When workflows wait for external confirmations
- Cross-Module Dependencies: How this workflow affects other business areas

Timing & Scheduling Workflows:

- Time-Sensitive Processes: Workflows with deadlines or time constraints
- Scheduled Activities: Automated or recurring workflow processes
- Deadline Management: How the system handles time-critical workflows
- Calendar Integration: How workflows align with business calendars

Performance & Efficiency Workflows:

- Bulk Operations: How multiple items are processed efficiently
- Automated Steps: Where the system performs workflow actions automatically
- Optimization Points: Where workflows can be streamlined or accelerated
- Bottleneck Management: How workflow congestion is handled
```

## WRITING STYLE:

### DO:
- ✅ Use process language: "User submits request for review" not "form submission triggers validation"
- ✅ Describe user actions: "Manager reviews and approves purchase request" not "onClick handler updates status"
- ✅ Map complete journeys: "From initial request → review → approval → fulfillment"
- ✅ Explain workflow logic: "High-value requests require additional approval layer" not "if amount > threshold"
- ✅ Focus on business outcomes: "Approved requests proceed to vendor processing" not "status change triggers next component"
- ✅ Include timing elements: "Standard approval takes 2-3 business days" not "async function processes request"

### DON'T:
- ❌ Include code snippets, function names, or routing logic
- ❌ Reference technical component names (use "Approval Screen" not "ApprovalModal component")
- ❌ Show implementation details or state management
- ❌ Add workflow steps that don't exist in actual user experience
- ❌ Use developer terminology or technical process descriptions

## WORKFLOW DOCUMENTATION PATTERNS:

### Linear Workflows:
```
Start → Step 1 → Step 2 → Step 3 → Complete
"User creates request → Submits for review → Manager approves → System processes order"
```

### Branching Workflows:
```
Start → Decision Point → Path A → Complete
                     → Path B → Complete
"Purchase request → Amount check → Under $1000: Auto-approve → Order placed
                               → Over $1000: Manager review → Approval/rejection"
```

### Parallel Workflows:
```
Start → Process A → Sync Point → Complete
     → Process B → 
"Order creation → Inventory check → Both complete → Order confirmation
              → Credit verification →"
```

### Iterative Workflows:
```
Start → Process → Review → Pass: Complete
               → Fail: Return to Process
"Document creation → Review cycle → Approved: Publish
                                → Needs changes: Return for revision"
```

## VERIFICATION CHECKLIST:

Before finalizing, ensure:
- Every workflow step can be performed by actually using the system
- All decision points and branching logic are clearly documented
- Role-based access and capabilities are accurately reflected
- Integration points with other modules are identified
- Error conditions and recovery procedures are included
- Timing and performance expectations are realistic
- Document serves as operational guide for process training

## EXAMPLE WORKFLOW TRANSFORMATIONS:

Instead of: "useEffect triggers API call on status change"
Write: "When request status changes, system automatically notifies relevant stakeholders"

Instead of: "handleApproval() updates database and redirects"
Write: "Manager approval immediately updates request status and advances to next process stage"

Instead of: "React Router navigates to next component"
Write: "User proceeds to order confirmation screen after successful payment processing"

Instead of: "useState manages form validation"
Write: "System prevents incomplete requests from entering the approval workflow"

## WORKFLOW ANALYSIS FRAMEWORK:

### Process Efficiency:
- How quickly workflows complete under normal conditions
- Where delays typically occur and why
- Opportunities for automation or streamlining

### User Experience:
- How intuitive workflows are for different user types
- Where users commonly get confused or make errors
- Support mechanisms for complex workflow steps

### Business Impact:
- How workflows support business objectives
- Cost and time implications of different process paths
- Quality and compliance considerations

### System Performance:
- How workflows handle high transaction volumes
- Where system limitations affect workflow speed
- Integration reliability and error handling

## DELIVERABLE STRUCTURE:

The completed module workflow specification should function as:
- **Process Manual**: Step-by-step guide for users to follow workflows
- **Training Resource**: Foundation for educating users on proper procedures
- **Optimization Tool**: Baseline for identifying workflow improvement opportunities
- **Integration Guide**: Reference for understanding how this module fits into broader business processes
- **Quality Assurance**: Standard for validating that workflows meet business requirements

## WORKFLOW VISUALIZATION GUIDELINES:

While this template focuses on written documentation, consider including:
- Simple flowcharts showing major decision points
- Timeline diagrams for time-sensitive processes
- Role responsibility matrices showing who does what
- State transition diagrams for complex approval workflows

This approach ensures workflow documentation that accurately reflects current system capabilities while providing clear operational guidance for all workflow participants and stakeholders.