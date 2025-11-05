# Documentation Generator Command Prompt

## Document Information
- **Command Type**: Project Documentation Generator
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Purpose**: Generate complete documentation sets from templates with source code verification

---

## Command Overview

This prompt generates a complete 6-document set (BR, UC, TS, DS, FD, VAL) for a sub-module by:
1. Scanning source code to identify actual features
2. Using documentation templates as structure
3. Following user story guidelines
4. Maintaining hospitality/hotel operation focus
5. Ensuring no fictional features are added

---

## Command Format

```
/generate-docs --module [MODULE_NAME] --submodule [SUBMODULE_NAME] [OPTIONS]
```

### Arguments

**Required:**
- `--module` or `-m`: Parent module name (e.g., "procurement", "inventory", "finance")
- `--submodule` or `-s`: Sub-module name (e.g., "purchase-requests", "stock-adjustments")

**Optional:**
- `--scan-depth`: How deep to scan source code (default: "thorough")
  - `quick`: Basic file structure and exports
  - `standard`: Components, functions, types
  - `thorough`: Full implementation details, business logic
- `--verify-only`: Only verify features exist, don't generate docs (default: false)
- `--update-existing`: Update existing docs instead of creating new (default: false)
- `--skip-validation`: Skip source code verification (NOT RECOMMENDED)

### Examples

```bash
# Generate complete documentation for a new sub-module
/generate-docs --module procurement --submodule vendor-management

# Thoroughly scan and generate with verification
/generate-docs -m inventory -s stock-adjustments --scan-depth thorough

# Update existing documentation after code changes
/generate-docs -m procurement -s purchase-orders --update-existing

# Verify features in existing documentation
/generate-docs -m procurement -s goods-receipt-notes --verify-only
```

---

## Execution Workflow

### Phase 1: Source Code Discovery and Analysis

#### Step 1.1: Locate Source Code
```
Objective: Find all relevant source code files for the sub-module

Actions:
1. Search for sub-module directory in app/(main)/[module]/[submodule]/
2. Identify file structure:
   - page.tsx (main list page)
   - [id]/page.tsx (detail page)
   - [id]/edit/page.tsx (edit page)
   - create/page.tsx (create page)
   - components/ (UI components)
   - actions/ (server actions)
   - hooks/ (custom hooks)
   - types/ (TypeScript types)
   - utils/ (utility functions)

Search Pattern:
- Glob: app/(main)/{module}/{submodule}/**/*.{ts,tsx}
- Glob: lib/types/*.ts (for shared types)
- Glob: lib/mock-data/*.ts (for data structures)

Output:
- List of all TypeScript/TSX files
- File paths and sizes
- Primary vs secondary files
```

#### Step 1.2: Extract Type Definitions
```
Objective: Understand data models and interfaces

Actions:
1. Read all files in types/ directory
2. Scan lib/types/index.ts for module-specific types
3. Extract interface definitions
4. Identify enums and type unions
5. Map relationships between types

Search Commands:
- Read: app/(main)/{module}/{submodule}/types/*.ts
- Grep: "interface \w+" in lib/types/*.ts
- Grep: "type \w+ =" in lib/types/*.ts
- Grep: "enum \w+" in lib/types/*.ts

Output:
- All interface definitions
- Enum values
- Type relationships
- Required vs optional fields
```

#### Step 1.3: Identify Components and Features
```
Objective: Catalog all UI components and their functionality

Actions:
1. List all components in components/ directory
2. Read each component file
3. Extract:
   - Component purpose (from JSDoc comments)
   - Props interface
   - Key features (buttons, forms, tables)
   - User interactions (onClick handlers, form submissions)
   - State management (useState, useForm)
   - Data fetching (custom hooks, React Query)

Search Commands:
- Glob: app/(main)/{module}/{submodule}/components/*.tsx
- Grep: "export function \w+" (component names)
- Grep: "interface \w+Props" (component props)
- Grep: "onClick|onSubmit|onChange" (interactions)
- Grep: "useState|useForm|useQuery" (state management)

Output:
- Component inventory with purposes
- User interaction capabilities
- Data requirements
- Integration points
```

#### Step 1.4: Analyze Server Actions
```
Objective: Identify backend operations and business logic

Actions:
1. Read all files in actions/ directory
2. Extract:
   - Action function names
   - Input parameters
   - Return types
   - Business logic steps
   - Database operations
   - Validation rules
   - Error handling

Search Commands:
- Glob: app/(main)/{module}/{submodule}/actions/*.ts
- Grep: "export async function \w+" (server actions)
- Grep: "supabase\.from\(" (database queries)
- Grep: "z\.object\(" (Zod schemas)
- Grep: "if.*error|throw new Error" (error handling)

Output:
- All server action signatures
- Business rule implementations
- Validation logic
- Database schema usage
- Integration points (budget, inventory, etc.)
```

