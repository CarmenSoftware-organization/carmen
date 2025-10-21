# Carmen ERP - Refactored Documentation Structure Plan

> **Version:** 2.0
> **Date:** 2025-01-17
> **Purpose:** Organized, hierarchical documentation with HTML navigation

---

## 📋 Table of Contents

- [Documentation Philosophy](#documentation-philosophy)
- [Directory Structure](#directory-structure)
- [Module Documentation Template](#module-documentation-template)
- [HTML Navigation System](#html-navigation-system)
- [Sub-Options Organization](#sub-options-organization)
- [Implementation Plan](#implementation-plan)

---

## Documentation Philosophy

### Goals
1. **Hierarchical Organization** - Clear parent-child relationships
2. **HTML Navigation** - Interactive browsing with visual index
3. **Sub-Option Documentation** - Detailed docs for each feature
4. **Consistency** - Standardized templates across all modules
5. **Discoverability** - Easy to find and navigate

### Principles
- **DRY** - Reference shared components, don't duplicate
- **Progressive Disclosure** - Overview → Details → Technical
- **Visual Navigation** - HTML indexes with screenshots
- **Cross-Linking** - Related docs interconnected

---

## Directory Structure

### Standard Module Structure

```
docs/documents/{module-abbrev}/
├── index.html                          # Interactive visual index
├── README.md                           # Module overview
├── {module}-specification.md           # Complete specification
├── {module}-sitemap.md                # Navigation map
│
├── features/                           # Feature-level docs
│   ├── index.html                     # Features visual index
│   ├── {feature-1}/
│   │   ├── README.md                  # Feature overview
│   │   ├── specification.md           # Detailed spec
│   │   ├── user-guide.md             # User documentation
│   │   └── screenshots/              # Feature screenshots
│   ├── {feature-2}/
│   └── ...
│
├── components/                         # Component documentation
│   ├── index.html                     # Components index
│   ├── {component-1}.md
│   └── ...
│
├── api/                               # API documentation
│   ├── index.html                     # API index
│   ├── endpoints.md
│   ├── {endpoint-group}.md
│   └── examples/
│
├── guides/                            # User guides
│   ├── index.html
│   ├── getting-started.md
│   ├── administrator-guide.md
│   ├── user-guide.md
│   └── troubleshooting.md
│
├── technical/                         # Technical documentation
│   ├── architecture.md
│   ├── data-models.md
│   ├── workflows.md
│   └── integrations.md
│
└── screenshots/                       # Module screenshots
    ├── dashboard.png
    ├── {feature-name}-{view}.png
    └── ...
```

---

## Module Documentation Template

### Level 1: Module Overview (README.md)

```markdown
# {Module Name}

> Status, stats, quick links

## Overview
- Purpose
- Key capabilities
- User roles

## Features Summary
- Feature list with status
- Quick access links

## Getting Started
- Quick start guide
- Common tasks

## Sub-Modules / Features
- Feature 1 with link
- Feature 2 with link

## Documentation Index
- Links to all docs

## Related Modules
- Cross-references
```

### Level 2: Feature Documentation (features/{feature}/README.md)

```markdown
# {Feature Name}

> Feature status, scope, dependencies

## Overview
- What it does
- Why it exists
- Who uses it

## Functionality
- Core capabilities
- User workflows
- Business rules

## User Interface
- Screens and views
- Navigation
- Actions available

## Technical Details
- Components used
- Data models
- API endpoints

## User Guide
- How to use
- Common tasks
- Tips and tricks

## Screenshots
- Annotated screenshots
```

### Level 3: Component Documentation (components/{component}.md)

```markdown
# {Component Name}

> Type, location, dependencies

## Purpose
## Props / Interface
## Usage Examples
## Related Components
```

---

## HTML Navigation System

### Root Index (docs/documents/index.html)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Carmen ERP Documentation</title>
    <style>
        /* Modern, responsive design */
        /* Card-based layout */
        /* Color-coded by status */
    </style>
</head>
<body>
    <header>
        <h1>Carmen ERP System Documentation</h1>
        <nav>All Modules | By Feature | By Status | Search</nav>
    </header>

    <main>
        <!-- Module Cards Grid -->
        <div class="module-grid">
            <!-- System Administration Card -->
            <div class="module-card status-complete">
                <img src="sa/screenshots/dashboard.png" />
                <h2>System Administration</h2>
                <p>47 pages | 10 sub-modules</p>
                <div class="features">
                    <span>Permission Management</span>
                    <span>POS Integration</span>
                    <span>+8 more</span>
                </div>
                <a href="sa/index.html">Explore →</a>
            </div>

            <!-- More module cards... -->
        </div>
    </main>
</body>
</html>
```

### Module Index (docs/documents/{module}/index.html)

```html
<!DOCTYPE html>
<html>
<head>
    <title>{Module Name} Documentation</title>
</head>
<body>
    <header>
        <nav>
            <a href="../index.html">← All Modules</a>
            <h1>{Module Name}</h1>
        </nav>
    </header>

    <aside>
        <!-- Sidebar navigation -->
        <nav class="sidebar">
            <h3>Features</h3>
            <ul>
                <li><a href="features/feature-1/index.html">Feature 1</a></li>
                <li><a href="features/feature-2/index.html">Feature 2</a></li>
            </ul>

            <h3>Documentation</h3>
            <ul>
                <li><a href="README.md">Overview</a></li>
                <li><a href="{module}-specification.md">Specification</a></li>
                <li><a href="guides/index.html">User Guides</a></li>
            </ul>
        </nav>
    </aside>

    <main>
        <!-- Feature cards with screenshots -->
        <!-- Quick stats -->
        <!-- Recent updates -->
    </main>
</body>
</html>
```

### Feature Index (docs/documents/{module}/features/index.html)

```html
<!-- Similar structure, listing all features -->
<!-- Each feature has card with:
     - Screenshot
     - Status badge
     - Page count
     - Quick description
     - Link to feature docs
-->
```

---

## Sub-Options Organization

### System Administration Example

```
sa/
├── index.html                              # Main module index
├── README.md                               # Module overview
├── system-administration-specification.md  # Complete spec
├── system-administration-sitemap.md       # Navigation map
│
├── features/
│   ├── index.html                         # Features gallery
│   │
│   ├── permission-management/
│   │   ├── index.html                    # PM visual index
│   │   ├── README.md                     # PM overview
│   │   ├── specification.md              # PM spec
│   │   ├── user-guide.md                # How to use PM
│   │   │
│   │   ├── sub-features/
│   │   │   ├── roles/
│   │   │   │   ├── README.md            # Roles management
│   │   │   │   ├── crud-operations.md   # CRUD details
│   │   │   │   └── screenshots/
│   │   │   │
│   │   │   ├── policies/
│   │   │   │   ├── README.md            # Policies overview
│   │   │   │   ├── policy-builder.md    # Builder docs
│   │   │   │   ├── abac-concepts.md     # ABAC explanation
│   │   │   │   └── screenshots/
│   │   │   │
│   │   │   └── subscriptions/
│   │   │       ├── README.md
│   │   │       └── screenshots/
│   │   │
│   │   └── screenshots/                  # PM screenshots
│   │
│   ├── pos-integration/
│   │   ├── index.html
│   │   ├── README.md
│   │   ├── specification.md
│   │   │
│   │   ├── sub-features/
│   │   │   ├── settings/
│   │   │   │   ├── configuration.md
│   │   │   │   ├── system-settings.md
│   │   │   │   └── screenshots/
│   │   │   │
│   │   │   ├── mapping/
│   │   │   │   ├── locations-mapping.md
│   │   │   │   ├── units-mapping.md
│   │   │   │   ├── recipes-mapping.md
│   │   │   │   └── screenshots/
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── consumption-report.md
│   │   │   │   ├── gross-profit-report.md
│   │   │   │   └── screenshots/
│   │   │   │
│   │   │   └── transactions/
│   │   │       ├── sync-process.md
│   │   │       └── screenshots/
│   │   │
│   │   └── screenshots/
│   │
│   ├── location-management/
│   ├── workflow/
│   ├── certifications/
│   ├── business-rules/
│   └── ...
│
├── components/
│   ├── index.html
│   ├── PolicyEditor.md
│   ├── WorkflowBuilder.md
│   └── ...
│
├── api/
│   ├── index.html
│   ├── permission-api.md
│   ├── workflow-api.md
│   └── ...
│
├── guides/
│   ├── index.html
│   ├── getting-started.md
│   ├── administrator-guide.md
│   ├── permission-setup-guide.md
│   └── pos-integration-guide.md
│
├── technical/
│   ├── architecture.md
│   ├── data-models.md
│   └── security.md
│
└── screenshots/
    ├── dashboard.png
    ├── permission-management-overview.png
    └── ...
```

---

## Implementation Plan

### Phase 1: Core Structure (Week 1)

**Deliverables:**
1. Root documentation index.html
2. Module template files
3. Feature template files
4. CSS/JS for navigation

**Tasks:**
- Create HTML templates
- Design responsive layout
- Implement navigation logic
- Add search functionality

### Phase 2: System Administration (Weeks 1-2)

**Structure:**
```
sa/
├── index.html ✅
├── README.md ✅
├── sitemap.md ✅
├── features/
│   ├── index.html
│   ├── permission-management/
│   │   ├── README.md
│   │   ├── specification.md
│   │   ├── sub-features/
│   │   │   ├── roles/README.md
│   │   │   ├── policies/README.md
│   │   │   └── subscriptions/README.md
│   │   └── screenshots/
│   ├── pos-integration/
│   │   ├── README.md
│   │   ├── sub-features/
│   │   │   ├── settings/
│   │   │   ├── mapping/
│   │   │   ├── reports/
│   │   │   └── transactions/
│   │   └── screenshots/
│   └── [other features]/
├── guides/
├── technical/
└── screenshots/
```

**Tasks:**
- Create all feature directories
- Write feature READMEs
- Document sub-features
- Capture screenshots
- Build HTML indexes

### Phase 3: Other Modules (Weeks 3-6)

Apply same structure to:
- Operational Planning
- Security
- Finance
- Reporting
- Production
- Style Guide
- Help & Support
- User Profile

---

## Template Files

### 1. Root Index Template

**File:** `docs/documents/index-template.html`

Features:
- Module cards with screenshots
- Status indicators
- Search bar
- Filter by status/category
- Quick stats

### 2. Module Index Template

**File:** `docs/documents/{module}/index-template.html`

Features:
- Feature gallery
- Sidebar navigation
- Breadcrumbs
- Module stats
- Recent updates

### 3. Feature Documentation Template

**File:** `docs/documents/templates/feature-README-template.md`

Sections:
- Overview
- Functionality
- User Interface
- Technical Details
- User Guide
- Screenshots

---

## Navigation Flow

```
Root Index (index.html)
    ↓
Module Index (sa/index.html)
    ↓
Feature Index (sa/features/index.html)
    ↓
Feature Page (sa/features/permission-management/index.html)
    ↓
Sub-Feature (sa/features/permission-management/sub-features/roles/README.md)
```

---

## Status Indicators

### Color Coding

- 🟢 **Complete** - Green - 100% documented
- 🟡 **Partial** - Yellow - 50-99% documented
- 🔴 **Missing** - Red - 0-49% documented
- 🔵 **In Progress** - Blue - Currently being documented

### Progress Tracking

Each module/feature shows:
- Pages documented / Total pages
- Screenshot count
- Last updated date
- Contributors

---

## Benefits of This Structure

1. **Better Organization** - Clear hierarchy, easy to navigate
2. **Visual Discovery** - HTML indexes with screenshots
3. **Detailed Sub-Options** - Every feature fully documented
4. **Reusable Templates** - Consistent structure across modules
5. **Scalable** - Easy to add new modules/features
6. **User-Friendly** - Multiple entry points (visual, text, search)
7. **Developer-Friendly** - Clear technical docs separate from user guides

---

## Next Steps

1. ✅ Create template files
2. ✅ Build root index.html
3. ✅ Implement SA module with new structure
4. ✅ Capture screenshots
5. ✅ Replicate for other modules
6. ✅ Add search functionality
7. ✅ Create PDF exports

---

## Example: Permission Management Feature

```
sa/features/permission-management/
├── index.html                         # PM visual overview
├── README.md                          # PM overview (text)
├── specification.md                   # Complete PM specification
├── user-guide.md                      # How to use PM
├── architecture.md                    # Technical architecture
│
├── sub-features/
│   ├── roles/
│   │   ├── README.md                 # Roles overview
│   │   ├── creating-roles.md         # How to create
│   │   ├── editing-roles.md          # How to edit
│   │   ├── assigning-roles.md        # How to assign
│   │   ├── role-hierarchy.md         # Role relationships
│   │   └── screenshots/
│   │       ├── roles-list.png
│   │       ├── role-create-form.png
│   │       └── role-detail.png
│   │
│   ├── policies/
│   │   ├── README.md                 # Policies overview
│   │   ├── abac-introduction.md      # ABAC concepts
│   │   ├── policy-builder.md         # Using the builder
│   │   ├── policy-syntax.md          # Policy language
│   │   ├── examples/
│   │   │   ├── basic-policies.md
│   │   │   ├── advanced-policies.md
│   │   │   └── common-scenarios.md
│   │   └── screenshots/
│   │       ├── policies-list.png
│   │       ├── policy-builder.png
│   │       ├── policy-editor.png
│   │       └── policy-testing.png
│   │
│   └── subscriptions/
│       ├── README.md
│       ├── subscription-tiers.md
│       ├── feature-flags.md
│       └── screenshots/
│
├── api/
│   ├── roles-api.md
│   ├── policies-api.md
│   └── subscriptions-api.md
│
└── screenshots/
    ├── permission-management-dashboard.png
    └── ...
```

---

**Version:** 2.0
**Last Updated:** 2025-01-17
**Status:** Ready for Implementation
