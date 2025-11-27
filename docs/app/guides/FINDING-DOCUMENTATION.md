# Finding Documentation Guide

**Master the Carmen documentation system** to quickly find what you need from 247 files.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Documentation System Overview

**Total**: 247 documentation files across 8 modules

**7 Document Types**:
- **DD** (Data Definition): 40 files - Database schemas
- **BR** (Business Requirements): 38 files - Functional requirements
- **TS** (Technical Specification): 36 files - Implementation details
- **UC** (Use Cases): 38 files - User workflows
- **FD** (Flow Diagrams): 38 files - Visual process flows
- **VAL** (Validations): 38 files - Business rules
- **PROCESS**: 2 files - End-to-end workflows

**📖 [Complete Guide](../reference/DOCUMENT-TYPES-EXPLAINED.md)**

---

## Quick Navigation Strategies

### Strategy 1: Start with Wiki Home

**[WIKI-HOME.md](../WIKI-HOME.md)** - Central hub with:
- Module overview cards
- Quick links to all documentation
- Search by feature
- Documentation type index

**Use When**: First time exploring or need module overview

---

### Strategy 2: Use Module Index

**[MODULE-INDEX.md](../MODULE-INDEX.md)** - Complete catalog of all 247 files

**Navigate By**:
- Module (Finance, Inventory, Procurement, etc.)
- Document type (all DDs, all BRs, etc.)
- Sub-module (Purchase Requests, Vendors, etc.)

**Use When**: You know which module but not specific feature

---

### Strategy 3: Search Pattern

**For Data Model** → DD documents
```
Example: "What tables store purchase requests?"
→ procurement/purchase-requests/DD-purchase-requests.md
```

**For Business Rules** → BR documents
```
Example: "What are the approval rules?"
→ procurement/purchase-requests/BR-purchase-requests.md
```

**For Implementation** → TS documents
```
Example: "How is inventory costing implemented?"
→ inventory-management/lot-based-costing/TS-lot-based-costing.md
```

**For Workflows** → UC or FD documents
```
Example: "How does the GRN process work?"
→ procurement/goods-received-notes/FD-goods-received-note.md
```

---

## Finding Documentation by Task

### Task: Understanding a Feature

**Read in Order**:
1. **DD** - What data is stored?
2. **BR** - What are the business rules?
3. **UC** - How do users interact with it?
4. **TS** - How is it implemented?
5. **FD** - Visual workflow
6. **VAL** - What validations apply?

**Example - Purchase Requests**:
1. [DD-purchase-requests.md](../procurement/purchase-requests/DD-purchase-requests.md)
2. [BR-purchase-requests.md](../procurement/purchase-requests/BR-purchase-requests.md)
3. [UC-purchase-requests.md](../procurement/purchase-requests/UC-purchase-requests.md)
4. [TS-purchase-requests.md](../procurement/purchase-requests/TS-purchase-requests.md)
5. [FD-purchase-requests.md](../procurement/purchase-requests/FD-purchase-requests.md)
6. [VAL-purchase-requests.md](../procurement/purchase-requests/VAL-purchase-requests.md)

---

### Task: Implementing a New Feature

**Read Order**:
1. **BR** - Requirements first
2. **DD** - Data model
3. **TS** - Technical approach
4. **Related BRs** - Integration points
5. **VAL** - Validation rules
6. **UC** - User scenarios for testing

---

### Task: Debugging an Issue

**Read Order**:
1. **TS** - Current implementation
2. **VAL** - Validation rules (is validation failing?)
3. **BR** - Business rules (is logic correct?)
4. **DD** - Data model (is data structured correctly?)

---

### Task: Writing Tests

**Read Order**:
1. **UC** - User workflows to test
2. **VAL** - Validation scenarios
3. **BR** - Business rule edge cases
4. **FD** - Process flows to cover

---

## Finding by Module

**Finance Management** (20 docs):
- Account Codes, Currencies, Departments, Exchange Rates
- [→ View all](../MODULE-INDEX.md#finance-management)

**Inventory Management** (30 docs):
- Inventory Overview, Lot Costing, Periodic Average, Adjustments
- [→ View all](../MODULE-INDEX.md#inventory-management)

**Procurement Management** (18 docs):
- Purchase Requests, Orders, GRN, Approvals
- [→ View all](../MODULE-INDEX.md#procurement-management)

**Vendor Management** (30 docs):
- Vendors, Price Lists, RFPs, Portal
- [→ View all](../MODULE-INDEX.md#vendor-management)

**Product Management** (12 docs):
- Products, Categories, Units
- [→ View all](../MODULE-INDEX.md#product-management)

**Store Operations** (18 docs):
- Requisitions, Replenishment, Wastage
- [→ View all](../MODULE-INDEX.md#store-operations)

**Operational Planning** (24 docs):
- Recipes, Categories, Cuisine Types, Menu Engineering
- [→ View all](../MODULE-INDEX.md#operational-planning)

**System Administration** (6 docs):
- Users, Roles, Permissions, Workflows
- [→ View all](../MODULE-INDEX.md#system-administration)

---

## Keyboard Shortcuts for Navigation

**VS Code**:
- `Cmd/Ctrl + P` - Quick file open
- `Cmd/Ctrl + Shift + F` - Search across all files
- `Cmd/Ctrl + Click` - Follow link

**GitHub**:
- `T` - File finder
- `/` - Search
- `B` - View blame

---

## Search Tips

### File Pattern Matching

```bash
# Find all DD documents for procurement
docs/app/procurement/**/DD-*.md

# Find all validation documents
docs/app/**/VAL-*.md

# Find all finance documentation
docs/app/finance/**/*.md
```

### Content Search

```bash
# Search for specific terms
grep -r "FIFO" docs/app/inventory-management/

# Search for table names
grep -r "tb_purchase_request" docs/app/

# Search for business rules
grep -r "VAL-PRO" docs/app/procurement/
```

---

## Documentation Naming Convention

**Pattern**: `[TYPE]-[feature-name].md`

**Examples**:
- `DD-purchase-requests.md` - Data Definition
- `BR-purchase-requests.md` - Business Requirements
- `TS-purchase-requests.md` - Technical Specification
- `UC-purchase-requests.md` - Use Cases
- `FD-purchase-requests.md` - Flow Diagrams
- `VAL-purchase-requests.md` - Validations

**Directory Structure**:
```
docs/app/
├── module-name/
│   ├── sub-module/
│   │   ├── DD-sub-module.md
│   │   ├── BR-sub-module.md
│   │   ├── TS-sub-module.md
│   │   ├── UC-sub-module.md
│   │   ├── FD-sub-module.md
│   │   └── VAL-sub-module.md
```

---

## Related Documentation

**Core**:
- **[WIKI-HOME.md](../WIKI-HOME.md)** - Documentation hub
- **[MODULE-INDEX.md](../MODULE-INDEX.md)** - Complete catalog
- **[DEVELOPER-ONBOARDING.md](../DEVELOPER-ONBOARDING.md)** - Onboarding guide

**Reference**:
- **[DOCUMENT-TYPES-EXPLAINED.md](../reference/DOCUMENT-TYPES-EXPLAINED.md)** - Document type guide
- **[NAMING-CONVENTIONS.md](../reference/NAMING-CONVENTIONS.md)** - Naming standards
- **[GLOSSARY.md](../reference/GLOSSARY.md)** - Terminology

---

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **📚 [Module Index](../MODULE-INDEX.md)** | **🚀 [Getting Started](GETTING-STARTED.md)**
