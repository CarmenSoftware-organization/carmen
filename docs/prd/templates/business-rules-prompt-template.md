# Business Rules Prompt Template

Create a comprehensive Business Rules Document (BRD) for [FEATURE/MODULE NAME] based strictly on actual source code implementation and observable system behavior. Follow these guidelines:

## CRITICAL REQUIREMENTS:

1. **Source Code Analysis**: Document ONLY business rules that exist in actual implementation - verify all rules are enforced
2. **Business Language Only**: Use clear operational language, NO code snippets, function names, or technical validation references
3. **Behavior-Focused**: Describe what the system enforces and prevents, not how it's technically implemented
4. **Rule-Based Organization**: Structure by business domains and operational contexts
5. **Complete Verification**: Every business rule must be demonstrable through system behavior

## DOCUMENT STRUCTURE:

### Header Section (Required):
```yaml
Title: [Feature/Module Name] Business Rules Specification
Module: [Module Name]
Business Domain: [Primary Business Area]
Scope: [Coverage Area - e.g., Procurement, Inventory, etc.]
Version: 1.0
Date: [Current Date]
Status: Based on Source Code Analysis & System Behavior

Business Rules Overview (Required):

- Purpose: What business operations these rules govern
- Scope: Which processes and workflows are covered
- Authority: Business stakeholders who own these rules
- Implementation Status: Which rules are fully enforced vs. partially implemented
- Dependencies: Other business areas that influence these rules

Content Sections (Adapt as needed):

Data Integrity Rules:

- Required Information: What data must be provided before operations can proceed
- Data Format Standards: How information must be structured (dates, numbers, text)
- Uniqueness Requirements: What information cannot be duplicated in the system
- Data Relationships: How information in different areas must remain consistent

Authorization & Access Rules:

- Role-Based Permissions: Who can perform specific business operations
- Approval Authority: Who can authorize different types of transactions
- Access Restrictions: What information or functions are limited by role
- Delegation Rules: How authority can be transferred between users

Workflow & Process Rules:

- Sequence Requirements: What must happen before other actions can occur
- Status Progression: How items move through different business states
- Approval Thresholds: When transactions require additional authorization
- Escalation Triggers: When processes automatically involve higher authority

Financial & Business Logic Rules:

- Calculation Methods: How amounts, totals, and derived values are determined
- Pricing Rules: How costs and prices are established and validated
- Budget Controls: How spending limits and approvals are enforced
- Currency Handling: How multi-currency transactions are managed

Validation & Quality Rules:

- Business Logic Validation: What combinations of information are acceptable
- Cross-Reference Checks: How system validates information against other data
- Completeness Requirements: When transactions require all supporting information
- Accuracy Standards: How system ensures information meets business standards

Temporal & Scheduling Rules:

- Timing Constraints: When operations can or cannot be performed
- Date Logic: How past, current, and future dates affect operations
- Deadline Management: How the system handles time-sensitive processes
- Recurring Operations: How regular business cycles are managed

Exception & Error Handling Rules:

- Override Conditions: When business rules can be bypassed and by whom
- Error Recovery: How users can correct issues and continue operations
- Warning Thresholds: When system alerts users to potential problems
- Fallback Procedures: What happens when normal processes cannot complete

Integration & System Rules:

- External System Requirements: How business rules are enforced across systems
- Data Synchronization Rules: How information consistency is maintained
- Master Data Management: How authoritative information is established
- Conflict Resolution: How competing business requirements are prioritized
```

## WRITING STYLE:

### DO:
- ✅ Use business operations language: "Purchase orders require vendor approval" not "validation function checks vendor status"
- ✅ Describe enforcement outcomes: "System prevents negative inventory transactions" not "if statement blocks submission"
- ✅ Explain business rationale: "Approval limits ensure financial control" not "role.maxAmount > transaction.total"
- ✅ Focus on constraints: "Only managers can approve budgets over $10,000" not "hasRole('manager') && amount > 10000"
- ✅ Define clear conditions: "When order total exceeds department budget, automatic approval request is sent"
- ✅ Specify consequences: "Incomplete vendor information prevents purchase order creation"

### DON'T:
- ❌ Include code snippets, function names, or validation logic
- ❌ Reference technical field names (use "Purchase Amount" not "transaction.amount")
- ❌ Show implementation details or conditional statements
- ❌ Add business rules that don't exist in source code behavior
- ❌ Use developer terminology or programming concepts

## BUSINESS RULE PATTERNS:

### Mandatory Rules (Must/Must Not):
- "Purchase requests must include vendor information before submission"
- "Users must not modify approved transactions without manager authorization"
- "System must validate budget availability before purchase order creation"

### Conditional Rules (If/Then/When):
- "When order total exceeds $5,000, department manager approval is required"
- "If vendor payment terms change, all pending orders must be reviewed"
- "When inventory falls below minimum levels, automatic reorder alerts are generated"

### Constraint Rules (Cannot/Only):
- "Users cannot approve their own purchase requests"
- "Only procurement staff can modify vendor pricing information"
- "Budget transfers cannot exceed quarterly allocation limits"

### Calculation Rules (How Amounts Are Determined):
- "Order total includes line items plus applicable taxes and shipping"
- "Vendor payment terms determine due dates for invoice processing"
- "Currency conversion uses exchange rates from business day of transaction"

## VERIFICATION CHECKLIST:

Before finalizing, ensure:
- Every business rule can be demonstrated by testing system behavior
- All rule conditions and outcomes are clearly defined
- Business rationale is explained for complex or restrictive rules
- Rule exceptions and override conditions are documented
- Cross-references between related rules are identified
- Current limitations or partial implementations are honestly stated
- Document serves as operational guidance for business users

## EXAMPLE BUSINESS RULE TRANSFORMATIONS:

Instead of: "validateBudgetConstraint() returns false if insufficient funds"
Write: "Purchase requests exceeding available budget are automatically rejected with budget limit notification"

Instead of: "userRole.permissions.includes('approve_purchase')"
Write: "Only users with purchase approval authority can advance purchase requests to approved status"

Instead of: "calculateTotalWithTax(lineItems, taxRate)"
Write: "Order totals automatically include applicable taxes based on vendor location and product categories"

Instead of: "if (item.status === 'pending' && user.department === item.department)"
Write: "Users can only modify purchase requests from their own department while in pending status"

## BUSINESS RULE CATEGORIES:

### Governance Rules:
Define who has authority to make decisions and approve actions

### Operational Rules:
Specify how day-to-day business processes must be conducted

### Financial Rules:
Control monetary transactions and budget management

### Compliance Rules:
Ensure adherence to regulatory and policy requirements

### Quality Rules:
Maintain data accuracy and business process standards

### Security Rules:
Protect sensitive information and system access

## DELIVERABLE PURPOSE:

The completed business rules specification should serve as:
- **Operational Manual**: Guide for users on what they can and cannot do
- **Training Resource**: Foundation for educating new users on system constraints
- **Testing Blueprint**: Basis for validating that system enforces business requirements
- **Audit Documentation**: Evidence of how business controls are implemented
- **Change Management**: Reference for understanding impact of business rule modifications

This approach ensures business rules documentation that accurately reflects current system enforcement while being accessible to business stakeholders who need to understand operational constraints and capabilities.