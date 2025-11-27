# Purchase Request Approval Workflows Business Rules Specification

**Module**: Purchase Request Management  
**Business Domain**: Procurement and Financial Controls  
**Scope**: Purchase Request Approval Workflow Templates and Processing  
**Version**: 1.0  
**Date**: August 14, 2025  
**Status**: Based on Source Code Analysis & System Behavior  

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Business Rules Overview

**Purpose**: These business rules govern the approval workflow processing for purchase requests in a hospitality ERP system, ensuring proper financial controls, budget compliance, and procurement authorization through structured approval templates.

**Scope**: Covers all purchase request approval processes from submission through final authorization, including workflow type selection, routing logic, approval authority validation, and status management across different procurement scenarios.

**Authority**: Business stakeholders include Finance Managers, Department Heads, General Managers, Purchasing Staff, and Procurement Coordinators who own and enforce these approval requirements.

**Implementation Status**: All core workflow rules are fully enforced through system validation. Advanced routing rules for emergency procurement and complex multi-department scenarios are partially implemented.

**Dependencies**: These rules depend on User Role Management for approval authority, Budget Management for financial limits, and Vendor Management for procurement validations.

## Data Integrity Rules

### Required Information

**Purchase Request Creation Requirements**
- All purchase requests must include requestor identification, department assignment, and location specification before workflow processing can begin
- Purchase request type must be selected from predefined workflow templates (General Purchase, Market List, Asset Purchase, Service Request) to determine appropriate approval routing
- Delivery date and description are mandatory for all requests to ensure proper planning and tracking
- Department and job code assignments are required for budget allocation and responsibility tracking

**Workflow Assignment Validation**
- System must validate that selected PR type corresponds to an active workflow template before allowing submission
- All workflow stages must have assigned approval roles before requests can progress to those stages
- Budget code and allocation information is required for financial approval stages in General Purchase and Asset Purchase workflows

### Data Format Standards

**Reference Number Generation**
- General Purchase requests use pattern "GP-{YYYY}-{00000}" with automatic sequential numbering
- Market List requests use pattern "ML-{YYYY}-{00000}" format for tracking and identification
- Asset Purchase requests follow specialized numbering for capital expenditure tracking
- Service requests maintain separate numbering sequence for non-tangible procurement

**Currency and Financial Data**
- All monetary amounts must include currency specification and exchange rate information
- Budget comparisons require conversion to base currency for validation
- Financial totals must reconcile across all workflow stages and approval levels

### Uniqueness Requirements

**Workflow Instance Management**
- Each purchase request maintains one active workflow instance at any time
- Workflow stage progression must be sequential without skipping required approval steps
- Approval actions cannot be duplicated by the same user within a workflow stage

## Authorization & Access Rules

### Role-Based Permissions

**Requester Role Authority**
- Requesters can create and submit purchase requests within their department and location scope
- Requesters can view status and progress of their own submitted requests
- Requesters cannot approve their own purchase requests regardless of approval authority level
- Requesters can provide additional information and respond to requests for clarification

**Department Head Approval Authority**
- Department Heads can approve requests from their assigned departments up to established financial limits
- Department Head approval is mandatory for requests exceeding 5,000 BAHT in Market List workflows
- Department Heads can delegate approval authority to designated deputies within their department
- Cross-department approvals require specific authorization or escalation to Finance Manager level

**Purchasing Staff Review Authority**
- Purchasing Staff can review technical specifications and vendor compliance for all requests
- Purchasing Staff can request modifications for procurement policy compliance
- Purchasing Staff cannot provide final approval but can recommend approval or rejection
- Purchasing Staff have access to vendor management and pricing validation functions

**Finance Manager Approval Authority**
- Finance Managers can approve requests up to 50,000 BAHT across all departments
- Finance Manager approval is required for all Asset Purchase requests regardless of amount
- Finance Managers can override budget allocation warnings with documented justification
- Finance Managers have authority to modify budget codes and allocation assignments

