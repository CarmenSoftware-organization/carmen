# Documentation Templates

This directory contains all documentation templates for the Carmen ERP system.

## Directory Structure

```
docs/app/
└── template-guide/
    ├── ARC-template.md                       - Architecture Change Request (ISO 29110)
    ├── BR-template.md                        - Business Requirements template
    ├── UC-template.md                        - Use Cases template
    ├── TS-template.md                        - Technical Specifications template
    ├── DS-template.md                        - Data Schema template
    ├── FD-template.md                        - Flow Diagrams template
    ├── VAL-template.md                       - Validations template
    ├── PC-template.md                        - Page Content template
    ├── DD-template.md                        - Data Dictionary template
    ├── README.md                             - This file
    ├── USER-STORY-TEMPLATE.md                - User Story writing guide
    ├── HOSPITALITY-PERSONAS-UPDATE.md        - Hospitality personas reference
    └── DOCUMENTATION-GENERATOR-PROMPT.md     - Documentation generation workflow
```

## How to Use These Templates

When creating documentation for a new sub-module:

1. **Copy the template files to your module directory**:
   ```bash
   cp -r docs/app/template-guide docs/app/{your-module}/{your-sub-module}
   ```

2. **Create pages directory for page content documents**:
   ```bash
   mkdir -p docs/app/{your-module}/{your-sub-module}/pages
   ```

3. **Rename and customize each template file**:
   - Replace `{module}` with your module name (e.g., "procurement")
   - Replace `{sub-module}` with your sub-module name (e.g., "purchase-requests")
   - Replace `{CODE}` with your sub-module code (e.g., "PR")
   - For PC files: Replace `{Page Name}` with actual page name (e.g., "List Page", "Create Form")

4. **Update file names** (optional but recommended):
   ```bash
   mv BR-template.md BR-purchase-requests.md
   mv UC-template.md UC-purchase-requests.md
   mv PC-template.md pages/PC-list-page.md  # For each page
   # etc.
   ```

4. **Fill in the template content**:
   - Remove all placeholder text (text in `{curly braces}`)
   - Complete all sections with actual requirements
   - Update document history and metadata

## Template Descriptions

### ARC-template.md (Architecture Change Request - ISO 29110)
Documents **ARCHITECTURE CHANGES** following ISO/IEC 29110 standards for Very Small Entities:
- Formal change request process for architecture modifications
- Current state analysis and proposed architecture
- Comprehensive impact assessment (technical, business, security, performance)
- ISO 29110 compliance checklist and traceability
- Risk assessment and mitigation strategies
- Implementation plan with phases and timeline
- Testing strategy and deployment plan
- Approval workflow and sign-off procedures
- Post-implementation review requirements
- **Use For**: Major architecture changes, technology stack updates, design pattern changes
- **ISO Alignment**: ISO/IEC 29110-4-1 (Software Implementation), ISO/IEC 29110-5-1-2 (PM & SI Guide)

### BR-template.md (Business Requirements)
Documents **WHAT** the system needs to do from a business perspective:
- Business objectives and stakeholders
- Functional requirements with acceptance criteria
- Business rules and constraints
- Data model (conceptual)
- Non-functional requirements
- Success metrics

### UC-template.md (Use Cases)
Documents **HOW** users and systems interact with the features:
- Actor definitions (Primary, Secondary, and System Actors)
- **Use Case Diagram**: Visual representation of actor-use case relationships
- **Use Case Summary Table**: Quick reference with all use cases, priorities, and complexity
- User workflows (main flow, alternative flows, exceptions)
- System use cases (automated processes)
- Integration use cases (external system interactions)
- Background job use cases (scheduled tasks)
- Complexity and priority definitions

### FD-template.md (Flow Diagrams)
Visual representations of processes and data flows:
- Process flow diagrams
- Data flow diagrams
- Sequence diagrams
- State transition diagrams
- Workflow diagrams

### DS-template.md (Data Schema)
Database structure and data organization:
- Entity Relationship Diagrams
- Table definitions with SQL DDL
- Indexes and constraints
- Views and stored procedures
- Data migration scripts

### TS-template.md (Technical Specifications)
**HOW** to implement the system technically (TEXT DESCRIPTIONS ONLY - NO CODE):
- Architecture diagrams (Mermaid)
- Technology stack descriptions
- Component responsibilities and interactions (described in text)
- Server action descriptions (inputs, outputs, responsibilities)
- State management patterns (described in text)
- Integration patterns and data flows
- Security implementation descriptions
- Testing strategy descriptions
- **NOTE**: TS documents describe HOW in text format - refer to DS (Data Schema) for SQL code

### VAL-template.md (Validations)
Validation requirements in text format (not code):
- Field-level validations
- Business rule validations
- Cross-field validations
- Security validations
- Error messages and handling

### PC-template.md (Page Content)
UI content and copy for pages and dialogues:
- Page headers, titles, and instructions
- Button labels and action text
- Form field labels and placeholders
- Success, error, and warning messages
- Status indicators and badges
- Empty states and loading states
- Dialog/modal content
- Tooltips and help text
- Accessibility labels
- Microcopy and messaging
- **Location**: Store in `pages/` subdirectory within module folder
- **Example**: See `PC-example-list-page.md` for a complete reference implementation

