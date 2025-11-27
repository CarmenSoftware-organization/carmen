# User Story Template and Usage Guide

## Document Information
- **Template Type**: User Story Format
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Applies To**: All Business Requirements (BR) documents

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

This guide establishes the standard format for writing user stories in the Carmen ERP system. User stories help capture functional requirements from the perspective of end users, ensuring the system meets real-world needs in hospitality operations.

**Purpose**: Ensure consistent, clear, and actionable user stories across all modules

**Context**: Carmen ERP is designed for hospitality operations, specifically hotels, resorts, and multi-property management

---

## User Story Format

### Standard Structure

```markdown
### FR-XXX-NNN: [Feature Name]
**Priority**: [High/Medium/Low]
**User Story**: As a [persona/role], I want to [action/goal] so that [business value/benefit].

**Requirements**:
- [Detailed requirement 1]
- [Detailed requirement 2]
- [Detailed requirement 3]
  * [Sub-requirement or detail]
  * [Sub-requirement or detail]
- [etc.]

**Acceptance Criteria**:
- [Testable criterion 1]
- [Testable criterion 2]
- [Testable criterion 3]
- [etc.]
```

### Component Breakdown

#### 1. Feature ID: `FR-XXX-NNN`
- **FR**: Functional Requirement (standard prefix)
- **XXX**: Module abbreviation (e.g., PR for Purchase Requests, PO for Purchase Orders, GRN for Goods Receipt Notes)
- **NNN**: Sequential number (001, 002, 003, etc.)
- **Example**: FR-PR-001, FR-PO-015, FR-GRN-007

#### 2. Feature Name
- Clear, concise description of the feature
- Use title case
- Action-oriented when possible
- **Examples**:
  - "Purchase Request List View"
  - "Create GRN from Purchase Order"
  - "Vendor Selection and Validation"

#### 3. Priority
- **High**: Critical for core functionality, must-have for launch
- **Medium**: Important but not critical, can be delivered in phases
- **Low**: Nice-to-have, future enhancement

#### 4. User Story Statement
**Format**: "As a [who], I want to [what] so that [why]"

**Components**:
- **Who (Persona)**: Specific role or user type
- **What (Action/Goal)**: What the user wants to accomplish
- **Why (Benefit)**: Business value or reason for the feature

**Examples**:
- ✅ "As a department manager, I want to view all purchase requests from my department so that I can monitor spending and approve requests efficiently."
- ✅ "As a receiving staff member, I want to create a GRN from a mobile device so that I can record receipts immediately at the loading dock."
- ❌ "As a user, I need a list page." (Too vague, no benefit stated)
- ❌ "The system should have a dashboard." (Not from user perspective)

#### 5. Requirements
- Detailed, specific, and actionable
- Use bullet points for clarity
- Nest sub-requirements with indentation
- Include UI elements, data fields, workflows
- Specify integrations and system behaviors
- Use present tense ("Display", "Calculate", "Record")

**Structure Tips**:
- Group related requirements together
- Use sub-bullets for additional details
- Be specific about data fields, calculations, validations
- Mention user interactions and system responses

#### 6. Acceptance Criteria
- Testable conditions that define "done"
- Written from QA/testing perspective
- Measurable and verifiable
- Include both positive and negative test cases
- Cover edge cases and error conditions
- Specify performance requirements where applicable

**Good Acceptance Criteria**:
- ✅ "List loads within 2 seconds with 1000+ records"
- ✅ "Cannot submit request with empty required fields"
- ✅ "Status updates reflect immediately in the UI"
- ✅ "Export includes all filtered data in correct format"
- ❌ "Works well" (Not measurable)
- ❌ "Fast enough" (Not specific)

---

## Hospitality-Specific Personas

### Procurement Department

#### Department Manager
**Role**: Oversees departmental operations and budget
**Responsibilities**: Approve purchase requests, monitor spending, ensure compliance
**Goals**: Control costs, maintain quality standards, avoid stockouts
**Pain Points**: Budget overruns, unauthorized purchases, slow approval processes
**System Usage**: Review and approve PRs, monitor budget utilization, generate reports

#### Purchasing Staff / Buyer
**Role**: Professional procurement specialist
**Responsibilities**: Source vendors, negotiate prices, create POs, manage vendor relationships
**Goals**: Best value procurement, reliable supply chain, vendor performance
**Pain Points**: Manual processes, vendor issues, price discrepancies
**System Usage**: Create POs from PRs, vendor management, price comparison, order tracking

#### Purchasing Manager / Chief Buyer
**Role**: Leads procurement function
**Responsibilities**: Approve high-value POs, vendor strategy, team management, compliance
**Goals**: Strategic sourcing, cost savings, supply continuity, risk management
**Pain Points**: Lack of visibility, compliance issues, vendor performance problems
**System Usage**: Approve POs, vendor performance review, spend analysis, compliance monitoring

