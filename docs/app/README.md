# Carmen ERP Documentation

Welcome to the Carmen ERP documentation system. This directory contains comprehensive documentation for all modules and sub-modules organized by functional area.

## 📁 Documentation Structure

```
docs/app/
├── template-module/
│   └── template-sub-module/          # Templates for creating new documentation
│       ├── README.md                 # Template usage guide
│       ├── BR-template.md            # Business Requirements template
│       ├── UC-template.md            # Use Cases template
│       ├── TS-template.md            # Technical Specifications template
│       ├── DS-template.md            # Data Schema template
│       ├── FD-template.md            # Flow Diagrams template
│       └── VAL-template.md           # Validations template
│
├── procurement/                       # Procurement module
│   ├── purchase-requests/            # Purchase Requests sub-module
│   ├── purchase-orders/              # Purchase Orders sub-module
│   ├── goods-receipt-notes/          # GRN sub-module
│   └── ...
│
├── inventory-management/              # Inventory module
│   ├── stock-management/             # Stock Management sub-module
│   ├── stock-adjustments/            # Stock Adjustments sub-module
│   ├── stock-counts/                 # Stock Counts sub-module
│   └── ...
│
├── vendor-management/                 # Vendor Management module
│   ├── vendor-profiles/              # Vendor Profiles sub-module
│   ├── vendor-certifications/        # Vendor Certifications sub-module
│   └── ...
│
├── product-management/                # Product Management module
├── operational-planning/              # Operational Planning module
├── production/                        # Production module
├── store-operations/                  # Store Operations module
├── reporting-analytics/               # Reporting & Analytics module
├── finance/                           # Finance module
└── system-administration/             # System Administration module
```

## 📚 Document Types

Each sub-module contains **six core documents** that work together to provide complete specification:

### 1. **BR** - Business Requirements
**Purpose**: Defines WHAT the system needs to do from a business perspective

**Contains**:
- Business objectives and stakeholders
- Functional requirements with acceptance criteria
- Business rules and constraints
- Conceptual data model
- Non-functional requirements
- Success metrics

**Audience**: Business stakeholders, product managers, analysts

---

### 2. **UC** - Use Cases
**Purpose**: Describes HOW users and systems interact with features

**Contains**:
- Actor definitions (users, systems)
- User workflows (main flow, alternatives, exceptions)
- System use cases (automated processes)
- Integration use cases
- Background job use cases

**Audience**: Business analysts, UX designers, QA testers

---

### 3. **TS** - Technical Specifications
**Purpose**: Details HOW to implement the system technically

**Contains**:
- Architecture diagrams
- Technology stack
- Component structure
- API contracts with code examples
- State management patterns
- Security implementation
- Testing strategy

**Audience**: Developers, technical leads, architects

---

### 4. **DS** - Data Schema
**Purpose**: Defines database structure and data organization

**Contains**:
- Entity Relationship Diagrams
- Table definitions with SQL DDL
- Indexes and constraints
- Views and stored procedures
- Data migration scripts

**Audience**: Database administrators, backend developers

---

### 5. **FD** - Flow Diagrams
**Purpose**: Visual representations of processes and data flows

**Contains**:
- Process flow diagrams
- Data flow diagrams
- Sequence diagrams
- State transition diagrams
- Workflow diagrams

**Audience**: All stakeholders (visual reference)

---

### 6. **VAL** - Validations
**Purpose**: Validation requirements in descriptive text format

**Contains**:
- Field-level validations
- Business rule validations
- Cross-field validations
- Security validations
- Error messages and handling

**Audience**: Developers, QA testers, business analysts

---

## 🎯 Key Principles

### Requirements Documents (Text-Based)
**Documents**: BR, UC, FD, VAL

**Characteristics**:
- Focus on **WHAT** and **WHY**, not HOW
- Written in descriptive text, not implementation code
- Technology-agnostic requirements
- Business-oriented language
- Validation requirements as text descriptions

### Technical Documents (Implementation Guidance)
**Documents**: TS, DS

**Characteristics**:
- Focus on **HOW** to implement
- Include code examples and schemas
- Technology-specific guidance
- Implementation patterns
- SQL DDL for database structure

---

## 🚀 Quick Start

### Creating Documentation for a New Sub-Module

```bash
# 1. Copy the template directory
cp -r docs/app/template-module/template-sub-module docs/app/{module}/{sub-module}

# Example: Creating documentation for "Price Comparisons" in Procurement
cp -r docs/app/template-module/template-sub-module docs/app/procurement/price-comparisons

# 2. Rename files (optional but recommended)
cd docs/app/procurement/price-comparisons
mv BR-template.md BR-price-comparisons.md
mv UC-template.md UC-price-comparisons.md
mv TS-template.md TS-price-comparisons.md
mv DS-template.md DS-price-comparisons.md
mv FD-template.md FD-price-comparisons.md
mv VAL-template.md VAL-price-comparisons.md

# 3. Update each file
# Replace these placeholders:
#   {module} → "procurement"
#   {sub-module} → "price-comparisons"
#   {CODE} → "PC"
#   {Module Name} → "Procurement"
#   {Sub-Module Name} → "Price Comparisons"
```

### Document Linking

All documents in a sub-module directory use **relative paths** for cross-referencing:

```markdown
- [Business Requirements](./BR-purchase-requests.md)
- [Use Cases](./UC-purchase-requests.md)
- [Technical Specification](./TS-purchase-requests.md)
- [Data Schema](./DS-purchase-requests.md)
- [Flow Diagrams](./FD-purchase-requests.md)
- [Validations](./VAL-purchase-requests.md)
```