## Supporting Files

### USER-STORY-TEMPLATE.md
Comprehensive guide for writing effective user stories:
- Standard user story format and structure
- Hospitality-specific personas (Chef, Housekeeper, Purchasing Staff, etc.)
- Best practices for user-centered requirements
- Common mistakes to avoid
- Examples for simple features, complex workflows, and integrations
- Quality checklist for user story completeness

### HOSPITALITY-PERSONAS-UPDATE.md
Reference guide for hospitality-specific terminology and personas:
- Primary and secondary user roles in hotel operations
- Hospitality-specific terminology (F&B, housekeeping, engineering)
- Department and location names
- Before/after examples of persona-focused documentation
- Implementation plan for updating existing documentation

### DOCUMENTATION-GENERATOR-PROMPT.md
Complete workflow for generating documentation from source code:
- `/generate-docs` command usage and arguments
- Source code scanning strategy (quick, standard, thorough)
- Phase-by-phase documentation generation process
- Quality assurance and verification checklists
- Feature verification rules and best practices
- Troubleshooting common documentation issues

## Key Principles

### All Documents Are Text-Based (NO CODE except DS)
All documentation documents use descriptive text to explain requirements, use cases, flows, technical patterns, and validations. The ONLY exception is DS (Data Schema) which contains actual SQL code.

**Text-Based Documents (NO CODE)**:
- **BR** (Business Requirements): WHAT and WHY - requirements in text, no code
- **UC** (Use Cases): HOW users interact - workflow descriptions in text, no code
- **TS** (Technical Specification): HOW to implement - architecture and patterns described in text, no code
- **FD** (Flow Diagrams): VISUAL flows - Mermaid diagrams only, no code
- **VAL** (Validations): VALIDATION rules - validation descriptions in text, no code
- **PC** (Page Content): UI COPY and content - all text that appears on pages and in dialogues

**Code-Based Document (SQL CODE ONLY)**:
- **DS** (Data Schema): DATABASE structure - SQL DDL, CREATE statements, indexes, constraints

## Cross-References

All templates reference each other using relative paths:
- `[Business Requirements](./BR-template.md)`
- `[Use Cases](./UC-template.md)`
- `[Technical Specification](./TS-template.md)`
- `[Data Schema](./DS-template.md)`
- `[Flow Diagrams](./FD-template.md)`
- `[Validations](./VAL-template.md)`
- `[Page Content](./pages/PC-list-page.md)` (from pages subdirectory)

When you copy the templates to your module directory, these links will automatically work within that directory.

## Example Usage

For the Purchase Requests sub-module in Procurement:

```
docs/app/procurement/purchase-requests/
├── BR-purchase-requests.md
├── UC-purchase-requests.md
├── TS-purchase-requests.md
├── DS-purchase-requests.md
├── FD-purchase-requests.md
├── VAL-purchase-requests.md
└── pages/
    ├── PC-list-page.md
    ├── PC-create-form.md
    ├── PC-detail-page.md
    ├── PC-edit-form.md
    └── PC-dialogs.md
```

## Document Maintenance

- **Version**: Update document history when making changes
- **Status**: Set to Draft → Review → Approved
- **Owner**: Assign clear ownership for each document
- **Review Schedule**: Regular reviews to keep documentation current

## Template Enhancements

### Enhanced Use Case Template (UC-template.md)

The UC template has been enhanced with the following visual aids for better documentation quality:

#### **Use Case Diagram**
- **Purpose**: Provides instant visual understanding of actor-use case relationships
- **Structure**: Three-tier layout showing primary actors (top), external/secondary actors (middle), and system actors (bottom)
- **Benefits**:
  - Quick overview for stakeholders and new team members
  - Clear visualization of user vs. system vs. integration use cases
  - Easy identification of external dependencies

#### **Use Case Summary Table**
- **Purpose**: Quick reference catalog of all use cases with key metadata
- **Columns**: ID, Name, Actor(s), Priority, Complexity, Category
- **Categories**: User, System, Integration, Background
- **Benefits**:
  - Instant reference for sprint planning and estimation
  - Clear prioritization for backlog grooming
  - Complexity assessment for resource planning
  - Complete use case inventory at a glance

#### **Definitions Section**
- **Complexity Definitions**: Simple, Medium, Complex with clear criteria
- **Priority Definitions**: High, Medium, Low with business context
- **Category Definitions**: User, System, Integration, Background with descriptions
- **Benefits**:
  - Removes ambiguity in classifications
  - Ensures consistent assessment across documents
  - Supports accurate estimation and planning

### Best Practices for Enhanced UC Template

1. **Complete the Use Case Summary Table First**: Before writing detailed use cases, fill out the summary table to ensure proper coverage and organization
2. **Create the Diagram Early**: Visual representation helps identify gaps and overlaps in actor responsibilities
3. **Use Consistent Numbering**: User (001-099), System (101-199), Integration (201-299), Background (301-399)
4. **Keep Definitions Handy**: Reference complexity and priority definitions when assessing each use case
5. **Update Diagram and Table Together**: When adding/removing use cases, update both the diagram and summary table

## Questions?

Refer to the individual template files for detailed guidance on each section. Each template includes:
- Section-by-section instructions
- Examples and patterns
- Best practices notes
- Common pitfalls to avoid
