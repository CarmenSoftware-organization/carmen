# Module Analysis Template

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Command Structure

```
/analyze [module-name] by recursively scanning the source code. Create comprehensive documentation in docs/documents/[module-name]/ including:

1. A Mermaid sitemap showing all pages and navigation flows
2. Detailed documentation of:
   - All pages and routes
   - Modals and dialogs
   - Dropdown fields and their options
   - Available actions and buttons
   - Form fields and validation rules
   - Business logic and workflows
   - Data flows and transformations
   - State management patterns
   - Server actions and API endpoints
   - Authorization rules and permissions
3. Screenshots of each screen/component placed in the same folder
4. Link screenshots to relevant documentation sections

Start by identifying all [module-name]-related files in the codebase, then systematically document each component.
```

## Alternative Structured Format

```
/analyze [module-name] --comprehensive --with-screenshots --output docs/documents/[module-name]/

Include:
- Mermaid sitemap (pages, navigation flows)
- Full component inventory (pages, modals, dialogs, dropdowns)
- All actions, buttons, and form fields
- Business Logic:
  * Workflow processes and approval chains
  * Validation rules and business constraints
  * Data transformations and calculations
  * State transitions and lifecycle management
  * Integration points with other modules
  * Authorization and permission checks
- Screenshots linked to documentation sections
```

## Usage Examples

### Example 1: GRN Module
```
/analyze grn by recursively scanning the source code...
```

### Example 2: Purchase Request Module
```
/analyze purchase-request --comprehensive --with-screenshots --output docs/documents/pr/
```

### Example 3: Vendor Management Module
```
/analyze vendor-management by recursively scanning the source code...
```

## Output Structure

The analysis will create documentation in the following structure:

```
docs/documents/[module-name]/
├── README.md                           # Main documentation
├── sitemap.md                          # Mermaid sitemap
├── pages/                              # Page-by-page documentation
├── components/                         # Component documentation
├── business-logic/                     # Business rules and workflows
├── screenshots/                        # Visual documentation
│   ├── pages/
│   ├── modals/
│   └── components/
└── api/                                # API and server actions
```

## Documentation Sections

### 1. Sitemap
- Mermaid diagram showing navigation hierarchy
- Route structure and paths
- User flow diagrams

### 2. UI Components
- Pages and layouts
- Modals and dialogs
- Form components
- Dropdown menus and options
- Buttons and actions

### 3. Business Logic
- Workflow processes
- Validation rules
- State transitions
- Data transformations
- Authorization checks
- Integration points

### 4. Technical Details
- Server actions
- API endpoints
- State management
- Data models
- Type definitions

### 5. Visual Documentation
- Screenshots of all screens
- Annotated UI elements
- User journey flows