**General Manager Final Authority**
- General Manager approval is required for all requests exceeding 50,000 BAHT
- General Manager can approve emergency procurement requests outside normal workflow
- General Manager can authorize budget transfers and special allocation adjustments
- General Manager approval is final and cannot be overridden by system or other users

### Approval Thresholds

**Budget-Based Routing**
- Market List requests under 5,000 BAHT bypass Department Head approval and route directly to completion
- General Purchase requests under 10,000 BAHT skip General Manager approval after Finance approval
- Asset Purchase requests always require full approval chain regardless of amount
- Service requests follow standard approval chain with department-specific modifications

**Department-Based Authority**
- Department Heads have unlimited approval authority within their department for requests under 25,000 BAHT
- Cross-department requests exceeding 10,000 BAHT require Finance Manager approval
- Multi-location requests require approval from each affected location's department head
- Emergency requests can bypass normal department approval with General Manager authorization

### Delegation Rules

**Approval Authority Transfer**
- Department Heads can designate temporary approval delegates within their department
- Delegation must be formally recorded in system with effective date ranges
- Delegates cannot exceed the original authority holder's approval limits
- Finance Manager delegation requires General Manager approval for amounts over 25,000 BAHT

**Substitute Approval Processing**
- System automatically routes to designated substitute when primary approver is unavailable
- Substitute assignments must be configured in advance with specific authority limits
- Emergency substitution requires two-level approval for requests over standard limits

## Workflow & Process Rules

### Sequence Requirements

**Mandatory Stage Progression**
- All workflows must begin with Request Creation stage where requestor provides complete information
- Purchasing Review must occur before Department Approval in General Purchase workflows
- Finance Review cannot be bypassed for any request exceeding departmental approval limits
- Completed stage marks workflow conclusion and prevents further modifications

**Stage Completion Validation**
- Each workflow stage must receive explicit approval or rejection before progression
- Incomplete stages block advancement to subsequent approval levels
- System validates that all required fields and attachments are provided before stage completion
- Approval actions must include approver identification and timestamp for audit trail

### Status Progression

**Request Status Management**
- Draft status allows unlimited modifications by requestor before submission
- Submitted status locks basic request information and initiates workflow processing
- InProgress status indicates active review and approval processing
- Completed status indicates successful approval and authorization for procurement
- Rejected status stops workflow processing and returns request to requestor

**Workflow Status Tracking**
- Pending status indicates awaiting action from assigned approver
- Approved status at stage level advances request to next workflow stage
- Rejected status at stage level can return request to previous stage or requestor
- System maintains complete status history for audit and tracking purposes

### Escalation Triggers

**Service Level Agreement Enforcement**
- Request Creation stage must be completed within 4 hours for General Purchase workflows
- Purchasing Review must be completed within 8 hours of assignment
- Department Approval must be completed within 12 hours of routing
- Finance Review must be completed within 24 hours for requests over threshold amounts
- General Manager approval must be completed within 48 hours for high-value requests

**Automatic Escalation Rules**
- SLA violations trigger automatic notification to approver's manager
- Requests pending for 150% of SLA time route to substitute approver if configured
- Critical requests exceeding 200% of SLA time escalate to General Manager attention
- Emergency procurement requests bypass normal SLA requirements with special authorization

## Financial & Business Logic Rules

### Calculation Methods

**Budget Validation Processing**
- System compares request total against available departmental budget allocation
- Hard budget limits prevent approval when allocation is exceeded without override authority
- Soft budget warnings alert approvers when 80% of allocation is reached
- Multi-period budget calculations consider fiscal year allocation and year-to-date spending

**Currency Conversion Standards**
- Foreign currency requests convert to base currency using current exchange rates
- Exchange rate lock prevents rate fluctuation during approval processing
- Multi-currency budgets maintain separate allocation tracking by currency
- Currency conversion fees are calculated and included in total cost analysis

### Pricing Rules

**Market List Pricing Validation**
- Market list items must be validated against current market pricing before approval
- Price deviations exceeding 15% from last purchase price require additional justification
- Vendor pricing must be verified through purchasing staff review process
- Emergency purchases may bypass pricing validation with appropriate authorization