#### Step 1.5: Map User Workflows
```
Objective: Understand complete user journeys

Actions:
1. Trace navigation flows:
   - List page → Detail page
   - List page → Create page
   - Detail page → Edit page
2. Identify form submissions:
   - Form fields and validation
   - Submit handlers and server actions
   - Success/error handling
3. Map approval workflows (if applicable)
4. Identify status transitions

Search Commands:
- Grep: "router.push\(|href=" (navigation)
- Grep: "onSubmit|handleSubmit" (form submissions)
- Grep: "status.*===|status:" (status management)
- Read: Form component files in detail

Output:
- Navigation flow diagram
- Form submission workflows
- Status state machine
- Approval flow (if exists)
```

#### Step 1.6: Identify Business Rules
```
Objective: Extract all business logic and constraints

Actions:
1. Find validation rules:
   - Zod schemas
   - Custom validators
   - Database constraints
2. Extract calculation logic:
   - Price calculations
   - Quantity calculations
   - Tax/discount logic
3. Identify access control:
   - Permission checks
   - Role-based restrictions
4. Find integration rules:
   - Budget validation
   - Inventory checks
   - Vendor eligibility

Search Commands:
- Grep: "z\.(string|number|object|array)\(" (Zod validators)
- Grep: "calculate|compute|total" (calculation functions)
- Grep: "permission|role|canAccess" (access control)
- Grep: "validate|check|verify" (validation logic)

Output:
- All validation rules
- Business logic formulas
- Access control matrix
- Integration constraints
```

### Phase 2: Documentation Generation

#### Step 2.1: Generate Business Requirements (BR)
```
Objective: Create comprehensive BR document

Template: docs/app/template-guide/BR-template.md
Guidelines: docs/app/template-guide/USER-STORY-TEMPLATE.md

Process:
1. Document Header:
   - Use actual module and sub-module names
   - Set version 1.0.0 for new docs
   - Use current date
   - Status: Draft

2. Overview Section:
   - Summarize module purpose (from code analysis)
   - List key objectives (what the code actually does)
   - Identify business value (from feature set)

3. Stakeholders Section:
   - Use hospitality personas from template
   - Match personas to actual features found
   - Primary users: Who creates/manages records
   - Secondary users: Who views/approves/reports

4. Functional Requirements:
   - ONE requirement per major feature found in code
   - Format: FR-XXX-NNN (e.g., FR-VEN-001)
   - Each FR must have:
     * Priority (based on feature criticality in code)
     * User Story (using persona template)
     * Requirements (detailed, from code analysis)
     * Acceptance Criteria (testable, from component behavior)

5. Non-Functional Requirements:
   - Performance (based on code patterns)
   - Security (based on auth checks)
   - Usability (based on UI components)
   - Scalability (based on data handling)

6. Business Rules:
   - Extract from validation logic
   - Number as BR-XXX-NNN
   - Categorize by type

7. Data Model:
   - Use actual TypeScript interfaces
   - Document all fields
   - Show relationships

Verification:
- Every FR maps to actual code feature ✓
- No fictional features added ✓
- All personas relevant to module ✓
- User stories follow template format ✓
```

#### Step 2.2: Generate Use Cases (UC)
```
Objective: Create detailed workflow documentation

Template: docs/app/template-guide/UC-template.md

Process:
1. Primary Use Cases:
   - Map to server actions found in code
   - Use actual component workflows
   - Reference actual form fields

2. For Each Use Case:
   - Title: Matches actual feature
   - Actor: From persona list (verified against code)
   - Preconditions: Based on state checks in code
   - Main Flow: Step-by-step from code analysis
   - Alternative Flows: From conditional logic
   - Exception Flows: From error handling
   - Postconditions: From state updates

3. Workflow Examples:
   - Use actual field names from forms
   - Reference real validation rules
   - Show actual status transitions

Verification:
- All use cases have corresponding code ✓
- Steps match actual implementation ✓
- Field names are accurate ✓
- No made-up workflows ✓
```

#### Step 2.3: Generate Technical Specification (TS)
```
Objective: Create high-level technical guide

Template: docs/app/template-guide/TS-template.md
Reference: Purchase Requests TS (text-based format)

Process:
1. System Architecture:
   - Create Mermaid diagram of actual architecture
   - Show real integrations found in code

2. Page Hierarchy:
   - Mermaid diagram of actual pages
   - Use real routes from file structure

3. Page Descriptions:
   - One per actual page (from page.tsx files)
   - Describe real components used
   - List actual features implemented

4. Navigation Flows:
   - Mermaid diagrams of real workflows
   - Based on router.push() calls
   - Show actual form submissions

5. Component Descriptions:
   - One per major component found
   - Describe actual responsibilities
   - List real features (not fictional)

6. Server Actions:
   - Describe actual functions from actions/
   - Show real inputs/outputs from types
   - Document actual business logic

7. Integration Points:
   - Only integrations found in code
   - Actual API calls and endpoints
   - Real external systems

Verification:
- All pages exist in code ✓
- All components are real ✓
- All flows match implementation ✓
- No speculative features ✓
```