### Operations Department

#### Department Staff (F&B, Housekeeping, Maintenance, Front Office)
**Role**: Front-line operational staff
**Responsibilities**: Identify needs, request supplies, use products
**Goals**: Have right products available when needed, easy ordering process
**Pain Points**: Stockouts, long approval times, complicated systems
**System Usage**: Create purchase requests, check request status, view inventory

#### Chef / Head Chef / Executive Chef
**Role**: Culinary operations leader
**Responsibilities**: Menu planning, food quality, kitchen operations, cost control
**Goals**: Fresh quality ingredients, cost-effective sourcing, waste reduction
**Pain Points**: Inconsistent product quality, delivery delays, price fluctuations
**System Usage**: Create PRs for F&B items, approve kitchen purchases, recipe management integration

#### Housekeeping Manager
**Role**: Manages guest room and public area cleanliness
**Responsibilities**: Linen management, cleaning supplies, room amenities, equipment
**Goals**: Maintain quality standards, control par levels, minimize waste
**Pain Points**: Par level management, product standardization, usage tracking
**System Usage**: Create PRs for housekeeping supplies, monitor usage, manage inventory

#### Maintenance Manager / Chief Engineer
**Role**: Property maintenance and engineering
**Responsibilities**: Equipment maintenance, repairs, preventive maintenance, spare parts
**Goals**: Equipment uptime, maintenance efficiency, cost control
**Pain Points**: Spare parts availability, emergency repairs, equipment downtime
**System Usage**: Create PRs for parts and supplies, urgent/emergency requests, equipment tracking

### Receiving and Storage

#### Receiving Staff / Receiving Clerk
**Role**: Receives and inspects delivered goods
**Responsibilities**: Check deliveries, verify quantities, quality inspection, create GRNs
**Goals**: Accurate receiving, quick processing, damage prevention
**Pain Points**: Manual paperwork, discrepancies, quality issues, long GRN process
**System Usage**: Create GRNs, document inspections, photograph issues, update inventory

#### Receiving Supervisor / Warehouse Manager
**Role**: Oversees receiving operations
**Responsibilities**: Supervise receiving team, resolve discrepancies, manage returns, ensure compliance
**Goals**: Efficient receiving process, minimize errors, vendor accountability
**Pain Points**: Staff productivity, discrepancy resolution, vendor disputes
**System Usage**: Review GRNs, approve exceptions, manage discrepancies, returns to vendor

#### Storekeeper / Inventory Clerk
**Role**: Manages stored inventory
**Responsibilities**: Stock organization, par level maintenance, inventory counts, issue items
**Goals**: Accurate inventory, FIFO rotation, minimize shrinkage
**Pain Points**: Stock discrepancies, space management, expiry tracking
**System Usage**: Receive goods into storage, issue items to departments, cycle counts

### Finance and Administration

#### Accounts Payable Clerk
**Role**: Processes vendor invoices and payments
**Responsibilities**: Invoice matching, payment processing, vendor inquiries
**Goals**: Timely accurate payments, vendor relationship, cost control
**Pain Points**: Missing GRNs, invoice discrepancies, manual matching
**System Usage**: 3-way matching (PO-GRN-Invoice), payment approvals, vendor communications

#### Financial Manager / Controller
**Role**: Oversees financial operations
**Responsibilities**: Budget management, financial controls, audit compliance, cost analysis
**Goals**: Financial accuracy, budget adherence, audit compliance, cost optimization
**Pain Points**: Budget overruns, lack of spend visibility, compliance gaps
**System Usage**: Budget approvals, spend analysis, financial reports, audit trails

#### General Manager / Hotel Manager
**Role**: Overall property operations
**Responsibilities**: P&L responsibility, strategic decisions, compliance, guest satisfaction
**Goals**: Profitability, operational efficiency, quality standards, compliance
**Pain Points**: Cost control, operational visibility, regulatory compliance
**System Usage**: High-value approvals, executive dashboards, strategic reports

### Quality and Compliance

#### Quality Control Inspector
**Role**: Ensures product quality standards
**Responsibilities**: Inspect received goods, quality testing, accept/reject decisions, documentation
**Goals**: Consistent quality, prevent substandard products, supplier accountability
**Pain Points**: Subjective criteria, documentation burden, supplier issues
**System Usage**: Quality inspections in GRN, photo documentation, rejection workflows

#### Internal Auditor
**Role**: Ensures process compliance
**Responsibilities**: Audit procurement processes, review controls, identify gaps, recommend improvements
**Goals**: Compliance, risk mitigation, process improvement
**Pain Points**: Manual audit trails, incomplete documentation, control gaps
**System Usage**: Review audit trails, compliance reports, approval workflows, exception analysis