**Asset Purchase Pricing Controls**
- Asset purchases require vendor quotations and competitive bidding for amounts over 25,000 BAHT
- Capital expenditure requests must include depreciation and ROI analysis
- Multi-vendor comparisons are mandatory for standardized asset categories
- Single-source purchases require documented justification and approval

### Budget Controls

**Departmental Budget Enforcement**
- Each department maintains separate budget allocation for operational and capital expenses
- Budget transfers between departments require Finance Manager approval
- Year-end budget reconciliation affects approval authority for final quarter requests
- New fiscal year budgets reset approval thresholds and allocation limits

**Project-Based Budget Management**
- Project-specific requests must reference valid project codes and budget allocations
- Cross-project budget transfers require project manager and Finance Manager approval
- Project completion affects remaining budget availability and approval requirements

## Validation & Quality Rules

### Business Logic Validation

**Workflow Template Selection**
- General Purchase workflows apply to standard operational procurement needs
- Market List workflows are restricted to food and beverage operational requirements
- Asset Purchase workflows are mandatory for capital expenditure requests
- Service Request workflows apply to maintenance, consulting, and professional services

**Approval Authority Validation**
- System validates that assigned approvers have current authority for request amounts
- Approval limits are checked against user role configuration and delegation settings
- Department-specific approval rules override general role-based authority where applicable
- Emergency approval bypasses require appropriate emergency authorization roles

### Cross-Reference Checks

**Vendor and Product Validation**
- Requested items must reference valid vendor relationships and approved product catalogs
- Vendor credit terms and payment conditions affect approval routing and timing
- Product specifications must meet organizational standards and compliance requirements
- New vendor requests require additional approval steps and vendor qualification validation

**Budget and Department Consistency**
- Request department must match approver department authority or require cross-department approval
- Budget codes must be valid for the requesting department and current fiscal period
- Location assignments must align with departmental organizational structure
- Job codes must be active and properly allocated to requesting department

### Completeness Requirements

**Supporting Documentation**
- Asset purchases over 25,000 BAHT require vendor quotations and technical specifications
- Service requests must include scope of work and delivery timeline documentation
- Emergency requests require documented justification for expedited processing
- Foreign vendor requests require compliance documentation and tax verification

**Approval Documentation**
- All approval actions must include approver comments and decision rationale
- Rejection notifications must provide specific reasons and corrective action guidance
- Delegation approvals must reference original authority holder and delegation terms
- Override approvals require detailed justification and secondary authorization

## Temporal & Scheduling Rules

### Timing Constraints

**Business Hours Processing**
- Standard approval workflows operate during business hours (8 AM - 6 PM local time)
- After-hours submissions queue for next business day processing unless marked urgent
- Weekend and holiday processing is limited to emergency procurement requests
- Multi-location requests account for time zone differences in SLA calculations

**Delivery Date Validation**
- Requested delivery dates must allow sufficient time for approval processing and vendor fulfillment
- Rush delivery requests require additional approval for associated premium costs
- Delivery scheduling must consider operational calendar and blackout periods
- Special event procurement has expedited approval processing with compressed SLA

### Date Logic

**Request Date Processing**
- Request creation date establishes baseline for all SLA calculations and audit trails
- Approval dates must be sequential and cannot predate the previous stage completion
- Delivery dates cannot be earlier than minimum procurement lead time plus approval processing time
- Budget period validation ensures requests are processed within appropriate fiscal periods

### Deadline Management

**Critical Date Enforcement**
- Purchase requests for scheduled events must be submitted with adequate lead time
- Month-end budget reconciliation affects approval processing for final week submissions
- Year-end requests have accelerated approval requirements to ensure processing completion
- Contract renewal requests must be submitted 30 days before expiration to ensure continuity

## Exception & Error Handling Rules

### Override Conditions

**Emergency Procurement Authorization**
- General Manager can authorize emergency procurement bypassing normal workflow stages
- Emergency overrides require post-procurement validation and documentation within 48 hours
- Emergency authorization is limited to operational necessity and cannot exceed 100,000 BAHT
- Emergency overrides require Finance Manager counter-signature for amounts over 25,000 BAHT