#### Step 2.4: Generate Data Schema (DS)
```
Objective: Document database schema

Template: docs/app/template-guide/DS-template.md

Process:
1. Extract Database Schema:
   - From Supabase queries in actions/
   - From TypeScript interfaces
   - From mock data structure

2. For Each Table:
   - Table name (from .from('table_name'))
   - Columns (from interface fields)
   - Data types (from TypeScript types)
   - Constraints (from validation logic)
   - Indexes (from performance patterns)
   - Relationships (from foreign keys)

3. Sample Data:
   - Use actual mock data if available
   - Follow real data patterns

Verification:
- Tables match database queries ✓
- Columns match interfaces ✓
- Relationships are implemented ✓
- No fictional schema elements ✓
```

#### Step 2.5: Generate Flow Diagrams (FD)
```
Objective: Create visual workflow documentation

Template: docs/app/template-guide/FD-template.md

Process:
1. Create Mermaid Diagrams For:
   - Main workflows (from use case analysis)
   - Approval flows (if found in code)
   - Status transitions (from state management)
   - Data flows (from component interactions)

2. Each Diagram Must:
   - Reflect actual code implementation
   - Use real status values
   - Show actual decision points
   - Include real error paths

Verification:
- All flows exist in code ✓
- Decision points match logic ✓
- Status values are accurate ✓
- No fictional paths ✓
```

#### Step 2.6: Generate Validations (VAL)
```
Objective: Document all validation rules

Template: docs/app/template-guide/VAL-template.md

Process:
1. Extract Validations From:
   - Zod schemas
   - Custom validator functions
   - Server-side checks
   - Database constraints

2. Categorize By Type:
   - Field-level validations
   - Form-level validations
   - Business rule validations
   - Cross-field validations

3. Document Each Rule:
   - Rule ID (VAL-XXX-NNN)
   - Field/entity
   - Validation logic
   - Error message (actual text from code)

Verification:
- All rules extracted from code ✓
- Error messages match implementation ✓
- No fictional validations ✓
```

### Phase 3: Quality Assurance

#### Step 3.1: Cross-Reference Verification
```
Checklist:
- [ ] All FR-XXX references in UC exist in BR
- [ ] All UC-XXX references in TS exist in UC
- [ ] All table names in DS match code queries
- [ ] All diagrams in FD match code flows
- [ ] All VAL rules reference actual fields
- [ ] All personas used are defined in template
- [ ] All user stories follow template format
```

#### Step 3.2: Code Coverage Verification
```
For Each Document:
BR: Count features in code vs features in BR (should match)
UC: Verify all major workflows have use cases
TS: Verify all pages/components documented
DS: Verify all database tables documented
FD: Verify all major flows diagrammed
VAL: Verify all Zod schemas documented

Report:
- Coverage percentage per document
- Missing features (code not documented)
- Extra features (documented but not in code) ← Should be ZERO
```

#### Step 3.3: Hospitality Context Verification
```
Checklist:
- [ ] All personas are hospitality roles (chef, housekeeper, etc.)
- [ ] Examples use hotel scenarios (F&B, housekeeping, etc.)
- [ ] Terminology is hotel-specific (kitchen, store, department)
- [ ] Workflows match hotel operations
- [ ] No generic business terms without context
```

---

## Source Code Scanning Strategy

### Scan Depth Levels

#### Quick Scan
**Time**: 2-5 minutes
**Coverage**:
- File structure and page routes
- Exported component names
- Main interface definitions
- Server action signatures

**Use When**:
- Getting initial overview
- Planning documentation
- Checking if module exists

#### Standard Scan
**Time**: 10-15 minutes
**Coverage**:
- All Quick Scan items
- Component props and features
- Form field definitions
- Basic business logic
- State management patterns
- Navigation flows

**Use When**:
- Creating draft documentation
- Understanding module structure
- Identifying main features

#### Thorough Scan (Recommended)
**Time**: 20-30 minutes
**Coverage**:
- All Standard Scan items
- Detailed business logic
- All validation rules
- Complete workflows
- Integration points
- Error handling
- Database schema
- Type relationships

**Use When**:
- Creating production documentation
- Need complete accuracy
- Updating existing docs
- Complex modules

### Scan Execution