---

## Writing Effective User Stories

### Best Practices

#### 1. Keep It User-Centered
- Always write from the user's perspective
- Use actual job titles and roles from hospitality
- Focus on what the user wants to accomplish
- Express the benefit or value clearly

**Example**:
✅ "As a head chef, I want to create recurring purchase requests for weekly produce so that I can ensure consistent supply without manual weekly entry."

#### 2. Be Specific About Context
- Specify when/where the feature is used
- Include relevant constraints or conditions
- Mention related processes or workflows

**Example**:
✅ "As a receiving clerk at the loading dock, I want to scan barcodes on my mobile device so that I can quickly record receipts without returning to the office computer."

#### 3. Focus on the "Why"
- Always include the business benefit
- Connect to operational goals
- Show impact on efficiency, cost, quality, or compliance

**Example**:
✅ "As a purchasing manager, I want to view vendor performance dashboards so that I can identify quality issues early and take corrective action before they impact operations."

#### 4. Make Requirements Actionable
- Use clear action verbs
- Specify exact data fields and calculations
- Define workflow steps
- Include validation rules

**Example**:
```
**Requirements**:
- Display list of all purchase requests with columns:
  * PR Number (clickable link)
  * Requestor Name and Department
  * Request Date
  * Status Badge (color-coded)
  * Total Amount
  * Approval Progress
- Filter by:
  * Department (multi-select dropdown)
  * Status (Draft, Pending, Approved, Rejected)
  * Date Range (calendar picker)
  * Amount Range (min/max inputs)
```

#### 5. Write Testable Acceptance Criteria
- Use specific numbers and timeframes
- Include both success and failure scenarios
- Cover edge cases
- Specify error messages

**Example**:
```
**Acceptance Criteria**:
- List loads in <2 seconds with 1000+ PRs
- Filters apply instantly (<500ms response)
- Cannot submit PR without required fields (show inline errors)
- Budget validation occurs before submission
- Insufficient budget displays clear error message with available amount
- Success message appears after successful submission
- Email notification sent to approver within 5 minutes
```

### Common Mistakes to Avoid

❌ **Too Technical**: "As a user, I want a RESTful API endpoint..."
✅ **User-Focused**: "As a purchasing manager, I want to view real-time inventory levels when creating POs..."

❌ **Too Vague**: "As a chef, I need better ordering"
✅ **Specific**: "As a head chef, I want to create purchase requests directly from recipes so that I can order exact quantities needed for planned menus."

❌ **Missing Benefit**: "As a receiving clerk, I want to use a mobile app"
✅ **With Benefit**: "As a receiving clerk, I want to use a mobile app so that I can record receipts immediately at the loading dock without walking back to the office computer."

❌ **Solution-Oriented**: "As a user, I want a dashboard with charts"
✅ **Need-Oriented**: "As a general manager, I want to view spending trends by department so that I can identify cost-saving opportunities and budget issues."

❌ **Not Testable**: "System should be fast and easy to use"
✅ **Testable**: "Page loads in <2 seconds, 90% of users complete task in <3 minutes without help"

---

## User Story Template Examples

### Example 1: Simple Feature

```markdown
### FR-PR-001: Purchase Request List View
**Priority**: High
**User Story**: As a department manager, I want to view all purchase requests from my department so that I can monitor spending and track request status.

**Requirements**:
- Display paginated list of purchase requests
- Show columns: PR Number, Requestor, Date, Status, Amount
- Filter by status, date range, requestor
- Sort by any column
- Export to Excel/CSV

**Acceptance Criteria**:
- List loads within 2 seconds
- Filters apply instantly (<500ms)
- Can view 10, 20, 50, or 100 items per page
- Export includes all filtered data
- Mobile responsive (works on tablets)
```

### Example 2: Complex Feature with Workflow

