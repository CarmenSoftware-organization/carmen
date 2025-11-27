# Functional Specification Prompt Template

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
Create a comprehensive Functional Specification Document (FSD) for [FEATURE/COMPONENT NAME] based strictly on actual source code implementation and business requirements. Follow these guidelines:

## CRITICAL REQUIREMENTS:

1. **Source Code Analysis**: Document existing functionality from actual implementation - verify all features exist
2. **Business-Focused Language**: Use clear functional language, NO code snippets, variable names, or technical implementation details  
3. **User Journey Mapping**: Describe complete user workflows and system interactions
4. **Role-Based Functionality**: Define capabilities by user permissions and access levels
5. **Complete Traceability**: Every functional requirement must be verifiable in source code or existing business rules

## DOCUMENT STRUCTURE:

### Header Section (Required):
```yaml
Title: [Feature/Component Name] Functional Specification
Module: [Module Name] 
Function: [Primary Business Function]
Component: [UI Component/Screen]
Version: 1.0
Date: [Current Date]
Status: Based on Source Code Analysis & Business Requirements

Functional Overview (Required):

- Business Purpose: What business problem this solves
- Primary Users: Who uses this functionality and how
- Core Workflows: Main user journeys supported
- Integration Points: How this connects to other system functions
- Success Criteria: How to measure functional effectiveness

Content Sections (Adapt as needed):

User Interface Specifications:

- Screen Layout: How information is visually organized for users
- Navigation Flow: How users move between different views and actions
- Interactive Elements: What users can click, type, select, or manipulate
- Visual Feedback: How the system communicates status, errors, and confirmations

Data Management Functions:

- Information Display: What data users see, how it's formatted and organized
- Data Entry: How users input, modify, and validate information  
- Search & Filtering: How users find and narrow down information
- Data Relationships: How information connects between different parts of the system

Business Process Workflows:

- Standard Operations: Normal day-to-day user workflows
- Approval Processes: How items move through review and approval stages
- Error Handling: What happens when things go wrong and how users recover
- Business Rules: Automatic system behaviors that enforce business logic

Role-Based Access Control:

- [Role 1] Capabilities: What this user type can view, create, edit, approve
- [Role 2] Capabilities: Different functional access for this role
- [Role 3] Capabilities: Additional role-specific business functions
- Permission Inheritance: How roles build upon each other

Integration & System Behavior:

- External System Connections: How this function interacts with other systems
- Data Synchronization: How information stays consistent across the system
- Automated Processes: What the system does automatically without user intervention
- Performance Requirements: Response time and capacity expectations

Business Rules & Constraints:

- Validation Requirements: What makes data valid or invalid
- Business Logic: Rules that govern how the system behaves
- Compliance Requirements: Regulatory or policy constraints
- Data Integrity: How the system maintains accurate and consistent information

Current Implementation Status:

- Fully Functional: Features working as designed
- Partially Implemented: Features with known limitations
- Mock/Placeholder: Features showing sample data only
- Integration Gaps: Missing connections to external systems

Technical Specifications:

- Performance Requirements: Response time, throughput, and resource usage expectations
- Data Specifications: Key data structures, validation rules, and storage requirements
- Security Requirements: Access control, data protection, and audit requirements

Testing Specifications:

- Test Cases: Happy path, edge cases, error handling, and performance testing scenarios
- Acceptance Criteria: Specific testable criteria for validation
- User Acceptance Testing: Business user validation requirements

Data Dictionary:

- Input Data Elements: Field specifications with data types, validation rules, and requirements
- Output Data Elements: Result specifications with formats and descriptions
- Data Relationships: How information connects between system components

Business Scenarios:

- Scenario Workflows: Detailed step-by-step business scenarios with context and expected outcomes
- Scenario Variations: Alternative flows and edge case handling
- Exception Scenarios: Error conditions and recovery procedures

Monitoring & Analytics:

- Key Metrics: Performance indicators and business metrics to track
- Reporting Requirements: Frequency, recipients, and format specifications
- Success Measurement: How to measure functional effectiveness and business value

Future Enhancements:

- Planned Improvements: Identified enhancements with timelines and priorities
- Scalability Considerations: How functionality will scale with business growth
- Evolution Path: How the function will adapt to changing business needs

Document Control:

- Version History: Change tracking with dates, authors, and modification descriptions
- Review & Approval: Stakeholder sign-off requirements and approval workflow
- Maintenance Schedule: Regular review and update procedures
```