```
1. File Discovery:
   - Glob all TypeScript files in module
   - Prioritize: types → actions → components → pages
   - Create file inventory with sizes

2. Read Priority Files First:
   - types/ (data models)
   - actions/ (business logic)
   - Main components (List, Form, Detail)

3. Extract Patterns:
   - Search for specific patterns (interfaces, functions, validations)
   - Build feature matrix
   - Map data flows

4. Verify Completeness:
   - Check all major features covered
   - Validate workflows end-to-end
   - Confirm no orphaned code

5. Generate Evidence Map:
   - Feature → Code Location
   - Validation → Schema Location
   - Workflow → Component Chain
```

---

## Feature Verification Rules

### MUST DO:
✅ Scan actual source code before documenting
✅ Verify every feature exists in code
✅ Use actual field names from types
✅ Use actual validation messages from code
✅ Use actual status values from enums
✅ Use actual personas that match code users
✅ Follow template structure exactly
✅ Apply hospitality context consistently

### MUST NOT:
❌ Add features not in code
❌ Invent field names
❌ Make up validation rules
❌ Create fictional workflows
❌ Add aspirational features
❌ Guess at implementation details
❌ Copy features from other modules without verification

---

## Output Structure

```
docs/app/{module}/{submodule}/
├── BR-{submodule}.md          (Business Requirements)
├── UC-{submodule}.md          (Use Cases)
├── TS-{submodule}.md          (Technical Specification)
├── DS-{submodule}.md          (Data Schema)
├── FD-{submodule}.md          (Flow Diagrams)
└── VAL-{submodule}.md         (Validations)

docs/app/{module}/{submodule}/.verification/
├── code-scan-results.json     (Source code analysis results)
├── feature-matrix.md          (Features vs Code mapping)
└── coverage-report.md         (Documentation coverage metrics)
```

---

## Example Execution

```
Command:
/generate-docs --module procurement --submodule vendor-management --scan-depth thorough

Output:

Phase 1: Source Code Discovery
✓ Found 23 TypeScript files in app/(main)/procurement/vendor-management/
✓ Extracted 8 interface definitions from types/
✓ Identified 12 components in components/
✓ Found 7 server actions in actions/
✓ Mapped 4 page routes
✓ Extracted 34 validation rules from Zod schemas

Phase 2: Feature Analysis
✓ Primary features: List vendors, Create vendor, Edit vendor, Vendor contacts
✓ Business rules: 15 validation rules, 3 calculation rules, 4 status rules
✓ User workflows: 6 main flows, 8 alternative flows
✓ Integration points: Budget (none), Inventory (none), PO (yes)

Phase 3: Documentation Generation
✓ Generated BR-vendor-management.md (847 lines, 12 functional requirements)
✓ Generated UC-vendor-management.md (654 lines, 6 primary use cases)
✓ Generated TS-vendor-management.md (923 lines, 8 page descriptions)
✓ Generated DS-vendor-management.md (412 lines, 5 tables documented)
✓ Generated FD-vendor-management.md (334 lines, 6 Mermaid diagrams)
✓ Generated VAL-vendor-management.md (287 lines, 34 validation rules)

Phase 4: Verification
✓ All 12 FR features verified in code (100% coverage)
✓ All 6 use cases map to implemented workflows
✓ All 8 pages exist in source code
✓ All 5 database tables found in queries
✓ All 34 validation rules extracted from code
✓ Zero fictional features added
✓ All personas are hospitality-specific

Summary:
✅ Documentation complete and verified
✅ 3,457 total lines of documentation
✅ 100% code coverage
✅ 0 fictional features
✅ Ready for review
```

---

## Troubleshooting

### Issue: Can't find source code
**Solution**:
- Check module/submodule naming (kebab-case)
- Verify path: app/(main)/{module}/{submodule}/
- Try glob: app/**/{submodule}/ if nested differently

### Issue: Missing features in code
**Solution**:
- Don't document features that don't exist
- Mark as "Future Enhancement" if needed
- Flag in coverage report as "Not Implemented"

### Issue: Type definitions not found
**Solution**:
- Check lib/types/index.ts for shared types
- Look in lib/mock-data/ for data structures
- Search globally: grep -r "interface VendorType"

### Issue: Incomplete validation rules
**Solution**:
- Search for all Zod usage: grep -r "z\."
- Check server actions for manual validation
- Look for database constraints in migrations

---

## Best Practices

1. **Always Scan First**: Never document before code analysis
2. **Trust the Code**: If it's not in code, it's not a feature
3. **Be Specific**: Use exact names, values, and messages from code
4. **Verify Everything**: Cross-check every claim against source
5. **Follow Templates**: Structure and format must match exactly
6. **Hospitality Focus**: Every example and persona must fit hotels
7. **Document Evidence**: Keep scan results for verification
8. **Update Regularly**: Re-scan when code changes

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-31 | System | Initial command prompt creation |