**Budget Override Authority**
- Finance Manager can approve budget overrides up to 25% above departmental allocation
- Budget overrides require detailed justification and repayment plan documentation
- General Manager approval is required for budget overrides exceeding 25% overage
- End-of-year budget overrides require board approval for amounts over 100,000 BAHT

### Error Recovery

**Workflow Correction Procedures**
- Incorrect workflow routing can be corrected by Finance Manager with approval stage reset
- Data entry errors can be corrected by requestor during Draft status only
- Approval errors require workflow reset to previous stage with approver notification
- System errors causing workflow interruption trigger automatic escalation to system administrator

**Request Modification Process**
- Approved requests cannot be modified without workflow reset and re-approval processing
- Minor modifications (delivery date, comments) may be allowed with approver consent
- Material changes (amount, vendor, specifications) require complete workflow restart
- Modification requests must be documented with change justification and impact analysis

### Warning Thresholds

**Budget and Spending Alerts**
- Budget utilization warnings are generated at 75%, 90%, and 95% of allocation consumption
- Department spending pattern analysis triggers alerts for unusual procurement activity
- Vendor concentration warnings alert when single vendor represents over 40% of department spending
- Price variance alerts trigger when requested pricing exceeds historical averages by 20%

**Approval Timing Warnings**
- SLA approaching notifications are sent at 75% of allocated time
- Overdue approval notifications escalate to approver manager after SLA expiration
- Workflow stagnation alerts trigger after 5 business days without action
- End-of-period processing alerts remind approvers of pending fiscal deadlines

### Fallback Procedures

**Approver Unavailability**
- Automatic delegation to configured substitute approvers after 24 hours of inactivity
- Escalation to higher authority level when all department approvers are unavailable
- Emergency approval committee activation for critical business operations
- General Manager final authority activation when all other approval channels are exhausted

**System Recovery Procedures**
- Workflow state preservation during system maintenance or unexpected downtime
- Manual approval process activation when automated workflow is unavailable
- Post-system recovery validation ensures all pending approvals are properly restored
- Audit trail reconstruction for approvals processed during system recovery periods

## Integration & System Rules

### External System Requirements

**Vendor Management Integration**
- Vendor approval status must be verified before purchase request approval processing
- Vendor credit limits and payment terms affect approval routing and financial controls
- New vendor setup triggers require additional approval steps in purchase request workflow
- Vendor performance ratings influence approval requirements and vendor selection preferences

**Budget System Synchronization**
- Real-time budget balance validation prevents approval of requests exceeding available funds
- Budget commitment updates immediately upon approval to maintain accurate availability
- Monthly budget reconciliation validates approval decisions against actual financial commitments
- Year-end budget closure affects approval processing for the final month of fiscal period

### Data Synchronization Rules

**Multi-System Consistency**
- Purchase request approval status must synchronize with purchase order generation systems
- Approved requests automatically create purchase order drafts for vendor processing
- Inventory management systems receive notification of approved requests for planning purposes
- Financial systems record budget commitments immediately upon workflow approval completion

**Master Data Management**
- Vendor information changes trigger review of pending requests using outdated vendor data
- Product specification updates may require re-approval of pending requests with affected items
- Organizational structure changes (department, location) require workflow route recalculation
- User role changes immediately affect approval authority for pending and future requests

### Conflict Resolution

**Competing Requirements Priority**
- Business operational requirements take precedence over administrative convenience
- Financial controls override operational urgency except for documented emergency situations
- Regulatory compliance requirements cannot be waived regardless of business pressure
- Customer service impact considerations influence priority when approval delays affect guest experience

**System Performance Balance**
- Approval workflow efficiency balanced against financial control requirements
- User experience optimization does not compromise audit trail completeness
- Automated processing preferred where business rules allow consistent application
- Manual intervention available for complex scenarios requiring business judgment

This comprehensive business rules specification ensures that purchase request approval workflows maintain appropriate financial controls while supporting efficient procurement operations in the hospitality environment. All rules are designed to be measurable, enforceable, and auditable through system controls and reporting mechanisms.