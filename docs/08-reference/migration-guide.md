# Documentation Reorganization Migration Guide

> **Document Type:** Migration Reference
> **Date:** October 20, 2025
> **Version:** 1.0

---

## Overview

This guide documents the comprehensive reorganization of the Carmen ERP documentation from a flat structure to a hierarchical, numbered structure for improved navigation and maintainability.

---

## Migration Summary

### Old Structure
```
docs/
├── documents/
│   ├── pr/              # Purchase Requests
│   ├── po/              # Purchase Orders
│   ├── grn/             # Goods Received Notes
│   ├── cn/              # Credit Notes
│   ├── inv/             # Inventory
│   ├── vm/              # Vendor Management
│   ├── pm/              # Product Management
│   └── [many more...]
├── README.md
├── architecture/
├── api-specifications/
└── [various other files]
```

### New Structure
```
docs/
├── 01-overview/
├── 02-architecture/
├── 03-data-model/
├── 04-modules/
│   ├── procurement/
│   │   ├── purchase-requests/
│   │   ├── purchase-orders/
│   │   ├── goods-received-notes/
│   │   ├── credit-notes/
│   │   └── templates/
│   ├── inventory/
│   ├── finance/
│   ├── vendor-management/
│   └── [9 more modules]
├── 05-cross-cutting/
├── 06-api-reference/
├── 07-development/
└── 08-reference/
```

---

## Path Mapping

### Module Paths

| Old Path | New Path | Description |
|----------|----------|-------------|
| `documents/pr/` | `04-modules/procurement/purchase-requests/` | Purchase Requests |
| `documents/po/` | `04-modules/procurement/purchase-orders/` | Purchase Orders |
| `documents/grn/` | `04-modules/procurement/goods-received-notes/` | Goods Received Notes |
| `documents/cn/` | `04-modules/procurement/credit-notes/` | Credit Notes |
| `documents/prt/` | `04-modules/procurement/templates/` | PR Templates |
| `documents/inv/` or `documents/inventory/` | `04-modules/inventory/stock-management/` | Stock Management |
| `documents/pc/` | `04-modules/inventory/physical-count/` | Physical Count |
| `documents/sc/` | `04-modules/inventory/spot-check/` | Spot Check |
| `documents/finance/` | `04-modules/finance/` | Finance Module |
| `documents/vm/` | `04-modules/vendor-management/` | Vendor Management |
| `documents/pm/` | `04-modules/product-management/` | Product Management |
| `documents/so/` or `documents/store-ops/` | `04-modules/store-operations/` | Store Operations |
| `documents/op/` | `04-modules/operational-planning/` | Operational Planning |
| `documents/sa/` | `04-modules/system-administration/` | System Administration |
| `documents/reporting/` | `04-modules/reporting/` | Reporting |
| `documents/dashboard/` | `04-modules/dashboard/` | Dashboard |
| `documents/production/` | `04-modules/production/` | Production |

### Section Paths

| Old Path | New Path | Description |
|----------|----------|-------------|
| `documents/architecture/` | `02-architecture/` | Architecture docs |
| `api-specifications/` | `06-api-reference/` | API specifications |
| `developer-guides/` | `07-development/` | Developer guides |
| `documents/security/` | `05-cross-cutting/security/` | Security docs |
| `prisma-schema/` | `03-data-model/` | Database schema |
| `README.md` | `01-overview/README.md` | Main overview |

---

## Link Updates

All internal markdown links were automatically updated using a conversion script. The script applied the following transformations:

### Module Links (from 04-modules context)
```markdown
# Old format
[Purchase Requests](../pr/README.md)
[Vendor Management](../vm/README.md)

# New format
[Purchase Requests](./procurement/purchase-requests/README.md)
[Vendor Management](./vendor-management/README.md)
```

### Section Links
```markdown
# Old format
[System Architecture](../architecture/SYSTEM-ARCHITECTURE.md)
[API Documentation](../api/API-DOCUMENTATION.md)

# New format
[System Architecture](../02-architecture/system-architecture.md)
[API Documentation](../06-api-reference/api-documentation.md)
```

### Overview Links
```markdown
# Old format
[System Documentation Index](../SYSTEM-DOCUMENTATION-INDEX.md)

# New format
[System Documentation Index](./README.md)
```