## ADDITIONAL DOCUMENTATION SECTIONS:

### Function Objectives Section:
```yaml
Primary Goals:
- [Specific, measurable goal 1]
- [Specific, measurable goal 2] 
- [Specific, measurable goal 3]

Success Criteria:
- [Measurable success criterion 1]
- [Measurable success criterion 2]
- [Measurable success criterion 3]
```

### Input/Output Specifications:
```yaml
Input Requirements:
- [Input Name]: Description, format, validation rules
- [Input Name]: Description, format, validation rules

Processing Logic:
1. Step 1: Detailed description of processing step
2. Step 2: Detailed description of processing step
3. Step 3: Detailed description of processing step

Output Specifications:
- [Output Name]: Description, format, destination
- [Output Name]: Description, format, destination
```

### Data Flow Visualization:
```yaml
Data Flow:
Input → [Function Name] → Output
  ↓
[Related Systems/Modules]
```

### User Interface Elements:
```yaml
UI Components:
- [UI Element]: Purpose and behavior description
- [UI Element]: Purpose and behavior description

User Workflow Steps:
1. [Step Name]: User action and system response
2. [Step Name]: User action and system response  
3. [Step Name]: User action and system response
```

### Exception Handling Details:
```yaml
Error Conditions:
- [Error Type]: When it occurs, how to handle
- [Error Type]: When it occurs, how to handle

Validation Failures:
- [Validation Rule]: Error message and recovery action
- [Validation Rule]: Error message and recovery action
```

### Document Control Template:
```yaml
Version History:
| Version | Date | Author | Changes |
|---------|------|---------|---------|
| 1.0 | [DATE] | [AUTHOR] | Initial version |

Review & Approval:
| Role | Name | Date | Status |
|------|------|------|--------|
| Business Analyst | | | |
| Technical Lead | | | |
| Product Owner | | | |

Support Contacts:
- Business Questions: [Contact]
- Technical Issues: [Contact]
- Documentation Updates: [Contact]
```

## WRITING STYLE:

### DO:
- ✅ Focus on business outcomes: "Enables users to track vendor performance" not "displays vendor data"
- ✅ Describe complete workflows: "User searches → filters results → selects item → views details"
- ✅ Explain business value: "Approval workflow ensures financial control" not "status field updates"
- ✅ Use functional language: "System validates required information" not "form validation runs"
- ✅ Map user journeys: Start to finish process flows with decision points
- ✅ Define success scenarios: What constitutes successful completion of tasks

### DON'T:
- ❌ Include technical implementation details or code references
- ❌ Use database field names (use "Customer Name" not "customer.displayName")
- ❌ Reference UI framework components or event handlers
- ❌ Add functional requirements that don't exist in source code
- ❌ Focus on how things work instead of what they accomplish

## FUNCTIONAL VERIFICATION CHECKLIST:

Before finalizing, ensure:
- Every functional requirement can be demonstrated in the actual system
- All user workflows are complete and testable
- Business rules are clearly defined and verifiable
- Role-based access is documented with specific capabilities
- Integration points are identified and their current status noted
- Success criteria are measurable and achievable
- Document serves as a blueprint for testing and validation

## EXAMPLE FUNCTIONAL TRANSFORMATIONS:

Instead of: "onClick handler validates form fields"
Write: "System prevents submission when required business information is incomplete"

Instead of: "useState manages approval status"  
Write: "Approval status tracks items through the business review process"

Instead of: "API call updates backend database"
Write: "Changes are saved to the system and immediately available to other users"

Instead of: "useRole hook checks permissions"
Write: "System ensures users can only perform actions appropriate to their business role"

## TESTING ALIGNMENT:

This functional specification should enable:
- **User Acceptance Testing**: Business users can verify workflows meet their needs
- **Integration Testing**: Technical teams can validate system connections work properly
- **Role-Based Testing**: Security teams can verify access controls function correctly
- **Process Testing**: Business analysts can confirm workflows support business operations

## DELIVERABLE STRUCTURE:

The completed functional specification should read like a business manual that:
- Explains what the system does from a user perspective
- Documents all supported business processes
- Defines success criteria for each functional area
- Serves as the foundation for user training and system testing
- Bridges business requirements and technical implementation

This approach ensures functional specifications that accurately reflect current capabilities while clearly defining business value and user workflows for all stakeholders.