This makes links work automatically when you copy the template directory!

---

## 📖 Example: Purchase Requests

A complete example is available at `docs/app/procurement/purchase-requests/`:

```
docs/app/procurement/purchase-requests/
├── BR-purchase-requests.md    # Business requirements
├── UC-purchase-requests.md    # 8 detailed use cases
├── TS-purchase-requests.md    # Next.js implementation guide
├── DS-purchase-requests.md    # PostgreSQL schema
├── FD-purchase-requests.md    # Mermaid flow diagrams
└── VAL-purchase-requests.md   # 31 validation rules
```

Use this as a reference when creating your own documentation.

---

## 🔄 Documentation Workflow

### 1. **Requirements Phase**
- Create **BR** (Business Requirements)
- Create **UC** (Use Cases)
- Create **FD** (Flow Diagrams) for key processes
- Status: `Draft` → Get stakeholder approval → `Approved`

### 2. **Design Phase**
- Create **DS** (Data Schema)
- Create **VAL** (Validations)
- Update **FD** with detailed flows
- Status: `Draft` → Get technical review → `Approved`

### 3. **Development Phase**
- Create **TS** (Technical Specifications)
- Developers implement using TS guidance
- QA uses UC and VAL for testing

### 4. **Maintenance Phase**
- Update documents when features change
- Keep all 6 documents in sync
- Update document history and version numbers

---

## 📊 Document Status Levels

Each document has a status field in the header:

- **Draft**: Initial version, work in progress
- **Review**: Ready for stakeholder/technical review
- **Approved**: Reviewed and approved, ready for implementation
- **Deprecated**: No longer current, replaced by newer version

---

## 🎨 Documentation Best Practices

### Writing Style
- **Clear and Concise**: Use simple language, avoid jargon
- **Specific and Measurable**: Requirements must be testable
- **Consistent Terminology**: Use the same terms across all documents
- **Active Voice**: "System validates input" not "Input is validated"

### Requirements Documents (BR, UC, VAL)
- Write in **descriptive text**, not code
- Focus on **business value** and **user needs**
- Include **rationale** for requirements
- Provide **examples** for clarity
- Define **acceptance criteria** clearly

### Technical Documents (TS, DS)
- Include **code examples** for guidance
- Show **complete schemas** with all constraints
- Provide **implementation patterns**
- Include **error handling** strategies
- Document **performance considerations**

### Visual Documents (FD)
- Use **Mermaid** for version-controllable diagrams
- Keep diagrams **simple and focused**
- Include **legend** for custom symbols
- Provide **text descriptions** alongside diagrams
- Update when processes change

---

## 🔍 Finding Information

### By Module
Navigate to `docs/app/{module}/` to see all sub-modules for that functional area.

### By Sub-Module
Navigate to `docs/app/{module}/{sub-module}/` to see all 6 documents for that feature.

### By Document Type
Use your code editor's search (e.g., `**/*-purchase-requests.md`) to find all documents for a specific feature across document types.

---

## 🛠️ Tools and Technologies

### Diagram Tools
- **Mermaid**: Primary tool for flow diagrams (renders in Markdown)
- **Draw.io**: For complex diagrams (export as PNG/SVG)
- **PlantUML**: Alternative for sequence diagrams

### Validation
- **Markdown Linters**: Ensure consistent formatting
- **Link Checkers**: Verify cross-references work
- **Spell Checkers**: Maintain professional quality

### Version Control
- All documents are version-controlled in Git
- Use meaningful commit messages
- Create branches for major documentation updates
- Use Pull Requests for review

---

## 📋 Maintenance Checklist

When updating documentation:

- [ ] Update document version and history table
- [ ] Update "Last Updated" date
- [ ] Ensure all cross-references still work
- [ ] Update related documents if needed
- [ ] Review with relevant stakeholders
- [ ] Update status if moving to new approval stage
- [ ] Commit with descriptive message

---

## 🤝 Contributing

### Document Reviews
- **Business Requirements**: Reviewed by product manager, business stakeholders
- **Use Cases**: Reviewed by UX designer, QA lead, product manager
- **Technical Specifications**: Reviewed by technical lead, architects
- **Data Schema**: Reviewed by DBA, backend lead
- **Flow Diagrams**: Reviewed by all relevant stakeholders
- **Validations**: Reviewed by QA lead, business analyst

### Approval Process
1. Author creates Draft
2. Submit for Review
3. Incorporate feedback
4. Get approval from designated reviewers
5. Update status to Approved
6. Implement feature based on approved documentation

---

## 📞 Support

### Questions About Documentation
- Check the template README at `docs/app/template-module/template-sub-module/README.md`
- Review the example at `docs/app/procurement/purchase-requests/`
- Consult this README for structure guidance

### Questions About a Specific Feature
- Navigate to the sub-module directory
- Start with BR (Business Requirements) for overview
- Check UC (Use Cases) for workflows
- Review TS (Technical Specifications) for implementation details

---

## 🔗 Related Documentation

- **Architecture Overview**: `/docs/architecture/`
- **Development Guide**: `/docs/development/`
- **API Documentation**: `/docs/api/`
- **User Guides**: `/docs/user-guides/`

---

## 📈 Documentation Metrics

Track these metrics for documentation quality:

- **Coverage**: Percentage of features with complete documentation (all 6 docs)
- **Currency**: How recently documents were updated
- **Completeness**: Percentage of template sections filled
- **Cross-Reference Accuracy**: Percentage of working links
- **Review Cycle Time**: Time from Draft to Approved

---

**Last Updated**: 2025-10-30
**Documentation Version**: 2.0
**Structure**: Centralized sub-module directories