---

## Build System Updates

### New Conversion Script

Created `convert-docs-new.js` to replace old conversion scripts:

**Features:**
- Processes all 8 numbered sections
- Generates section badges
- Creates proper breadcrumbs
- Supports Mermaid diagrams
- Better error handling

### Package.json Scripts

Added new npm scripts:
```json
{
  "docs:convert": "cd docs && node convert-docs-new.js",
  "docs:build": "npm run docs:convert",
  "docs:watch": "cd docs && nodemon --watch '**/*.md' --exec 'node convert-docs-new.js'"
}
```

**Usage:**
```bash
# Convert all markdown to HTML
npm run docs:convert

# Watch mode for development
npm run docs:watch
```

---

## New Documentation Created

### Added Files

1. **tech-stack.md** (`01-overview/tech-stack.md`)
   - Comprehensive technology stack documentation
   - Framework versions and configurations
   - Development tools and dependencies
   - Browser support matrix

2. **data-dictionary.md** (`03-data-model/data-dictionary.md`)
   - Complete database schema documentation
   - Table definitions and relationships
   - Column descriptions and constraints
   - Index and performance documentation

3. **migration-guide.md** (`08-reference/migration-guide.md`)
   - This document
   - Path mapping reference
   - Migration procedures

---

## File Statistics

### Conversion Results

| Section | Markdown Files | HTML Generated |
|---------|---------------|----------------|
| 01-overview | 3 | 3 |
| 02-architecture | 1 | 1 |
| 03-data-model | 1 | 1 |
| 04-modules | 108 | 108 |
| 05-cross-cutting | 2 | 2 |
| 06-api-reference | 3 | 3 |
| 07-development | 1 | 1 |
| 08-reference | 4 | 4 |
| **Total** | **123** | **123** |

---

## Validation

### Automated Checks

The reorganization included:

✓ All markdown files copied to new structure
✓ All internal links updated
✓ Conversion script updated
✓ Build scripts updated
✓ All markdown converted to HTML
✓ New documentation created

### Manual Verification

Recommended checks:
- [ ] Browse HTML output in browser
- [ ] Verify all internal links work
- [ ] Check all images load correctly
- [ ] Confirm breadcrumb navigation works
- [ ] Test search functionality

---

## Rollback Procedure

If needed, the old structure is preserved in:
- Original `documents/` directory remains intact
- Old conversion scripts available as backup
- Git history contains all changes

**To Rollback:**
1. Revert commits from this reorganization
2. Remove numbered directories (01-08)
3. Restore original conversion scripts
4. Regenerate HTML from old structure

---

## Benefits of New Structure

### Improved Organization
- **Numbered Sections:** Clear hierarchy and ordering
- **Logical Grouping:** Related content co-located
- **Scalability:** Easy to add new modules
- **Consistency:** Standardized structure across all modules

### Better Navigation
- **Breadcrumbs:** Clear navigation path
- **Section Badges:** Visual section identification
- **Predictable Paths:** Easier to find content
- **Table of Contents:** Organized documentation index

### Enhanced Maintainability
- **Modular Structure:** Isolated module documentation
- **Clear Ownership:** Module boundaries well-defined
- **Version Control:** Better merge conflict resolution
- **Documentation Standards:** Consistent formatting

---

## Future Enhancements

### Planned Improvements

1. **Search Functionality**
   - Full-text search across all documentation
   - Module-specific search
   - Tag-based filtering

2. **Navigation Enhancements**
   - Dynamic table of contents
   - Previous/next page navigation
   - Sidebar navigation tree

3. **Documentation Automation**
   - Auto-generate module documentation from code
   - API documentation from TypeScript types
   - Database schema from Prisma models

4. **Quality Improvements**
   - Link validation automation
   - Broken link detection
   - Image optimization
   - Accessibility validation

---

## Support & Questions

For questions or issues with the new documentation structure:

1. Check this migration guide
2. Review the [Documentation Index](../01-overview/README.md)
3. Contact the development team

---

## Change Log

### Version 1.0 (October 20, 2025)
- Initial migration from flat to hierarchical structure
- Created 8 numbered sections
- Updated all internal links
- Converted all markdown to HTML
- Added tech stack and data dictionary documentation