```markdown
### FR-GRN-003: Quality Inspection Workflow
**Priority**: High
**User Story**: As a quality control inspector, I want to perform detailed inspections on received goods so that only quality products enter our inventory and maintain hotel standards.

**Requirements**:
- Quality inspection section for each received line item:
  * Visual inspection checklist (packaging, labels, damage, cleanliness)
  * Quantity verification (count accuracy ±1%)
  * Product specification match (size, brand, grade)
  * Sampling for detailed testing (random sample selection)
  * Pass/Fail/Conditional acceptance decision
- Record inspection details:
  * Inspector name (auto-filled from logged-in user)
  * Inspection date/time (auto-filled)
  * Quality grade (A/B/C scale)
  * Defects found with counts and types
  * Photos of defects (up to 10 photos per line)
  * Acceptance decision with detailed reason
- Rejection workflow:
  * Select rejection reason from predefined list (quality, specifications, damage, expiry, documentation)
  * Enter detailed rejection notes (minimum 50 characters)
  * Attach photos of rejected items (required, minimum 2 photos)
  * Specify disposition (return to vendor, scrap, quarantine, investigate)
  * Generate automatic rejection notice for vendor
  * Create follow-up task for purchasing staff
- Conditional acceptance:
  * Accept with conditions (price adjustment, credit note, replacement next delivery)
  * Record conditional terms (free text with structured options)
  * Flag items in inventory with condition code
  * Auto-create follow-up task for resolution

**Acceptance Criteria**:
- All inspection criteria can be documented
- Photos upload successfully (max 10MB per photo, JPG/PNG formats)
- Rejection reasons must be selected before saving rejection
- Detailed notes required if "Other" reason selected
- Rejected items do NOT add to inventory quantities
- Conditionally accepted items flag in inventory with condition code
- Rejection notice auto-generates and sends to vendor contact email
- Photos display with zoom capability and download option
- Inspection history stored and viewable in audit trail
- Mobile-optimized for tablet use in receiving area
- Can complete inspection in <5 minutes per line item
```

### Example 3: Integration Feature

```markdown
### FR-PO-015: Budget Validation Integration
**Priority**: High
**User Story**: As a financial manager, I want purchase orders to validate against available budget in real-time so that we prevent overspending and maintain budget compliance.

**Requirements**:
- Real-time budget validation when:
  * User enters budget allocation on PO
  * User changes PO line item quantities or prices
  * User submits PO for approval
- Budget check process:
  * Calculate total PO amount
  * Query budget system for available funds in allocated accounts
  * Compare PO amount vs available budget
  * Apply budget tolerance rules (5% over allowed with approval)
- Display budget information:
  * Budget account name and code
  * Total budget allocation for fiscal year
  * Year-to-date spending
  * Committed amounts (encumbrances from other POs)
  * Available balance
  * Remaining after this PO
  * Visual indicator (green/yellow/red based on utilization %)
- Budget validation results:
  * Sufficient budget: Allow submission
  * Insufficient budget: Block submission, show clear error message
  * Over tolerance: Block submission, require manager override
  * Budget service unavailable: Allow with warning, create manual review task
- Budget encumbrance:
  * Create soft commitment on PO submission
  * Create firm commitment on PO approval
  * Release encumbrance on PO cancellation
  * Adjust encumbrance on change orders

**Acceptance Criteria**:
- Budget check completes in <2 seconds
- Budget information displays accurately with current data
- Cannot submit PO if budget insufficient (error message shows available amount)
- Over-tolerance requires manager approval (approval workflow triggers)
- Budget encumbrance created immediately on PO approval
- Encumbrance releases immediately on PO cancellation
- Budget service timeout handled gracefully (allows PO with warning)
- Budget allocation must sum to 100% of PO total
- Cannot allocate to inactive or closed budget accounts
- Budget utilization updates in real-time (no refresh needed)
- Audit trail records all budget checks and results
```

---

## Quality Checklist

Before finalizing a user story, verify:

### Content Quality
- [ ] Written from user perspective (not system perspective)
- [ ] Uses hospitality-specific persona (chef, receiving clerk, etc.)
- [ ] Includes clear business benefit in "so that" clause
- [ ] Requirements are specific and actionable
- [ ] Acceptance criteria are testable and measurable
- [ ] Covers both happy path and error scenarios
- [ ] Includes performance requirements where applicable
- [ ] Addresses security and access control if relevant

### Formatting Standards
- [ ] Feature ID follows FR-XXX-NNN format
- [ ] Priority specified (High/Medium/Low)
- [ ] User story follows "As a... I want... so that..." format
- [ ] Requirements use bullet points with proper nesting
- [ ] Acceptance criteria are numbered or bulleted
- [ ] Uses consistent verb tense (present tense for requirements)
- [ ] Proper markdown formatting

### Completeness
- [ ] All fields populated (Priority, User Story, Requirements, Acceptance Criteria)
- [ ] Requirements cover UI, data, workflow, and integrations
- [ ] Acceptance criteria cover success, failure, and edge cases
- [ ] Performance requirements specified
- [ ] Security/access requirements mentioned if applicable
- [ ] Integration points identified
- [ ] Data validation rules specified

---

## Usage in Different Document Types

### Business Requirements (BR)
- Most comprehensive user stories
- Include full requirements and acceptance criteria
- Specify all functional details
- Define business rules
- List integration points

### Use Cases (UC)
- Reference user stories from BR
- Expand into step-by-step workflows
- Add preconditions and postconditions
- Show main flow and alternative flows
- Include exception handling

### Technical Specification (TS)
- Reference user stories and use cases
- Add technical implementation details
- Specify architecture and components
- Define API contracts
- Detail data models

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-31 | System | Initial template creation |
